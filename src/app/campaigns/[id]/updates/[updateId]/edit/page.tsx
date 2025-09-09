'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UpdateForm } from '@/components/features/campaigns/UpdateForm';
import { toast } from 'sonner';
import type { CampaignUpdate } from '@/types/campaignUpdate';

interface Campaign {
  id: string;
  title: string;
  creator: {
    id: string;
  };
}

export default function EditUpdatePage({ 
  params 
}: { 
  params: Promise<{ id: string; updateId: string }> 
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [update, setUpdate] = useState<CampaignUpdate | null>(null);
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

  // Cargar datos de la campaña y actualización
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar campaña
        const campaignResponse = await fetch(`/api/campaigns/${resolvedParams.id}`);
        if (!campaignResponse.ok) {
          throw new Error('Campaña no encontrada');
        }
        const campaignData = await campaignResponse.json();
        setCampaign(campaignData);

        // Verificar permisos
        if (campaignData.creator.id !== session.user.id) {
          setError('No tienes permisos para editar actualizaciones de esta campaña');
          return;
        }

        // Cargar actualización
        const updateResponse = await fetch(`/api/campaigns/${resolvedParams.id}/updates/${resolvedParams.updateId}`);
        if (!updateResponse.ok) {
          throw new Error('Actualización no encontrada');
        }
        const updateData = await updateResponse.json();
        setUpdate(updateData);

        // Verificar que el usuario es el autor de la actualización
        if (updateData.authorId !== session.user.id) {
          setError('No tienes permisos para editar esta actualización');
          return;
        }

      } catch (err) {
        console.error('Error cargando datos:', err);
        setError(err instanceof Error ? err.message : 'Error cargando los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [resolvedParams.id, resolvedParams.updateId, session, status]);

  const handleSubmit = async (formData: FormData) => {
    if (!update) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/campaigns/${resolvedParams.id}/updates/${resolvedParams.updateId}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess('Actualización editada exitosamente');
        toast.success('Actualización editada exitosamente');
        
        // Redirigir a la página de la campaña después de un breve delay
        setTimeout(() => {
          router.push(`/campaigns/${resolvedParams.id}`);
        }, 1500);
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || 'Error al editar la actualización');
        toast.error(errorData.error || 'Error al editar la actualización');
      }
    } catch (err) {
      const errorMessage = 'Error de conexión. Inténtalo de nuevo.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/campaigns/${resolvedParams.id}`);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              href="/my-campaigns"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Volver a mis campañas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign || !update) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se encontraron los datos necesarios</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/campaigns/${resolvedParams.id}`}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la campaña
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Editar Actualización
            </h1>
            <p className="text-gray-600">
              para &ldquo;<span className="font-medium">{campaign.title}</span>&rdquo;
            </p>
          </div>
        </div>

        {/* Mensajes de estado */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {submitError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{submitError}</p>
          </div>
        )}

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>Editar Actualización</CardTitle>
          </CardHeader>
          <CardContent>
            <UpdateForm
              campaignId={resolvedParams.id}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
              error={submitError}
              initialData={{
                title: update.title,
                content: update.content,
                isPublic: update.isPublic,
                existingImages: update.images,
                existingVideos: update.videos
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}