# Sumar+ 🤝

**Conectando corazones, transformando vidas**

Sumar+ es una plataforma web innovadora que conecta a donantes con personas en necesidad a través de donaciones directas y crowdfunding, priorizando la transparencia y la participación comunitaria.

## 🌟 Características Principales

### Para Donantes
- **Donaciones Directas**: Contribuye directamente a personas en necesidad
- **Crowdfunding**: Participa en campañas colectivas para causas importantes
- **Transparencia Total**: Seguimiento en tiempo real del uso de las donaciones
- **Múltiples Métodos de Pago**: Tarjetas, transferencias, billeteras digitales

### Para Beneficiarios
- **Creación de Campañas**: Solicita ayuda para necesidades específicas
- **Actualizaciones en Tiempo Real**: Mantén informados a tus donantes
- **Gestión de Fondos**: Herramientas para administrar las donaciones recibidas
- **Comunicación Directa**: Interactúa con tu comunidad de apoyo

### Para la Comunidad
- **Sistema de Comentarios**: Participa en conversaciones sobre las campañas
- **Notificaciones**: Mantente al día con las causas que te importan
- **Categorías Diversas**: Salud, educación, emergencias, emprendimiento y más
- **Verificación de Campañas**: Sistema de validación para garantizar autenticidad

## 🚀 Tecnologías

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático para mayor robustez
- **Tailwind CSS** - Framework de CSS utilitario
- **Shadcn/ui** - Componentes de UI modernos y accesibles
- **Magic UI** - Componentes adicionales con animaciones

### Backend
- **Next.js API Routes** - API serverless integrada
- **Prisma** - ORM moderno para TypeScript
- **PostgreSQL** - Base de datos relacional robusta
- **NextAuth.js** - Autenticación completa y segura

### Servicios Externos
- **Stripe** - Procesamiento de pagos seguro
- **AWS S3** - Almacenamiento de imágenes y archivos
- **SendGrid** - Envío de emails transaccionales
- **Sentry** - Monitoreo de errores en producción

## 📋 Requisitos Previos

- Node.js 18.0 o superior
- PostgreSQL 14 o superior
- npm o pnpm
- Git

## 🛠️ Instalación Rápida

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/sumar-plus.git
   cd sumar-plus
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Configurar base de datos**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📚 Documentación

- [📖 Guía de Instalación Completa](./docs/INSTALLATION.md)
- [🏗️ Arquitectura del Sistema](./docs/ARCHITECTURE.md)
- [💾 Documentación de Base de Datos](./docs/DATABASE.md)
- [⚙️ Requisitos Funcionales](./docs/REQUIREMENTS.md)
- [👨‍💻 Guía de Desarrollo](./docs/DEVELOPMENT.md)

## 🗂️ Estructura del Proyecto

```
sumar+/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── (dashboard)/       # Dashboard de usuario
│   │   ├── api/               # API Routes
│   │   └── globals.css        # Estilos globales
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/                # Componentes base (shadcn/ui)
│   │   ├── forms/             # Formularios
│   │   └── features/          # Componentes específicos
│   ├── lib/                   # Utilidades y configuraciones
│   ├── hooks/                 # Custom hooks
│   └── types/                 # Tipos TypeScript
├── prisma/                    # Esquema y migraciones de DB
├── docs/                      # Documentación del proyecto
├── public/                    # Assets estáticos
└── tests/                     # Tests unitarios y e2e
```

## 🎯 Funcionalidades Principales

### 👤 Gestión de Usuarios
- Registro y autenticación segura
- Perfiles de usuario personalizables
- Roles diferenciados (donante, beneficiario, admin)
- Verificación de identidad

### 📢 Sistema de Campañas
- Creación de campañas con multimedia
- Categorización y etiquetado
- Metas de financiamiento flexibles
- Fechas límite configurables

### 💰 Procesamiento de Donaciones
- Múltiples métodos de pago
- Donaciones recurrentes
- Comisiones transparentes
- Reportes detallados

### 🔍 Transparencia y Seguimiento
- Actualizaciones de progreso en tiempo real
- Historial completo de transacciones
- Reportes de uso de fondos
- Sistema de comentarios y feedback

### 📊 Panel de Administración
- Gestión de usuarios y campañas
- Moderación de contenido
- Análisis y reportes
- Configuración del sistema

## 📄 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run start            # Servidor de producción
npm run lint             # Linter
npm run type-check       # Verificación de tipos

# Base de datos
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Poblar con datos de prueba
npm run db:studio        # Abrir Prisma Studio
npm run db:reset         # Resetear base de datos

# Testing
npm run test             # Tests unitarios
npm run test:e2e         # Tests end-to-end
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Cobertura de código

# Deployment
npm run docker:build     # Build imagen Docker
npm run docker:run       # Ejecutar contenedor
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/sumarplus"

# Autenticación
NEXTAUTH_SECRET="tu-secret-muy-seguro"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (opcional para desarrollo)
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Email (opcional para desarrollo)
SENDGRID_API_KEY="SG...."

# Storage (opcional para desarrollo)
AWS_ACCESS_KEY_ID="tu-access-key"
AWS_SECRET_ACCESS_KEY="tu-secret-key"
AWS_S3_BUCKET="sumarplus-images"
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: add nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Convenciones de Commits

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan funcionalidad)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

## 📞 Soporte

- **Email**: soporte@sumarplus.com
- **Documentación**: Ver carpeta `/docs`
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/sumar-plus/issues)

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

**Hecho con ❤️ para conectar corazones y transformar vidas**
