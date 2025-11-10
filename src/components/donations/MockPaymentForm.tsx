'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Lock, CheckCircle, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  validateCardNumber,
  validateExpiryDate,
  validateCVV,
  formatCardNumber as formatCard,
  formatExpiryDate as formatExpiry,
  detectCardBrand,
  type CardBrand,
} from '@/lib/card-validation';

// Schema de validación mejorado para el formulario de pago
const paymentSchema = z.object({
  amount: z.string()
    .min(1, 'El monto es requerido')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 100;
    }, 'El monto mínimo es $100'),
  cardNumber: z.string()
    .min(1, 'Número de tarjeta es requerido')
    .refine((val) => {
      const validation = validateCardNumber(val);
      return validation.isValid;
    }, 'Número de tarjeta inválido'),
  expiryDate: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato inválido (MM/YY)')
    .refine((val) => {
      const [month, year] = val.split('/');
      const validation = validateExpiryDate(month, year);
      return validation.isValid;
    }, 'Tarjeta expirada o fecha inválida'),
  cvv: z.string()
    .min(1, 'CVV es requerido')
    .refine((val) => {
      return /^\d{3,4}$/.test(val);
    }, 'CVV inválido (3 o 4 dígitos)'),
  cardholderName: z.string()
    .min(2, 'Nombre del titular es requerido')
    .max(50, 'Nombre muy largo')
    .refine((val) => {
      return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val);
    }, 'Solo se permiten letras y espacios'),
  email: z.string()
    .min(1, 'Email es requerido')
    .email('Email inválido'),
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
  const [detectedBrand, setDetectedBrand] = useState<CardBrand>('unknown');
  const [cardType, setCardType] = useState<'credit' | 'debit' | 'prepaid' | 'unknown'>('unknown');
  const [isCardValid, setIsCardValid] = useState<boolean>(false);

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
    mode: 'onChange', // Validación en tiempo real
  });

  // Montos sugeridos en pesos uruguayos
  const suggestedAmounts = [500, 1000, 2500, 5000, 10000];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
    }).format(amount);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCard(value);
    setValue('cardNumber', formatted, { shouldValidate: true });

    // Detectar bandera de tarjeta
    const cleaned = formatted.replace(/\s/g, '');
    if (cleaned.length >= 4) {
      const brandInfo = detectCardBrand(cleaned);
      setDetectedBrand(brandInfo.brand);

      // Validar tarjeta completa
      const validation = validateCardNumber(formatted);
      setIsCardValid(validation.isValid);
      setCardType(validation.type);
    } else {
      setDetectedBrand('unknown');
      setIsCardValid(false);
      setCardType('unknown');
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setValue('expiryDate', formatted, { shouldValidate: true });
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
      // Primero simular el procesamiento del pago
      await simulatePayment(data);

      // Preparar datos para enviar a la API
      const brandDisplay = getCardBrandDisplay(detectedBrand);
      const typeDisplay = getCardTypeDisplay(cardType);
      const transactionId = `TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Enviar la donación a la API real para guardar en la base de datos
      const response = await fetch('/api/donations/mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaign.id,
          amount: parseFloat(data.amount),
          currency: 'UYU',
          message: '', // Puedes agregar un campo de mensaje opcional
          isAnonymous: false,
          cardBrand: brandDisplay.name,
          cardType: typeDisplay.name,
          cardLastFour: data.cardNumber.replace(/\s/g, '').slice(-4),
          cardholderName: data.cardholderName,
          email: data.email,
          transactionId: transactionId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar la donación');
      }

      // Crear datos de donación para mostrar en la UI
      const mockDonation = {
        id: result.donation.id,
        amount: result.donation.amount,
        currency: result.donation.currency,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        donorName: data.cardholderName,
        donorEmail: data.email,
        paymentMethod: `${brandDisplay.name} ${typeDisplay.name}`.trim(),
        cardBrand: brandDisplay.name,
        cardType: typeDisplay.name,
        cardLastFour: data.cardNumber.replace(/\s/g, '').slice(-4),
        status: 'completed',
        createdAt: result.donation.processedAt,
        transactionId: result.donation.transactionId,
        processedAt: result.donation.processedAt,
        // Información de la campaña actualizada
        campaignCurrentAmount: result.campaign.currentAmount,
        campaignGoalAmount: result.campaign.goalAmount,
        campaignProgressPercentage: result.campaign.progressPercentage,
      };

      setDonationData(mockDonation);
      setStep('success');

      toast.success('¡Pago procesado exitosamente!');
      toast.info('Se han enviado emails de confirmación', { duration: 5000 });

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

  const getCardBrandDisplay = (brand: CardBrand) => {
    const brandMap: Record<CardBrand, { name: string; color: string }> = {
      visa: { name: 'Visa', color: 'bg-blue-600' },
      mastercard: { name: 'Mastercard', color: 'bg-red-600' },
      amex: { name: 'American Express', color: 'bg-blue-500' },
      discover: { name: 'Discover', color: 'bg-orange-600' },
      diners: { name: 'Diners Club', color: 'bg-blue-700' },
      jcb: { name: 'JCB', color: 'bg-blue-800' },
      unionpay: { name: 'UnionPay', color: 'bg-red-700' },
      maestro: { name: 'Maestro', color: 'bg-blue-400' },
      elo: { name: 'Elo', color: 'bg-yellow-500' },
      hipercard: { name: 'Hipercard', color: 'bg-red-500' },
      unknown: { name: '', color: 'bg-gray-500' },
    };
    return brandMap[brand];
  };

  const getCardTypeDisplay = (type: 'credit' | 'debit' | 'prepaid' | 'unknown') => {
    const typeMap = {
      credit: { name: 'Crédito', color: 'bg-green-600' },
      debit: { name: 'Débito', color: 'bg-purple-600' },
      prepaid: { name: 'Prepago', color: 'bg-yellow-600' },
      unknown: { name: '', color: 'bg-gray-500' },
    };
    return typeMap[type];
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
          <p className="text-gray-600 text-center mb-2">
            Tu donación ha sido procesada correctamente
          </p>

          {/* Barra de progreso de la campaña */}
          {donationData.campaignProgressPercentage !== undefined && (
            <div className="w-full mb-4 px-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(donationData.campaignProgressPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-center text-gray-500 mt-1">
                Progreso de la campaña: {donationData.campaignProgressPercentage.toFixed(1)}%
              </p>
            </div>
          )}

          <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monto:</span>
                <span className="font-bold text-lg text-green-700">{formatCurrency(donationData.amount)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Campaña:</span>
                  <span className="font-semibold truncate ml-2 max-w-[200px]">{donationData.campaignTitle}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Método de pago:</span>
                <div className="flex gap-1">
                  {donationData.cardBrand && (
                    <Badge variant="secondary" className="text-xs">
                      {donationData.cardBrand}
                    </Badge>
                  )}
                  {donationData.cardType && (
                    <Badge variant="outline" className="text-xs">
                      {donationData.cardType}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tarjeta:</span>
                <span className="font-mono font-semibold">**** **** **** {donationData.cardLastFour}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Donante:</span>
                <span className="font-semibold">{donationData.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="text-xs truncate ml-2 max-w-[200px]">{donationData.donorEmail}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">ID Transacción:</span>
                  <span className="font-mono font-semibold">{donationData.transactionId}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-500">Fecha:</span>
                  <span>{new Date(donationData.processedAt).toLocaleString('es-UY')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información sobre emails enviados */}
          <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Emails de confirmación enviados</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>✓ Recibo de donación enviado a {donationData.donorEmail}</li>
                  <li>✓ El creador recibirá los fondos una vez valide sus datos empresariales</li>
                </ul>
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
                className={`${errors.cardNumber ? 'border-red-500' : isCardValid ? 'border-green-500' : ''} pr-24`}
                maxLength={23} // Aumentado para soportar American Express con espacios
                autoComplete="cc-number"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {isCardValid && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                {detectedBrand !== 'unknown' && (
                  <div className="flex gap-1">
                    <Badge variant="secondary" className={`${getCardBrandDisplay(detectedBrand).color} text-white text-xs px-2 py-0`}>
                      {getCardBrandDisplay(detectedBrand).name}
                    </Badge>
                    {cardType !== 'unknown' && (
                      <Badge variant="outline" className={`${getCardTypeDisplay(cardType).color} text-white text-xs px-2 py-0`}>
                        {getCardTypeDisplay(cardType).name}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
            {errors.cardNumber && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.cardNumber.message}
              </p>
            )}
            {!errors.cardNumber && isCardValid && (
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Tarjeta válida
              </p>
            )}
          </div>

          {/* Fecha de expiración y CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Fecha de expiración</Label>
              <div className="relative">
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  {...register('expiryDate')}
                  onChange={handleExpiryChange}
                  className={`${errors.expiryDate ? 'border-red-500' : watch('expiryDate')?.length === 5 && !errors.expiryDate ? 'border-green-500' : ''}`}
                  maxLength={5}
                  autoComplete="cc-exp"
                />
                {watch('expiryDate')?.length === 5 && !errors.expiryDate && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
              {errors.expiryDate && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.expiryDate.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="cvv">
                CVV
                <span className="text-xs text-gray-500 ml-1">
                  ({detectedBrand === 'amex' ? '4 dígitos' : '3 dígitos'})
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="cvv"
                  type="password"
                  placeholder={detectedBrand === 'amex' ? '1234' : '123'}
                  {...register('cvv')}
                  className={`${errors.cvv ? 'border-red-500' : watch('cvv')?.length >= 3 && !errors.cvv ? 'border-green-500' : ''}`}
                  maxLength={4}
                  autoComplete="cc-csc"
                  inputMode="numeric"
                />
                {watch('cvv')?.length >= 3 && !errors.cvv && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
              {errors.cvv && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.cvv.message}
                </p>
              )}
            </div>
          </div>

          {/* Nombre del titular */}
          <div>
            <Label htmlFor="cardholderName">Nombre del titular (como aparece en la tarjeta)</Label>
            <div className="relative">
              <Input
                id="cardholderName"
                placeholder="JUAN PÉREZ"
                {...register('cardholderName')}
                className={`${errors.cardholderName ? 'border-red-500' : watch('cardholderName')?.length >= 3 && !errors.cardholderName ? 'border-green-500' : ''} uppercase`}
                autoComplete="cc-name"
                style={{ textTransform: 'uppercase' }}
              />
              {watch('cardholderName')?.length >= 3 && !errors.cardholderName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              )}
            </div>
            {errors.cardholderName && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.cardholderName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email de confirmación</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="juan@ejemplo.com"
                {...register('email')}
                className={`${errors.email ? 'border-red-500' : watch('email')?.includes('@') && !errors.email ? 'border-green-500' : ''}`}
                autoComplete="email"
              />
              {watch('email')?.includes('@') && !errors.email && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              )}
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Tarjetas aceptadas */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-xs font-medium text-blue-900 mb-2">Tarjetas Aceptadas:</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="bg-white text-blue-700 text-xs">Visa</Badge>
              <Badge variant="outline" className="bg-white text-red-700 text-xs">Mastercard</Badge>
              <Badge variant="outline" className="bg-white text-blue-600 text-xs">American Express</Badge>
              <Badge variant="outline" className="bg-white text-purple-600 text-xs">Maestro</Badge>
              <Badge variant="outline" className="bg-white text-orange-600 text-xs">Discover</Badge>
            </div>
          </div>

          {/* Información de seguridad */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="font-medium">Pago seguro y encriptado</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-1 ml-6">
              <li>• Validación en tiempo real con algoritmo Luhn</li>
              <li>• Detección automática de tipo y bandera de tarjeta</li>
              <li>• Verificación de fecha de expiración</li>
            </ul>
            <p className="text-xs text-orange-600 font-medium mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
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
