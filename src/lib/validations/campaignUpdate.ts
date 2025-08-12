import { z } from 'zod';

// Constantes para validación
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB para videos
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB para imágenes
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/avi"];

// Enumeración para tipos de actualización
export enum UpdateType {
  TEXT_ONLY = 'TEXT_ONLY',
  TEXT_IMAGE = 'TEXT_IMAGE',
  TEXT_VIDEO = 'TEXT_VIDEO'
}

// Esquema base para crear actualización
export const createCampaignUpdateSchema = z.object({
  title: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres')
    .trim(),

  content: z.string()
    .min(10, 'El contenido debe tener al menos 10 caracteres')
    .max(5000, 'El contenido no puede exceder 5000 caracteres')
    .trim(),

  type: z.nativeEnum(UpdateType, {
    errorMap: () => ({ message: 'Tipo de actualización inválido' }),
  }).default(UpdateType.TEXT_ONLY),

  isPublic: z.boolean().default(true),

  // Archivos opcionales (se validan en el backend)
  images: z.array(z.any()).optional(),
  videos: z.array(z.any()).optional(),
});

// Tipo inferido para frontend
export type CreateCampaignUpdateInput = z.infer<typeof createCampaignUpdateSchema>;

// Esquema para el backend después de procesar archivos
export const createCampaignUpdateBackendSchema = createCampaignUpdateSchema.extend({
  campaignId: z.string().min(1, 'ID de campaña es requerido'),
  authorId: z.string().min(1, 'ID de autor es requerido'),
  images: z.array(z.string().url()).optional(), // URLs de imágenes procesadas
  videos: z.array(z.string().url()).optional(), // URLs de videos procesados
});

export type CreateCampaignUpdateBackendInput = z.infer<typeof createCampaignUpdateBackendSchema>;

// Esquema para actualizar una actualización existente
export const updateCampaignUpdateSchema = createCampaignUpdateSchema.partial().extend({
  id: z.string().min(1, 'El ID de la actualización es requerido'),
});

export type UpdateCampaignUpdateInput = z.infer<typeof updateCampaignUpdateSchema>;

// Validación específica para archivos de imagen
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `La imagen debe ser menor a ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
    };
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Solo se permiten imágenes .jpg, .jpeg, .png y .webp"
    };
  }

  return { valid: true };
};

// Validación específica para archivos de video
export const validateVideoFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El video debe ser menor a ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Solo se permiten videos .mp4, .webm, .ogg y .avi"
    };
  }

  return { valid: true };
};

// Constantes para labels y colores
export const UpdateTypeLabels: Record<UpdateType, string> = {
  [UpdateType.TEXT_ONLY]: 'Solo Texto',
  [UpdateType.TEXT_IMAGE]: 'Texto con Imagen',
  [UpdateType.TEXT_VIDEO]: 'Texto con Video',
};

export const UpdateTypeColors: Record<UpdateType, string> = {
  [UpdateType.TEXT_ONLY]: 'bg-gray-100 text-gray-800',
  [UpdateType.TEXT_IMAGE]: 'bg-blue-100 text-blue-800',
  [UpdateType.TEXT_VIDEO]: 'bg-purple-100 text-purple-800',
};
