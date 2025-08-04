# Requisitos Funcionales - Sumar+

## Descripción del Proyecto

**Nombre**: Sumar+  
**Propósito**: Crear una plataforma web que centralice la ayuda solidaria, permitiendo a usuarios realizar donaciones directas y crear campañas de crowdfunding.  
**Slogan**: "Pequeños gestos, grandes cambios"

## Objetivos Principales

1. Facilitar registro de usuarios (personas físicas y organizaciones)
2. Permitir creación y publicación de campañas con título, imagen, descripción, meta y categoría
3. Integrar dos tipos de campañas:
   - **Donación Solidaria**: Para personas en situación vulnerable u ONGs
   - **Crowdfunding**: Para proyectos o ideas con objetivos específicos
4. Ofrecer panel de transparencia con avance de campañas, historial de aportes e impacto generado
5. Implementar interacción entre donantes y creadores (comentarios, actualizaciones)
6. Enviar notificaciones por correo electrónico después de cada donación
7. Soportar múltiples métodos de pago (Stripe, PayPal, PIX)
8. Interfaz responsiva, intuitiva y accesible para todos los usuarios

## Requisitos Funcionales Detallados

### RF01: Gestión de Usuarios

#### RF01.1: Registro de Usuario
- **Descripción**: Permitir registro de personas físicas y organizaciones
- **Actores**: Usuario no registrado
- **Precondiciones**: Ninguna
- **Flujo Principal**:
  1. Usuario accede al formulario de registro
  2. Selecciona tipo de cuenta (Individual/Organización)
  3. Completa información requerida
  4. Acepta términos y condiciones
  5. Sistema valida datos y crea cuenta
  6. Envía email de verificación
- **Postcondiciones**: Usuario registrado en el sistema
- **Campos Requeridos**:
  - Email (único)
  - Contraseña (mínimo 8 caracteres)
  - Nombre y apellido (para individuos)
  - Nombre de organización (para organizaciones)
  - Teléfono (opcional)
  - País

#### RF01.2: Inicio de Sesión
- **Descripción**: Autenticación de usuarios registrados
- **Actores**: Usuario registrado
- **Precondiciones**: Usuario debe estar registrado y verificado
- **Flujo Principal**:
  1. Usuario ingresa email y contraseña
  2. Sistema valida credenciales
  3. Genera tokens de acceso y refresh
  4. Redirige al dashboard o página solicitada
- **Postcondiciones**: Usuario autenticado en el sistema

#### RF01.3: Verificación de Email
- **Descripción**: Verificar la dirección de email del usuario
- **Actores**: Usuario registrado
- **Precondiciones**: Usuario registrado pero no verificado
- **Flujo Principal**:
  1. Usuario recibe email con enlace de verificación
  2. Hace clic en el enlace
  3. Sistema marca email como verificado
  4. Usuario puede acceder a todas las funcionalidades

#### RF01.4: Recuperación de Contraseña
- **Descripción**: Permitir recuperar acceso cuando se olvida la contraseña
- **Actores**: Usuario registrado
- **Flujo Principal**:
  1. Usuario solicita recuperación de contraseña
  2. Sistema envía email con enlace temporal
  3. Usuario accede al enlace y define nueva contraseña
  4. Sistema actualiza contraseña

### RF02: Gestión de Campañas

#### RF02.1: Creación de Campaña
- **Descripción**: Permitir a usuarios crear nuevas campañas
- **Actores**: Usuario autenticado y verificado
- **Precondiciones**: Usuario debe estar autenticado y verificado
- **Flujo Principal**:
  1. Usuario accede al formulario de creación
  2. Selecciona tipo de campaña (Donación/Crowdfunding)
  3. Completa información requerida
  4. Sube imágenes de la campaña
  5. Revisa y publica campaña
- **Postcondiciones**: Campaña creada y disponible para donaciones
- **Campos Requeridos**:
  - Título (máximo 100 caracteres)
  - Descripción completa
  - Descripción breve (máximo 200 caracteres)
  - Meta de recaudación
  - Categoría y subcategoría
  - Al menos una imagen
  - Fecha de finalización (opcional)
  - Información del beneficiario

#### RF02.2: Edición de Campaña
- **Descripción**: Permitir modificar campañas existentes
- **Actores**: Creador de la campaña, Administrador
- **Precondiciones**: Campaña debe existir y usuario debe ser el creador
- **Restricciones**: 
  - No se puede cambiar la meta si ya hay donaciones
  - No se puede cambiar el tipo de campaña
  - Cambios requieren re-moderación si son significativos

#### RF02.3: Listado y Filtrado de Campañas
- **Descripción**: Mostrar campañas disponibles con opciones de filtrado
- **Actores**: Cualquier usuario (autenticado o no)
- **Filtros Disponibles**:
  - Tipo de campaña
  - Categoría/Subcategoría
  - Estado (activa, completada, etc.)
  - Ubicación
  - Rango de meta
  - Nivel de urgencia
  - Campañas verificadas
  - Campañas destacadas
- **Ordenamiento**:
  - Más recientes
  - Más populares
  - Próximas a completar
  - Mayor urgencia

#### RF02.4: Visualización de Campaña
- **Descripción**: Mostrar detalles completos de una campaña
- **Actores**: Cualquier usuario
- **Información Mostrada**:
  - Detalles completos de la campaña
  - Progreso de recaudación (visual)
  - Lista de donaciones (respetando anonimato)
  - Comentarios de donantes
  - Actualizaciones del creador
  - Información del creador
  - Botón de donación prominente

### RF03: Gestión de Donaciones

