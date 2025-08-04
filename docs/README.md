# Sumar+ - Documentación del Proyecto

## Descripción

Sumar+ es una aplicación web desarrollada con Next.js, TypeScript y Tailwind CSS. Este proyecto proporciona una base sólida para el desarrollo de aplicaciones web modernas.

## Tecnologías Utilizadas

### Frontend

- **Next.js 15.4.5**: Framework de React para aplicaciones web
- **React 19.1.0**: Biblioteca de JavaScript para interfaces de usuario
- **TypeScript 5**: Superset de JavaScript con tipado estático
- **Tailwind CSS 4**: Framework CSS utility-first

### Herramientas de Desarrollo

- **ESLint**: Linter para JavaScript/TypeScript
- **PostCSS**: Procesador de CSS
- **Turbopack**: Bundler rápido para desarrollo

## Estructura del Proyecto

```
Sumar+/
├── src/
│   └── app/                    # App Router de Next.js
│       ├── layout.tsx          # Layout principal
│       ├── page.tsx            # Página principal
│       ├── globals.css         # Estilos globales
│       └── favicon.ico         # Icono de la aplicación
├── public/                     # Archivos estáticos
├── docs/                       # Documentación del proyecto
├── package.json                # Dependencias y scripts
├── tsconfig.json              # Configuración de TypeScript
├── next.config.ts             # Configuración de Next.js
├── postcss.config.mjs         # Configuración de PostCSS
├── eslint.config.mjs          # Configuración de ESLint
└── README.md                  # Documentación principal
```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo con Turbopack
- `npm run build`: Construye la aplicación para producción
- `npm run start`: Inicia el servidor de producción
- `npm run lint`: Ejecuta el linter para verificar el código

## Configuración

### TypeScript

El proyecto está configurado con TypeScript para proporcionar tipado estático y mejor experiencia de desarrollo.

### Tailwind CSS

Tailwind CSS está configurado con PostCSS para procesamiento de estilos. Los estilos se pueden escribir directamente en las clases de los componentes.

### ESLint

ESLint está configurado con las reglas recomendadas de Next.js para mantener la calidad del código.

## Desarrollo

### Requisitos Previos

- Node.js (versión recomendada: 18 o superior)
- npm o yarn

### Instalación

```bash
npm install
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Despliegue

### Construcción para Producción

```bash
npm run build
```

### Iniciar Servidor de Producción

```bash
npm run start
```

## Convenciones de Código

- **Commits**: Deben ser semánticos y en inglés
- **Comentarios**: Deben estar en inglés
- **Nombres de archivos**: Usar kebab-case
- **Componentes**: Usar PascalCase
- **Variables y funciones**: Usar camelCase

## Estructura de Documentación

### Documentación Principal
- `docs/README.md`: Documentación principal del proyecto
- `docs/ARCHITECTURE.md`: Arquitectura del sistema
- `docs/REQUIREMENTS.md`: Requerimientos funcionales y no funcionales
- `docs/INSTALLATION.md`: Guía de instalación y configuración
- `docs/DEVELOPMENT.md`: Guía de desarrollo

### Documentación Técnica
- `docs/DATABASE.md`: Esquema y gestión de base de datos
- `docs/AUTHENTICATION.md`: Sistema de autenticación completo
- `docs/AUTH_QUICK_START.md`: Guía rápida de autenticación
- `docs/COMPONENTS.md`: Documentación de componentes
- `docs/DEPLOYMENT.md`: Guía de despliegue

### Autenticación y Seguridad

El proyecto incluye un sistema completo de autenticación con:

- ✅ **Registro y Login** con email/contraseña
- ✅ **OAuth con Google** 
- ✅ **Gestión de sesiones** con NextAuth.js
- ✅ **Validación de formularios** con Zod
- ✅ **Protección de rutas** automática
- ✅ **Tipos TypeScript** personalizados

**Documentación detallada**: [AUTHENTICATION.md](./AUTHENTICATION.md)  
**Guía rápida**: [AUTH_QUICK_START.md](./AUTH_QUICK_START.md)
