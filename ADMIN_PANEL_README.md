# Panel de Administración - Sumar+

## 📋 Descripción General

El panel de administración de Sumar+ es una interfaz completa y moderna diseñada específicamente para usuarios con rol de administrador. Proporciona herramientas avanzadas para la gestión del sistema, monitoreo de estadísticas y administración de contenido.

## 🚀 Características Principales

### Dashboard Principal (`/admin`)
- **Estadísticas en tiempo real** del sistema
- **Gráficos interactivos** con Recharts
- **Métricas clave**: usuarios, campañas, donaciones, ingresos
- **Tendencias de crecimiento** y análisis comparativo
- **Top categorías** más populares
- **Distribución de usuarios** por tipo

### Gestión de Usuarios (`/admin/users`)
- **Lista paginada** de todos los usuarios
- **Filtros avanzados** por rol, tipo y estado
- **Búsqueda en tiempo real** por nombre, email u organización
- **Acciones administrativas**:
  - Activar/desactivar usuarios
  - Verificar/desverificar cuentas
  - Cambiar roles (Usuario ↔ Moderador)
- **Estadísticas por usuario**: campañas, donaciones, comentarios

### Gestión de Campañas (`/admin/campaigns`)
- **Vista detallada** de todas las campañas
- **Filtros por estado**: activas, borrador, completadas, pausadas, canceladas
- **Filtros por tipo**: donación, crowdfunding
- **Acciones de moderación**:
  - Pausar/activar campañas
  - Verificar campañas
  - Destacar/quitar destacado
  - Cancelar campañas
- **Progreso visual** de recaudación
- **Métricas de engagement**: vistas, donaciones, comentarios

### Gestión de Categorías (`/admin/categories`)
- **CRUD completo** de categorías
- **Personalización visual**: colores e iconos
- **Gestión de subcategorías**
- **Estadísticas de uso** por categoría
- **Control de estado**: activar/desactivar

## 🔒 Seguridad y Acceso

### Protección de Rutas
- **Middleware personalizado** que verifica autenticación
- **Verificación de roles** a nivel de servidor
- **Redirección automática** para usuarios no autorizados
- **Página de error 403** personalizada

### Verificación en APIs
- **Autenticación obligatoria** en todas las rutas admin
- **Validación de rol ADMIN** en cada endpoint
- **Manejo de errores** detallado y seguro

## 🎨 Diseño y UX

### Componentes Principales
- **AdminLayout**: Layout principal con sidebar y header
- **AdminSidebar**: Navegación lateral responsive
- **AdminHeader**: Header con información del usuario
- **StatCard**: Tarjetas de estadísticas reutilizables

### Características de UI
- **Diseño responsive** que funciona en móviles y desktop
- **Sidebar colapsible** para móviles
- **Tema consistente** con el resto de la aplicación
- **Iconografía clara** con Lucide React
- **Animaciones suaves** y transiciones

### Componentes UI Utilizados
- **Shadcn/ui**: Base de componentes
- **Recharts**: Gráficos y visualizaciones
- **Radix UI**: Componentes primitivos accesibles

## 📊 APIs del Panel Admin

### Estadísticas Generales
```typescript
GET /api/admin/stats
// Retorna métricas completas del sistema
```

### Gestión de Usuarios
```typescript
GET /api/admin/users?page=1&limit=10&search=&role=&userType=&isActive=
PATCH /api/admin/users
// Body: { userId: string, updates: Partial<User> }
```

### Gestión de Campañas
```typescript
GET /api/admin/campaigns?page=1&limit=10&search=&status=&category=&type=
PATCH /api/admin/campaigns
// Body: { campaignId: string, updates: Partial<Campaign> }
```

### Gestión de Categorías
```typescript
GET /api/admin/categories?includeStats=true
POST /api/admin/categories
PATCH /api/admin/categories
DELETE /api/admin/categories?id=categoryId
```

