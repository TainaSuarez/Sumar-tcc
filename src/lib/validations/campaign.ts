import { z } from 'zod';

// Esquema para crear una campaña
export const createCampaignSchema = z.object({
  title: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres')
    .trim(),
  
  categoryId: z.string()
    .min(1, 'Debes seleccionar una categoría'),
  
  goalAmount: z.number()
    .min(100, 'El monto objetivo debe ser al menos $100')
    .max(1000000, 'El monto objetivo no puede exceder $1,000,000')
    .positive('El monto objetivo debe ser un número positivo'),
  
  shortDescription: z.string()
    .min(10, 'La descripción corta debe tener al menos 10 caracteres')
    .max(150, 'La descripción corta no puede exceder 150 caracteres')
    .trim(),
  
  description: z.string()
    .min(50, 'La descripción debe tener al menos 50 caracteres')
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .trim(),
  
  coverImage: z.any()
    .optional()
    .refine((file) => {
      if (!file) return true; // Es opcional
      return file instanceof File;
    }, 'Debe ser un archivo válido')
    .refine((file) => {
      if (!file) return true;
      return file.size <= 5 * 1024 * 1024; // 5MB máximo
    }, 'La imagen debe ser menor a 5MB')
    .refine((file) => {
      if (!file) return true;
      return file.type.startsWith('image/');
    }, 'El archivo debe ser una imagen válida'),
});

// Esquema alternativo para uso en el backend donde coverImage puede ser string (URL)
export const createCampaignBackendSchema = createCampaignSchema.extend({
  coverImage: z.string().url('URL de imagen inválida').optional(),
});

// Esquema para actualizar una campaña (todos los campos opcionales excepto ID)
export const updateCampaignSchema = createCampaignSchema.partial().extend({
  id: z.string().min(1, 'ID de campaña requerido'),
});

// Tipo inferido para el frontend (con File para coverImage)
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

// Tipo inferido para el backend (con string URL para coverImage)
export type CreateCampaignBackendInput = z.infer<typeof createCampaignBackendSchema>;

// Tipo para actualizar campaña
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
