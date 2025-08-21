# Gestión de Campañas - Sistema Sumar+

## Descripción General

El sistema de gestión de campañas de Sumar+ proporciona una interfaz completa para administradores que permite gestionar todos los aspectos de las campañas de donaciones y crowdfunding en la plataforma.

## Características Principales

### 🔍 Filtrado y Búsqueda Avanzada

- **Búsqueda de texto**: Busca por título, descripción, creador
- **Filtros por estado**: DRAFT, ACTIVE, PAUSED, COMPLETED, CANCELLED
- **Filtros por tipo**: DONATION, CROWDFUNDING
- **Filtros por verificación**: Verificadas/No verificadas
- **Filtros por destacadas**: Destacadas/No destacadas
- **Filtros por categoría**: Todas las categorías disponibles
- **Filtros por urgencia**: Niveles 1-5
- **Filtros por fecha**: Rango de fechas de creación
- **Filtros por monto**: Rango de objetivos de recaudación
- **Ordenamiento**: Por fecha, título, monto, etc.

### 🎯 Gestión Individual

- **Activar/Pausar/Cancelar campañas**
- **Verificar/Desverificar campañas**
- **Destacar/Quitar destacado**
- **Ver detalles completos** con estadísticas
- **Editar información** de la campaña
- **Historial de actividad** completo

### 📊 Acciones Masivas

- **Selección múltiple** de campañas
- **Activación/Pausa masiva**
- **Verificación masiva**
- **Destacar/Quitar destacado masivo**
- **Cancelación masiva**
- **Estadísticas en tiempo real**

### 📈 Estadísticas y Analytics

- **Dashboard de estadísticas** generales
- **Distribución por estado y tipo**
- **Top campañas** por recaudación y donaciones
- **Análisis financiero** completo
- **Métricas de rendimiento**
- **Crecimiento mensual**

### 🔍 Detalles de Campaña

#### Información Básica
- Datos de la campaña (título, descripción, objetivo)
- Estado actual y progreso
- Información del creador
- Categoría y subcategoría
- Fechas importantes

#### Estadísticas de la Campaña
- Número de donaciones recibidas
- Monto total recaudado
- Progreso hacia el objetivo
- Comentarios y actualizaciones
- Vistas y compartidos

#### Actividad Reciente
- Timeline de donaciones
- Comentarios de usuarios
- Actualizaciones publicadas
- Cambios de estado

## Estructura de Archivos

```
src/
├── app/
│   ├── admin/campaigns/
│   │   └── page.tsx                    # Página principal con tabs
│   └── api/admin/campaigns/
│       ├── route.ts                    # API principal (GET, PATCH, PUT)
│       ├── stats/route.ts              # Estadísticas de campañas
│       └── [id]/
│           └── route.ts                # Campaña individual (GET, PATCH)
└── components/
    └── admin/
        ├── CampaignsManagement.tsx     # Componente principal
        └── CampaignStats.tsx           # Estadísticas
```

## Endpoints API

### GET /api/admin/campaigns
Obtiene lista paginada de campañas con filtros avanzados.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `search`: Término de búsqueda
- `status`: Filtro por estado (DRAFT, ACTIVE, PAUSED, COMPLETED, CANCELLED)
- `type`: Filtro por tipo (DONATION, CROWDFUNDING)
- `category`: Filtro por categoría (ID de categoría)
- `isVerified`: Filtro por verificación (true, false)
- `isFeatured`: Filtro por destacadas (true, false)
- `urgencyLevel`: Filtro por urgencia (1-5)
- `dateFrom`: Fecha desde (ISO string)
- `dateTo`: Fecha hasta (ISO string)
- `minAmount`: Monto mínimo objetivo
- `maxAmount`: Monto máximo objetivo
- `sortBy`: Campo de ordenamiento (createdAt, title, goalAmount, currentAmount)
- `sortOrder`: Orden (asc, desc)

### PATCH /api/admin/campaigns
Actualiza una campaña individual.

**Body:**
```json
{
  "campaignId": "string",
  "updates": {
    "status": "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED",
    "isVerified": boolean,
    "isFeatured": boolean,
    "urgencyLevel": number
  }
}
```

### PUT /api/admin/campaigns
Ejecuta acciones masivas en múltiples campañas.

**Body:**
```json
{
  "action": "bulk_activate" | "bulk_pause" | "bulk_verify" | "bulk_feature" | "bulk_cancel",
  "campaignIds": ["string"],
  "updates": {} // Solo para bulk_update
}
```

### GET /api/admin/campaigns/stats
Obtiene estadísticas generales de campañas.

