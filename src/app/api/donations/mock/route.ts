import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { sendDonationThankYouEmail, sendDonationPendingVerificationEmail } from '@/lib/email-service';

// Schema de validación para donación simulada
const mockDonationSchema = z.object({
  campaignId: z.string().min(1, 'ID de campaña requerido'),
  amount: z.number().min(100, 'El monto mínimo es $100'),
  currency: z.string().default('UYU'),
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  cardBrand: z.string().optional(),
  cardType: z.string().optional(),
  cardLastFour: z.string().length(4, 'Últimos 4 dígitos de la tarjeta'),
  cardholderName: z.string().min(2, 'Nombre del titular requerido'),
  email: z.string().email('Email inválido'),
  transactionId: z.string().min(1, 'ID de transacción requerido'),
});

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación (opcional para donaciones anónimas)
    const session = await getServerSession(authOptions);

    // Parsear el cuerpo de la petición
    const body = await request.json();
    const validatedData = mockDonationSchema.parse(body);

    const {
      campaignId,
      amount,
      currency,
      message,
      isAnonymous,
      cardBrand,
      cardType,
      cardLastFour,
      cardholderName,
      email,
      transactionId,
    } = validatedData;

    // Verificar que la campaña existe y está activa
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            organizationName: true,
            email: true,
          }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'La campaña no está disponible para donaciones' },
        { status: 400 }
      );
    }

    // Crear el registro de donación y actualizar la campaña en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear la donación con estado COMPLETED (pago simulado exitoso)
      const donation = await tx.donation.create({
        data: {
          amount: amount,
          currency: currency.toUpperCase(),
          message: message,
          isAnonymous: isAnonymous,
          paymentMethod: 'STRIPE', // Usamos STRIPE aunque sea simulado
          status: 'COMPLETED',
          processedAt: new Date(),
          donorId: session?.user?.id || null,
          campaignId: campaign.id,
          // Guardar información de la tarjeta (simulada) como metadata
          stripeMetadata: {
            cardBrand: cardBrand || 'Unknown',
            cardType: cardType || 'Unknown',
            cardLastFour: cardLastFour,
            cardholderName: cardholderName,
            transactionId: transactionId,
            isMockPayment: true,
            mockPaymentEmail: email,
          },
        },
      });

      // Actualizar el monto actual de la campaña (acumulativo)
      const updatedCampaign = await tx.campaign.update({
        where: { id: campaign.id },
        data: {
          currentAmount: {
            increment: amount, // Suma acumulativa
          },
        },
      });

      // Verificar si la campaña alcanzó su objetivo
      if (updatedCampaign.currentAmount >= updatedCampaign.goalAmount) {
        await tx.campaign.update({
          where: { id: campaign.id },
          data: {
            status: 'COMPLETED',
          },
        });
      }

      return { donation, updatedCampaign };
    });

    // Crear notificación para el creador de la campaña
    if (!isAnonymous && (session?.user || email)) {
      const donorName = session?.user
        ? `${session.user.name || 'Donante'}`
        : cardholderName;

      await prisma.notification.create({
        data: {
          title: 'Nueva donación recibida',
          message: `${donorName} ha donado $${amount} ${currency} a tu campaña "${campaign.title}"`,
          type: 'donation',
          userId: campaign.creator.id,
          data: {
            donationId: result.donation.id,
            campaignId: campaign.id,
            amount: amount,
            donorName: donorName,
            cardBrand: cardBrand,
            cardType: cardType,
          },
        },
      });
    }

    // Enviar emails de agradecimiento
    try {
      // Email para el donante
      await sendDonationThankYouEmail({
        donorEmail: email,
        donorName: cardholderName,
        amount: amount,
        currency: currency,
        campaignTitle: campaign.title,
        campaignCreator: campaign.creator.organizationName ||
          `${campaign.creator.firstName} ${campaign.creator.lastName}`,
        transactionId: transactionId,
        donationId: result.donation.id,
        cardLastFour: cardLastFour,
        cardBrand: cardBrand,
      });

      // Email informando que el pago está pendiente de verificación del creador
      await sendDonationPendingVerificationEmail({
        donorEmail: email,
        donorName: cardholderName,
        amount: amount,
        currency: currency,
        campaignTitle: campaign.title,
        campaignCreator: campaign.creator.organizationName ||
          `${campaign.creator.firstName} ${campaign.creator.lastName}`,
      });
    } catch (emailError) {
      console.error('Error enviando emails:', emailError);
      // No fallar la transacción si falla el email
    }

    // Calcular el progreso
    const progressPercentage = Math.min(
      (Number(result.updatedCampaign.currentAmount) / Number(result.updatedCampaign.goalAmount)) * 100,
      100
    );

    return NextResponse.json({
      success: true,
      message: 'Donación procesada exitosamente',
      donation: {
        id: result.donation.id,
        amount: result.donation.amount,
        currency: result.donation.currency,
        status: result.donation.status,
        processedAt: result.donation.processedAt,
        transactionId: transactionId,
      },
      campaign: {
        id: campaign.id,
        title: campaign.title,
        currentAmount: result.updatedCampaign.currentAmount,
        goalAmount: result.updatedCampaign.goalAmount,
        progressPercentage: progressPercentage,
        status: result.updatedCampaign.status,
      },
      emailSent: true,
    });

  } catch (error) {
    console.error('Error procesando donación simulada:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
