'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CampaignStatusLabels, CampaignStatusColors } from '@/types/campaign';
import { UpdatesTimeline } from '@/components/features/campaigns/UpdatesTimeline';
import { CommentsSection } from '@/components/features/campaigns/CommentsSection';
import { ImageCarousel } from '@/components/ui/image-carousel';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/Footer';
import type { CampaignUpdate } from '@/types/campaignUpdate';

interface Campaign {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  currency: string;
  status: string;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    firstName: string;
    lastName: string | null;
    organizationName: string | null;
  };
  donationCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CampaignDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState<string>('');

  // Resolve params
  useEffect(() => {
    params.then(resolvedParams => {
      setCampaignId(resolvedParams.id);
    });
  }, [params]);

  // Fetch campaign data
  useEffect(() => {
    if (!campaignId) return;

    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/campaigns/${campaignId}`);
        if (!response.ok) {
          throw new Error('Campaign not found');
        }
        const data = await response.json();
        setCampaign(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading campaign');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  const handleEditUpdate = (update: CampaignUpdate) => {
    router.push(`/campaigns/${campaignId}/updates/${update.id}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando campaña...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaña no encontrada</h1>
          <p className="text-gray-600 mb-4">{error || 'La campaña que buscas no existe.'}</p>
          <Link href="/campaigns">
            <Button>Volver a las campañas</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = session?.user?.id === campaign.creator.id;

  const progressPercentage = Math.min(
    (Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100,
    100
  );

  const creatorName = campaign.creator.organizationName || 
    `${campaign.creator.firstName} ${campaign.creator.lastName || ''}`.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar />
      
      {/* Contenido principal */}
      <div className="py-8">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-14 2xl:px-16 max-w-screen-2xl mx-auto">
          {/* Botón de volver atrás */}
          <div className="mb-6">
            <Link href="/campaigns">
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 h-auto"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver a las campañas
              </Button>
            </Link>
          </div>
        <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 gap-8 xl:gap-10">
          {/* Contenido principal */}
          <div className="xl:col-span-3 lg:col-span-2 space-y-6">
            {/* Carrusel de imágenes */}
            {campaign.images && campaign.images.length > 0 ? (
              <ImageCarousel 
                images={campaign.images} 
                title={campaign.title}
                className="w-full max-w-4xl mx-auto"
              />
            ) : (
              /* Placeholder cuando no hay imágenes */
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg 
                      className="w-8 h-8 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">Sin imágenes</p>
                  <p className="text-xs mt-1">Esta campaña no tiene imágenes</p>
                </div>
              </div>
            )}

            {/* Información principal */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-4xl font-bold text-gray-900">
                    {campaign.title}
                  </CardTitle>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      CampaignStatusColors[campaign.status]
                    }`}
                  >
                    {CampaignStatusLabels[campaign.status]}
                  </span>
                </div>
                <div className="flex items-center text-base text-gray-600">
                  <span>por {creatorName}</span>
                  <span className="mx-2">•</span>
                  <span>en {campaign.category.name}</span>
                </div>
              </CardHeader>
              <CardContent>
                {campaign.shortDescription && (
                  <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                    {campaign.shortDescription}
                  </p>
                )}
                
                <div className="prose max-w-none">
                  <h3 className="text-2xl font-semibold mb-4">Descripción del proyecto</h3>
                  <div className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed">
                    {campaign.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar de donación */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Progreso */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-3xl font-bold text-gray-900">
                        ${Number(campaign.currentAmount).toLocaleString()} UYU
                      </span>
                      <span className="text-base text-gray-600">
                        {progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <p className="text-base text-gray-600">
                      de ${Number(campaign.goalAmount).toLocaleString()} UYU objetivo
                    </p>
                  </div>

                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 gap-4 py-6 border-t border-b border-gray-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">0</div>
                      <div className="text-base text-gray-600">Donantes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {Math.ceil((new Date().getTime() - new Date(campaign.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <div className="text-base text-gray-600">Días activa</div>
                    </div>
                  </div>

                  {/* Botón de donación */}
                  {campaign.status === 'ACTIVE' && (
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-12">
                      Donar ahora
                    </Button>
                  )}

                  {/* Compartir */}
                  <div className="pt-4">
                    <p className="text-base text-gray-600 mb-3">Compartir esta campaña:</p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Facebook
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Twitter
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Copiar link
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del creador */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Creado por</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-semibold text-lg">
                      {creatorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-lg">{creatorName}</p>
                    <p className="text-base text-gray-600">
                      {campaign.creator.organizationName ? 'Organización' : 'Individuo'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sección de actualizaciones */}
        <div className="mt-12">
          <UpdatesTimeline 
            campaignId={campaignId}
            isOwner={isOwner}
            showPrivate={isOwner}
            onEdit={handleEditUpdate}
          />
        </div>

        {/* Sección de comentarios */}
        <div className="mt-12">
          <CommentsSection campaignId={campaignId} />
        </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
