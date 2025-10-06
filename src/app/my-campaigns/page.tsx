'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit, Eye, Settings, Calendar, Users, DollarSign, TrendingUp, FileText, Search, Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/layout/navbar';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
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

  // Funciones para el estado de las campañas
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '🚀';
      case 'DRAFT':
        return '📝';
      case 'PAUSED':
        return '⏸️';
      case 'COMPLETED':
        return '✅';
      case 'CANCELLED':
        return '❌';
      default:
        return '📋';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activa';
      case 'DRAFT':
        return 'Borrador';
      case 'PAUSED':
        return 'Pausada';
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  // Filtrar y ordenar campañas
  const filteredCampaigns = campaigns
    .filter(campaign => {
      // Filtro por búsqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          campaign.title.toLowerCase().includes(query) ||
          campaign.shortDescription.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'progress':
          const progressA = (a.currentAmount / a.goalAmount) * 100;
          const progressB = (b.currentAmount / b.goalAmount) * 100;
          return progressB - progressA;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-violet-50/50">
      <Navbar />
      
      {/* Header mejorado */}
      <div className="bg-gradient-to-r from-white/95 via-purple-50/40 to-violet-50/40 border-b border-purple-100/60 shadow-sm backdrop-blur-md mt-8">
        <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg">
                    <Settings className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-700 via-violet-700 to-purple-800 bg-clip-text text-transparent">
                    Mis Campañas
                  </h1>
                  <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mt-2"></div>
                </div>
              </div>
              <p className="text-gray-600 text-xl leading-relaxed max-w-3xl font-light">
                Gestiona tus campañas, revisa su progreso y actualiza su información desde un panel de control profesional.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 lg:flex-shrink-0">
              <Link href="/campaigns/create">
                <Button className="w-full sm:w-auto h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 text-lg font-semibold rounded-xl">
                  <Plus className="w-6 h-6 mr-3" />
                  Nueva Campaña
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda mejorados */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-100/80 sticky top-0 z-20 shadow-sm">
        <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Barra de búsqueda mejorada */}
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar campañas por nombre o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white shadow-sm rounded-xl text-base"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filtro por estado mejorado */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-56 h-12 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white shadow-sm rounded-xl">
                  <Filter className="w-5 h-5 mr-3 text-purple-500" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-gray-100">
                  <SelectItem value="all" className="text-base py-3">📋 Todas las campañas</SelectItem>
                  <SelectItem value="DRAFT" className="text-base py-3">📝 Borradores</SelectItem>
                  <SelectItem value="ACTIVE" className="text-base py-3">🚀 Activas</SelectItem>
                  <SelectItem value="PAUSED" className="text-base py-3">⏸️ Pausadas</SelectItem>
                  <SelectItem value="COMPLETED" className="text-base py-3">✅ Completadas</SelectItem>
                  <SelectItem value="CANCELLED" className="text-base py-3">❌ Canceladas</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Ordenar por mejorado */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-56 h-12 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white shadow-sm rounded-xl">
                  <SortAsc className="w-5 h-5 mr-3 text-purple-500" />
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-gray-100">
                  <SelectItem value="newest" className="text-base py-3">🕒 Más recientes</SelectItem>
                  <SelectItem value="oldest" className="text-base py-3">📅 Más antiguas</SelectItem>
                  <SelectItem value="progress" className="text-base py-3">📊 Mayor progreso</SelectItem>
                  <SelectItem value="alphabetical" className="text-base py-3">🔤 Alfabético</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-10">
        {/* Estadísticas mejoradas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/80 border-purple-200/60 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-700 mb-2 uppercase tracking-wide">Total Campañas</p>
                  <p className="text-4xl font-bold text-purple-900">{stats.total}</p>
                  <p className="text-xs text-purple-600 mt-1">campañas creadas</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                  <Settings className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/80 border-emerald-200/60 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-700 mb-2 uppercase tracking-wide">Activas</p>
                  <p className="text-4xl font-bold text-emerald-900">{stats.active}</p>
                  <p className="text-xs text-emerald-600 mt-1">en funcionamiento</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/80 border-blue-200/60 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Recaudado</p>
                  <p className="text-3xl font-bold text-blue-900">{formatCurrency(stats.totalRaised)}</p>
                  <p className="text-xs text-blue-600 mt-1">total recaudado</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/80 border-amber-200/60 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-700 mb-2 uppercase tracking-wide">Progreso Global</p>
                  <p className="text-4xl font-bold text-amber-900">
                    {stats.totalGoal > 0 ? Math.round((stats.totalRaised / stats.totalGoal) * 100) : 0}%
                  </p>
                  <p className="text-xs text-amber-600 mt-1">completado</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Estado de error */}
        {error && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center max-w-md mx-auto">
              <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-2xl">⚠️</span>
                </div>
                <h3 className="text-xl font-bold text-red-800 mb-3">
                  ❌ Error al cargar
                </h3>
                <p className="text-red-700 mb-6 leading-relaxed">{error}</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-11"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Intentar de nuevo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {!loading && !error && campaigns.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center max-w-lg mx-auto">
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-2xl p-10 shadow-lg">
                <div className="relative mb-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center">
                    <Plus className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-white text-sm">✨</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  🚀 ¡Comienza tu primera campaña!
                </h3>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Crea tu primera campaña y comienza a recaudar fondos para hacer realidad tus proyectos.
                </p>
                
                <Link href="/campaigns/create">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-lg">
                    <Plus className="w-5 h-5 mr-3" />
                    Crear Primera Campaña
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Lista de campañas */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-white/80 backdrop-blur-sm border-gray-200/60 shadow-lg rounded-2xl overflow-hidden">
                <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-300 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="flex justify-between items-center pt-4">
                      <div className="h-8 bg-gray-300 rounded-lg w-24"></div>
                      <div className="h-10 bg-gray-300 rounded-xl w-32"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="p-8 bg-gradient-to-br from-purple-100 to-violet-100 rounded-3xl shadow-xl">
                <Search className="h-20 w-20 text-purple-400 mx-auto mb-6" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce"></div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4 mt-8">
              {searchQuery || statusFilter !== 'all' ? 'No se encontraron campañas' : 'Aún no tienes campañas'}
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              {searchQuery || statusFilter !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda para encontrar lo que buscas.'
                : 'Comienza creando tu primera campaña y empieza a recaudar fondos para tu causa.'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link href="/campaigns/create">
                <Button className="h-14 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-10 text-lg font-semibold rounded-2xl">
                  <Plus className="w-6 h-6 mr-3" />
                  Crear Mi Primera Campaña
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="group bg-white/95 backdrop-blur-md border-gray-200/60 hover:border-purple-300/80 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 rounded-2xl overflow-hidden">
                {/* Imagen de la campaña mejorada */}
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-violet-600/20 z-10"></div>
                  {campaign.images && campaign.images.length > 0 ? (
                    <img
                      src={campaign.images[0]}
                      alt={campaign.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 via-purple-50 to-violet-100 flex items-center justify-center transition-all duration-700 group-hover:from-purple-200 group-hover:to-violet-200">
                      <FileText className="h-16 w-16 text-purple-400 group-hover:text-purple-600 transition-colors duration-300" />
                    </div>
                  )}
                  
                  {/* Badge de estado mejorado */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-md border ${getStatusColor(campaign.status)} transition-all duration-300 group-hover:scale-105`}>
                      {getStatusIcon(campaign.status)} {getStatusText(campaign.status)}
                    </span>
                  </div>

                  {/* Indicador de progreso visual */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20 z-20">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Título y descripción mejorados */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors duration-300 line-clamp-2 leading-tight">
                        {campaign.title}
                      </h3>
                      <p className="text-gray-600 text-base line-clamp-3 leading-relaxed">
                        {campaign.shortDescription}
                      </p>
                    </div>

                    {/* Progreso mejorado */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Progreso</span>
                        <span className="text-lg font-bold text-purple-900">
                          {Math.round((campaign.currentAmount / campaign.goalAmount) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-violet-600 h-3 rounded-full shadow-lg transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{ width: `${Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-purple-900 text-lg">
                          {formatCurrency(campaign.currentAmount)}
                        </span>
                        <span className="text-gray-600">
                          de {formatCurrency(campaign.goalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Información adicional mejorada */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">Creada</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(campaign.createdAt).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                          <Users className="h-4 w-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">Donantes</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          {campaign.donationCount || 0}
                        </p>
                      </div>
                    </div>

                    {/* Botones de acción mejorados */}
                    <div className="flex gap-3 pt-6">
                      <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                        <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold">
                          <Eye className="w-5 h-5 mr-2" />
                          Ver Detalles
                        </Button>
                      </Link>
                      <Link href={`/campaigns/${campaign.id}/edit`}>
                        <Button variant="outline" className="h-12 px-6 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 hover:text-purple-800 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl font-semibold">
                          <Edit className="w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

