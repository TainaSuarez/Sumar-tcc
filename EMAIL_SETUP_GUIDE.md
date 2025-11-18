# 📧 Guía de Configuración de Emails

Esta guía te muestra cómo configurar el envío de emails reales para el sistema de donaciones.

## 🚀 Opción 1: Gmail (Recomendado para desarrollo)

### Paso 1: Habilitar "App Passwords" en Gmail

1. Ve a tu **Google Account**: https://myaccount.google.com/
2. En el menú izquierdo, selecciona **Security**
3. En la sección "How you sign in to Google", activa **2-Step Verification** (si no la tienes)
4. Luego busca **App passwords** (Contraseñas de aplicaciones)
5. Selecciona:
   - App: **Mail**
   - Device: **Other** (escribe "Sumar+")
6. Google te dará una contraseña de 16 caracteres como: `abcd efgh ijkl mnop`
7. **Guarda esta contraseña**, la necesitarás en el siguiente paso

### Paso 2: Configurar Variables de Entorno

Abre tu archivo `.env` (o `.env.local`) y agrega:

```env
# Configuración de Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=abcdefghijklmnop  # La contraseña de 16 caracteres de App Password (sin espacios)
```

**Ejemplo completo:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yeffersonsilvagomez@gmail.com
SMTP_PASS=abcdefghijklmnop
```

### Paso 3: Reiniciar el Servidor

```bash
# Detener el servidor (Ctrl + C)
# Luego iniciar nuevamente
npm run dev
```

### Paso 4: Probar

1. Haz una donación de prueba
2. Verás en la consola:
   ```
   📧 Email de agradecimiento enviado: { to: '...' }
   ✅ Email enviado exitosamente: <message-id>
   ```
3. Revisa tu bandeja de entrada (puede tardar 1-2 minutos)
4. **Importante**: Revisa también la carpeta de **SPAM** la primera vez

---

## 🔧 Opción 2: Otros Servicios SMTP

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tu-email@outlook.com
SMTP_PASS=tu-contraseña
```

### SendGrid (Profesional)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=tu-api-key-de-sendgrid
```

### Mailgun (Profesional)

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@tu-dominio.mailgun.org
SMTP_PASS=tu-contraseña-mailgun
```

---

## ⚠️ Solución de Problemas

### Error: "Invalid login"

**Solución para Gmail:**
- Verifica que hayas habilitado 2-Step Verification
- Asegúrate de estar usando una **App Password**, no tu contraseña normal
- La App Password debe estar sin espacios: `abcdefghijklmnop`

### Error: "Connection timeout"

**Solución:**
1. Verifica que el puerto sea 587 (no 465)
2. Verifica tu firewall/antivirus
3. Intenta con otro servicio SMTP

### Los emails van a SPAM

**Solución:**
- Normal la primera vez
- Marca el email como "No es spam"
- Considera usar un dominio personalizado en producción

### Error: "self signed certificate"

**Solución temporal:**
Agrega esto a tu código (solo para desarrollo):

```typescript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false  // Solo para desarrollo
  }
});
```

---

## 🧪 Testing

### 1. Verificar Variables de Entorno

Crea un archivo temporal `test-email.js`:

```javascript
require('dotenv').config();
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✓ Configurado' : '✗ No configurado');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
```

Ejecuta:
```bash
node test-email.js
```

### 2. Test de Envío Simple

```javascript
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Enviarte a ti mismo
      subject: 'Test Sumar+',
      text: '¡Funciona!',
      html: '<b>¡Funciona!</b>',
    });
    console.log('✅ Email enviado:', info.messageId);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEmail();
```

---

## 📝 Checklist Final

Antes de hacer una donación de prueba, verifica:

- [ ] Has instalado nodemailer: `npm install nodemailer`
- [ ] Has configurado las 4 variables en `.env`:
  - [ ] `SMTP_HOST`
  - [ ] `SMTP_PORT`
  - [ ] `SMTP_USER`
  - [ ] `SMTP_PASS`
- [ ] Has reiniciado el servidor de desarrollo
- [ ] Puedes ver las variables en la consola (sin mostrar la contraseña completa)

---

## 🎯 Resultado Esperado

Cuando hagas una donación, deberías ver en la consola:

```bash
📧 Email de agradecimiento enviado: { to: 'email@ejemplo.com' }
✅ Email enviado exitosamente: <abc123@gmail.com>
📧 Email de verificación pendiente: { to: 'email@ejemplo.com' }
✅ Email de verificación enviado exitosamente: <def456@gmail.com>
POST /api/donations/mock 200 in 1500ms
```

Y recibir 2 emails:
1. ✅ Recibo de donación con todos los detalles
2. ⏳ Información sobre verificación pendiente del creador

---

## 🔒 Seguridad en Producción

Para producción, **NO uses Gmail**. Usa servicios profesionales:

### Recomendados:
- **SendGrid**: 100 emails/día gratis
- **Mailgun**: 5,000 emails/mes gratis
- **AWS SES**: 62,000 emails/mes gratis (con EC2)
- **Resend**: Moderno y fácil de usar

### Mejores Prácticas:
1. Usa un dominio personalizado (@tudominio.com)
2. Configura SPF, DKIM y DMARC
3. Monitorea tasa de entrega
4. Implementa rate limiting
5. Usa variables de entorno seguras (nunca commitear `.env`)

---

## 📚 Recursos Adicionales

- **Nodemailer Docs**: https://nodemailer.com/
- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833
- **SendGrid Tutorial**: https://sendgrid.com/docs/
- **Testing Tools**: https://mailtrap.io/ (para testing sin enviar emails reales)

---

**Última actualización**: 2025-11-10
**¿Necesitas ayuda?** Revisa los logs de la consola para más detalles sobre errores.
