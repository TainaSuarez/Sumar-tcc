# 🔐 Sistema de Autenticación - Sumar+

## Descripción General

Sumar+ implementa un sistema de autenticación robusto y seguro utilizando NextAuth.js v4, que proporciona múltiples métodos de autenticación y gestión de sesiones. El sistema está diseñado para ser escalable, seguro y fácil de mantener.

## Tecnologías Utilizadas

- **NextAuth.js v4**: Framework de autenticación para Next.js
- **Prisma**: ORM para gestión de base de datos
- **bcryptjs**: Hashing de contraseñas
- **Zod**: Validación de esquemas
- **React Hook Form**: Gestión de formularios
- **Shadcn/ui**: Componentes de interfaz

## Métodos de Autenticación Soportados

### 1. Email y Contraseña
- Registro con validación de fortaleza de contraseña
- Login con credenciales
- Hashing seguro con bcryptjs (salt rounds: 12)

### 2. OAuth con Google
- Autenticación mediante Google OAuth 2.0
- Creación automática de cuentas
- Sincronización de datos de perfil

## Arquitectura del Sistema

### Backend

#### Configuración Principal
```typescript
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({...}),
    GoogleProvider({...})
  ],
  session: { strategy: "jwt" },
  callbacks: {...}
}
```

#### API Routes
- `/api/auth/[...nextauth]`: Manejo de NextAuth.js
- `/api/auth/register`: Registro de nuevos usuarios

#### Validaciones
```typescript
// src/lib/validations/auth.ts
export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  userType: z.enum(["DONOR", "BENEFICIARY"]),
  acceptTerms: z.boolean().refine(val => val === true)
})
```

### Frontend

#### Componentes de Autenticación
- `LoginForm`: Formulario de inicio de sesión
- `RegisterForm`: Formulario de registro
- `AuthProvider`: Proveedor de contexto de autenticación

#### Páginas
- `/auth/signin`: Página de inicio de sesión
- `/auth/signup`: Página de registro

## Flujo de Autenticación

### Registro de Usuario

1. **Validación del Formulario**
   - Validación en tiempo real con Zod
   - Verificación de fortaleza de contraseña
   - Confirmación de términos y condiciones

2. **Procesamiento Backend**
   ```typescript
   // Verificar si el usuario ya existe
   const existingUser = await db.user.findUnique({
     where: { email: data.email }
   })
   
   // Hash de la contraseña
   const hashedPassword = await bcrypt.hash(data.password, 12)
   
   // Crear usuario en la base de datos
   const user = await db.user.create({
     data: {
       name: data.name,
       email: data.email,
       password: hashedPassword,
       userType: data.userType
     }
   })
   ```

3. **Respuesta**
   - Usuario creado exitosamente
   - Redirección automática a login

### Inicio de Sesión

#### Con Email/Contraseña
1. Validación de credenciales
2. Verificación de contraseña con bcrypt
3. Generación de JWT token
4. Establecimiento de sesión

#### Con Google OAuth
1. Redirección a Google OAuth
2. Autorización del usuario
3. Callback con datos de Google
4. Creación/actualización de usuario
5. Establecimiento de sesión

### Gestión de Sesiones

```typescript
// Callbacks de NextAuth
callbacks: {
  async jwt({ token, user, account }) {
    if (user) {
      token.id = user.id
      token.role = user.role
      token.userType = user.userType
      token.isVerified = user.isVerified
    }
    return token
  },
  
  async session({ session, token }) {
    if (token) {
      session.user.id = token.id
      session.user.role = token.role
      session.user.userType = token.userType
      session.user.isVerified = token.isVerified
    }
    return session
  }
}
```

## Seguridad

### Medidas Implementadas

1. **Hashing de Contraseñas**
   - bcryptjs con 12 salt rounds
   - Nunca se almacenan contraseñas en texto plano

2. **Validación de Entrada**
   - Validación tanto en frontend como backend
   - Sanitización de datos de entrada

3. **Gestión de Sesiones**
   - JWT tokens seguros
   - Expiración automática de sesiones

4. **Protección CSRF**
   - Tokens CSRF automáticos con NextAuth.js
   - Verificación en cada request

5. **Variables de Entorno**
   - Secrets seguros para JWT
   - Configuración separada por ambiente

### Configuración de Seguridad

