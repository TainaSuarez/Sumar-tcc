'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Heart, CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Inicializar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Campaign {
  id: string;
  title: string;
  goalAmount: number;
  currentAmount: number;
  currency: string;
  creator: {
    firstName: string;
    lastName: string;
    organizationName?: string;
  };
}

interface DonationFormProps {
  campaign: Campaign;
  onSuccess?: (donationId: string) => void;
  onCancel?: () => void;
}

// Componente interno que usa Stripe hooks
function DonationFormContent({ campaign, onSuccess, onCancel }: DonationFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();
  const router = useRouter();
  
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [donationId, setDonationId] = useState<string>('');
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [error, setError] = useState<string>('');

  // Montos sugeridos
  const suggestedAmounts = [500, 1000, 2500, 5000, 10000];

  const handleAmountSelect = (suggestedAmount: number) => {
    setAmount(suggestedAmount.toString());
  };

  const handleCreatePaymentIntent = async () => {
    if (!amount || parseFloat(amount) < 100) {
      setError('El monto mínimo de donación es $100 UYU');
      return;
    }

    if (!session) {
      toast.error('Debes iniciar sesión para realizar una donación');
      router.push('/auth/login');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/donations/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaign.id,
          amount: parseFloat(amount),
          currency: campaign.currency || 'UYU',
          message: message.trim() || undefined,
          isAnonymous,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la intención de pago');
      }

      setClientSecret(data.clientSecret);
      setDonationId(data.donationId);
      setStep('payment');

    } catch (error) {
      console.error('Error creando Payment Intent:', error);
      setError(error instanceof Error ? error.message : 'Error inesperado');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Error al obtener los datos de la tarjeta');
      setIsProcessing(false);
      return;
    }

    try {
      // Confirmar el pago con Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: session?.user?.name || 'Donante Anónimo',
              email: session?.user?.email || undefined,
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || 'Error en el pago');
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirmar la donación en nuestro backend
        const confirmResponse = await fetch('/api/donations/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            donationId,
            paymentIntentId: paymentIntent.id,
          }),
        });

        if (!confirmResponse.ok) {
          const confirmData = await confirmResponse.json();
          throw new Error(confirmData.error || 'Error al confirmar la donación');
        }

        setStep('success');
        toast.success('¡Donación realizada con éxito!');
        
        if (onSuccess) {
          onSuccess(donationId);
        }
      }

    } catch (error) {
      console.error('Error procesando pago:', error);
      setError(error instanceof Error ? error.message : 'Error inesperado');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'UYU') => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (step === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Donación Exitosa!
              </h3>
              <p className="text-gray-600 mb-4">
                Tu donación de {formatCurrency(parseFloat(amount))} ha sido procesada correctamente.
              </p>
              <p className="text-sm text-gray-500">
                Recibirás un email de confirmación en breve.
              </p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
                className="w-full"
              >
                Ver Campaña
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/profile/donations')}
                className="w-full"
              >
                Ver Mis Donaciones
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'payment') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Información de Pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            {/* Resumen de la donación */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Campaña:</span>
                <span className="text-sm font-medium">{campaign.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monto:</span>
                <span className="text-sm font-medium">{formatCurrency(parseFloat(amount))}</span>
              </div>
              {message && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mensaje:</span>
                  <span className="text-sm font-medium truncate ml-2">{message}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Donación anónima:</span>
                <span className="text-sm font-medium">{isAnonymous ? 'Sí' : 'No'}</span>
              </div>
            </div>

            {/* Elemento de tarjeta de Stripe */}
            <div className="space-y-2">
              <Label>Información de la Tarjeta</Label>
              <div className="p-3 border rounded-md">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Lock className="w-3 h-3" />
              <span>Tus datos están protegidos con encriptación SSL</span>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('form')}
                className="flex-1"
                disabled={isProcessing}
              >
                Volver
              </Button>
              <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Procesando...' : `Donar ${formatCurrency(parseFloat(amount))}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Formulario inicial
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Realizar Donación
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Información de la campaña */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-1">{campaign.title}</h4>
            <p className="text-sm text-blue-700">
              Creada por {campaign.creator.organizationName || 
                `${campaign.creator.firstName} ${campaign.creator.lastName}`}
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-sm">
                <span>Progreso:</span>
                <span>{formatCurrency(campaign.currentAmount)} de {formatCurrency(campaign.goalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Montos sugeridos */}
          <div className="space-y-2">
            <Label>Montos Sugeridos</Label>
            <div className="grid grid-cols-3 gap-2">
              {suggestedAmounts.map((suggestedAmount) => (
                <Button
                  key={suggestedAmount}
                  type="button"
                  variant={amount === suggestedAmount.toString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAmountSelect(suggestedAmount)}
                  className="text-xs"
                >
                  ${suggestedAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Monto personalizado */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto Personalizado (UYU)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Ingresa el monto"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              step="1"
            />
            <p className="text-xs text-gray-500">Monto mínimo: $100 UYU</p>
          </div>

          {/* Mensaje opcional */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje de Apoyo (Opcional)</Label>
            <Textarea
              id="message"
              placeholder="Escribe un mensaje de apoyo para la campaña..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-gray-500">{message.length}/500 caracteres</p>
          </div>

          {/* Donación anónima */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Realizar donación anónima
            </Label>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancelar
              </Button>
            )}
            <Button
              onClick={handleCreatePaymentIntent}
              disabled={!amount || parseFloat(amount) < 100 || isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Procesando...' : 'Continuar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente principal que envuelve con Elements provider
export function DonationForm(props: DonationFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <DonationFormContent {...props} />
    </Elements>
  );
}

export default DonationForm;