**Respuesta incluye:**
- Resumen general (totales, activas, verificadas, etc.)
- Distribución por tipo, estado y categoría
- Top campañas por recaudación y donaciones
- Estadísticas financieras
- Crecimiento mensual

### GET /api/admin/campaigns/[id]
Obtiene detalles completos de una campaña específica.

**Incluye:**
- Información completa de la campaña
- Datos del creador
- Estadísticas detalladas
- Donaciones recientes
- Comentarios y actualizaciones
- Analytics específicos

## Estados de Campaña

### DRAFT (Borrador)
- Campaña creada pero no publicada
- Solo visible para el creador y administradores
- Puede ser editada libremente

### ACTIVE (Activa)
- Campaña publicada y recibiendo donaciones
- Visible públicamente
- Aparece en búsquedas y listados

### PAUSED (Pausada)
- Campaña temporalmente suspendida
- No recibe nuevas donaciones
- Visible pero marcada como pausada

### COMPLETED (Completada)
- Campaña que alcanzó su objetivo o fecha límite
- No recibe más donaciones
- Marcada como exitosa

### CANCELLED (Cancelada)
- Campaña cancelada por el creador o administrador
- No recibe donaciones
- Marcada como cancelada

## Tipos de Campaña

### DONATION (Donación)
- Campañas de ayuda solidaria
- Sin límite de tiempo específico
- Enfoque en necesidades inmediatas

### CROWDFUNDING (Crowdfunding)
- Campañas de financiación de proyectos
- Objetivo específico y tiempo límite
- Enfoque en innovación y emprendimiento

## Niveles de Urgencia

1. **Baja**: Sin prisa especial
2. **Media-Baja**: Importante pero no urgente
3. **Media**: Necesidad moderada
4. **Media-Alta**: Bastante urgente
5. **Alta**: Extremadamente urgente

## Casos de Uso Principales

### 1. Búsqueda de Campaña Específica
```typescript
const params = new URLSearchParams({
  search: "ayuda médica",
  status: "ACTIVE",
  isVerified: "true"
});
```

### 2. Filtrado de Campañas por Urgencia
```typescript
const params = new URLSearchParams({
  urgencyLevel: "5",
  status: "ACTIVE",
  sortBy: "createdAt",
  sortOrder: "desc"
});
```

### 3. Verificación Masiva de Campañas
```typescript
const response = await fetch('/api/admin/campaigns', {
  method: 'PUT',
  body: JSON.stringify({
    action: 'bulk_verify',
    campaignIds: selectedCampaignIds
  })
});
```

### 4. Análisis de Rendimiento
```typescript
// Las estadísticas incluyen métricas detalladas
const stats = await fetch('/api/admin/campaigns/stats');
const topCampaigns = stats.topCampaigns.byRaised;
```

## Mejores Prácticas

### Frontend
- Usar debounce en búsquedas para optimizar rendimiento
- Implementar paginación para grandes volúmenes
- Confirmar acciones destructivas (cancelar, pausar)
- Mostrar progreso visual en acciones masivas
- Cache de categorías para filtros

### Backend
- Implementar rate limiting para prevenir abuso
- Usar índices en campos de búsqueda frecuente
- Validar permisos en cada endpoint
- Mantener logs de cambios importantes
- Optimizar queries complejas con agregaciones

### Base de Datos
- Índices compuestos para filtros múltiples
- Soft deletes para preservar historial
- Triggers para actualizar estadísticas
- Particionado por fecha para mejor rendimiento

## Monitoreo y Métricas

### Métricas Clave
- Campañas activas vs. totales
- Tasa de éxito (completadas)
- Promedio de recaudación
- Tiempo promedio hasta completar
- Distribución por categorías

### Alertas Recomendadas
- Campañas con alta urgencia sin donaciones
- Caídas en creación de campañas
- Picos inusuales de cancelaciones
- Errores en procesamiento de pagos

## Roadmap Futuro

### Funcionalidades Planificadas
- [ ] Editor visual de campañas
- [ ] Sistema de moderación automática
- [ ] Integración con redes sociales
- [ ] Analytics avanzados con gráficos
- [ ] Exportación de reportes
- [ ] Plantillas de campañas
- [ ] Sistema de recomendaciones

### Mejoras Técnicas
- [ ] Búsqueda con Elasticsearch
- [ ] Cache distribuido con Redis
- [ ] Procesamiento asíncrono de imágenes
- [ ] API GraphQL para consultas flexibles
- [ ] Websockets para updates en tiempo real
- [ ] Machine Learning para detección de fraude

