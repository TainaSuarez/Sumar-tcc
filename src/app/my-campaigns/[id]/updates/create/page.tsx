'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UpdateForm } from '@/components/features/campaigns/UpdateForm';

interface Campaign {
  id: string;
  title: string;
  creator: {
    id: string;
  };
}

export default function CreateUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Verificar autenticación
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname));
    }
  }, [status, router]);

  // Cargar datos de la campaña
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/campaigns/${resolvedParams.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Campaña no encontrada');
          } else if (response.status === 403) {
            setError('No tienes permisos para acceder a esta campaña');
          } else {
            setError('Error al cargar la campaña');
          }
          return;
        }

        const campaignData = await response.json();
        
        // Verificar que el usuario es el propietario
        if (campaignData.creator.id !== session.user.id) {
          setError('No tienes permisos para crear actualizaciones en esta campaña');
          return;
        }

        setCampaign(campaignData);
      } catch {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [resolvedParams.id, session]);

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
    return null;
  }

  // Manejar envío del formulario
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/campaigns/${resolvedParams.id}/updates`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          const errorMessages = result.details.map((detail: { field?: string; message: string }) => {
            const fieldName = detail.field ? `${detail.field}: ` : '';
            return `${fieldName}${detail.message}`;
          }).join('. ');
          setSubmitError(errorMessages);
        } else {
          switch (response.status) {
            case 401:
              setSubmitError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
              break;
            case 403:
              setSubmitError('No tienes permisos para crear actualizaciones en esta campaña.');
              break;
            case 413:
              setSubmitError('Los archivos son demasiado grandes. Revisa los límites de tamaño.');
              break;
            case 429:
              setSubmitError('Has realizado demasiadas solicitudes. Espera un momento e inténtalo de nuevo.');
              break;
            default:
              setSubmitError(result.error || 'Error al crear la actualización. Inténtalo de nuevo.');
          }
        }
        return;
      }

      // Mostrar mensaje de éxito
      setSuccess('¡Actualización creada exitosamente! Redirigiendo...');

      // Redirigir a la página de la campaña
      setTimeout(() => {
        router.push(`/campaigns/${resolvedParams.id}`);
      }, 2000);

    } catch (error) {
      console.error('Error al crear actualización:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        setSubmitError('Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.');
      } else if (error instanceof Error) {
        setSubmitError(`Error inesperado: ${error.message}`);
      } else {
        setSubmitError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    router.push(`/campaigns/${resolvedParams.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando campaña...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-red-600 mb-6">{error}</p>
            <Link href="/my-campaigns">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Mis Campañas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con navegación */}
        <div className="mb-8">
          <Link href={`/campaigns/${resolvedParams.id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la campaña
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Nueva Actualización
            </h1>
            <p className="text-gray-600">
              para &ldquo;<span className="font-medium">{campaign.title}</span>&rdquo;
            </p>
          </div>
        </div>

        {/* Formulario */}
        <UpdateForm
          campaignId={resolvedParams.id}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          error={submitError}
          success={success}
        />

        {/* Información adicional */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Las actualizaciones ayudan a mantener informados a tus seguidores sobre el progreso de tu campaña.
          </p>
        </div>
      </div>
    </div>
  );
}