```env
# Requerido para producción
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://yourdomain.com"

# OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Tipos TypeScript

```typescript
// src/types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: UserRole
      userType: UserType
      isVerified: boolean
    }
  }
  
  interface User {
    id: string
    role: UserRole
    userType: UserType
    isVerified: boolean
  }
}
```

## Uso en Componentes

### Verificar Estado de Autenticación
```typescript
import { useSession } from 'next-auth/react'

function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <p>Cargando...</p>
  if (status === "unauthenticated") return <p>No autenticado</p>
  
  return <p>Bienvenido {session?.user?.name}</p>
}
```

### Proteger Páginas (Server Side)
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  return <div>Contenido protegido</div>
}
```

### Cerrar Sesión
```typescript
import { signOut } from 'next-auth/react'

function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: '/' })}>
      Cerrar Sesión
    </button>
  )
}
```

## Configuración de Base de Datos

### Modelos Prisma Relacionados
```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  password    String?
  image       String?
  role        UserRole @default(USER)
  userType    UserType @default(DONOR)
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // NextAuth.js relations
  accounts    Account[]
  sessions    Session[]
}

model Account {
  // OAuth account data
}

model Session {
  // Session data
}
```

## Configuración de Desarrollo

### Variables de Entorno Requeridas
```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/sumarplus"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key"

# Google OAuth (opcional para desarrollo)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Comandos de Desarrollo
```bash
# Instalar dependencias
npm install

# Ejecutar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Iniciar servidor de desarrollo
npm run dev
```

## Configuración de Producción

### Variables de Entorno Críticas
```env
# OBLIGATORIO: Secret fuerte para JWT
NEXTAUTH_SECRET="super-secure-random-string-for-production"

# URL de producción
NEXTAUTH_URL="https://sumarplus.com"

# Base de datos de producción
DATABASE_URL="postgresql://user:password@prod-db:5432/sumarplus"
```

### Consideraciones de Seguridad en Producción

1. **NEXTAUTH_SECRET**: Debe ser una cadena aleatoria y segura
2. **HTTPS**: Obligatorio para OAuth y cookies seguras
3. **Variables de Entorno**: Nunca commitear secrets al repositorio
4. **Rate Limiting**: Implementar límites en endpoints de auth
5. **Monitoring**: Logs de intentos de autenticación

## Testing

### Tests de Autenticación
```typescript
// Ejemplo de test para registro
describe('User Registration', () => {
  it('should create a new user with valid data', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass123',
      userType: 'DONOR'
    }
    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    
    expect(response.status).toBe(201)
  })
})
```

## Troubleshooting

### Problemas Comunes

1. **Error: NEXTAUTH_SECRET missing**
   - Solución: Agregar NEXTAUTH_SECRET al archivo .env

2. **Error: Database connection failed**
   - Verificar DATABASE_URL
   - Ejecutar `npx prisma migrate dev`

3. **Google OAuth no funciona**
   - Verificar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET
   - Configurar URLs de callback en Google Console

4. **Sesión no persiste**
   - Verificar configuración de cookies
   - Revisar NEXTAUTH_URL

### Logs de Debug
```typescript
// Habilitar logs de debug en desarrollo
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  // ... resto de configuración
}
```

## Roadmap y Mejoras Futuras

### Funcionalidades Planificadas
- [ ] Autenticación de dos factores (2FA)
- [ ] Recuperación de contraseña por email
- [ ] Verificación de email
- [ ] OAuth con Facebook y Twitter
- [ ] Rate limiting avanzado
- [ ] Audit logs de autenticación

### Optimizaciones
- [ ] Caché de sesiones con Redis
- [ ] Refresh tokens automáticos
- [ ] SSO (Single Sign-On)
- [ ] Integración con servicios de identidad externos

## Soporte y Documentación

- **NextAuth.js**: https://next-auth.js.org/
- **Prisma**: https://www.prisma.io/docs/
- **Zod**: https://zod.dev/
- **React Hook Form**: https://react-hook-form.com/

## Contribución

Para contribuir al sistema de autenticación:

1. Seguir las convenciones de código establecidas
2. Escribir tests para nuevas funcionalidades
3. Actualizar esta documentación
4. Revisar implicaciones de seguridad
5. Probar en múltiples navegadores

---

*Última actualización: Enero 2024*
*Versión del sistema: 1.0.0*