## 🛠️ Estructura de Archivos

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx                 # Dashboard principal
│   │   ├── users/page.tsx           # Gestión de usuarios
│   │   ├── campaigns/page.tsx       # Gestión de campañas
│   │   └── categories/page.tsx      # Gestión de categorías
│   ├── api/admin/
│   │   ├── stats/route.ts           # API de estadísticas
│   │   ├── users/route.ts           # API de usuarios
│   │   ├── campaigns/route.ts       # API de campañas
│   │   └── categories/route.ts      # API de categorías
│   └── unauthorized/page.tsx        # Página de acceso denegado
├── components/admin/
│   ├── AdminLayout.tsx              # Layout principal
│   ├── AdminSidebar.tsx             # Sidebar de navegación
│   ├── AdminHeader.tsx              # Header del panel
│   ├── AdminDashboard.tsx           # Dashboard con estadísticas
│   ├── StatCard.tsx                 # Tarjeta de estadística
│   ├── UsersManagement.tsx          # Gestión de usuarios
│   ├── CampaignsManagement.tsx      # Gestión de campañas
│   └── CategoriesManagement.tsx     # Gestión de categorías
└── middleware.ts                    # Middleware de protección
```

## 🚦 Instalación y Configuración

### Dependencias Requeridas
```bash
npm install recharts @radix-ui/react-dropdown-menu @radix-ui/react-avatar @radix-ui/react-select @radix-ui/react-dialog
```

### Variables de Entorno
Las mismas que el proyecto principal, ya que utiliza NextAuth.js y Prisma existentes.

### Permisos de Base de Datos
El panel utiliza el esquema existente con el campo `role` en el modelo `User`:
```prisma
enum UserRole {
  USER
  ADMIN
  MODERATOR
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px - Sidebar colapsible, layout de una columna
- **Tablet**: 768px - 1024px - Sidebar fijo, grid adaptativo
- **Desktop**: > 1024px - Layout completo con sidebar

### Adaptaciones Móviles
- **Sidebar overlay** en lugar de sidebar fijo
- **Navegación simplificada** con iconos más grandes
- **Tablas responsive** con scroll horizontal
- **Formularios de una columna**

## 🔄 Actualizaciones en Tiempo Real

### Estrategia de Datos
- **Fetch bajo demanda** para optimizar rendimiento
- **Paginación** en todas las listas extensas
- **Filtros URL-based** para mantener estado
- **Carga optimista** en actualizaciones

### Manejo de Estados
- **Loading states** para todas las operaciones
- **Error handling** robusto con mensajes claros
- **Confirmaciones** para acciones destructivas

## 🎯 Próximas Funcionalidades

### Características Planeadas
- [ ] **Gestión de donaciones** con detalles de transacciones
- [ ] **Herramientas de moderación** para comentarios y reportes
- [ ] **Configuración del sistema** (SMTP, API keys, etc.)
- [ ] **Logs de auditoría** para acciones administrativas
- [ ] **Notificaciones push** para alertas importantes
- [ ] **Exportación de datos** en CSV/Excel
- [ ] **Dashboard personalizable** con widgets arrastrables

### Mejoras de UX
- [ ] **Búsqueda global** entre todas las secciones
- [ ] **Shortcuts de teclado** para acciones comunes
- [ ] **Modo oscuro** para uso prolongado
- [ ] **Favoritos** para acceso rápido
- [ ] **Historial de acciones** recientes

## 🤝 Contribución

### Estándares de Código
- **TypeScript estricto** para type safety
- **Componentes funcionales** con hooks
- **Props interfaces** bien definidas
- **Error boundaries** para manejo de errores
- **Testing** con Jest y React Testing Library

### Patrones de Diseño
- **Separación de responsabilidades** entre UI y lógica
- **Custom hooks** para lógica reutilizable
- **Context API** para estado global cuando necesario
- **Optimistic updates** para mejor UX

## 📄 Licencia

Parte del proyecto Sumar+ - Todos los derechos reservados.

---

*Panel de Administración diseñado y desarrollado para Sumar+ con ❤️*
