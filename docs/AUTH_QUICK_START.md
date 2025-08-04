# 🚀 Guía Rápida - Sistema de Autenticación

## Configuración Inicial (5 minutos)

### 1. Variables de Entorno
Crea el archivo `.env.local` basado en `.env.example`:

```bash
cp .env.example .env.local
```

Configura las variables mínimas:
```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/sumarplus"

# NextAuth.js (OBLIGATORIO)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-clave-secreta-aqui"

# Google OAuth (Opcional)
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"
```

### 2. Base de Datos
```bash
# Ejecutar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate
```

### 3. Iniciar Servidor
```bash
npm run dev
```

## URLs Disponibles

- **Página Principal**: http://localhost:3000
- **Login**: http://localhost:3000/auth/signin
- **Registro**: http://localhost:3000/auth/signup

## Uso Básico en Componentes

### Verificar Autenticación
```typescript
'use client'
import { useSession } from 'next-auth/react'

export function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <div>Cargando...</div>
  if (!session) return <div>No autenticado</div>
  
  return <div>Hola {session.user.name}!</div>
}
```

### Proteger Páginas (Server Side)
```typescript
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  return <div>Contenido protegido</div>
}
```

### Botón de Logout
```typescript
'use client'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  return (
    <Button onClick={() => signOut({ callbackUrl: '/' })}>
      Cerrar Sesión
    </Button>
  )
}
```

## API Endpoints

### Registro de Usuario
```typescript
// POST /api/auth/register
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Juan Pérez',
    email: 'juan@example.com',
    password: 'MiPassword123',
    userType: 'DONOR', // o 'BENEFICIARY'
    acceptTerms: true
  })
})
```

### Login Programático
```typescript
import { signIn } from 'next-auth/react'

// Login con credenciales
await signIn('credentials', {
  email: 'user@example.com',
  password: 'password',
  callbackUrl: '/'
})

// Login con Google
await signIn('google', { callbackUrl: '/' })
```

## Tipos de Usuario

- **DONOR**: Usuario que puede hacer donaciones
- **BENEFICIARY**: Usuario que puede crear campañas
- **ADMIN**: Administrador del sistema (futuro)

## Validaciones Implementadas

### Contraseña
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número

### Email
- Formato válido de email
- Único en el sistema

### Nombre
- Entre 2 y 50 caracteres
- Solo letras y espacios

## Estados de Sesión

```typescript
const { data: session, status } = useSession()

// status puede ser:
// - "loading": Cargando sesión
// - "authenticated": Usuario autenticado
// - "unauthenticated": Usuario no autenticado
```

## Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+
4. Crea credenciales OAuth 2.0
5. Configura URLs autorizadas:
   - **Desarrollo**: `http://localhost:3000/api/auth/callback/google`
   - **Producción**: `https://tudominio.com/api/auth/callback/google`

## Troubleshooting Rápido

### Error: "NEXTAUTH_SECRET missing"
```bash
# Genera una clave secreta
openssl rand -base64 32
# Agrégala a .env.local
echo "NEXTAUTH_SECRET=tu-clave-generada" >> .env.local
```

### Error: "Database connection failed"
```bash
# Verifica que PostgreSQL esté corriendo
# Actualiza DATABASE_URL en .env.local
# Ejecuta las migraciones
npx prisma migrate dev
```

### Error: "Google OAuth not working"
- Verifica GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET
- Confirma URLs de callback en Google Console
- Asegúrate de que el proyecto de Google esté en producción

## Comandos Útiles

```bash
# Ver estado de la base de datos
npx prisma studio

# Reset de base de datos
npx prisma migrate reset

# Ver logs de NextAuth
# Agregar debug: true en authOptions

# Verificar variables de entorno
npm run env:check
```

## Próximos Pasos

1. ✅ Sistema básico de autenticación
2. 🔄 Recuperación de contraseña
3. 🔄 Verificación de email
4. 🔄 Autenticación de dos factores
5. 🔄 OAuth con más proveedores

---

¿Necesitas ayuda? Revisa la [documentación completa](./AUTHENTICATION.md) o contacta al equipo de desarrollo.