'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  User, 
  Camera, 
  Edit3, 
  Heart, 
  TrendingUp, 
  DollarSign, 
  Target,
  Users,
  Award,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { FavoriteCampaigns } from '@/components/profile/FavoriteCampaigns';
import { UserCampaigns } from '@/components/profile/UserCampaigns';

interface UserStats {
  fundraising: {
    totalRaised: number;
    totalGoal: number;
    totalCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    totalDonationsReceived: number;
    topCampaigns: Array<{
      id: string;
      title: string;
      raised: number;
      goal: number;
      progress: number;
      donationsCount: number;
    }>;
  };
  donations: {
    totalDonated: number;
    totalDonationsMade: number;
    uniqueCampaignsSupported: number;
  };
  general: {
    favoritesCount: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchUserStats();
    }
  }, [status, router]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('es-UY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header del Perfil */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.firstName || user.name || 'Usuario'}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <User className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-20 pb-6 px-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.organizationName || `${user.firstName || user.name || 'Usuario'} ${user.lastName || ''}`}
                </h1>
                {user.organizationName && (
                  <p className="text-lg text-gray-600 mt-1">
                    {user.firstName || user.name || 'Usuario'} {user.lastName || ''}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Miembro desde {formatDate(user.createdAt || new Date().toISOString())}
                  </Badge>
                  {user.userType === 'ORGANIZATION' && (
                    <Badge variant="outline">Organización</Badge>
                  )}
                  {user.isVerified && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Award className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                {user.bio && (
                  <p className="text-gray-700 mt-4 max-w-2xl">{user.bio}</p>
                )}
              </div>
              
              <Button
                onClick={() => setIsEditModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Editar Perfil
              </Button>
            </div>
          </div>
        </div>

        {/* Estadísticas Principales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.fundraising.totalRaised)}
                </div>
                <p className="text-xs text-muted-foreground">
                  de {formatCurrency(stats.fundraising.totalGoal)} objetivo total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donado</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.donations.totalDonated)}
                </div>
                <p className="text-xs text-muted-foreground">
                  en {stats.donations.totalDonationsMade} donaciones
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campañas Creadas</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.fundraising.totalCampaigns}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.fundraising.activeCampaigns} activas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
                <Heart className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.general.favoritesCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  campañas guardadas
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs de Contenido */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="campaigns">Mis Campañas</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {stats && stats.fundraising.topCampaigns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Campañas Más Exitosas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.fundraising.topCampaigns.map((campaign, index) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{campaign.title}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>{formatCurrency(campaign.raised)} recaudado</span>
                            <span>{campaign.donationsCount} donaciones</span>
                            <span>{campaign.progress.toFixed(1)}% completado</span>
                          </div>
                        </div>
                        <Badge variant={index === 0 ? 'default' : 'secondary'}>
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="campaigns">
            <UserCampaigns />
          </TabsContent>

          <TabsContent value="favorites">
            <FavoriteCampaigns />
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Próximamente: historial de actividad detallado</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Edición */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUpdate={() => {
          console.log('🔄 Profile update callback triggered');
          // Actualizar los stats después de la actualización del perfil
          fetchUserStats();
        }}
      />
    </div>
  );
}