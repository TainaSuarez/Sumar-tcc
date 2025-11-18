# Sistema de Donaciones - Documentación Completa

Este documento describe el sistema completo de donaciones implementado en la plataforma Sumar+.

## 📋 Tabla de Contenidos

1. [Resumen General](#resumen-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Flujo de Donación](#flujo-de-donación)
4. [Sistema de Pagos](#sistema-de-pagos)
5. [Base de Datos](#base-de-datos)
6. [Emails Automáticos](#emails-automáticos)
7. [APIs Implementadas](#apis-implementadas)
8. [Testing](#testing)

---

## 🎯 Resumen General

El sistema de donaciones permite a los usuarios contribuir a campañas de manera segura y profesional. Incluye:

- ✅ **Validación profesional de tarjetas** (Algoritmo de Luhn)
- ✅ **Detección automática de banderas** (Visa, Mastercard, Amex, etc.)
- ✅ **Progress bar acumulativo** que se actualiza en tiempo real
- ✅ **Sistema de emails automáticos** de confirmación
- ✅ **Notificación de verificación pendiente** para el creador
- ✅ **Persistencia en base de datos** con transacciones atómicas

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Usuario (Donante)                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              MockPaymentForm Component                       │
│  • Validación de tarjeta (Luhn)                             │
│  • Detección de bandera y tipo                              │
│  • Máscaras de entrada                                       │
│  • Validación en tiempo real                                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              API /api/donations/mock                         │
│  • Validación de datos                                       │
│  • Transacción de base de datos                             │
│  • Actualización acumulativa del progress                    │
│  • Envío de emails                                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
┌──────────────────────┐  ┌──────────────────────┐
│  Base de Datos       │  │  Email Service       │
│  • Donation          │  │  • Thank you email   │
│  • Campaign          │  │  • Pending email     │
│  • Notification      │  │                      │
└──────────────────────┘  └──────────────────────┘
```

---

## 🔄 Flujo de Donación

### 1. Ingreso de Datos
El usuario completa el formulario con:
- Monto de donación (mínimo $100 UYU)
- Número de tarjeta (validado con Luhn)
- Fecha de expiración (no puede estar vencida)
- CVV (3 o 4 dígitos según la tarjeta)
- Nombre del titular
- Email de confirmación

### 2. Validación en Tiempo Real
- ✅ Algoritmo de Luhn valida el número de tarjeta
- ✅ Detección automática de bandera (Visa, Mastercard, etc.)
- ✅ Detección de tipo (Crédito/Débito)
- ✅ Indicadores visuales (bordes verdes, checkmarks)
- ✅ Badges de color para bandera y tipo

### 3. Simulación de Pago
- Tiempo de procesamiento: 2-4 segundos
- Tasa de éxito: 95%
- Animación de carga profesional

### 4. Guardado en Base de Datos
```typescript
// Transacción atómica
await prisma.$transaction(async (tx) => {
  // 1. Crear donación
  const donation = await tx.donation.create({...});

  // 2. Actualizar campaña (acumulativo)
  const campaign = await tx.campaign.update({
    where: { id: campaignId },
    data: {
      currentAmount: { increment: amount } // ⚡ Acumulativo
    }
  });

  // 3. Verificar si alcanzó la meta
  if (campaign.currentAmount >= campaign.goalAmount) {
    await tx.campaign.update({
      data: { status: 'COMPLETED' }
    });
  }
});
```

### 5. Envío de Emails
Dos emails son enviados automáticamente:

**a) Email de Agradecimiento** 📧
- Recibo completo de la donación
- Detalles de la transacción
- Información de la campaña
- ID de transacción y donación

**b) Email de Verificación Pendiente** ⏳
- Informa que el pago fue exitoso
- Explica que el creador debe validar sus datos
- Tranquiliza al donante sobre la seguridad

### 6. Actualización de UI
- Progress bar actualizado con nuevo porcentaje
- Notificación de éxito
- Información de emails enviados
- Opción de imprimir recibo

---

## 💳 Sistema de Pagos

### Validaciones Implementadas

#### 1. Número de Tarjeta
```typescript
// Algoritmo de Luhn
export function luhnCheck(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}
```

#### 2. Detección de Bandera
Soporta 10 banderas diferentes:
- Visa (comienza con 4)
- Mastercard (51-55, 2221-2720)
- American Express (34, 37)
- Discover (6011, 65, 644-649)
- Diners Club (36, 38, 300-305)
- JCB (35)
- UnionPay (62, 88)
- Maestro (5018, 5020, 5038, etc.)
- Elo (Brasil)
- Hipercard (Brasil)

#### 3. Validación de Fecha
```typescript
export function validateExpiryDate(month: string, year: string) {
  const monthNum = parseInt(month, 10);
  let yearNum = parseInt(year, 10);

  // Convertir YY a YYYY
  if (yearNum < 100) yearNum += 2000;

  const expiryDate = new Date(yearNum, monthNum - 1, 1);
  const currentDate = new Date();

  return expiryDate >= currentDate;
}
```

#### 4. Validación de CVV
- 3 dígitos para la mayoría de tarjetas
- 4 dígitos para American Express
- Solo números permitidos

---

## 🗄️ Base de Datos

### Modelo de Donación

```prisma
model Donation {
  id              String         @id @default(cuid())
  amount          Float
  currency        String         @default("UYU")
  message         String?
  isAnonymous     Boolean        @default(false)
  paymentMethod   PaymentMethod
  status          DonationStatus @default(PENDING)
  processedAt     DateTime?

  // Metadata (incluye info de tarjeta simulada)
  stripeMetadata  Json?

  // Relaciones
  donorId         String?
  donor           User?          @relation(...)
  campaignId      String
  campaign        Campaign       @relation(...)

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}
```

### Actualización Acumulativa

```typescript
// ✅ CORRECTO - Acumulativo
await prisma.campaign.update({
  where: { id: campaignId },
  data: {
    currentAmount: { increment: donationAmount }
  }
});

// ❌ INCORRECTO - Sobrescribe
await prisma.campaign.update({
  where: { id: campaignId },
  data: {
    currentAmount: newAmount // NO HACER ESTO
  }
});
```

---

## 📧 Emails Automáticos

### Configuración

Los emails se configuran en [`/src/lib/email-service.ts`](src/lib/email-service.ts)

```typescript
// Para implementar con nodemailer:
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.sendMail({
  from: '"Sumar+" <noreply@sumar.com>',
  to: donorEmail,
  subject: '¡Gracias por tu donación!',
  html: htmlContent,
  text: textContent,
});
```

### Variables de Entorno Necesarias

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Plantillas de Email

#### Email 1: Agradecimiento
- **Asunto**: `¡Gracias por tu donación de ${monto}!`
- **Contenido**:
  - Mensaje de agradecimiento personalizado
  - Detalles completos de la donación
  - Información de la campaña
  - IDs de transacción y donación
  - Footer con información de contacto

#### Email 2: Verificación Pendiente
- **Asunto**: `Información sobre tu donación - Verificación pendiente`
- **Contenido**:
  - Confirmación de pago exitoso
  - Explicación de verificación pendiente del creador
  - Tranquilización sobre seguridad
  - Información de qué esperar

---

## 🔌 APIs Implementadas

### POST /api/donations/mock

Procesa una donación simulada y la guarda en la base de datos.

#### Request Body
```typescript
{
  campaignId: string;
  amount: number;         // Mínimo 100
  currency: string;       // Default: "UYU"
  message?: string;
  isAnonymous: boolean;
  cardBrand?: string;     // Ej: "Visa"
  cardType?: string;      // Ej: "Crédito"
  cardLastFour: string;   // Últimos 4 dígitos
  cardholderName: string;
  email: string;
  transactionId: string;
}
```

#### Response Success (200)
```typescript
{
  success: true,
  message: "Donación procesada exitosamente",
  donation: {
    id: string;
    amount: number;
    currency: string;
    status: "COMPLETED";
    processedAt: string;
    transactionId: string;
  },
  campaign: {
    id: string;
    title: string;
    currentAmount: number;      // ⚡ Actualizado
    goalAmount: number;
    progressPercentage: number; // ⚡ Calculado
    status: string;
  },
  emailSent: true
}
```

#### Response Error (400/404/500)
```typescript
{
  error: string;
  details?: any;
}
```

### Validaciones de la API

1. ✅ Campaña existe y está activa
2. ✅ Monto mínimo de $100
3. ✅ Email válido
4. ✅ Tarjeta con últimos 4 dígitos
5. ✅ Nombre del titular presente

---

## 🧪 Testing

### Tarjetas de Prueba

Ver archivo completo: [`PAYMENT_TEST_CARDS.md`](PAYMENT_TEST_CARDS.md)

#### Ejemplos Rápidos

**Visa Crédito**
```
Número: 4532 0151 1234 5678
CVV: 123
Fecha: 12/26
Nombre: JUAN PEREZ
Email: juan@ejemplo.com
```

**Mastercard**
```
Número: 5555 5555 5555 4444
CVV: 456
Fecha: 12/26
Nombre: MARIA GARCIA
Email: maria@ejemplo.com
```

**American Express**
```
Número: 3782 822463 10005
CVV: 1234  (4 dígitos!)
Fecha: 12/26
Nombre: CARLOS LOPEZ
Email: carlos@ejemplo.com
```

### Casos de Prueba

#### ✅ Caso 1: Donación Exitosa
1. Ingresar datos de tarjeta válida
2. Verificar que aparecen badges de bandera y tipo
3. Ver indicadores visuales verdes
4. Submit del formulario
5. Esperar animación de procesamiento
6. Verificar pantalla de éxito
7. Confirmar progress bar actualizado
8. Verificar emails en consola

#### ❌ Caso 2: Tarjeta Inválida (Luhn)
1. Ingresar: `4111 1111 1111 1112`
2. Verificar error: "Número de tarjeta inválido"
3. Formulario no se envía

#### ❌ Caso 3: Fecha Expirada
1. Ingresar: `01/20`
2. Verificar error: "Tarjeta expirada o fecha inválida"
3. Formulario no se envía

#### ✅ Caso 4: Progress Bar Acumulativo
1. Crear una campaña con meta de $10,000
2. Hacer donación de $1,000
3. Verificar progress: 10%
4. Hacer segunda donación de $1,500
5. Verificar progress: 25% (acumulativo!)

---

## 📁 Archivos del Sistema

### Componentes
- [`/src/components/donations/MockPaymentForm.tsx`](src/components/donations/MockPaymentForm.tsx) - Formulario principal
- [`/src/components/donations/MockDonateButton.tsx`](src/components/donations/MockDonateButton.tsx) - Botón de donación
- [`/src/components/donations/MockDonationModal.tsx`](src/components/donations/MockDonationModal.tsx) - Modal

### Librerías
- [`/src/lib/card-validation.ts`](src/lib/card-validation.ts) - Validaciones de tarjeta
- [`/src/lib/email-service.ts`](src/lib/email-service.ts) - Servicio de emails

### APIs
- [`/src/app/api/donations/mock/route.ts`](src/app/api/donations/mock/route.ts) - API de donación mock
- [`/src/app/api/donations/create-payment-intent/route.ts`](src/app/api/donations/create-payment-intent/route.ts) - API de Stripe
- [`/src/app/api/donations/confirm/route.ts`](src/app/api/donations/confirm/route.ts) - Confirmación de Stripe

### Documentación
- [`/PAYMENT_TEST_CARDS.md`](PAYMENT_TEST_CARDS.md) - Tarjetas de prueba
- [`/DONATION_SYSTEM_README.md`](DONATION_SYSTEM_README.md) - Este archivo

---

## 🚀 Próximos Pasos

### Para Implementar Emails Reales

1. Instalar nodemailer:
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

2. Configurar variables de entorno:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

3. Descomentar código en [`/src/lib/email-service.ts`](src/lib/email-service.ts)

### Para Agregar Más Banderas de Tarjeta

Editar [`/src/lib/card-validation.ts`](src/lib/card-validation.ts):

```typescript
const CARD_PATTERNS: Record<CardBrand, CardBrandInfo> = {
  // ... existentes
  nuevaBandera: {
    brand: 'nuevaBandera',
    displayName: 'Nueva Bandera',
    lengths: [16],
    cvvLength: 3,
    luhnCheck: true,
    pattern: /^XXXX[0-9]{0,}$/,  // Patrón de detección
    color: '#COLOR',
  },
};
```

### Para Personalizar Emails

1. Editar plantillas HTML en [`/src/lib/email-service.ts`](src/lib/email-service.ts)
2. Agregar logo de la empresa
3. Personalizar colores corporativos
4. Agregar información adicional

---

## 🔒 Seguridad

### Validaciones del Sistema

- ✅ Algoritmo de Luhn para números de tarjeta
- ✅ Validación de fecha de expiración
- ✅ CVV solo en tipo password
- ✅ Transacciones atómicas en base de datos
- ✅ Validación de campaña activa antes de donar
- ✅ Protección contra donaciones duplicadas
- ✅ Sanitización de inputs

### Notas Importantes

1. **MockPaymentForm es para TESTING**: No procesa pagos reales
2. **Datos sensibles**: CVV nunca se guarda en base de datos
3. **Emails**: Configura SMTP con credenciales seguras
4. **Variables de entorno**: Nunca commiteresenv con credenciales
5. **Stripe real**: Usa [`/api/donations/create-payment-intent`](src/app/api/donations/create-payment-intent/route.ts) para producción

---

## 📞 Soporte

Para preguntas o problemas:
- Revisar logs de la API en `/api/donations/mock`
- Verificar consola del navegador para errores de validación
- Revisar base de datos en Prisma Studio: `npx prisma studio`
- Consultar emails en logs de consola (hasta implementar SMTP real)

---

**Última actualización**: 2025-11-10
**Versión**: 2.0 - Sistema Completo con Emails