#### RF03.1: Realizar Donación
- **Descripción**: Permitir a usuarios donar a campañas
- **Actores**: Usuario (autenticado o anónimo)
- **Precondiciones**: Campaña debe estar activa
- **Flujo Principal**:
  1. Usuario selecciona campaña
  2. Ingresa monto a donar
  3. Selecciona método de pago
  4. Opcionalmente agrega mensaje
  5. Elige si donar anónimamente
  6. Procesa pago a través de pasarela
  7. Confirma donación exitosa
- **Postcondiciones**: 
  - Donación registrada en el sistema
  - Monto agregado al total de la campaña
  - Notificaciones enviadas

#### RF03.2: Historial de Donaciones
- **Descripción**: Mostrar historial de donaciones del usuario
- **Actores**: Usuario autenticado
- **Información Mostrada**:
  - Lista de todas las donaciones realizadas
  - Estado de cada donación
  - Detalles de la campaña donada
  - Recibos descargables
  - Opción de solicitar reembolso (si aplica)

#### RF03.3: Procesamiento de Pagos
- **Descripción**: Integrar múltiples métodos de pago
- **Métodos Soportados**:
  - Stripe (tarjetas de crédito/débito)
  - PayPal
  - PIX (Brasil)
  - Transferencia bancaria
- **Características**:
  - Procesamiento seguro
  - Manejo de errores
  - Webhooks para confirmación
  - Reembolsos automáticos

### RF04: Sistema de Transparencia

#### RF04.1: Panel de Transparencia
- **Descripción**: Mostrar información transparente sobre el uso de fondos
- **Actores**: Cualquier usuario
- **Información Mostrada**:
  - Progreso detallado de campañas
  - Historial completo de donaciones
  - Actualizaciones del creador
  - Impacto generado
  - Uso de fondos (si disponible)

#### RF04.2: Actualizaciones de Campaña
- **Descripción**: Permitir a creadores publicar actualizaciones
- **Actores**: Creador de campaña
- **Características**:
  - Texto e imágenes
  - Notificación automática a donantes
  - Línea de tiempo visual
  - Marcas de tiempo

### RF05: Sistema de Comentarios e Interacción

#### RF05.1: Comentarios en Campañas
- **Descripción**: Permitir comentarios en campañas
- **Actores**: Usuario autenticado
- **Características**:
  - Comentarios públicos
  - Respuestas del creador
  - Moderación de contenido
  - Reportar comentarios inapropiados

#### RF05.2: Mensajería Directa
- **Descripción**: Comunicación directa entre donantes y creadores
- **Actores**: Donantes y creadores de campañas
- **Características**:
  - Mensajes privados
  - Notificaciones en tiempo real
  - Historial de conversaciones

### RF06: Sistema de Notificaciones

#### RF06.1: Notificaciones por Email
- **Descripción**: Enviar notificaciones automáticas por email
- **Tipos de Notificaciones**:
  - Confirmación de donación
  - Actualizaciones de campaña
  - Meta alcanzada
  - Nuevos comentarios
  - Recordatorios de campaña

#### RF06.2: Notificaciones en la Plataforma
- **Descripción**: Sistema de notificaciones interno
- **Características**:
  - Centro de notificaciones
  - Marcado como leído/no leído
  - Filtros por tipo
  - Configuración de preferencias

### RF07: Panel de Administración

#### RF07.1: Gestión de Usuarios
- **Descripción**: Administrar usuarios del sistema
- **Actores**: Administrador
- **Funcionalidades**:
  - Ver lista de usuarios
  - Suspender/activar cuentas
  - Verificar organizaciones
  - Ver estadísticas de usuarios

#### RF07.2: Moderación de Campañas
- **Descripción**: Moderar contenido de campañas
- **Actores**: Administrador, Moderador
- **Funcionalidades**:
  - Revisar campañas nuevas
  - Aprobar/rechazar campañas
  - Marcar como destacadas
  - Suspender campañas

#### RF07.3: Gestión de Categorías
- **Descripción**: Administrar categorías y subcategorías
- **Actores**: Administrador
- **Funcionalidades**:
  - Crear/editar/eliminar categorías
  - Gestionar subcategorías
  - Configurar iconos y colores

### RF08: Reportes y Analytics

#### RF08.1: Dashboard de Estadísticas
- **Descripción**: Panel con métricas del sistema
- **Actores**: Administrador
- **Métricas Incluidas**:
  - Total de donaciones
  - Número de campañas activas
  - Usuarios registrados
  - Conversión de donaciones
  - Campañas más exitosas

#### RF08.2: Reportes de Campañas
- **Descripción**: Reportes detallados para creadores
- **Actores**: Creador de campaña
- **Información Incluida**:
  - Progreso de recaudación
  - Demografía de donantes
  - Fuentes de tráfico
  - Engagement de la campaña

## Requisitos No Funcionales

### RNF01: Performance
- Tiempo de carga de página < 3 segundos
- Tiempo de respuesta de API < 500ms
- Soporte para 1000 usuarios concurrentes

### RNF02: Seguridad
- Encriptación HTTPS en todas las comunicaciones
- Autenticación JWT con refresh tokens
- Validación de datos en frontend y backend
- Protección contra ataques comunes (XSS, CSRF, SQL Injection)

### RNF03: Usabilidad
- Interfaz responsiva para móviles y desktop
- Accesibilidad WCAG 2.1 AA
- Soporte para múltiples idiomas (ES, PT)
- Navegación intuitiva

### RNF04: Disponibilidad
- Uptime del 99.9%
- Backups automáticos diarios
- Plan de recuperación ante desastres

### RNF05: Escalabilidad
- Arquitectura que soporte crecimiento horizontal
- Base de datos optimizada para consultas frecuentes
- CDN para contenido estático