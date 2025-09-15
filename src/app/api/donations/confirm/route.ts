import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Schema de validación
const confirmDonationSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment Intent ID requerido'),
});

export async function POST(request: NextRequest) {
  try {
    // Parsear el cuerpo de la petición
    const body = await request.json();
    const { paymentIntentId } = confirmDonationSchema.parse(body);

    // Buscar la donación en la base de datos
    const donation = await prisma.donation.findFirst({
      where: {
        stripePaymentIntentId: paymentIntentId,
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            currentAmount: true,
            goalAmount: true,
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
      return NextResponse.json(
        { error: 'Donación no encontrada' },
        { status: 404 }
      );
    }

    // Verificar el estado del Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'El pago no se ha completado exitosamente' },
        { status: 400 }
      );
    }

    // Si la donación ya está procesada, no hacer nada
    if (donation.status === 'COMPLETED') {
      return NextResponse.json({
        success: true,
        message: 'Donación ya procesada',
        donation: {
          id: donation.id,
          amount: donation.amount,
          status: donation.status,
        }
      });
    }

    // Actualizar la donación y la campaña en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar la donación
      const updatedDonation = await tx.donation.update({
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
      }

      return { updatedDonation, updatedCampaign };
    });

    // Crear notificación para el creador de la campaña (si no es anónima)
    if (!donation.isAnonymous && donation.donor) {
      await prisma.notification.create({
        data: {
          title: 'Nueva donación recibida',
          message: `${donation.donor.firstName} ${donation.donor.lastName || ''} ha donado $${donation.amount} a tu campaña "${donation.campaign.title}"`,
          type: 'donation',
          userId: donation.campaign.id, // Esto debería ser el ID del creador
          data: {
            donationId: donation.id,
            campaignId: donation.campaignId,
            amount: donation.amount,
            donorName: `${donation.donor.firstName} ${donation.donor.lastName || ''}`,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Donación confirmada exitosamente',
      donation: {
        id: result.updatedDonation.id,
        amount: result.updatedDonation.amount,
        currency: result.updatedDonation.currency,
        status: result.updatedDonation.status,
        processedAt: result.updatedDonation.processedAt,
      },
      campaign: {
        id: donation.campaign.id,
        title: donation.campaign.title,
        currentAmount: result.updatedCampaign.currentAmount,
        goalAmount: result.updatedCampaign.goalAmount,
        progressPercentage: Math.min(
          (Number(result.updatedCampaign.currentAmount) / Number(result.updatedCampaign.goalAmount)) * 100,
          100
        ),
      }
    });

  } catch (error) {
    console.error('Error confirmando donación:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: 'Error de Stripe', message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}