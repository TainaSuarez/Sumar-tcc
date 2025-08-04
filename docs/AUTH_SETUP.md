# 🔧 Configuración del Sistema de Autenticación

## Configuración Paso a Paso

### 1. Configuración de Variables de Entorno

#### Crear archivo .env.local
```bash
cp .env.example .env.local
```

#### Variables Obligatorias
```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/sumarplus"

# NextAuth.js - OBLIGATORIO
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"
```

#### Generar NEXTAUTH_SECRET
```bash
# Opción 1: OpenSSL
openssl rand -base64 32

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Opción 3: Online
# Visita: https://generate-secret.vercel.app/32
```

### 2. Configuración de Google OAuth (Opcional)

#### Paso 1: Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API**

#### Paso 2: Crear Credenciales OAuth
1. Ve a **APIs & Services > Credentials**
2. Clic en **Create Credentials > OAuth 2.0 Client IDs**
3. Selecciona **Web application**
4. Configura las URLs:

**URLs de JavaScript autorizadas:**
```
http://localhost:3000
https://tudominio.com (para producción)
```

**URLs de redirección autorizadas:**
```
http://localhost:3000/api/auth/callback/google
https://tudominio.com/api/auth/callback/google (para producción)
```

#### Paso 3: Agregar Credenciales
```env
GOOGLE_CLIENT_ID="tu-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"
```

### 3. Configuración de Base de Datos

#### Instalar PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS con Homebrew
brew install postgresql
brew services start postgresql

# Windows
# Descargar desde: https://www.postgresql.org/download/windows/
```

#### Crear Base de Datos
```sql
-- Conectar a PostgreSQL
psql -U postgres

-- Crear base de datos
CREATE DATABASE sumarplus;

-- Crear usuario (opcional)
CREATE USER sumarplus_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE sumarplus TO sumarplus_user;
```

#### Actualizar DATABASE_URL
```env
# Con usuario postgres
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/sumarplus"

# Con usuario personalizado
DATABASE_URL="postgresql://sumarplus_user:tu_password@localhost:5432/sumarplus"
```

### 4. Ejecutar Migraciones

```bash
# Instalar dependencias
npm install

# Ejecutar migraciones de Prisma
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Verificar base de datos (opcional)
npx prisma studio
```

### 5. Verificar Configuración

#### Iniciar Servidor
```bash
npm run dev
```

#### Verificar URLs
- **Aplicación**: http://localhost:3000
- **Login**: http://localhost:3000/auth/signin
- **Registro**: http://localhost:3000/auth/signup
- **API Auth**: http://localhost:3000/api/auth/session

## Configuración para Producción

### Variables de Entorno de Producción
```env
# URL de producción
NEXTAUTH_URL="https://tudominio.com"

# Secret fuerte para producción
NEXTAUTH_SECRET="super-secure-random-string-for-production"

# Base de datos de producción
DATABASE_URL="postgresql://user:password@prod-host:5432/sumarplus"

# Google OAuth para producción
GOOGLE_CLIENT_ID="prod-google-client-id"
GOOGLE_CLIENT_SECRET="prod-google-client-secret"
```

### Consideraciones de Seguridad

1. **HTTPS Obligatorio**: NextAuth requiere HTTPS en producción
2. **Secrets Seguros**: Usar generadores de claves aleatorias
3. **Variables de Entorno**: Nunca commitear secrets al repositorio
4. **Base de Datos**: Usar conexiones SSL en producción

## Troubleshooting

### Error: "NEXTAUTH_SECRET is missing"
```bash
# Generar y agregar secret
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
```

### Error: "Database connection failed"
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Verificar conexión
psql -U postgres -h localhost -p 5432 -d sumarplus
```

### Error: "Google OAuth redirect_uri_mismatch"
1. Verificar URLs en Google Cloud Console
2. Asegurar que coincidan exactamente con la configuración
3. Verificar que el proyecto esté en modo "Producción"

### Error: "Prisma Client not generated"
```bash
npx prisma generate
```

### Error: "Migration failed"
```bash
# Reset de base de datos (CUIDADO: borra todos los datos)
npx prisma migrate reset

# O crear nueva migración
npx prisma migrate dev --name fix_migration
```

## Verificación de Configuración

### Script de Verificación
Crea un archivo `scripts/verify-auth.js`:

```javascript
const { PrismaClient } = require('@prisma/client')

async function verifyConfig() {
  console.log('🔍 Verificando configuración...')
  
  // Verificar variables de entorno
  const requiredEnvs = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']
  const missing = requiredEnvs.filter(env => !process.env[env])
  
  if (missing.length > 0) {
    console.error('❌ Variables faltantes:', missing)
    return false
  }
  
  // Verificar conexión a base de datos
  try {
    const prisma = new PrismaClient()
    await prisma.$connect()
    console.log('✅ Conexión a base de datos exitosa')
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Error de conexión a base de datos:', error.message)
    return false
  }
  
  console.log('✅ Configuración verificada correctamente')
  return true
}

verifyConfig()
```

Ejecutar:
```bash
node scripts/verify-auth.js
```

## Comandos Útiles

```bash
# Ver estado de migraciones
npx prisma migrate status

# Ver esquema actual
npx prisma db pull

# Abrir Prisma Studio
npx prisma studio

# Reset completo de base de datos
npx prisma migrate reset

# Generar nueva migración
npx prisma migrate dev --name nombre_migracion

# Verificar variables de entorno
printenv | grep -E "(NEXTAUTH|DATABASE|GOOGLE)"
```

## Recursos Adicionales

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

¿Problemas con la configuración? Revisa la [documentación completa](./AUTHENTICATION.md) o contacta al equipo de desarrollo.