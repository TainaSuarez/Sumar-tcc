# 🗄️ Configuración de Base de Datos PostgreSQL

Esta guía te ayudará a configurar PostgreSQL para el proyecto Sumar+ en cualquier PC.

## 📋 Requisitos Previos

1. **PostgreSQL instalado** (versión 12 o superior)
2. **pgAdmin** (opcional, pero recomendado para gestión visual)

## 🚀 Instalación de PostgreSQL

### Windows:
1. Descarga PostgreSQL desde: https://www.postgresql.org/download/windows/
2. Ejecuta el instalador y sigue las instrucciones
3. **¡IMPORTANTE!** Anota la contraseña del usuario `postgres` que configures

### macOS:
```bash
# Usando Homebrew
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 🔧 Configuración Inicial

### 1. Crear la Base de Datos

#### Opción A: Usando pgAdmin (Recomendado)
1. Abre pgAdmin
2. Conecta al servidor local (localhost)
3. Click derecho en "Databases" → "Create" → "Database..."
4. Nombre: `sumarplus`
5. Click "Save"

#### Opción B: Usando línea de comandos
```bash
# Conectar como usuario postgres
psql -U postgres

# Crear la base de datos
CREATE DATABASE sumarplus;

# Salir
\q
```

### 2. Configurar Variables de Entorno

Crea o actualiza el archivo `.env.local` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://postgres:TU_PASSWORD_AQUI@localhost:5432/sumarplus"

# NextAuth
NEXTAUTH_SECRET="tu-clave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (opcional)
# STRIPE_PUBLISHABLE_KEY=""
# STRIPE_SECRET_KEY=""
```

**⚠️ IMPORTANTE:** Reemplaza `TU_PASSWORD_AQUI` con la contraseña que configuraste para el usuario `postgres`.

## 🔄 Migración y Datos Iniciales

### 1. Ejecutar Migraciones
```bash
# Eliminar migraciones anteriores (si existen)
rm -rf prisma/migrations

# Crear nueva migración
npx prisma migrate dev --name init

# Generar cliente Prisma
npx prisma generate
```

### 2. Poblar con Datos de Prueba
```bash
# Ejecutar script de datos de muestra
node create-sample-data.js
```

## 🖥️ Para Clonar en Otra PC

### 1. Clonar el Repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd sumar-tcc
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar PostgreSQL
- Instala PostgreSQL siguiendo los pasos anteriores
- Crea la base de datos `sumarplus`
- Configura el archivo `.env.local` con tus credenciales locales

### 4. Configurar Base de Datos
```bash
# Ejecutar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Poblar con datos de prueba
node create-sample-data.js
```

### 5. Iniciar el Proyecto
```bash
npm run dev
```

## 🔍 Verificación

### Comprobar Conexión a la Base de Datos
```bash
# Abrir Prisma Studio para ver los datos
npx prisma studio
```

Esto abrirá una interfaz web en `http://localhost:5555` donde podrás ver y editar los datos.

### Verificar la Aplicación
1. Inicia el servidor: `npm run dev`
2. Abre `http://localhost:3000`
3. Las campañas destacadas deberían cargar sin errores

## 🛠️ Solución de Problemas Comunes

### Error: "database does not exist"
```bash
# Crear la base de datos manualmente
createdb -U postgres sumarplus
```

### Error: "password authentication failed"
- Verifica que la contraseña en `DATABASE_URL` sea correcta
- Asegúrate de que el usuario `postgres` tenga los permisos necesarios

### Error: "connection refused"
- Verifica que PostgreSQL esté ejecutándose:
  - Windows: Servicios → PostgreSQL
  - macOS: `brew services list | grep postgresql`
  - Linux: `sudo systemctl status postgresql`

### Puerto ocupado
Si el puerto 5432 está ocupado, puedes cambiar el puerto en PostgreSQL o usar otro puerto en la URL de conexión.

## 📝 Notas Importantes

1. **Nunca subas el archivo `.env.local` al repositorio** (ya está en `.gitignore`)
2. **Cada desarrollador debe configurar su propio `.env.local`**
3. **Usa contraseñas seguras en producción**
4. **Haz backups regulares de la base de datos en producción**

## 🔄 Comandos Útiles

```bash
# Ver estado de la base de datos
npx prisma db pull

# Resetear la base de datos (¡CUIDADO!)
npx prisma migrate reset

# Ver logs de PostgreSQL
# Windows: Event Viewer
# Linux: sudo journalctl -u postgresql
# macOS: brew services list
```

---

¡Con esta configuración tendrás PostgreSQL funcionando en cualquier PC! 🎉