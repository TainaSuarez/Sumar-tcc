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
const createPaymentIntentSchema = z.object({
  campaignId: z.string().min(1, 'ID de campaña requerido'),
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  currency: z.string().default('uyu'),
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación (opcional para donaciones anónimas)
    const session = await getServerSession(authOptions);
    
    // Parsear el cuerpo de la petición
    const body = await request.json();
    const validatedData = createPaymentIntentSchema.parse(body);
    
    const { campaignId, amount, currency, message, isAnonymous } = validatedData;

    // Verificar que la campaña existe y está activa
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        title: true,
        status: true,
        goalAmount: true,
        currentAmount: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            organizationName: true,
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

    if (campaign.status !== 'ACTIVE' && campaign.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'La campaña no está disponible para donaciones' },
        { status: 400 }
      );
    }

    // Convertir el monto a centavos (Stripe maneja montos en centavos)
    const amountInCents = Math.round(amount * 100);

    // Crear el Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        donorId: session?.user?.id || 'anonymous',
        isAnonymous: isAnonymous.toString(),
        message: message || '',
      },
      description: `Donación para: ${campaign.title}`,
    });

    // Crear el registro de donación en la base de datos con estado PENDING
    const donation = await prisma.donation.create({
      data: {
        amount: amount,
        currency: currency.toUpperCase(),
        message: message,
        isAnonymous: isAnonymous,
        paymentMethod: 'STRIPE',
        stripePaymentIntentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret,
        stripeMetadata: paymentIntent.metadata,
        status: 'PENDING',
        donorId: session?.user?.id || null,
        campaignId: campaign.id,
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      donationId: donation.id,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
      donation: {
        id: donation.id,
        amount: donation.amount,
        currency: donation.currency,
        status: donation.status,
      },
      campaign: {
        id: campaign.id,
        title: campaign.title,
      }
    });

  } catch (error) {
    console.error('Error creando Payment Intent:', error);
    
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