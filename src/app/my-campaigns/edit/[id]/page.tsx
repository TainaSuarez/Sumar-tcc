'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createCampaignSchema } from '@/lib/validations/campaign';
import { type CreateCampaignInput } from '@/types/campaign';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface Campaign {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  categoryId: string;
  status: string;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [shortDescriptionLength, setShortDescriptionLength] = useState(0);

  const form = useForm<CreateCampaignInput>({
    resolver: zodResolver(createCampaignSchema.omit({ coverImage: true })),
    defaultValues: {
      title: '',
      categoryId: '',
      goalAmount: 0,
      shortDescription: '',
      description: '',
    },
  });

  // Verificar autenticación
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/my-campaigns');
    }
  }, [status, router]);

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error cargando categorías:', error);
      }
    };

    fetchCategories();
  }, []);

  // Cargar campaña
  useEffect(() => {
    const fetchCampaign = async () => {
      if (status !== 'authenticated' || !session?.user?.id) return;

      try {
        const response = await fetch(`/api/campaigns/${resolvedParams.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Campaña no encontrada');
          } else if (response.status === 403) {
            setError('No tienes permisos para editar esta campaña');
          } else {
            setError('Error al cargar la campaña');
          }
          return;
        }

        const data = await response.json();
        setCampaign(data);

        // Llenar el formulario con los datos existentes
        form.reset({
          title: data.title,
          categoryId: data.categoryId,
          goalAmount: data.goalAmount,
          shortDescription: data.shortDescription || '',
          description: data.description,
        });

        setShortDescriptionLength(data.shortDescription?.length || 0);
        
        // Si tiene imagen, mostrar preview
        if (data.images.length > 0) {
          setImagePreview(data.images[0]);
        }

      } catch {
        setError('Error al cargar la campaña');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [resolvedParams.id, session, status, form]);

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo y tamaño
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB');
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Guardar el archivo en el form
      form.setValue('coverImage', file);
    }
  };

  // Remover imagen
  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue('coverImage', undefined);
    
    // Limpiar el input file
    const fileInput = document.getElementById('coverImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (data: CreateCampaignInput) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      
      // Agregar los campos del formulario
      formData.append('title', data.title);
      formData.append('categoryId', data.categoryId || '');
      formData.append('goalAmount', data.goalAmount.toString());
      formData.append('shortDescription', data.shortDescription);
      formData.append('description', data.description);
      
      // Agregar la imagen si existe
      if (data.coverImage) {
        formData.append('coverImage', data.coverImage);
      }

      const response = await fetch(`/api/campaigns/${resolvedParams.id}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          // Errores de validación específicos
          const errorMessages = result.details.map((detail: { field?: string; message: string }) => {
            const fieldName = detail.field ? `${detail.field}: ` : '';
            return `${fieldName}${detail.message}`;
          }).join('. ');
          setError(errorMessages);
        } else {
          setError(result.error || 'Error al actualizar la campaña');
        }
        return;
      }

      setSuccess('¡Campaña actualizada exitosamente!');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/my-campaigns');
      }, 2000);

    } catch (error) {
      console.error('Error al actualizar campaña:', error);
      setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando campaña...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium">{error}</p>
            <div className="mt-4 space-y-2">
              <Link href="/my-campaigns">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Volver a Mis Campañas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      {/* Header */}
      <div className="bg-white border-b border-purple-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/my-campaigns">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Editar Campaña
                </h1>
                <p className="text-gray-600">
                  Actualiza la información de tu campaña
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/campaigns/${resolvedParams.id}`}>
                <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Campaña
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-bold text-gray-900">
              Información de la Campaña
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Mensajes de error y éxito */}
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
                          disabled={isSubmitting}
                          className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Categoría */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500">
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Monto objetivo */}
                <FormField
                  control={form.control}
                  name="goalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto objetivo (UYU)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            type="number"
                            min="100"
                            max="1000000"
                            step="1"
                            placeholder="15000"
                            disabled={isSubmitting}
                            className="pl-8 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Establece el monto que necesitas recaudar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descripción corta */}
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción corta</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Escribe una descripción breve y atractiva de tu campaña..."
                          maxLength={150}
                          rows={3}
                          disabled={isSubmitting}
                          className="resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setShortDescriptionLength(e.target.value.length);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        {shortDescriptionLength}/150 caracteres
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descripción detallada */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción detallada</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explica en detalle tu proyecto, por qué es importante y cómo se utilizarán los fondos..."
                          rows={8}
                          disabled={isSubmitting}
                          className="resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Proporciona todos los detalles importantes sobre tu campaña.
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
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="mt-4">
                                <label htmlFor="coverImage" className="cursor-pointer">
                                  <span className="mt-2 block text-sm font-medium text-gray-900">
                                    Arrastra y suelta tu imagen aquí, o haz clic para seleccionar
                                  </span>
                                  <span className="mt-1 block text-sm text-gray-600">
                                    (Recomendado: 1200x630px, máx. 5MB)
                                  </span>
                                </label>
                                <input
                                  id="coverImage"
                                  type="file"
                                  className="sr-only"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={handleImageChange}
                                  disabled={isSubmitting}
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
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 rounded-full bg-white/80 hover:bg-white"
                                onClick={handleRemoveImage}
                                disabled={isSubmitting}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Actualiza la imagen de tu campaña (opcional).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Link href="/my-campaigns" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-gray-300 hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
