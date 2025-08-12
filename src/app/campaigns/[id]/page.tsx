import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CampaignService } from '@/lib/services/campaignService';
import { CampaignStatusLabels, CampaignStatusColors } from '@/types/campaign';
import { UpdatesTimeline } from '@/components/features/campaigns/UpdatesTimeline';
import { authOptions } from '@/lib/auth';

interface CampaignDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const resolvedParams = await params;
  const campaign = await CampaignService.getById(resolvedParams.id);

  if (!campaign) {
    notFound();
  }

  // Verificar si el usuario actual es el propietario de la campaña
  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.id === campaign.creator.id;

  const progressPercentage = Math.min(
    (Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100,
    100
  );

  const creatorName = campaign.creator.organizationName || 
    `${campaign.creator.firstName} ${campaign.creator.lastName || ''}`.trim();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Imagen de portada */}
            {campaign.images.length > 0 && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                <Image
                  src={campaign.images[0]}
                  alt={campaign.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Información principal */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-bold text-gray-900">
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
                <div className="flex items-center text-sm text-gray-600">
                  <span>por {creatorName}</span>
                  <span className="mx-2">•</span>
                  <span>en {campaign.category.name}</span>
                </div>
              </CardHeader>
              <CardContent>
                {campaign.shortDescription && (
                  <p className="text-lg text-gray-700 mb-6">
                    {campaign.shortDescription}
                  </p>
                )}
                
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">Descripción del proyecto</h3>
                  <div className="whitespace-pre-wrap text-gray-700">
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
                      <span className="text-2xl font-bold text-gray-900">
                        €{Number(campaign.currentAmount).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      de €{Number(campaign.goalAmount).toLocaleString()} objetivo
                    </p>
                  </div>

                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">0</div>
                      <div className="text-sm text-gray-600">Donantes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.ceil((new Date().getTime() - campaign.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <div className="text-sm text-gray-600">Días activa</div>
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
                    <p className="text-sm text-gray-600 mb-2">Compartir esta campaña:</p>
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
                <CardTitle className="text-lg">Creado por</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-semibold text-lg">
                      {creatorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{creatorName}</p>
                    <p className="text-sm text-gray-600">
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
            campaignId={resolvedParams.id}
            isOwner={isOwner}
            showPrivate={isOwner}
          />
        </div>
      </div>
    </div>
  );
}
