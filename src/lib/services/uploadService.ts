import path from 'path';
import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';

// Función simplificada para procesar la subida en API routes de Next.js
export async function handleFileUpload(request: NextRequest): Promise<{
  file?: { filename: string; path: string; size: number; mimetype: string };
  fields: Record<string, string>;
  error?: string;
}> {
  try {
    const formData = await request.formData();
    const fields: Record<string, string> = {};
    let file: { filename: string; path: string; size: number; mimetype: string } | undefined;

    // Procesar FormData
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'object' && value !== null && 'size' in value && 'type' in value && 'name' in value && value.size > 0) {
        // Es un archivo
        const uploadedFile = value as File;
        
        // Validar que es una imagen
        if (!uploadedFile.type.startsWith('image/')) {
          return { fields, error: 'Solo se permiten archivos de imagen' };
        }

        // Validar tamaño (máx. 5MB)
        if (uploadedFile.size > 5 * 1024 * 1024) {
          return { fields, error: 'La imagen debe ser menor a 5MB' };
        }

        // Validar tipos permitidos
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(uploadedFile.type)) {
          return { fields, error: 'Solo se permiten imágenes JPEG, PNG o WEBP' };
        }

        // Generar nombre único
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(uploadedFile.name);
        const filename = `campaign-${uniqueSuffix}${extension}`;
        
        // Asegurar que el directorio existe
        const uploadPath = path.join(process.cwd(), 'public/uploads/campaigns');
        try {
          await fs.access(uploadPath);
        } catch {
          await fs.mkdir(uploadPath, { recursive: true });
        }

        // Guardar archivo
        const fullPath = path.join(uploadPath, filename);
        const buffer = Buffer.from(await uploadedFile.arrayBuffer());
        await fs.writeFile(fullPath, buffer);

        file = {
          filename,
          path: fullPath,
          size: uploadedFile.size,
          mimetype: uploadedFile.type
        };
      } else if (typeof value === 'string') {
        fields[key] = value;
      }
    }

    return { file, fields };
  } catch (error) {
    return { 
      fields: {}, 
      error: `Error al procesar archivo: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    };
  }
}

// Función para obtener la URL pública de un archivo
export function getPublicImageUrl(filename: string): string {
  return `/uploads/campaigns/${filename}`;
}

// Función para eliminar un archivo
export async function deleteUploadedFile(filename: string): Promise<void> {
  const filePath = path.join(process.cwd(), 'public/uploads/campaigns', filename);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
  }
}
