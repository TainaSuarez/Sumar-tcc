'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { CampaignStatusLabels, CampaignStatusColors } from '@/types/campaign';
import { UpdatesTimeline } from '@/components/features/campaigns/UpdatesTimeline';
import { CommentsSection } from '@/components/features/campaigns/CommentsSection';
import { ImageCarousel } from '@/components/ui/image-carousel';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/Footer';
import { MockDonateButton } from '@/components/donations';
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

  // Resolver params
  useEffect(() => {
    params.then(resolvedParams => {
      setCampaignId(resolvedParams.id);
    });
  }, [params]);

  // Cargar datos de la campaña
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) return;
      
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`);
        if (!response.ok) {
          throw new Error('Error al cargar la campaña');
        }
        const data = await response.json();
        setCampaign(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  const handleEditUpdate = (update: CampaignUpdate) => {
    // Lógica para editar actualización
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando campaña...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Campaña no encontrada'}</p>
          <Button onClick={() => router.back()}>Volver</Button>
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
      {/* Navbar */}
      <Navbar />
      
      {/* Botón de volver atrás - Entre header e imagen */}
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 max-w-none mx-auto py-12 mt-16">
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

      {/* Contenido principal */}
      <div className="pb-8">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 max-w-none mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-3 gap-8 xl:gap-12">
            {/* Contenido principal */}
            <div className="xl:col-span-2 lg:col-span-2 space-y-6">
              {/* Imagen de la campaña */}
              {campaign.images && campaign.images.length > 0 ? (
                <ImageCarousel 
                  images={campaign.images} 
                  title={campaign.title}
                  className="w-full h-96 mb-32"
                />
              ) : (
                /* Placeholder cuando no hay imágenes */
                <div className="relative h-96 w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center mb-32">
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
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">Sin imágenes</p>
                    <p className="text-xs mt-1">Esta campaña no tiene imágenes</p>
                  </div>
                </div>
              )}

              {/* Título de la campaña */}
              <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
                <div className="flex items-start justify-between mb-6">
                  <h1 className="text-4xl font-bold text-gray-900 flex-1 mr-6 leading-tight">
                    {campaign.title}
                  </h1>
                  <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">
                    Activo
                  </span>
                </div>
                
                <div className="text-lg text-gray-600">
                  <span>por {creatorName}</span>
                  <span className="mx-3">•</span>
                  <span>en {campaign.category.name}</span>
                </div>
              </div>

              {/* Descripción de la campaña */}
              <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
                {campaign.shortDescription && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <p className="text-xl text-gray-700 leading-relaxed">
                      {campaign.shortDescription}
                    </p>
                  </div>
                )}
                
                <div className="prose max-w-none">
                  <h3 className="text-2xl font-semibold mb-6 text-gray-900">Descripción del proyecto</h3>
                  <div className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed mb-4">
                    {campaign.description}
                  </div>
                </div>
              </div>

              {/* Sección de actualizaciones */}
              <div className="mt-8">
                <UpdatesTimeline 
                  campaignId={campaignId}
                  isOwner={isOwner}
                  showPrivate={isOwner}
                  onEdit={handleEditUpdate}
                />
              </div>

              {/* Sección de comentarios */}
              <div className="mt-8">
                <CommentsSection campaignId={campaignId} />
              </div>
            </div>

            {/* Sidebar de donación */}
            <div className="space-y-8">
              <Card className="overflow-hidden">
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Progreso */}
                    <div>
                      <div className="mb-8">
                        <div className="text-2xl font-semibold text-gray-700 mb-3">
                          Recaudado
                        </div>
                        <div className="text-6xl font-bold text-gray-900 mb-4 transition-all duration-500 ease-out">
                          {Number(campaign.currentAmount).toLocaleString('es-UY')} $UY
                        </div>
                        <div className="text-xl text-gray-600 mb-6">
                          Meta: {Number(campaign.goalAmount).toLocaleString('es-UY')} $UY
                        </div>
                        <div className="text-3xl font-bold text-purple-600 mb-3 transition-all duration-500 ease-out">
                          {progressPercentage.toFixed(0)}% completado
                        </div>
                        <div className="text-lg text-gray-600 mb-3">
                          <span className="font-semibold text-blue-600 transition-all duration-500 ease-out">
                            {campaign.donationCount}
                          </span> donantes
                        </div>
                        <div className="text-lg text-gray-600">
                          {Math.ceil((new Date().getTime() - new Date(campaign.createdAt).getTime()) / (1000 * 60 * 60 * 24))} días restantes
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-6 mb-8">
                        <div
                          className="bg-purple-500 h-6 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-1">$1 000</div>
                          <div className="text-sm text-gray-600">Donación mínima</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-1">$5 000</div>
                          <div className="text-sm text-gray-600">Donación media</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-1">$10 000</div>
                          <div className="text-sm text-gray-600">Otra meta</div>
                        </div>
                      </div>
                    </div>

                    {/* Botón de donación */}
                    {(campaign.status === 'ACTIVE' || campaign.status === 'PENDING') && (
                      <MockDonateButton 
                        campaign={{
                          id: campaign.id,
                          title: campaign.title,
                          goalAmount: campaign.goalAmount,
                          currentAmount: campaign.currentAmount
                        }}
                        className="w-full h-14 text-xl"
                        onDonationSuccess={(donationData) => {
                          console.log('Donación simulada exitosa:', donationData);
                          
                          // Formatear el monto para mostrar
                          const formattedAmount = new Intl.NumberFormat('es-UY', {
                            style: 'currency',
                            currency: 'UYU',
                          }).format(donationData.amount);
                          
                          // Mostrar notificación de éxito
                          toast.success(
                            `¡Gracias por tu donación de ${formattedAmount}!`,
                            {
                              description: 'Tu contribución ayudará a hacer realidad esta campaña.',
                              duration: 5000,
                            }
                          );
                          
                          // Actualizar el estado local de la campaña
                          if (campaign) {
                            setCampaign(prevCampaign => {
                              if (!prevCampaign) return null;
                              
                              return {
                                ...prevCampaign,
                                currentAmount: prevCampaign.currentAmount + donationData.amount,
                                donationCount: prevCampaign.donationCount + 1
                              };
                            });
                          }
                        }}
                      />
                    )}

                    {/* Compartir */}
                    <div className="border-t border-gray-200 pt-8">
                      <p className="text-lg font-medium text-gray-900 mb-6">Compartir esta campaña</p>
                      <div className="grid grid-cols-1 gap-3">
                        <Button variant="outline" className="h-12 text-base font-medium border-2 hover:bg-blue-50 hover:border-blue-300">
                          Facebook
                        </Button>
                        <Button variant="outline" className="h-12 text-base font-medium border-2 hover:bg-sky-50 hover:border-sky-300">
                          Twitter
                        </Button>
                        <Button variant="outline" className="h-12 text-base font-medium border-2 hover:bg-gray-50 hover:border-gray-400">
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


        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
