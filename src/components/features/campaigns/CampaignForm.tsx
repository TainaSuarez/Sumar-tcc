'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, Loader2, DollarSign, Plus, ImageIcon, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { createCampaignSchema } from '@/lib/validations/campaign';
import { type CreateCampaignInput } from '@/types/campaign';

interface Category {
  id: string;
  name: string;
}

interface CampaignFormProps {
  onSubmit?: (data: CreateCampaignInput) => void;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
}

export function CampaignForm({ onSubmit, isLoading = false, error, success }: CampaignFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [shortDescriptionCount, setShortDescriptionCount] = useState(0);

  const form = useForm<CreateCampaignInput>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      title: '',
      type: 'DONATION',
      categoryId: '',
      goalAmount: 0,
      shortDescription: '',
      description: '',
      coverImage: undefined,
      additionalImages: [],
    },
  });

  // Cargar categorías desde la API pública
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        } else {
          console.error('Error al cargar categorías:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Manejar cambios en la descripción corta para el contador
  const shortDescription = form.watch('shortDescription');
  useEffect(() => {
    setShortDescriptionCount(shortDescription?.length || 0);
  }, [shortDescription]);

  // Manejar subida de imagen
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máx. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB');
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Actualizar el formulario
      form.setValue('coverImage', file);
    }
  };

  // Remover imagen
  const removeImage = () => {
    setImagePreview(null);
    form.setValue('coverImage', undefined);
    // Limpiar el input file
    const fileInput = document.getElementById('coverImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Manejar subida de múltiples imágenes adicionales
  const handleAdditionalImagesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validar número total de imágenes (incluyendo las existentes)
    const currentImages = form.getValues('additionalImages') || [];
    const totalImages = currentImages.length + files.length;
    
    if (totalImages > 8) {
      console.error('No puedes agregar más de 8 imágenes adicionales');
      return;
    }

    setUploadingImages(true);

    try {
      // Validar cada archivo
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          console.error(`${file.name} no es una imagen válida`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          console.error(`${file.name} es demasiado grande (máx. 5MB)`);
          continue;
        }
      }

      // Crear previews
      const newPreviews: string[] = [];
      const validFiles: File[] = [];

      for (const file of files) {
        if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
          const reader = new FileReader();
          const previewPromise = new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          
          const preview = await previewPromise;
          newPreviews.push(preview);
          validFiles.push(file);
        }
      }

      // Actualizar estados
      setAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
      form.setValue('additionalImages', [...currentImages, ...validFiles]);

    } catch (error) {
      console.error('Error al procesar las imágenes:', error);
    } finally {
      setUploadingImages(false);
      // Limpiar el input
      event.target.value = '';
    }
  };

  // Remover imagen adicional específica
  const removeAdditionalImage = (index: number) => {
    const currentImages = form.getValues('additionalImages') || [];
    const currentPreviews = [...additionalImagePreviews];

    // Remover de los arrays
    currentImages.splice(index, 1);
    currentPreviews.splice(index, 1);

    // Actualizar estados
    form.setValue('additionalImages', currentImages);
    setAdditionalImagePreviews(currentPreviews);
  };

  const handleSubmit = (data: CreateCampaignInput) => {
    if (!success) {
      onSubmit?.(data);
    }
  };

  const handleCancel = () => {
    // Confirmar antes de cancelar si hay datos en el formulario
    const hasData = form.getValues('title') || 
                    form.getValues('description') || 
                    form.getValues('shortDescription');
    
    if (hasData) {
      const confirmCancel = window.confirm(
        '¿Estás seguro de que deseas cancelar? Se perderán todos los datos ingresados.'
      );
      if (!confirmCancel) return;
    }
    
    // Redirigir a la página principal o mis campañas
    router.push('/my-campaigns');
  };

  // Deshabilitar formulario si hay éxito
  const isFormDisabled = isLoading || !!success;

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl border-0 bg-white">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center text-gray-900">
          Crear Nueva Campaña
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          Completa la información para crear tu campaña solidaria o proyecto
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            {success}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la campaña</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Escribe un título atractivo para tu campaña"
                      disabled={isFormDisabled}
                      className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Campaña */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de campaña</FormLabel>
                  <Select
                    disabled={isFormDisabled}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="Selecciona el tipo de campaña" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DONATION">
                        <div className="flex flex-col">
                          <span className="font-medium">Donación</span>
                          <span className="text-xs text-gray-500">Para causas solidarias y ayuda directa</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="CROWDFUNDING">
                        <div className="flex flex-col">
                          <span className="font-medium">Crowdfunding</span>
                          <span className="text-xs text-gray-500">Para proyectos y emprendimientos</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Elige si tu campaña es para una causa solidaria o un proyecto/emprendimiento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoría y Monto Objetivo en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categoría */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || loadingCategories}>
                      <FormControl>
                        <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingCategories ? (
                          <SelectItem value="loading" disabled>
                            <div className="flex items-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Cargando categorías...
                            </div>
                          </SelectItem>
                        ) : categories.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            No hay categorías disponibles
                          </SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Monto Objetivo */}
              <FormField
                control={form.control}
                name="goalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto objetivo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          placeholder="0"
                          disabled={isFormDisabled}
                          className="h-12 pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Monto mínimo: $100, máximo: $1,000,000
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descripción Corta */}
            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción corta</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe una descripción breve y atractiva de tu campaña"
                      disabled={isFormDisabled}
                      className="min-h-[100px] border-gray-300 focus:border-purple-500 focus:ring-purple-500 resize-none"
                      maxLength={150}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormDescription>
                      Esta descripción aparecerá en las vistas previas de tu campaña
                    </FormDescription>
                    <span className={`text-sm ${shortDescriptionCount > 150 ? 'text-red-500' : 'text-gray-500'}`}>
                      {shortDescriptionCount}/150
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción Extendida */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción detallada</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe tu proyecto en detalle. Incluye objetivos, beneficiarios, cronograma, y cualquier información relevante que ayude a los donantes a entender tu causa."
                      disabled={isFormDisabled}
                      className="min-h-[200px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Proporciona todos los detalles importantes sobre tu proyecto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Imagen de Portada */}
            <FormField
              control={form.control}
              name="coverImage"
              render={() => (
                <FormItem>
                  <FormLabel>Imagen de portada</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {!imagePreview ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <label htmlFor="coverImage" className="cursor-pointer">
                              <span className="mt-2 block text-sm font-medium text-gray-900">
                                Sube una imagen de portada
                              </span>
                              <span className="mt-1 block text-sm text-gray-600">
                                Tamaño recomendado: 1200x630px, máx. 5MB
                              </span>
                            </label>
                            <input
                              id="coverImage"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                              disabled={isFormDisabled}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-lg">
                            <Image
                              src={imagePreview}
                              alt="Vista previa de la imagen de portada"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                            disabled={isFormDisabled}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Una imagen atractiva ayuda a captar la atención de los donantes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Imágenes Adicionales */}
            <FormField
              control={form.control}
              name="additionalImages"
              render={() => (
                <FormItem>
                  <FormLabel>Imágenes adicionales (opcional)</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {/* Grid de imágenes existentes */}
                      {additionalImagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {additionalImagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-gray-200">
                                <Image
                                  src={preview}
                                  alt={`Imagen adicional ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeAdditionalImage(index)}
                                disabled={isFormDisabled}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Botón para agregar más imágenes */}
                      {additionalImagePreviews.length < 8 && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-500 transition-colors">
                          <label htmlFor="additionalImages" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                              {uploadingImages ? (
                                <>
                                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                                  <span className="mt-2 text-sm text-gray-600">
                                    Procesando imágenes...
                                  </span>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-2">
                                    <Plus className="h-6 w-6 text-gray-400" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">
                                    Agregar más imágenes
                                  </span>
                                  <span className="text-xs text-gray-600 mt-1">
                                    Máximo 8 imágenes, 5MB cada una
                                  </span>
                                  <span className="text-xs text-emerald-600 mt-1">
                                    {additionalImagePreviews.length}/8 imágenes
                                  </span>
                                </>
                              )}
                            </div>
                          </label>
                          <input
                            id="additionalImages"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleAdditionalImagesUpload}
                            disabled={isFormDisabled || uploadingImages}
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Agrega hasta 8 imágenes adicionales para mostrar más detalles de tu proyecto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
                disabled={isFormDisabled}
                onClick={handleCancel}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar campaña
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
                disabled={isFormDisabled}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear campaña
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
