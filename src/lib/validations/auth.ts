import { z } from 'zod';

// Esquema para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

// Esquema para registro
export const registerSchema = z.object({
  firstName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  lastName: z.string()
    .transform(val => val.trim() === '' ? undefined : val)
    .optional()
    .refine(val => !val || val.length >= 2, 'El apellido debe tener al menos 2 caracteres')
    .refine(val => !val || val.length <= 50, 'El apellido no puede exceder 50 caracteres')
    .refine(val => !val || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val), 'El apellido solo puede contener letras y espacios'),
  organizationName: z.string()
    .transform(val => val.trim() === '' ? undefined : val)
    .optional()
    .refine(val => !val || val.length >= 2, 'El nombre de la organización debe tener al menos 2 caracteres')
    .refine(val => !val || val.length <= 100, 'El nombre de la organización no puede exceder 100 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  confirmPassword: z.string(),
  userType: z.enum(['INDIVIDUAL', 'ORGANIZATION'], {
    errorMap: () => ({ message: 'Tipo de usuario inválido' })
  }).optional().default('INDIVIDUAL'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones'
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
}).refine((data) => {
  // Si es organización, debe tener nombre de organización
  if (data.userType === 'ORGANIZATION' && !data.organizationName) {
    return false;
  }
  return true;
}, {
  message: 'El nombre de la organización es requerido para organizaciones',
  path: ['organizationName'],
});

// Esquema para cambio de contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string()
    .min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
    .max(100, 'La nueva contraseña no puede exceder 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La nueva contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword'],
});

// Esquema para recuperación de contraseña
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

// Esquema para reseteo de contraseña
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Tipos inferidos
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;