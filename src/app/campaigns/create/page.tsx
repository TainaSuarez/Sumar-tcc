'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { CampaignForm } from '@/components/features/campaigns/CampaignForm';
import { type CreateCampaignInput } from '@/types/campaign';

export default function CreateCampaignPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { status } = useSession();

  // Verificar autenticación
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/campaigns/create');
    return null;
  }

  const handleSubmit = async (data: CreateCampaignInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Crear FormData para manejar la subida de archivos
      const formData = new FormData();
      
      // Agregar los campos del formulario
      formData.append('title', data.title);
      formData.append('type', data.type);
      formData.append('categoryId', data.categoryId || '');
      formData.append('goalAmount', data.goalAmount.toString());
      formData.append('shortDescription', data.shortDescription);
      formData.append('description', data.description);
      
      // Agregar la imagen de portada si existe
      if (data.coverImage) {
        formData.append('coverImage', data.coverImage);
      }

      // Agregar las imágenes adicionales si existen
      if (data.additionalImages && data.additionalImages.length > 0) {
        data.additionalImages.forEach((image, index) => {
          formData.append(`additionalImage${index}`, image);
        });
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
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
          // Mensajes de error específicos según el código de estado
          switch (response.status) {
            case 401:
              setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
              break;
            case 413:
              setError('La imagen es demasiado grande. El tamaño máximo permitido es 5MB.');
              break;
            case 429:
              setError('Has realizado demasiadas solicitudes. Espera un momento e inténtalo de nuevo.');
              break;
            default:
              setError(result.error || 'Error al crear la campaña. Inténtalo de nuevo.');
          }
        }
        return;
      }

      // Mostrar mensaje de éxito
      setSuccess('¡Campaña creada exitosamente! Redirigiendo...');

      // Redirigir a la campaña creada usando el ID
      setTimeout(() => {
        router.push(`/campaigns/${result.campaign.id}`);
      }, 2000);

    } catch (error) {
      console.error('Error al crear campaña:', error);
      
      // Manejar diferentes tipos de errores
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.');
      } else if (error instanceof Error) {
        setError(`Error inesperado: ${error.message}`);
      } else {
        setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Crea tu campaña
          </h1>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Comparte tu causa solidaria o proyecto con el mundo y recibe el apoyo que necesitas para hacerlo realidad.
          </p>
        </div>

        {/* Formulario */}
        <CampaignForm onSubmit={handleSubmit} isLoading={isLoading} error={error} success={success} />

        {/* Información adicional */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Al crear una campaña, aceptas nuestros{' '}
            <a href="/terms" className="text-purple-600 hover:underline" target="_blank">
              términos y condiciones
            </a>
            {' '}y{' '}
            <a href="/privacy" className="text-purple-600 hover:underline" target="_blank">
              política de privacidad
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
