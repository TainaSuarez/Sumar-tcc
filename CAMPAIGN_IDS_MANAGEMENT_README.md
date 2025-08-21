# Sistema de Selección de Campañas por ID - Sumar+

## Descripción General

El sistema de selección de campañas por ID proporciona herramientas avanzadas para administradores que permiten identificar, seleccionar y gestionar campañas específicas de manera eficiente mediante diferentes métodos de búsqueda y selección.

## Nuevas Funcionalidades

### 🔍 **Búsqueda Rápida de Campañas** (`CampaignQuickSearch`)

- **Búsqueda en tiempo real** con debounce de 300ms
- **Resultados instantáneos** con información resumida
- **Acciones rápidas** (copiar ID, ver detalles, abrir en sitio)
- **Modal de detalles** con información completa
- **Interfaz optimizada** para búsquedas frecuentes

#### Características:
- Busca por título, ID, creador o descripción
- Muestra hasta 20 resultados por búsqueda
- Información visual con avatares y badges de estado
- Copia rápida de IDs al portapapeles
- Navegación directa a la campaña pública

### 🎯 **Selector de Campañas** (`CampaignSelector`)

- **Selección múltiple** con checkboxes
- **Filtros avanzados** integrados
- **Límite configurable** de selección
- **Selección por filtros** automática
- **Vista modal** para uso en dialogs

#### Funcionalidades:
- Selección individual y masiva
- Filtros por estado, tipo, verificación, etc.
- Selección basada en criterios de filtrado
- Límites configurables de selección máxima
- Interfaz responsive y accesible

### ⚡ **Acciones Masivas Avanzadas** (`BulkCampaignActions`)

- **Categorización por riesgo** (bajo, medio, alto)
- **Confirmaciones inteligentes** según peligrosidad
- **Selección previa** de campañas objetivo
- **Feedback visual** del proceso
- **Prevención de errores** con validaciones

#### Tipos de Acciones:
- **Seguras**: Activar, verificar, destacar
- **Con confirmación**: Pausar, desverificar
- **Peligrosas**: Cancelar (irreversible)

### 🔌 **API de IDs** (`/api/admin/campaigns/ids/`)

#### GET - Obtener IDs con filtros
```typescript
GET /api/admin/campaigns/ids?search=term&status=ACTIVE&limit=500
```

**Respuesta:**
```json
{
  "campaigns": [
    {
      "id": "campaign-uuid",
      "title": "Título de la campaña",
      "status": "ACTIVE",
      "type": "DONATION",
      "progress": 45.5,
      "creatorName": "Juan Pérez",
      "categoryName": "Salud"
    }
  ],
  "totalCount": 150,
  "filters": { ... }
}
```

#### POST - Acciones masivas por filtros
```typescript
POST /api/admin/campaigns/ids
{
  "action": "bulk_activate_filtered",
  "filters": {
    "status": "DRAFT",
    "isVerified": true
  }
}
```

## Estructura de Archivos

```
src/
├── app/api/admin/campaigns/ids/
│   └── route.ts                    # API para IDs y filtros
├── components/admin/
│   ├── CampaignSelector.tsx        # Selector múltiple
│   ├── CampaignQuickSearch.tsx     # Búsqueda rápida
│   └── BulkCampaignActions.tsx     # Acciones masivas
└── app/admin/campaigns/
    └── page.tsx                    # Página con 4 pestañas
```

## Casos de Uso Principales

### 1. Búsqueda Rápida por ID o Título
```typescript
// El usuario escribe en el campo de búsqueda
// Se ejecuta automáticamente con debounce
const searchTerm = "ayuda médica";
// Resultados instantáneos con información resumida
```

### 2. Selección Masiva por Criterios
```typescript
// Configurar filtros específicos
const filters = {
  status: "DRAFT",
  isVerified: false,
  urgencyLevel: "5"
};

// Seleccionar todas las que coincidan
handleSelectFiltered(); // Selecciona automáticamente
```

### 3. Acciones Masivas Seguras
```typescript
// Seleccionar campañas y ejecutar acción
const selectedIds = ["id1", "id2", "id3"];
const action = "bulk_verify";

// Se ejecuta inmediatamente (acción segura)
executeAction(selectedIds, action);
```

