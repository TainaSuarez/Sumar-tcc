# Guía de Instalación - Sumar+

## Requisitos Previos

### Software Requerido
- **Node.js**: versión 18.0 o superior
- **npm** o **pnpm**: gestor de paquetes
- **PostgreSQL**: versión 14 o superior
- **Git**: para control de versiones

### Cuentas de Servicios Externos (Opcional para desarrollo)
- **Stripe**: Para procesamiento de pagos
- **SendGrid** o **AWS SES**: Para envío de emails
- **AWS S3** o **Cloudinary**: Para almacenamiento de imágenes
- **Sentry**: Para monitoreo de errores

## Instalación Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/sumar-plus.git
cd sumar-plus
```

### 2. Instalar Dependencias

```bash
# Usando npm
npm install

# O usando pnpm (recomendado)
pnpm install
```

### 3. Configurar Base de Datos

#### Instalar PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS con Homebrew
brew install postgresql
brew services start postgresql

# Windows
# Descargar desde https://www.postgresql.org/download/windows/
```

#### Crear Base de Datos
```bash
# Conectar a PostgreSQL
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE sumarplus;
CREATE USER sumarplus_user WITH PASSWORD 'tu_password_segura';
GRANT ALL PRIVILEGES ON DATABASE sumarplus TO sumarplus_user;
\q
```

### 4. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Base de Datos
DATABASE_URL="postgresql://sumarplus_user:tu_password_segura@localhost:5432/sumarplus"

# Autenticación
NEXTAUTH_SECRET="tu_secret_muy_seguro_aqui"
NEXTAUTH_URL="http://localhost:3000"

# JWT
JWT_SECRET="otro_secret_muy_seguro_para_jwt"
JWT_REFRESH_SECRET="secret_para_refresh_tokens"

# Stripe (Opcional para desarrollo)
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Opcional para desarrollo)
SENDGRID_API_KEY="SG...."
FROM_EMAIL="noreply@sumarplus.com"

# Storage (Opcional para desarrollo)
AWS_ACCESS_KEY_ID="tu_access_key"
AWS_SECRET_ACCESS_KEY="tu_secret_key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="sumarplus-images"

# Sentry (Opcional)
SENTRY_DSN="https://..."

# Configuración de desarrollo
NODE_ENV="development"
```

### 5. Configurar Prisma

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# (Opcional) Poblar base de datos con datos de prueba
npx prisma db seed
```

### 6. Ejecutar en Modo Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
# o
pnpm dev

# La aplicación estará disponible en http://localhost:3000
```

## Configuración de Servicios Externos

### Stripe (Pagos)

1. Crear cuenta en [Stripe](https://stripe.com)
2. Obtener claves de API desde el dashboard
3. Configurar webhooks:
   - URL: `http://localhost:3000/api/webhooks/stripe`
   - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

### SendGrid (Emails)

1. Crear cuenta en [SendGrid](https://sendgrid.com)
2. Crear API Key con permisos de envío
3. Verificar dominio de envío
4. Configurar templates de email

### AWS S3 (Almacenamiento)

1. Crear bucket en AWS S3
2. Configurar políticas de acceso público para imágenes
3. Crear usuario IAM con permisos de S3
4. Obtener Access Key y Secret Key

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar linter
npm run type-check   # Verificar tipos de TypeScript

# Base de Datos
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Poblar con datos de prueba
npm run db:studio    # Abrir Prisma Studio
npm run db:reset     # Resetear base de datos

# Testing
npm run test         # Ejecutar tests unitarios
npm run test:e2e     # Ejecutar tests end-to-end
npm run test:watch   # Ejecutar tests en modo watch

# Deployment
npm run docker:build # Construir imagen Docker
npm run docker:run   # Ejecutar contenedor Docker
```

## Configuración con Docker

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Reconstruir código fuente solo cuando sea necesario
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Imagen de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/sumarplus
    depends_on:
      - db
    volumes:
      - ./.env:/app/.env

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: sumarplus
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Ejecutar con Docker

```bash
# Construir y ejecutar
docker-compose up --build

# Solo ejecutar (si ya está construido)
docker-compose up

# Ejecutar en background
docker-compose up -d

# Parar servicios
docker-compose down
```

## Configuración de Producción

### Variables de Entorno de Producción

```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXTAUTH_URL="https://tu-dominio.com"

# Usar claves de producción para servicios externos
STRIPE_PUBLIC_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."

# Configurar CORS para producción
ALLOWED_ORIGINS="https://tu-dominio.com,https://www.tu-dominio.com"
```

### Optimizaciones de Producción

1. **Habilitar compresión gzip**
2. **Configurar CDN para assets estáticos**
3. **Implementar rate limiting**
4. **Configurar monitoreo con Sentry**
5. **Habilitar HTTPS**
6. **Configurar backups automáticos de base de datos**

## Deployment

### Vercel (Recomendado para Frontend)

1. Conectar repositorio de GitHub
2. Configurar variables de entorno
3. Deploy automático en cada push

### Railway/Render (Para Backend con Base de Datos)

1. Crear nuevo servicio
2. Conectar repositorio
3. Configurar variables de entorno
4. Configurar base de datos PostgreSQL

### AWS/DigitalOcean (Para deployment completo)

1. Configurar servidor con Docker
2. Configurar base de datos RDS/Managed Database
3. Configurar Load Balancer
4. Configurar CI/CD con GitHub Actions

## Troubleshooting

### Problemas Comunes

#### Error de conexión a base de datos
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql

# Verificar conexión
psql -h localhost -U sumarplus_user -d sumarplus
```

#### Error de migraciones de Prisma
```bash
# Resetear base de datos
npx prisma migrate reset

# Aplicar migraciones manualmente
npx prisma migrate deploy
```

#### Error de dependencias
```bash
# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### Error de tipos de TypeScript
```bash
# Regenerar tipos de Prisma
npx prisma generate

# Verificar configuración de TypeScript
npx tsc --noEmit
```

### Logs y Debugging

```bash
# Ver logs de desarrollo
npm run dev

# Ver logs de base de datos
tail -f /var/log/postgresql/postgresql-14-main.log

# Debug con Prisma Studio
npx prisma studio
```

## Soporte

Para obtener ayuda:

1. Revisar la documentación en `/docs`
2. Buscar en issues de GitHub
3. Crear nuevo issue con detalles del problema
4. Contactar al equipo de desarrollo

## Próximos Pasos

Después de la instalación exitosa:

1. Revisar la [documentación de arquitectura](./ARCHITECTURE.md)
2. Leer los [requisitos funcionales](./REQUIREMENTS.md)
3. Explorar la [documentación de la base de datos](./DATABASE.md)
4. Configurar el entorno de desarrollo según las [mejores prácticas](./DEVELOPMENT.md)