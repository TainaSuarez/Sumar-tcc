# 🛠️ Configuración del Panel de Administración

## 📋 Requisitos Previos

1. **Base de datos configurada** con Prisma
2. **Servidor de desarrollo ejecutándose** (`npm run dev`)
3. **Variables de entorno** configuradas correctamente

## 🚀 Pasos de Configuración

### 1. Crear Usuario Administrador

Ejecuta el siguiente script para crear un usuario administrador:

```bash
node scripts/create-admin-user.js
```

Esto creará un usuario con las siguientes credenciales:
- **Email**: `admin@sumar.com`
- **Contraseña**: `admin123`
- **Rol**: `ADMIN`

### 2. Acceder al Panel

1. **Inicia sesión** en la aplicación con las credenciales del admin
2. **Navega a** `/admin` para acceder al panel de administración
3. **Explora** las diferentes secciones disponibles

### 3. Rutas del Panel

- **Dashboard**: `/admin` - Estadísticas y métricas generales
- **Usuarios**: `/admin/users` - Gestión de usuarios registrados
- **Campañas**: `/admin/campaigns` - Moderación de campañas
- **Categorías**: `/admin/categories` - CRUD de categorías

## 🔒 Seguridad

### Protección de Rutas
- Las rutas `/admin/*` están protegidas por middleware
- Solo usuarios con rol `ADMIN` pueden acceder
- Redirección automática a login si no está autenticado
- Página de error 403 para usuarios sin permisos

### APIs Protegidas
- Todas las APIs en `/api/admin/*` verifican autenticación
- Validación de rol `ADMIN` en cada endpoint
- Manejo seguro de errores

## 📊 Funcionalidades Disponibles

### Dashboard Principal
- ✅ Estadísticas en tiempo real
- ✅ Gráficos interactivos (Recharts)
- ✅ Métricas de usuarios, campañas y donaciones
- ✅ Tendencias de crecimiento
- ✅ Top categorías más populares

### Gestión de Usuarios
- ✅ Lista paginada con filtros
- ✅ Búsqueda en tiempo real
- ✅ Activar/desactivar usuarios
- ✅ Verificar cuentas
- ✅ Cambiar roles (Usuario ↔ Moderador)
- ✅ Estadísticas por usuario

### Gestión de Campañas
- ✅ Vista detallada de campañas
- ✅ Filtros por estado y tipo
- ✅ Pausar/activar campañas
- ✅ Verificar/desverificar
- ✅ Destacar campañas
- ✅ Cancelar campañas
- ✅ Progreso de recaudación visual

### Gestión de Categorías
- ✅ CRUD completo
- ✅ Personalización visual (colores e iconos)
- ✅ Estadísticas de uso
- ✅ Gestión de subcategorías
- ✅ Control de estado activo/inactivo

## 🎨 Interfaz de Usuario

### Responsive Design
- **Mobile**: Sidebar colapsible, layout de una columna
- **Tablet**: Grid adaptativo, navegación optimizada
- **Desktop**: Layout completo con sidebar fijo

### Componentes Principales
- `AdminLayout` - Layout principal con sidebar y header
- `AdminSidebar` - Navegación lateral responsive
- `AdminHeader` - Header con dropdown de usuario
- `StatCard` - Tarjetas de estadísticas reutilizables

## 🔧 Solución de Problemas

### Error: "Event handlers cannot be passed to Client Component props"
- **Solución**: Agregar `'use client'` al inicio de componentes que usan eventos
- **Archivos afectados**: Ya corregidos en todos los componentes

### Error 401/403 al acceder a `/admin`
- **Causa**: Usuario no autenticado o sin permisos
- **Solución**: 
  1. Verificar que el usuario tenga rol `ADMIN`
  2. Asegurarse de estar logueado
  3. Revisar configuración de NextAuth

### Error 500 en APIs admin
- **Causa**: Posible error en base de datos o configuración
- **Solución**:
  1. Verificar conexión a base de datos
  2. Revisar variables de entorno
  3. Comprobar esquema de Prisma

### Gráficos no se muestran
- **Causa**: Problema con Recharts o datos faltantes
- **Solución**:
  1. Verificar que haya datos en la base de datos
  2. Revisar consola del navegador para errores
  3. Comprobar instalación de dependencias

## 📱 Pruebas del Panel

### 1. Crear Datos de Prueba

```bash
# Ejecutar seeds si están disponibles
npx prisma db seed

# O crear manualmente:
# - Usuarios de prueba
# - Campañas de ejemplo
# - Categorías básicas
# - Donaciones de prueba
```

### 2. Verificar Funcionalidades

**Dashboard:**
- [ ] Estadísticas se cargan correctamente
- [ ] Gráficos se renderizan sin errores
- [ ] Navegación entre secciones funciona

**Gestión de Usuarios:**
- [ ] Lista se carga con paginación
- [ ] Filtros funcionan correctamente
- [ ] Acciones de moderación funcionan
- [ ] Búsqueda en tiempo real opera

**Gestión de Campañas:**
- [ ] Campañas se muestran con detalles
- [ ] Cambios de estado funcionan
- [ ] Verificación/destacado opera
- [ ] Progreso visual es correcto

**Gestión de Categorías:**
- [ ] CRUD completo funciona
- [ ] Personalización visual opera
- [ ] Modal de creación/edición funciona
- [ ] Validaciones son efectivas

## 🔄 Próximas Funcionalidades

- [ ] Gestión de donaciones detallada
- [ ] Herramientas de moderación avanzadas
- [ ] Configuración del sistema
- [ ] Logs de auditoría
- [ ] Exportación de datos
- [ ] Notificaciones push
- [ ] Dashboard personalizable

## 📞 Soporte

Si encuentras problemas o tienes preguntas sobre el panel de administración:

1. **Revisar** esta documentación
2. **Verificar** logs del servidor y navegador
3. **Comprobar** configuración de base de datos
4. **Contactar** al equipo de desarrollo

---

✨ **¡El panel de administración está listo para usar!** ✨
