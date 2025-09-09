'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit, Eye, Settings, Calendar, Users, DollarSign, TrendingUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Campaign {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  goalAmount: number;
  currentAmount: number;
  currency: string;
  status: string;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  donationCount?: number;
  isFeatured: boolean;
  isVerified: boolean;
  viewCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CampaignsResponse {
  campaigns: Campaign[];
  total: number;
}

export default function MyCampaignsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Verificar autenticación
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/my-campaigns');
    }
  }, [status, router]);

  // Cargar campañas del usuario
  useEffect(() => {
    const fetchMyCampaigns = async () => {
      if (status !== 'authenticated' || !session?.user?.id) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          creatorId: session.user.id,
        });

        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }

        const response = await fetch(`/api/campaigns?${params}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar tus campañas');
        }

        const data: CampaignsResponse = await response.json();
        setCampaigns(data.campaigns);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchMyCampaigns();
  }, [session, status, statusFilter]);

  // Función para cambiar estado de campaña
  const handleStatusChange = async (campaignId: string, newStatus: string) => {
    setUpdatingStatus(campaignId);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el estado');
      }

      // Actualizar la campaña en el estado local
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: newStatus }
            : campaign
        )
      );
    } catch (error) {
      console.error('Error updating campaign status:', error);
      alert(error instanceof Error ? error.message : 'Error al actualizar el estado');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Función para formatear números
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Función para calcular porcentaje de progreso
  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calcular estadísticas
  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'ACTIVE').length,
    totalRaised: campaigns.reduce((sum, c) => sum + c.currentAmount, 0),
    totalGoal: campaigns.reduce((sum, c) => sum + c.goalAmount, 0),
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      {/* Header */}
      <div className="bg-white border-b border-purple-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mis Campañas
              </h1>
              <p className="text-gray-600">
                Gestiona tus campañas, revisa su progreso y actualiza su información.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border-purple-200 focus:border-purple-500">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las campañas</SelectItem>
                  <SelectItem value="DRAFT">Borradores</SelectItem>
                  <SelectItem value="ACTIVE">Activas</SelectItem>
                  <SelectItem value="PAUSED">Pausadas</SelectItem>
                  <SelectItem value="COMPLETED">Completadas</SelectItem>
                  <SelectItem value="CANCELLED">Canceladas</SelectItem>
                </SelectContent>
              </Select>
              <Link href="/campaigns/create">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Campaña
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Campañas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Activas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recaudado</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRaised)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Progreso Global</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalGoal > 0 ? Math.round((stats.totalRaised / stats.totalGoal) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-lg" />
                <CardContent className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-2 bg-gray-200 rounded w-full" />
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-20" />
                    <div className="h-8 bg-gray-200 rounded w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Estado de error */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 font-medium">Error al cargar tus campañas</p>
              <p className="text-red-500 text-sm mt-2">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white"
              >
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {!loading && !error && campaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 max-w-md mx-auto">
              <Plus className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes campañas aún
              </h3>
              <p className="text-gray-600 mb-6">
                Crea tu primera campaña para comenzar a recaudar fondos para tu causa.
              </p>
              <Link href="/campaigns/create">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Campaña
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Grid de campañas */}
        {!loading && !error && campaigns.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const progressPercentage = getProgressPercentage(
                campaign.currentAmount,
                campaign.goalAmount
              );

              return (
                <Card key={campaign.id} className="bg-white border-purple-100 hover:shadow-lg transition-shadow">
                  {/* Imagen */}
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    {campaign.images.length > 0 ? (
                      <Image
                        src={campaign.images[0]}
                        alt={campaign.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                        <Settings className="h-12 w-12 text-purple-300" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {campaign.isFeatured && (
                        <Badge className="bg-yellow-500 text-white">
                          Destacada
                        </Badge>
                      )}
                      {campaign.isVerified && (
                        <Badge className="bg-blue-500 text-white">
                          Verificada
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Título y estado */}
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                          {campaign.title}
                        </h3>
                        <Select
                          value={campaign.status}
                          onValueChange={(value) => handleStatusChange(campaign.id, value)}
                          disabled={updatingStatus === campaign.id}
                        >
                          <SelectTrigger className="w-32 ml-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DRAFT">Borrador</SelectItem>
                            <SelectItem value="ACTIVE">Activa</SelectItem>
                            <SelectItem value="PAUSED">Pausada</SelectItem>
                            <SelectItem value="COMPLETED">Completada</SelectItem>
                            <SelectItem value="CANCELLED">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Descripción */}
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {campaign.shortDescription}
                      </p>

                      {/* Progreso */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-purple-700">
                            {formatCurrency(campaign.currentAmount)}
                          </span>
                          <span className="text-gray-500">
                            {progressPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-violet-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          Objetivo: {formatCurrency(campaign.goalAmount)}
                        </div>
                      </div>

                      {/* Estadísticas */}
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 pt-2 border-t border-purple-50">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{campaign.donationCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{campaign.viewCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(campaign.createdAt)}</span>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="space-y-2 pt-2">
                        <div className="flex gap-2">
                          <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
                          <Link href={`/my-campaigns/edit/${campaign.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                          </Link>
                        </div>
                        <Link href={`/my-campaigns/${campaign.id}/updates/create`} className="block">
                          <Button 
                            size="sm" 
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={campaign.status === 'CANCELLED' || campaign.status === 'DRAFT'}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Nueva Actualización
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

