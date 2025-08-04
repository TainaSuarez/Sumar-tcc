# Guía de Despliegue - Sumar+

## Opciones de Despliegue

### 1. Vercel (Recomendado)

Vercel es la plataforma creada por los desarrolladores de Next.js y ofrece la mejor experiencia para aplicaciones Next.js.

#### Configuración Automática

1. **Conectar con GitHub**:

   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Importa el repositorio de Sumar+

2. **Configuración del Proyecto**:

   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Variables de Entorno** (si aplica):
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://api.tudominio.com
   ```

#### Configuración Manual

1. **Instalar Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Desplegar**:

   ```bash
   vercel
   ```

3. **Para producción**:
   ```bash
   vercel --prod
   ```

### 2. Netlify

#### Configuración

1. **Build Settings**:

   - Build command: `npm run build`
   - Publish directory: `out` (para export estático)
   - Node version: `18` o superior

2. **Configuración de Next.js**:

   ```typescript
   // next.config.ts
   const nextConfig = {
     output: "export",
     trailingSlash: true,
     images: {
       unoptimized: true,
     },
   };
   ```

3. **Script de build**:
   ```json
   {
     "scripts": {
       "build": "next build && next export"
     }
   }
   ```

### 3. AWS Amplify

#### Configuración

1. **amplify.yml**:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - "**/*"
     cache:
       paths:
         - node_modules/**/*
   ```

### 4. Docker

#### Dockerfile

```dockerfile
# Base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
version: "3.8"
services:
  sumar-plus:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### 5. Servidor VPS/Dedicado

#### Configuración con PM2

1. **Instalar PM2**:

   ```bash
   npm install -g pm2
   ```

2. **Ecosystem file** (`ecosystem.config.js`):

   ```javascript
   module.exports = {
     apps: [
       {
         name: "sumar-plus",
         script: "npm",
         args: "start",
         instances: "max",
         exec_mode: "cluster",
         env: {
           NODE_ENV: "production",
           PORT: 3000,
         },
       },
     ],
   };
   ```

3. **Iniciar aplicación**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

#### Configuración con Nginx

```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Optimizaciones de Producción

### 1. Configuración de Next.js

```typescript
// next.config.ts
const nextConfig = {
  // Optimizaciones de rendimiento
  compress: true,
  poweredByHeader: false,

  // Configuración de imágenes
  images: {
    domains: ["tu-dominio.com"],
    formats: ["image/webp", "image/avif"],
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};
```

### 2. Variables de Entorno

```env
# .env.production
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 3. Monitoreo

#### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "tu-dsn-de-sentry",
  tracesSampleRate: 1.0,
});
```

#### Analytics

```typescript
// Google Analytics
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url: string) => {
  window.gtag("config", GA_TRACKING_ID, {
    page_location: url,
  });
};
```

## Checklist de Despliegue

### Antes del Despliegue

- [ ] Ejecutar `npm run build` localmente
- [ ] Verificar que no hay errores de linting (`npm run lint`)
- [ ] Probar la aplicación en modo producción localmente
- [ ] Verificar variables de entorno
- [ ] Optimizar imágenes y assets
- [ ] Configurar dominio y SSL

### Después del Despliegue

- [ ] Verificar que la aplicación carga correctamente
- [ ] Probar funcionalidades críticas
- [ ] Verificar rendimiento con Lighthouse
- [ ] Configurar monitoreo y alertas
- [ ] Configurar backups (si aplica)
- [ ] Documentar configuración de producción

## Troubleshooting

### Errores Comunes

1. **Build Fails**:

   - Verificar dependencias
   - Revisar logs de build
   - Verificar configuración de TypeScript

2. **Runtime Errors**:

   - Verificar variables de entorno
   - Revisar logs del servidor
   - Verificar configuración de base de datos/APIs

3. **Performance Issues**:
   - Optimizar imágenes
   - Implementar lazy loading
   - Revisar bundle size

### Logs y Debugging

```bash
# Ver logs en Vercel
vercel logs

# Ver logs en PM2
pm2 logs sumar-plus

# Ver logs en Docker
docker logs container-name
```

## Seguridad

### Headers de Seguridad

```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains'
        }
      ]
    }
  ];
}
```

### Variables de Entorno Sensibles

- Nunca committear `.env.local` o `.env.production`
- Usar variables de entorno del proveedor de hosting
- Rotar claves y tokens regularmente
