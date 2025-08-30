import path from 'path';
import { type NextRequest } from 'next/server';
import { promises as fs } from 'fs';

// Tipos permitidos
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/avi"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

// Interfaz para archivos procesados
interface ProcessedFile {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  type: 'image' | 'video';
}

// Función para procesar múltiples archivos en actualizaciones
export async function handleUpdateFileUpload(request: NextRequest): Promise<{
  images: ProcessedFile[];
  videos: ProcessedFile[];
  fields: Record<string, string>;
  error?: string;
}> {
  try {
    const formData = await request.formData();
    const fields: Record<string, string> = {};
    const images: ProcessedFile[] = [];
    const videos: ProcessedFile[] = [];

    // Crear directorios si no existen
    const imageUploadPath = path.join(process.cwd(), 'public/uploads/updates/images');
    const videoUploadPath = path.join(process.cwd(), 'public/uploads/updates/videos');
    
    await ensureDirectoryExists(imageUploadPath);
    await ensureDirectoryExists(videoUploadPath);

    // Procesar FormData
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'object' && value.size > 0 && typeof value.name === 'string') {
        const file = value as unknown as UploadedFile;
        // Determinar si es imagen o video
        if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          // Validar tamaño de imagen
          if (file.size > MAX_IMAGE_SIZE) {
            return { 
              images, 
              videos, 
              fields, 
              error: `La imagen "${file.name}" debe ser menor a ${MAX_IMAGE_SIZE / (1024 * 1024)}MB` 
            };
          }

          // Procesar imagen
          const imageFile = await processFile(file, imageUploadPath, 'update-image');
          if (imageFile) {
            images.push({ ...imageFile, type: 'image' });
          }
        } else if (ACCEPTED_VIDEO_TYPES.includes(file.type)) {
          // Validar tamaño de video
          if (file.size > MAX_VIDEO_SIZE) {
            return { 
              images, 
              videos, 
              fields, 
              error: `El video "${file.name}" debe ser menor a ${MAX_VIDEO_SIZE / (1024 * 1024)}MB` 
            };
          }

          // Procesar video
          const videoFile = await processFile(file, videoUploadPath, 'update-video');
          if (videoFile) {
            videos.push({ ...videoFile, type: 'video' });
          }
        } else {
          return { 
            images, 
            videos, 
            fields, 
            error: `Tipo de archivo no soportado: ${file.type}. Solo se permiten imágenes (JPEG, PNG, WEBP) y videos (MP4, WEBM, OGG, AVI).` 
          };
        }
      } else if (typeof value === 'string') {
        fields[key] = value;
      }
    }

    return { images, videos, fields };
  } catch (error) {
    return {
      images: [],
      videos: [],
      fields: {},
      error: `Error al procesar archivos: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

// Función auxiliar para procesar un archivo individual
async function processFile(
  file: UploadedFile, 
  uploadPath: string, 
  prefix: string
): Promise<ProcessedFile | null> {
  try {
    // Generar nombre único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.name);
    const filename = `${prefix}-${uniqueSuffix}${extension}`;

    // Guardar archivo
    const fullPath = path.join(uploadPath, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, buffer);

    return {
      filename,
      path: fullPath,
      size: file.size,
      mimetype: file.type,
      type: file.type.startsWith('image/') ? 'image' : 'video'
    };
  } catch (error) {
    console.error('Error procesando archivo:', error);
    return null;
  }
}

// Función auxiliar para asegurar que el directorio existe
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Función para obtener la URL pública de una imagen de actualización
export function getPublicUpdateImageUrl(filename: string): string {
  return `/uploads/updates/images/${filename}`;
}

// Función para obtener la URL pública de un video de actualización
export function getPublicUpdateVideoUrl(filename: string): string {
  return `/uploads/updates/videos/${filename}`;
}

// Función para eliminar archivos de actualización
export async function deleteUpdateFile(filename: string, type: 'image' | 'video'): Promise<void> {
  try {
    const subDir = type === 'image' ? 'images' : 'videos';
    const filePath = path.join(process.cwd(), 'public/uploads/updates', subDir, filename);
    await fs.unlink(filePath);
    console.log(`Archivo ${filename} eliminado exitosamente.`);
  } catch (error) {
    console.error(`Error al eliminar archivo ${filename}:`, error);
  }
}

// Función para limpiar archivos en caso de error
export async function cleanupUpdateFiles(
  images: ProcessedFile[], 
  videos: ProcessedFile[]
): Promise<void> {
  try {
    const cleanupPromises = [
      ...images.map(img => deleteUpdateFile(img.filename, 'image')),
      ...videos.map(vid => deleteUpdateFile(vid.filename, 'video'))
    ];
    await Promise.all(cleanupPromises);
  } catch (error) {
    console.error('Error limpiando archivos:', error);
  }
}
