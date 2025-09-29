'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Schema de validación para el formulario de pago
const paymentSchema = z.object({
  amount: z.string().min(1, 'El monto es requerido'),
  cardNumber: z.string()
    .min(1, 'Número de tarjeta es requerido')
    .refine((val) => {
      const cleaned = val.replace(/\s/g, '');
      return cleaned.length >= 13 && cleaned.length <= 19;
    }, 'Número de tarjeta debe tener entre 13 y 19 dígitos')
    .refine((val) => {
      const cleaned = val.replace(/\s/g, '');
      return /^\d+$/.test(cleaned);
    }, 'Solo se permiten números'),
  expiryDate: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato inválido (MM/YY)'),
  cvv: z.string()
    .min(3, 'CVV debe tener al menos 3 dígitos')
    .max(4, 'CVV debe tener máximo 4 dígitos')
    .regex(/^\d+$/, 'CVV solo debe contener números'),
  cardholderName: z.string()
    .min(2, 'Nombre del titular es requerido')
    .max(50, 'Nombre muy largo'),
  email: z.string().email('Email inválido'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface MockPaymentFormProps {
  campaign: {
    id: string;
    title: string;
    goalAmount: number;
    currentAmount: number;
  };
  onSuccess?: (donationData: any) => void;
  onCancel?: () => void;
}

type PaymentStep = 'form' | 'processing' | 'success' | 'error';

export function MockPaymentForm({ campaign, onSuccess, onCancel }: MockPaymentFormProps) {
  const [step, setStep] = useState<PaymentStep>('form');
  const [donationData, setDonationData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      email: '',
    },
  });

  // Montos sugeridos en pesos uruguayos
  const suggestedAmounts = [500, 1000, 2500, 5000, 10000];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
    }).format(amount);
  };

  const formatCardNumber = (value: string) => {
    // Remover espacios y caracteres no numéricos
    const cleaned = value.replace(/\D/g, '');
    // Limitar a 16 dígitos máximo
    const limited = cleaned.slice(0, 16);
    // Agregar espacios cada 4 dígitos
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatExpiryDate = (value: string) => {
    // Remover caracteres no numéricos
    const cleaned = value.replace(/\D/g, '');
    // Agregar barra después de 2 dígitos
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setValue('cardNumber', formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setValue('expiryDate', formatted);
  };

  const handleAmountSelect = (amount: number) => {
    setValue('amount', amount.toString());
  };

  const simulatePayment = async (data: PaymentFormData): Promise<void> => {
    // Simular tiempo de procesamiento (2-4 segundos)
    const processingTime = Math.random() * 2000 + 2000;
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular éxito/fallo (95% de éxito)
        const isSuccess = Math.random() > 0.05;
        
        if (isSuccess) {
          resolve();
        } else {
          reject(new Error('Pago rechazado. Por favor, verifica los datos de tu tarjeta.'));
        }
      }, processingTime);
    });
  };

  const onSubmit = async (data: PaymentFormData) => {
    setStep('processing');

    try {
      await simulatePayment(data);

      // Crear datos de donación simulada
      const mockDonation = {
        id: `mock_${Date.now()}`,
        amount: parseFloat(data.amount),
        currency: 'UYU',
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        donorName: data.cardholderName,
        donorEmail: data.email,
        paymentMethod: 'Tarjeta de Crédito',
        cardLastFour: data.cardNumber.replace(/\s/g, '').slice(-4),
        status: 'completed',
        createdAt: new Date().toISOString(),
        transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
      };

      setDonationData(mockDonation);
      setStep('success');
      
      toast.success('¡Pago procesado exitosamente!');
      
      if (onSuccess) {
        onSuccess(mockDonation);
      }

    } catch (error) {
      console.error('Error en pago simulado:', error);
      setStep('error');
      toast.error(error instanceof Error ? error.message : 'Error en el procesamiento');
    }
  };

  const handleRetry = () => {
    setStep('form');
    setDonationData(null);
  };

  const getCardType = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'Mastercard';
    if (cleaned.startsWith('3')) return 'American Express';
    return 'Tarjeta';
  };

  // Pantalla de procesamiento
  if (step === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Procesando pago...</h3>
          <p className="text-gray-600 text-center mb-4">
            Estamos verificando los datos de tu tarjeta
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">No cierres esta ventana</p>
        </CardContent>
      </Card>
    );
  }

  // Pantalla de éxito
  if (step === 'success' && donationData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="bg-green-100 rounded-full p-3 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-green-700">¡Pago Exitoso!</h3>
          <p className="text-gray-600 text-center mb-6">
            Tu donación ha sido procesada correctamente
          </p>
          
          <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Monto:</span>
                <span className="font-semibold">{formatCurrency(donationData.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Campaña:</span>
                <span className="font-semibold truncate ml-2">{donationData.campaignTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Método:</span>
                <span className="font-semibold">**** {donationData.cardLastFour}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID Transacción:</span>
                <span className="font-mono text-xs">{donationData.transactionId}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button 
              onClick={onCancel} 
              variant="outline" 
              className="flex-1"
            >
              Cerrar
            </Button>
            <Button 
              onClick={() => window.print()} 
              className="flex-1"
            >
              Imprimir Recibo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pantalla de error
  if (step === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="bg-red-100 rounded-full p-3 mb-4">
            <CreditCard className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-red-700">Pago Rechazado</h3>
          <p className="text-gray-600 text-center mb-6">
            Hubo un problema al procesar tu pago. Por favor, verifica los datos de tu tarjeta.
          </p>
          
          <div className="flex gap-3 w-full">
            <Button 
              onClick={onCancel} 
              variant="outline" 
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleRetry} 
              className="flex-1"
            >
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Formulario principal
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Información de Pago
        </CardTitle>
        <div className="text-sm text-gray-600">
          <p className="font-semibold">{campaign.title}</p>
          <p>Meta: {formatCurrency(campaign.goalAmount)}</p>
          <p>Recaudado: {formatCurrency(campaign.currentAmount)}</p>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Monto */}
          <div>
            <Label htmlFor="amount">Monto a donar</Label>
            <div className="grid grid-cols-3 gap-2 mt-2 mb-2">
              {suggestedAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAmountSelect(amount)}
                  className="text-xs"
                >
                  ${amount}
                </Button>
              ))}
            </div>
            <Input
              id="amount"
              type="number"
              placeholder="Monto personalizado"
              {...register('amount')}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Número de tarjeta */}
          <div>
            <Label htmlFor="cardNumber">Número de tarjeta</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                {...register('cardNumber')}
                onChange={handleCardNumberChange}
                className={errors.cardNumber ? 'border-red-500' : ''}
                maxLength={19}
                autoComplete="cc-number"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-gray-500">
                  {watch('cardNumber') && getCardType(watch('cardNumber'))}
                </span>
              </div>
            </div>
            {errors.cardNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>
            )}
          </div>

          {/* Fecha de expiración y CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Fecha de expiración</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                {...register('expiryDate')}
                onChange={handleExpiryChange}
                className={errors.expiryDate ? 'border-red-500' : ''}
                maxLength={5}
                autoComplete="cc-exp"
              />
              {errors.expiryDate && (
                <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="password"
                placeholder="123"
                {...register('cvv')}
                className={errors.cvv ? 'border-red-500' : ''}
                maxLength={4}
                autoComplete="cc-csc"
              />
              {errors.cvv && (
                <p className="text-red-500 text-sm mt-1">{errors.cvv.message}</p>
              )}
            </div>
          </div>

          {/* Nombre del titular */}
          <div>
            <Label htmlFor="cardholderName">Nombre del titular</Label>
              <Input
                id="cardholderName"
                placeholder="Juan Pérez"
                {...register('cardholderName')}
                className={errors.cardholderName ? 'border-red-500' : ''}
                autoComplete="cc-name"
              />
            {errors.cardholderName && (
              <p className="text-red-500 text-sm mt-1">{errors.cardholderName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="juan@ejemplo.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Información de seguridad */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lock className="h-4 w-4" />
              <span>Pago seguro y encriptado</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Esta es una simulación. No se procesarán pagos reales.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Donar {watch('amount') && formatCurrency(parseFloat(watch('amount')) || 0)}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
