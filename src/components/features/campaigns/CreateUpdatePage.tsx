'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { UpdateForm } from './UpdateForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CreateUpdatePageProps {
  campaignId: string;
  campaignTitle: string;
}

export function CreateUpdatePage({ campaignId, campaignTitle }: CreateUpdatePageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/updates`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Actualización creada exitosamente');
        router.push(`/campaigns/${campaignId}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al crear la actualización');
        toast.error(errorData.error || 'Error al crear la actualización');
      }
    } catch (err) {
      const errorMessage = 'Error de conexión. Inténtalo de nuevo.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/campaigns/${campaignId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/campaigns/${campaignId}`}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la campaña
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Nueva Actualización
            </h1>
            <p className="text-gray-600">
              Comparte el progreso de tu campaña "{campaignTitle}" con tus seguidores
            </p>
          </div>
        </div>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>Crear Actualización</CardTitle>
          </CardHeader>
          <CardContent>
            <UpdateForm
              campaignId={campaignId}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
              error={error}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}