### 4. Acciones Masivas con Confirmación
```typescript
// Acciones que requieren confirmación
const action = "bulk_cancel"; // Peligrosa
const selectedIds = [...];

// Muestra modal de confirmación automáticamente
executeAction(selectedIds, action);
// Usuario debe confirmar antes de ejecutar
```

## Componentes y Props

### CampaignQuickSearch
```typescript
interface Props {
  // No requiere props, es standalone
}
```

**Funcionalidades:**
- Búsqueda automática con debounce
- Resultados con información visual
- Acciones rápidas (copiar, ver, abrir)
- Modal de detalles integrado

### CampaignSelector
```typescript
interface Props {
  onSelectionChange?: (selectedIds: string[]) => void;
  preSelectedIds?: string[];
  maxSelection?: number;
  title?: string;
  description?: string;
}
```

**Ejemplo de uso:**
```tsx
<CampaignSelector
  onSelectionChange={(ids) => setSelectedIds(ids)}
  maxSelection={50}
  title="Seleccionar Campañas para Verificar"
  description="Elige las campañas que deseas verificar"
/>
```

### CampaignSelectorModal
```typescript
interface Props {
  children: React.ReactNode;
  onSelectionConfirm: (selectedIds: string[]) => void;
  maxSelection?: number;
  title?: string;
  description?: string;
}
```

**Ejemplo de uso:**
```tsx
<CampaignSelectorModal
  onSelectionConfirm={(ids) => executeAction(ids, 'bulk_verify')}
  maxSelection={100}
  title="Verificar Campañas"
>
  <Button>Seleccionar Campañas</Button>
</CampaignSelectorModal>
```

### BulkCampaignActions
```typescript
interface Props {
  onActionComplete?: (action: string, affectedCount: number) => void;
}
```

## API Endpoints Detallados

### GET /api/admin/campaigns/ids

**Parámetros de consulta:**
- `search`: Término de búsqueda
- `status`: Estado de campaña
- `type`: Tipo de campaña
- `category`: ID de categoría
- `isVerified`: true/false
- `isFeatured`: true/false
- `urgencyLevel`: 1-5
- `dateFrom`: Fecha desde (ISO)
- `dateTo`: Fecha hasta (ISO)
- `minAmount`: Monto mínimo
- `maxAmount`: Monto máximo
- `limit`: Límite de resultados (default: 1000)

**Respuesta:**
```json
{
  "campaigns": [
    {
      "id": "uuid",
      "title": "string",
      "status": "ACTIVE|DRAFT|PAUSED|COMPLETED|CANCELLED",
      "type": "DONATION|CROWDFUNDING",
      "isVerified": boolean,
      "isFeatured": boolean,
      "goalAmount": number,
      "currentAmount": number,
      "createdAt": "ISO date",
      "creatorName": "string",
      "categoryName": "string",
      "progress": number
    }
  ],
  "totalCount": number,
  "filters": object
}
```

### POST /api/admin/campaigns/ids

**Acciones disponibles:**
- `select_all_filtered`: Obtener IDs que coinciden con filtros
- `bulk_activate_filtered`: Activar campañas filtradas
- `bulk_pause_filtered`: Pausar campañas filtradas
- `bulk_verify_filtered`: Verificar campañas filtradas
- `bulk_unverify_filtered`: Desverificar campañas filtradas
- `bulk_feature_filtered`: Destacar campañas filtradas
- `bulk_unfeature_filtered`: Quitar destacado filtradas
- `bulk_cancel_filtered`: Cancelar campañas filtradas

**Body de la petición:**
```json
{
  "action": "string",
  "filters": {
    "search": "string",
    "status": "string",
    "type": "string",
    "isVerified": boolean,
    "isFeatured": boolean,
    "urgencyLevel": number,
    "dateFrom": "ISO date",
    "dateTo": "ISO date",
    "minAmount": number,
    "maxAmount": number
  }
}
```

**Respuesta:**
```json
{
  "message": "string",
  "affectedRows": number,
  "campaignIds": ["string"]
}
```

## Flujos de Trabajo

### Flujo 1: Búsqueda y Acción Individual
1. Usuario abre "Búsqueda" tab
2. Escribe término de búsqueda
3. Ve resultados instantáneos
4. Hace clic en "Ver detalles" o "Copiar ID"
5. Ejecuta acción específica

### Flujo 2: Selección Masiva Manual
1. Usuario abre "Acciones Masivas" tab
2. Selecciona tipo de acción
3. Se abre modal de selección
4. Filtra y selecciona campañas manualmente
5. Confirma selección
6. Ejecuta acción (con o sin confirmación)

