# Gestión de Usuarios - Sistema Sumar+

## Descripción General

El sistema de gestión de usuarios de Sumar+ proporciona una interfaz completa para administradores que permite gestionar todos los aspectos de los usuarios registrados en la plataforma.

## Características Principales

### 🔍 Filtrado y Búsqueda Avanzada

- **Búsqueda de texto**: Busca por nombre, email, organización
- **Filtros por rol**: USER, MODERATOR, ADMIN
- **Filtros por tipo**: Individual, Organización  
- **Filtros por estado**: Activos/Inactivos
- **Filtros por verificación**: Verificados/No verificados
- **Filtros por fecha**: Rango de fechas de registro
- **Ordenamiento**: Por fecha, nombre, email, último acceso

### 👥 Gestión Individual

- **Activar/Desactivar usuarios**
- **Verificar/Desverificar usuarios**
- **Cambiar roles** (USER ↔ MODERATOR)
- **Ver detalles completos** del usuario
- **Historial de actividad** completo

### 📊 Acciones Masivas

- **Selección múltiple** de usuarios
- **Activación/Desactivación masiva**
- **Verificación masiva**
- **Cambio de roles masivo**
- **Estadísticas en tiempo real**

### 📈 Estadísticas y Analytics

- **Dashboard de estadísticas** generales
- **Distribución por tipo y rol**
- **Crecimiento mensual**
- **Top usuarios** por actividad
- **Métricas de engagement**

### 🔍 Detalles de Usuario

#### Información Personal
- Datos básicos (nombre, email, teléfono)
- Ubicación (país, ciudad)
- Estado de verificación
- Fechas importantes (registro, último acceso)

#### Estadísticas del Usuario
- Número de campañas creadas
- Total recaudado
- Donaciones realizadas
- Comentarios publicados

#### Actividad Reciente
- Timeline de actividades
- Campañas creadas
- Donaciones realizadas
- Comentarios y actualizaciones

## Estructura de Archivos

```
src/
├── app/
│   ├── admin/users/
│   │   └── page.tsx                    # Página principal de gestión
│   └── api/admin/users/
│       ├── route.ts                    # API principal (GET, PATCH, PUT)
│       ├── stats/route.ts              # Estadísticas de usuarios
│       └── [id]/
│           ├── route.ts                # Usuario individual (GET, PATCH)
│           └── activity/route.ts       # Actividad del usuario
└── components/
    ├── admin/
    │   ├── UsersManagement.tsx         # Componente principal
    │   ├── UserStats.tsx               # Estadísticas
    │   └── UserActivity.tsx            # Actividad del usuario
    └── ui/
        ├── checkbox.tsx                # Componente checkbox
        └── tabs.tsx                    # Componente tabs
```

## Endpoints API

### GET /api/admin/users
Obtiene lista paginada de usuarios con filtros.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `search`: Término de búsqueda
- `role`: Filtro por rol (USER, MODERATOR, ADMIN)
- `userType`: Filtro por tipo (INDIVIDUAL, ORGANIZATION)
- `isActive`: Filtro por estado (true, false)
- `isVerified`: Filtro por verificación (true, false)
- `dateFrom`: Fecha desde (ISO string)
- `dateTo`: Fecha hasta (ISO string)
- `sortBy`: Campo de ordenamiento (createdAt, firstName, email, lastLoginAt)
- `sortOrder`: Orden (asc, desc)

### PATCH /api/admin/users
Actualiza un usuario individual.

**Body:**
```json
{
  "userId": "string",
  "updates": {
    "isActive": boolean,
    "isVerified": boolean,
    "role": "USER" | "MODERATOR" | "ADMIN"
  }
}
```

### PUT /api/admin/users
Ejecuta acciones masivas en múltiples usuarios.

**Body:**
```json
{
  "action": "bulk_activate" | "bulk_deactivate" | "bulk_verify" | "bulk_unverify" | "bulk_make_moderator" | "bulk_remove_moderator",
  "userIds": ["string"],
  "updates": {} // Solo para bulk_update
}
```

### GET /api/admin/users/stats
Obtiene estadísticas generales de usuarios.

### GET /api/admin/users/[id]
Obtiene detalles completos de un usuario específico.

### GET /api/admin/users/[id]/activity
Obtiene el historial de actividad de un usuario.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 20)

## Permisos y Seguridad

### Autenticación Requerida
- Todos los endpoints requieren sesión activa
- Solo usuarios con rol `ADMIN` pueden acceder

### Validaciones
- Verificación de existencia del usuario antes de modificaciones
- Protección contra cambios de rol de administradores
- Validación de parámetros de entrada

### Seguridad de Datos
- Las contraseñas nunca se incluyen en las respuestas
- Logs de todas las modificaciones
- Protección contra inyección SQL con Prisma

## Casos de Uso Principales

### 1. Búsqueda de Usuario Específico
```typescript
// Buscar por email o nombre
const params = new URLSearchParams({
  search: "usuario@ejemplo.com",
  page: "1",
  limit: "10"
});
```

### 2. Filtrado de Usuarios Inactivos
```typescript
const params = new URLSearchParams({
  isActive: "false",
  sortBy: "lastLoginAt",
  sortOrder: "desc"
});
```

### 3. Activación Masiva de Usuarios
```typescript
const response = await fetch('/api/admin/users', {
  method: 'PUT',
  body: JSON.stringify({
    action: 'bulk_activate',
    userIds: selectedUserIds
  })
});
```

### 4. Análisis de Crecimiento
```typescript
// Las estadísticas incluyen crecimiento mensual
const stats = await fetch('/api/admin/users/stats');
const monthlyGrowth = stats.growth; // Array de crecimiento por mes
```

## Mejores Prácticas

### Frontend
- Usar debounce en búsquedas para optimizar rendimiento
- Implementar paginación para grandes volúmenes de datos
- Confirmar acciones destructivas con modals
- Mostrar feedback visual para acciones masivas

### Backend  
- Implementar rate limiting para prevenir abuso
- Usar transacciones para operaciones críticas
- Mantener logs detallados de cambios
- Validar permisos en cada endpoint

### Base de Datos
- Índices en campos de búsqueda frecuente
- Soft deletes para preservar integridad
- Auditoría de cambios importantes

## Monitoreo y Métricas

### Métricas Clave
- Usuarios activos diarios/mensuales
- Tasa de verificación de usuarios
- Distribución por tipo de usuario
- Crecimiento de registros

### Alertas Recomendadas
- Picos inusuales de registros
- Caídas en actividad de usuarios
- Errores en operaciones masivas
- Intentos de acceso no autorizados

## Roadmap Futuro

### Funcionalidades Planificadas
- [ ] Exportación de datos de usuarios
- [ ] Importación masiva de usuarios
- [ ] Plantillas de notificaciones
- [ ] Dashboard de métricas avanzadas
- [ ] Integración con sistemas externos
- [ ] Automatización de tareas administrativas

### Mejoras Técnicas
- [ ] Cache de consultas frecuentes
- [ ] Optimización de queries complejas
- [ ] Implementación de WebSockets para updates en tiempo real
- [ ] API GraphQL para consultas flexibles


