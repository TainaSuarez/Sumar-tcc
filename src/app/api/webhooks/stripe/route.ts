import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('No se encontró la firma de Stripe');
      return NextResponse.json(
        { error: 'Firma de webhook faltante' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      // Verificar la firma del webhook
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Error verificando webhook:', err);
      return NextResponse.json(
        { error: 'Firma de webhook inválida' },
        { status: 400 }
      );
    }

    console.log('Evento de Stripe recibido:', event.type);

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error procesando webhook de Stripe:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Manejar pago exitoso
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Procesando pago exitoso:', paymentIntent.id);

    // Buscar la donación en la base de datos
    const donation = await prisma.donation.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
      include: {
        campaign: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        },
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    if (!donation) {
      console.error('Donación no encontrada para Payment Intent:', paymentIntent.id);
      return;
    }

    // Si ya está procesada, no hacer nada
    if (donation.status === 'COMPLETED') {
      console.log('Donación ya procesada:', donation.id);
      return;
    }

    // Actualizar la donación y la campaña en una transacción
    await prisma.$transaction(async (tx) => {
      // Actualizar la donación
      await tx.donation.update({
        where: { id: donation.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          stripeChargeId: paymentIntent.latest_charge as string,
        },
      });

      // Actualizar el monto actual de la campaña
      const updatedCampaign = await tx.campaign.update({
        where: { id: donation.campaignId },
        data: {
          currentAmount: {
            increment: donation.amount,
          },
        },
      });

      // Verificar si la campaña alcanzó su objetivo
      if (updatedCampaign.currentAmount >= updatedCampaign.goalAmount) {
        await tx.campaign.update({
          where: { id: donation.campaignId },
          data: {
            status: 'COMPLETED',
          },
        });

        // Notificar al creador que la campaña se completó
        await tx.notification.create({
          data: {
            title: '¡Campaña completada!',
            message: `Tu campaña "${donation.campaign.title}" ha alcanzado su objetivo de $${donation.campaign.goalAmount}`,
            type: 'campaign_completed',
            userId: donation.campaign.creator.id,
            data: {
              campaignId: donation.campaignId,
              goalAmount: donation.campaign.goalAmount,
              finalAmount: updatedCampaign.currentAmount,
            },
          },
        });
      }

      // Crear notificación para el creador de la campaña (si no es anónima)
      if (!donation.isAnonymous && donation.donor) {
        await tx.notification.create({
          data: {
            title: 'Nueva donación recibida',
            message: `${donation.donor.firstName} ${donation.donor.lastName || ''} ha donado $${donation.amount} a tu campaña "${donation.campaign.title}"`,
            type: 'donation',
            userId: donation.campaign.creator.id,
            data: {
              donationId: donation.id,
              campaignId: donation.campaignId,
              amount: donation.amount,
              donorName: `${donation.donor.firstName} ${donation.donor.lastName || ''}`,
            },
          },
        });
      } else {
        // Notificación para donación anónima
        await tx.notification.create({
          data: {
            title: 'Nueva donación anónima recibida',
            message: `Has recibido una donación anónima de $${donation.amount} para tu campaña "${donation.campaign.title}"`,
            type: 'donation',
            userId: donation.campaign.creator.id,
            data: {
              donationId: donation.id,
              campaignId: donation.campaignId,
              amount: donation.amount,
              isAnonymous: true,
            },
          },
        });
      }
    });

    console.log('Donación procesada exitosamente:', donation.id);

  } catch (error) {
    console.error('Error procesando pago exitoso:', error);
  }
}

// Manejar pago fallido
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Procesando pago fallido:', paymentIntent.id);

    // Buscar la donación en la base de datos
    const donation = await prisma.donation.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    if (!donation) {
      console.error('Donación no encontrada para Payment Intent fallido:', paymentIntent.id);
      return;
    }

    // Actualizar el estado de la donación a FAILED
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: 'FAILED',
      },
    });

    console.log('Donación marcada como fallida:', donation.id);

  } catch (error) {
    console.error('Error procesando pago fallido:', error);
  }
}

// Manejar disputa de cargo
async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  try {
    console.log('Procesando disputa de cargo:', dispute.id);

    // Buscar la donación por el charge ID
    const donation = await prisma.donation.findFirst({
      where: {
        stripeChargeId: dispute.charge as string,
      },
      include: {
        campaign: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      }
    });

    if (!donation) {
      console.error('Donación no encontrada para disputa:', dispute.id);
      return;
    }

    // Notificar al creador de la campaña sobre la disputa
    await prisma.notification.create({
      data: {
        title: 'Disputa de pago',
        message: `Se ha iniciado una disputa para una donación de $${donation.amount} en tu campaña "${donation.campaign.title}"`,
        type: 'dispute',
        userId: donation.campaign.creator.id,
        data: {
          donationId: donation.id,
          campaignId: donation.campaignId,
          disputeId: dispute.id,
          amount: donation.amount,
          reason: dispute.reason,
        },
      },
    });

    console.log('Notificación de disputa creada para donación:', donation.id);

  } catch (error) {
    console.error('Error procesando disputa de cargo:', error);
  }
}