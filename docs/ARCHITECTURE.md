# Arquitectura del Sistema - Sumar+

## Descripción General

Sumar+ es una plataforma web full-stack diseñada para conectar donantes con personas y organizaciones que necesitan ayuda, integrando donaciones directas y campañas de crowdfunding en una misma plataforma.

**Slogan**: "Pequeños gestos, grandes cambios"

## Stack Tecnológico

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes UI**: Shadcn/ui + Magic UI
- **Estado**: React Context API / Zustand
- **Formularios**: React Hook Form + Zod
- **Autenticación**: NextAuth.js

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes / Express.js
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: JWT + Refresh Tokens
- **Validación**: Zod

### Servicios Externos
- **Pagos**: Stripe (principal), PayPal, PIX
- **Storage**: AWS S3 / Cloudinary
- **Email**: SendGrid / AWS SES
- **Monitoreo**: Sentry
- **Analytics**: Google Analytics / Mixpanel

### Infraestructura
- **Contenedores**: Docker
- **CI/CD**: GitHub Actions
- **Hosting Frontend**: Vercel
- **Hosting Backend**: AWS / Render
- **Base de Datos**: AWS RDS / Supabase

## Arquitectura de Alto Nivel

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Servicios     │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   Externos      │
│                 │    │                 │    │                 │
│ • Páginas       │    │ • Autenticación │    │ • Stripe        │
│ • Componentes   │    │ • CRUD APIs     │    │ • AWS S3        │
│ • Estado Global │    │ • Validaciones  │    │ • SendGrid      │
│ • Formularios   │    │ • Middleware    │    │ • Sentry        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Base de Datos │
                    │   (PostgreSQL)  │
                    │                 │
                    │ • Usuarios      │
                    │ • Campañas      │
                    │ • Donaciones    │
                    │ • Notificaciones│
                    └─────────────────┘
```

## Estructura de Carpetas

```
sumar-plus/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── (dashboard)/       # Panel de usuario
│   │   ├── campaigns/         # Páginas de campañas
│   │   ├── api/               # API Routes
│   │   └── globals.css        # Estilos globales
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # Componentes base (shadcn)
│   │   ├── magicui/          # Componentes animados
│   │   ├── forms/            # Formularios específicos
│   │   ├── layout/           # Componentes de layout
│   │   └── features/         # Componentes por funcionalidad
│   ├── lib/                  # Utilidades y configuraciones
│   │   ├── auth.ts           # Configuración de autenticación
│   │   ├── db.ts             # Cliente de Prisma
│   │   ├── validations.ts    # Esquemas de validación
│   │   ├── utils.ts          # Utilidades generales
│   │   └── constants.ts      # Constantes del sistema
│   ├── hooks/                # Custom hooks
│   ├── types/                # Definiciones de tipos
│   └── styles/               # Estilos adicionales
├── prisma/
│   ├── schema.prisma         # Esquema de base de datos
│   ├── migrations/           # Migraciones
│   └── seed.ts              # Datos de prueba
├── public/                   # Archivos estáticos
├── docs/                     # Documentación
└── tests/                    # Pruebas
```

## Flujos Principales

### 1. Registro y Autenticación
```
Usuario → Formulario Registro → Validación → Base de Datos → Email Verificación → Login
```

### 2. Creación de Campaña
```
Usuario Autenticado → Formulario Campaña → Validación → Subida Imágenes → Base de Datos → Moderación
```

### 3. Proceso de Donación
```
Donante → Seleccionar Campaña → Formulario Donación → Pasarela de Pago → Confirmación → Notificación
```

### 4. Actualización de Campaña
```
Creador → Panel Dashboard → Nueva Actualización → Notificación Donantes → Publicación
```

## Patrones de Diseño

### 1. Clean Architecture
- **Entities**: Modelos de dominio (User, Campaign, Donation)
- **Use Cases**: Lógica de negocio (CreateCampaign, ProcessDonation)
- **Interface Adapters**: Controllers y Presenters
- **Frameworks**: Next.js, Prisma, etc.

### 2. Repository Pattern
```typescript
interface CampaignRepository {
  create(campaign: CreateCampaignDto): Promise<Campaign>
  findById(id: string): Promise<Campaign | null>
  findByStatus(status: CampaignStatus): Promise<Campaign[]>
  update(id: string, data: UpdateCampaignDto): Promise<Campaign>
}
```

### 3. Service Layer
```typescript
class CampaignService {
  constructor(
    private campaignRepo: CampaignRepository,
    private notificationService: NotificationService,
    private imageService: ImageService
  ) {}

  async createCampaign(data: CreateCampaignDto): Promise<Campaign> {
    // Lógica de negocio
  }
}
```

## Seguridad

### 1. Autenticación
- JWT tokens con expiración corta (15 minutos)
- Refresh tokens con expiración larga (7 días)
- Rotación automática de refresh tokens

### 2. Autorización
- Middleware de verificación de roles
- Protección de rutas sensibles
- Validación de permisos por recurso

### 3. Validación de Datos
- Validación en frontend con Zod
- Validación en backend con Zod
- Sanitización de inputs
- Protección contra SQL injection (Prisma)

### 4. Protección CSRF
- Tokens CSRF en formularios
- SameSite cookies
- Verificación de origen

## Performance

### 1. Frontend
- Server-Side Rendering (SSR)
- Static Site Generation (SSG) para páginas estáticas
- Image optimization con Next.js
- Code splitting automático
- Lazy loading de componentes

### 2. Backend
- Connection pooling en base de datos
- Caching con Redis (opcional)
- Optimización de consultas con Prisma
- Rate limiting en APIs

### 3. Base de Datos
- Índices optimizados
- Consultas eficientes
- Paginación en listados
- Soft deletes para datos importantes

## Monitoreo y Logging

### 1. Error Tracking
- Sentry para errores en producción
- Logs estructurados con Winston
- Alertas automáticas

### 2. Performance Monitoring
- Web Vitals con Next.js
- Database query monitoring
- API response times

### 3. Business Metrics
- Conversión de donaciones
- Engagement de usuarios
- Performance de campañas

## Escalabilidad

### 1. Horizontal Scaling
- Stateless API design
- Load balancing
- Database read replicas

### 2. Microservicios (Futuro)
- Payment service
- Notification service
- Image processing service
- Analytics service

### 3. CDN
- Cloudflare para assets estáticos
- Edge caching
- Global distribution

## Consideraciones de Desarrollo

### 1. Testing
- Unit tests con Jest
- Integration tests con Supertest
- E2E tests con Playwright
- Component tests con React Testing Library

### 2. CI/CD
- GitHub Actions para CI/CD
- Automated testing en PRs
- Deployment automático a staging
- Manual approval para producción

### 3. Code Quality
- ESLint + Prettier
- Husky para pre-commit hooks
- TypeScript strict mode
- Code reviews obligatorios