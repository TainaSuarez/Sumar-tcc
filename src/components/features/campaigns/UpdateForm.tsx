'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { X, Upload, FileText, Image as ImageIcon, Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  createCampaignUpdateSchema, 
  type CreateCampaignUpdateInput, 
  UpdateType,
  UpdateTypeLabels,
  validateImageFile,
  validateVideoFile
} from '@/lib/validations/campaignUpdate';

interface UpdateFormProps {
  campaignId: string;
  initialData?: Partial<CreateCampaignUpdateInput & { 
    id: string;
    existingImages?: string[];
    existingVideos?: string[];
  }>;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
}

export function UpdateForm({
  campaignId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  success
}: UpdateFormProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.existingImages || []);
  const [existingVideos, setExistingVideos] = useState<string[]>(initialData?.existingVideos || []);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  const form = useForm<CreateCampaignUpdateInput>({
    resolver: zodResolver(createCampaignUpdateSchema.omit({ images: true, videos: true })),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      type: initialData?.type || UpdateType.TEXT_ONLY,
      isPublic: initialData?.isPublic !== undefined ? initialData.isPublic : true,
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchContent = watch('content');

  // Manejar selección de imágenes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newErrors: string[] = [];
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    // Verificar límite total
    if (selectedImages.length + files.length > 5) {
      newErrors.push('No puedes subir más de 5 imágenes por actualización');
      setFileErrors(newErrors);
      return;
    }

    files.forEach(file => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
        const preview = URL.createObjectURL(file);
        newPreviews.push(preview);
      } else {
        newErrors.push(validation.error || 'Error de validación de imagen');
      }
    });

    if (newErrors.length === 0) {
      setSelectedImages(prev => [...prev, ...validFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
      
      // Actualizar tipo automáticamente
      if (validFiles.length > 0 && selectedVideos.length === 0) {
        setValue('type', UpdateType.TEXT_IMAGE);
      }
    }

    setFileErrors(newErrors);
  };

  // Manejar selección de videos
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newErrors: string[] = [];
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    // Verificar límite (solo 1 video)
    if (selectedVideos.length + files.length > 1) {
      newErrors.push('Solo puedes subir 1 video por actualización');
      setFileErrors(newErrors);
      return;
    }

    files.forEach(file => {
      const validation = validateVideoFile(file);
      if (validation.valid) {
        validFiles.push(file);
        const preview = URL.createObjectURL(file);
        newPreviews.push(preview);
      } else {
        newErrors.push(validation.error || 'Error de validación de video');
      }
    });

    if (newErrors.length === 0) {
      setSelectedVideos(prev => [...prev, ...validFiles]);
      setVideoPreviews(prev => [...prev, ...newPreviews]);
      
      // Actualizar tipo automáticamente
      if (validFiles.length > 0) {
        setValue('type', UpdateType.TEXT_VIDEO);
      }
    }

    setFileErrors(newErrors);
  };

  // Remover imagen
  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revocar URL del preview
    URL.revokeObjectURL(imagePreviews[index]);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);

    // Actualizar tipo
    if (newImages.length === 0 && selectedVideos.length === 0) {
      setValue('type', UpdateType.TEXT_ONLY);
    }
  };

  // Remover video
  const removeVideo = (index: number) => {
    const newVideos = selectedVideos.filter((_, i) => i !== index);
    const newPreviews = videoPreviews.filter((_, i) => i !== index);
    
    // Revocar URL del preview
    URL.revokeObjectURL(videoPreviews[index]);
    
    setSelectedVideos(newVideos);
    setVideoPreviews(newPreviews);

    // Actualizar tipo
    if (newVideos.length === 0) {
      if (selectedImages.length > 0) {
        setValue('type', UpdateType.TEXT_IMAGE);
      } else {
        setValue('type', UpdateType.TEXT_ONLY);
      }
    }
  };

  // Remover imagen existente
  const removeExistingImage = (index: number) => {
    const newExistingImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newExistingImages);
  };

  // Remover video existente
  const removeExistingVideo = (index: number) => {
    const newExistingVideos = existingVideos.filter((_, i) => i !== index);
    setExistingVideos(newExistingVideos);
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (data: CreateCampaignUpdateInput) => {
    try {
      const formData = new FormData();

      // Agregar campos de texto
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('type', data.type);
      formData.append('isPublic', data.isPublic.toString());

      // Agregar imágenes
      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      // Agregar videos
      selectedVideos.forEach((video) => {
        formData.append('videos', video);
      });

      // Agregar imágenes existentes que se mantienen
      if (existingImages.length > 0) {
        formData.append('existingImages', JSON.stringify(existingImages));
      }

      // Agregar videos existentes que se mantienen
      if (existingVideos.length > 0) {
        formData.append('existingVideos', JSON.stringify(existingVideos));
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Error enviando formulario:', error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {initialData?.id ? 'Editar Actualización' : 'Nueva Actualización'}
            </CardTitle>
            <p className="text-gray-600 mt-1">
              Comparte el progreso de tu campaña con tus seguidores
            </p>
          </div>
          <Badge variant="outline" className="text-purple-700 border-purple-200">
            {UpdateTypeLabels[watch('type')]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Mensajes de estado */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          {fileErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              {fileErrors.map((error, index) => (
                <p key={index} className="text-red-800 text-sm">{error}</p>
              ))}
            </div>
          )}

          {/* Título */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Título de la actualización *
            </label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Ej: ¡Hemos alcanzado el 50% de nuestra meta!"
              className="w-full"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-red-600 text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Contenido */}
          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Contenido de la actualización *
            </label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="Describe los avances, logros, próximos pasos o cualquier información relevante para tus seguidores..."
              className="min-h-[120px] resize-vertical"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{watchContent?.length || 0} / 5000 caracteres</span>
              {errors.content && (
                <p className="text-red-600">{errors.content.message}</p>
              )}
            </div>
          </div>

          {/* Subida de archivos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Archivos multimedia</h3>
              <p className="text-sm text-gray-600">Opcional</p>
            </div>

            {/* Subida de imágenes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">
                  Imágenes (máx. 5)
                </label>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="images-upload"
                  disabled={isLoading || selectedImages.length >= 5}
                />
                <label
                  htmlFor="images-upload"
                  className="cursor-pointer flex flex-col items-center justify-center text-center"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Haz clic para subir imágenes o arrastra aquí
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WEBP hasta 5MB cada una
                  </p>
                </label>
              </div>

              {/* Imágenes existentes */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Imágenes actuales:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {existingImages.map((imageUrl, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <Image
                          src={imageUrl}
                          alt={`Imagen existente ${index + 1}`}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isLoading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Previews de imágenes nuevas */}
              {imagePreviews.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Nuevas imágenes:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isLoading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Subida de videos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">
                  Video (máx. 1)
                </label>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                  id="video-upload"
                  disabled={isLoading || selectedVideos.length >= 1}
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center justify-center text-center"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Haz clic para subir un video o arrastra aquí
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    MP4, WEBM, OGG hasta 10MB
                  </p>
                </label>
              </div>

              {/* Preview de video */}
              {videoPreviews.length > 0 && (
                <div className="space-y-2">
                  {videoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <video
                        src={preview}
                        controls
                        className="w-full max-h-64 rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Visibilidad */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              {...register('isPublic')}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              disabled={isLoading}
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Hacer esta actualización pública (visible para todos los visitantes)
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {initialData?.id ? 'Actualizando...' : 'Creando...'}
                </div>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  {initialData?.id ? 'Actualizar' : 'Publicar Actualización'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
