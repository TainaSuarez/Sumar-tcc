import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export class CloudinaryService {
  /**
   * Sube una imagen a Cloudinary
   */
  static async uploadImage(
    file: File,
    options: {
      folder?: string;
      transformation?: Record<string, string | number>[];
      public_id?: string;
    } = {}
  ): Promise<UploadResult> {
    try {
      // Convertir File a buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Configurar opciones por defecto
      const uploadOptions = {
        folder: options.folder || 'campaigns',
        resource_type: 'image' as const,
        transformation: options.transformation || [
          { width: 1200, height: 630, crop: 'fill', quality: 'auto' },
          { fetch_format: 'auto' }
        ],
        public_id: options.public_id,
      };

      // Subir imagen
      const result = await new Promise<UploadResult>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
              });
            } else {
              reject(new Error('No se pudo subir la imagen'));
            }
          }
        ).end(buffer);
      });

      return result;
    } catch (error) {
      console.error('Error subiendo imagen a Cloudinary:', error);
      throw new Error('Error al subir la imagen. Inténtalo de nuevo.');
    }
  }

  /**
   * Elimina una imagen de Cloudinary
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Error eliminando imagen de Cloudinary:', error);
      return false;
    }
  }

  /**
   * Genera URL de imagen con transformaciones
   */
  static getImageUrl(
    publicId: string,
    transformations?: Record<string, string | number>[]
  ): string {
    return cloudinary.url(publicId, {
      transformation: transformations || [
        { width: 1200, height: 630, crop: 'fill', quality: 'auto' },
        { fetch_format: 'auto' }
      ],
    });
  }
}