### Flujo 3: Selección Masiva por Filtros
1. Usuario configura filtros específicos
2. Hace clic en "Seleccionar filtradas"
3. Sistema selecciona automáticamente
4. Usuario confirma acción
5. Se ejecuta en todas las campañas filtradas

### Flujo 4: Gestión Individual desde Lista
1. Usuario está en "Gestión" tab
2. Usa filtros para encontrar campañas
3. Selecciona individualmente con checkboxes
4. Ejecuta acciones masivas desde la barra superior

## Seguridad y Validaciones

### Autenticación y Autorización
```typescript
// Verificación en todos los endpoints
const session = await getServerSession(authOptions);
if (!session?.user || session.user.role !== UserRole.ADMIN) {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}
```

### Validaciones de Entrada
- **Límites de selección** configurables por componente
- **Validación de filtros** en el backend
- **Sanitización de búsquedas** para prevenir inyección
- **Confirmaciones obligatorias** para acciones peligrosas

### Prevención de Errores
- **Límites de rate limiting** en endpoints
- **Timeouts** en búsquedas largas
- **Validación de IDs** existentes antes de acciones
- **Rollback** en caso de errores parciales

## Optimizaciones de Rendimiento

### Frontend
- **Debounce** en búsquedas (300ms)
- **Virtualización** para listas largas
- **Memoización** de resultados de búsqueda
- **Lazy loading** de componentes pesados
- **Cache local** de categorías

### Backend
- **Índices optimizados** para búsquedas
- **Límites de resultados** configurables
- **Paginación** en consultas grandes
- **Query optimization** con select específicos
- **Agregaciones eficientes** para conteos

### Base de Datos
```sql
-- Índices recomendados
CREATE INDEX idx_campaigns_search ON campaigns USING gin(to_tsvector('spanish', title || ' ' || description));
CREATE INDEX idx_campaigns_status_created ON campaigns(status, created_at);
CREATE INDEX idx_campaigns_creator_type ON campaigns(creator_id, type);
```

## Métricas y Monitoreo

### Métricas de Uso
- Búsquedas por término más frecuentes
- Acciones masivas más utilizadas
- Tiempo promedio de selección
- Errores en ejecución de acciones

### Alertas Recomendadas
- Acciones masivas con alta tasa de error
- Búsquedas que no devuelven resultados
- Selecciones que exceden límites
- Tiempos de respuesta elevados

## Roadmap Futuro

### Funcionalidades Planificadas
- [ ] **Selección por rango de fechas** visual
- [ ] **Plantillas de filtros** guardadas
- [ ] **Historial de acciones** masivas
- [ ] **Preview de cambios** antes de ejecutar
- [ ] **Progreso en tiempo real** de acciones largas
- [ ] **Notificaciones push** al completar acciones
- [ ] **Exportación de selecciones** a CSV/Excel
- [ ] **API GraphQL** para consultas complejas

### Mejoras Técnicas
- [ ] **WebSockets** para updates en tiempo real
- [ ] **Worker threads** para procesamiento pesado
- [ ] **Redis cache** para búsquedas frecuentes
- [ ] **Elasticsearch** para búsqueda avanzada
- [ ] **Audit log** completo de cambios
- [ ] **Backup automático** antes de acciones masivas

## Casos de Uso Avanzados

### Administración Diaria
```typescript
// Verificar todas las campañas nuevas del día
const filters = {
  dateFrom: today,
  status: "DRAFT",
  isVerified: false
};

// Seleccionar y verificar automáticamente
await bulkActionByFilters("bulk_verify_filtered", filters);
```

### Mantenimiento Semanal
```typescript
// Pausar campañas inactivas por más de 30 días
const filters = {
  status: "ACTIVE",
  dateTo: thirtyDaysAgo,
  maxAmount: "0" // Sin donaciones
};

await bulkActionByFilters("bulk_pause_filtered", filters);
```

### Campañas de Alto Impacto
```typescript
// Destacar campañas con alta recaudación
const filters = {
  status: "ACTIVE",
  minAmount: "10000",
  isFeatured: false
};

await bulkActionByFilters("bulk_feature_filtered", filters);
```

Este sistema proporciona herramientas completas y eficientes para la gestión masiva de campañas, combinando facilidad de uso con potentes capacidades de administración.

