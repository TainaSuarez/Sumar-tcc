# Base de Datos - Sumar+

## Descripción General

La base de datos de Sumar+ está diseñada para soportar un sistema completo de donaciones y crowdfunding solidario. Utiliza PostgreSQL como motor de base de datos y Prisma como ORM.

## Esquema de Base de Datos

### Enumeraciones

#### UserType
- `INDIVIDUAL`: Persona física
- `ORGANIZATION`: ONG o organización

#### UserRole
- `USER`: Usuario estándar
- `ADMIN`: Administrador del sistema
- `MODERATOR`: Moderador de contenido

#### CampaignType
- `DONATION`: Donación solidaria para personas en situación vulnerable
- `CROWDFUNDING`: Crowdfunding para proyectos específicos

#### CampaignStatus
- `DRAFT`: Borrador
- `ACTIVE`: Activa y recibiendo donaciones
- `PAUSED`: Pausada temporalmente
- `COMPLETED`: Completada (meta alcanzada)
- `CANCELLED`: Cancelada

#### DonationStatus
- `PENDING`: Pendiente de procesamiento
- `COMPLETED`: Completada exitosamente
- `FAILED`: Falló el procesamiento
- `REFUNDED`: Reembolsada

#### PaymentMethod
- `STRIPE`: Pago con Stripe
- `PAYPAL`: Pago con PayPal
- `PIX`: Pago con PIX (Brasil)
- `BANK_TRANSFER`: Transferencia bancaria

### Modelos Principales

#### User (Usuarios)
Almacena información de usuarios individuales y organizaciones.

**Campos principales:**
- `id`: Identificador único
- `email`: Email único del usuario
- `firstName`, `lastName`: Nombre y apellido
- `organizationName`: Nombre de la organización (solo para tipo ORGANIZATION)
- `userType`: Tipo de usuario (INDIVIDUAL/ORGANIZATION)
- `role`: Rol del usuario (USER/ADMIN/MODERATOR)
- `isVerified`: Indica si el usuario está verificado
- `isActive`: Indica si la cuenta está activa

#### Campaign (Campañas)
Representa las campañas de donación o crowdfunding.

**Campos principales:**
- `id`: Identificador único
- `title`: Título de la campaña
- `slug`: URL amigable única
- `description`: Descripción completa
- `shortDescription`: Descripción breve
- `images`: Array de URLs de imágenes
- `goalAmount`: Meta de recaudación
- `currentAmount`: Cantidad actual recaudada
- `type`: Tipo de campaña (DONATION/CROWDFUNDING)
- `status`: Estado actual de la campaña
- `urgencyLevel`: Nivel de urgencia (1-5)
- `isVerified`: Indica si la campaña está verificada
- `isFeatured`: Indica si es una campaña destacada

#### Donation (Donaciones)
Registra todas las donaciones realizadas.

**Campos principales:**
- `id`: Identificador único
- `amount`: Cantidad donada
- `currency`: Moneda de la donación
- `message`: Mensaje opcional del donante
- `isAnonymous`: Indica si es una donación anónima
- `paymentMethod`: Método de pago utilizado
- `status`: Estado de la donación

#### Category y Subcategory (Categorías)
Sistema de categorización jerárquico para las campañas.

#### Comment (Comentarios)
Comentarios de los usuarios en las campañas.

#### CampaignUpdate (Actualizaciones)
Actualizaciones publicadas por los creadores de campañas.

#### Notification (Notificaciones)
Sistema de notificaciones para los usuarios.

### Relaciones Principales

1. **User → Campaign**: Un usuario puede crear múltiples campañas
2. **User → Donation**: Un usuario puede realizar múltiples donaciones
3. **Campaign → Donation**: Una campaña puede recibir múltiples donaciones
4. **Campaign → Comment**: Una campaña puede tener múltiples comentarios
5. **Campaign → CampaignUpdate**: Una campaña puede tener múltiples actualizaciones
6. **Category → Subcategory**: Una categoría puede tener múltiples subcategorías
7. **Campaign → Tag**: Relación muchos a muchos a través de CampaignTag

## Configuración

### Variables de Entorno
```env
DATABASE_URL="postgresql://username:password@localhost:5432/sumarplus"
```

### Comandos Prisma

```bash
# Generar cliente
npx prisma generate

# Crear migración
npx prisma migrate dev --name init

# Aplicar migraciones
npx prisma migrate deploy

# Abrir Prisma Studio
npx prisma studio

# Reset de base de datos
npx prisma migrate reset
```

## Índices Recomendados

Para optimizar el rendimiento, se recomienda crear los siguientes índices:

1. `campaigns(status, type)` - Para filtros de campañas
2. `campaigns(createdAt)` - Para ordenamiento temporal
3. `donations(campaignId, status)` - Para consultas de donaciones por campaña
4. `users(email)` - Ya incluido como unique
5. `notifications(userId, isRead)` - Para consultas de notificaciones

## Consideraciones de Seguridad

1. **Encriptación de contraseñas**: Las contraseñas deben ser hasheadas con bcrypt
2. **Validación de datos**: Todos los inputs deben ser validados antes de insertar
3. **Soft deletes**: Considerar implementar borrado lógico para datos sensibles
4. **Auditoría**: Los campos `createdAt` y `updatedAt` permiten auditoría básica
5. **Tokens de refresh**: Sistema de tokens para autenticación segura

## Backup y Mantenimiento

1. **Backups automáticos**: Configurar backups diarios de la base de datos
2. **Limpieza de tokens**: Eliminar tokens de refresh expirados periódicamente
3. **Archivado de campañas**: Archivar campañas completadas después de un período
4. **Monitoreo**: Implementar monitoreo de performance de consultas