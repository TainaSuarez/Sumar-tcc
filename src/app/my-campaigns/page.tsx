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
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-white via-purple-50/30 to-violet-50/30 border-b border-purple-100/50 shadow-sm backdrop-blur-sm mt-8">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-violet-700 bg-clip-text text-transparent">
                  Mis Campañas
                </h1>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                Gestiona tus campañas, revisa su progreso y actualiza su información desde un solo lugar.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              <Link href="/campaigns/create">
                <Button className="w-full sm:w-auto h-11 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6">
                  <Plus className="w-5 h-5 mr-2" />
                  Nueva Campaña
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda avanzados */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 py-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Barra de búsqueda */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar campañas por nombre o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 border-gray-200 focus:border-purple-500 bg-white shadow-sm"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filtro por estado */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 h-10 border-gray-200 focus:border-purple-500 bg-white shadow-sm">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📋 Todas las campañas</SelectItem>
                  <SelectItem value="DRAFT">📝 Borradores</SelectItem>
                  <SelectItem value="ACTIVE">🚀 Activas</SelectItem>
                  <SelectItem value="PAUSED">⏸️ Pausadas</SelectItem>
                  <SelectItem value="COMPLETED">✅ Completadas</SelectItem>
                  <SelectItem value="CANCELLED">❌ Canceladas</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Ordenar por */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48 h-10 border-gray-200 focus:border-purple-500 bg-white shadow-sm">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">🕒 Más recientes</SelectItem>
                  <SelectItem value="oldest">📅 Más antiguas</SelectItem>
                  <SelectItem value="progress">📊 Mayor progreso</SelectItem>
                  <SelectItem value="alphabetical">🔤 Alfabético</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">Total Campañas</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-xl">
                  <Settings className="h-7 w-7 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 mb-1">Activas</p>
                  <p className="text-3xl font-bold text-emerald-900">{stats.active}</p>
                </div>
                <div className="p-3 bg-emerald-200 rounded-xl">
                  <TrendingUp className="h-7 w-7 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">Recaudado</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalRaised)}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-xl">
                  <DollarSign className="h-7 w-7 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 mb-1">Progreso Global</p>
                  <p className="text-3xl font-bold text-amber-900">
                    {stats.totalGoal > 0 ? Math.round((stats.totalRaised / stats.totalGoal) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-amber-200 rounded-xl">
                  <Users className="h-7 w-7 text-amber-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">Cargando tus campañas</h3>
                <p className="text-gray-600">Estamos preparando toda la información...</p>
                <div className="flex justify-center space-x-1 mt-4">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            </div>
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

        {/* Grid de campañas */}
        {!loading && !error && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
            {campaigns
              .filter(campaign => {
                // Filtro por estado
                const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
                
                // Filtro por búsqueda
                const matchesSearch = searchQuery === '' || 
                  campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  campaign.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
                
                return matchesStatus && matchesSearch;
              })
              .sort((a, b) => {
                switch (sortBy) {
                  case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                  case 'progress':
                    return getProgressPercentage(b.currentAmount, b.goalAmount) - getProgressPercentage(a.currentAmount, a.goalAmount);
                  case 'alphabetical':
                    return a.title.localeCompare(b.title);
                  default:
                    return 0;
                }
              })
              .map((campaign) => {
              const progressPercentage = getProgressPercentage(
                campaign.currentAmount,
                campaign.goalAmount
              );

              return (
                <Card key={campaign.id} className="bg-white border-purple-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                  {/* Imagen */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {campaign.images.length > 0 ? (
                      <Image
                        src={campaign.images[0]}
                        alt={campaign.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 via-violet-100 to-purple-200 flex items-center justify-center">
                        <Settings className="h-16 w-16 text-purple-400" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {campaign.isFeatured && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
                          ⭐ Destacada
                        </Badge>
                      )}
                      {campaign.isVerified && (
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
                          ✓ Verificada
                        </Badge>
                      )}
                    </div>
                    
                    {/* Estado overlay */}
                    <div className="absolute top-4 right-4">
                      <Badge 
                        className={`shadow-lg ${
                          campaign.status === 'ACTIVE' ? 'bg-green-500' :
                          campaign.status === 'PAUSED' ? 'bg-yellow-500' :
                          campaign.status === 'COMPLETED' ? 'bg-blue-500' :
                          campaign.status === 'CANCELLED' ? 'bg-red-500' :
                          'bg-gray-500'
                        } text-white`}
                      >
                        {campaign.status === 'ACTIVE' ? 'Activa' :
                         campaign.status === 'PAUSED' ? 'Pausada' :
                         campaign.status === 'COMPLETED' ? 'Completada' :
                         campaign.status === 'CANCELLED' ? 'Cancelada' :
                         'Borrador'}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-5">
                      {/* Título y categoría */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1 leading-tight">
                            {campaign.title}
                          </h3>
                          <Select
                            value={campaign.status}
                            onValueChange={(value) => handleStatusChange(campaign.id, value)}
                            disabled={updatingStatus === campaign.id}
                          >
                            <SelectTrigger className="w-28 h-8 text-xs border-purple-200">
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
                        <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
                          {campaign.category.name}
                        </Badge>
                      </div>

                      {/* Descripción */}
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {campaign.shortDescription}
                      </p>

                      {/* Progreso mejorado */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-2xl font-bold text-purple-700">
                              {formatCurrency(campaign.currentAmount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              de {formatCurrency(campaign.goalAmount)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-violet-100 rounded-full">
                                <span className="text-purple-700 font-bold text-sm">
                                  {progressPercentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">completado</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 via-purple-600 to-violet-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                            </div>
                          </div>
                          {progressPercentage >= 100 && (
                            <div className="absolute -top-1 -right-1">
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                                <span className="text-white text-xs font-bold">✓</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Estadísticas mejoradas */}
                      <div className="grid grid-cols-3 gap-4 py-3 border-t border-purple-50">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                            <Users className="h-4 w-4" />
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{campaign.donationCount || 0}</p>
                          <p className="text-xs text-gray-500">donantes</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                            <Eye className="h-4 w-4" />
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{campaign.viewCount}</p>
                          <p className="text-xs text-gray-500">vistas</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{formatDate(campaign.createdAt).split(' ')[0]}</p>
                          <p className="text-xs text-gray-500">{formatDate(campaign.createdAt).split(' ').slice(1).join(' ')}</p>
                        </div>
                      </div>

                      {/* Acciones mejoradas */}
                      <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Link href={`/campaigns/${campaign.id}`}>
                            <Button variant="outline" size="sm" className="w-full h-9 border-purple-200 text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalles
                            </Button>
                          </Link>
                          <Link href={`/my-campaigns/edit/${campaign.id}`}>
                            <Button variant="outline" size="sm" className="w-full h-9 border-blue-200 text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md">
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                          </Link>
                        </div>
                        
                        {/* Botón de estado dinámico */}
                        <div className="flex gap-2">
                          {campaign.status === 'ACTIVE' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(campaign.id, 'PAUSED')}
                              disabled={updatingStatus === campaign.id}
                              className="flex-1 h-9 border-orange-200 text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus === campaign.id ? (
                                <>
                                  <div className="w-3 h-3 border border-orange-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Pausando...
                                </>
                              ) : (
                                <>
                                  ⏸️
                                  <span className="ml-2">Pausar</span>
                                </>
                              )}
                            </Button>
                          )}
                          
                          {campaign.status === 'PAUSED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(campaign.id, 'ACTIVE')}
                              disabled={updatingStatus === campaign.id}
                              className="flex-1 h-9 border-green-200 text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus === campaign.id ? (
                                <>
                                  <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Activando...
                                </>
                              ) : (
                                <>
                                  ▶️
                                  <span className="ml-2">Activar</span>
                                </>
                              )}
                            </Button>
                          )}
                          
                          {campaign.status === 'DRAFT' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(campaign.id, 'ACTIVE')}
                              disabled={updatingStatus === campaign.id}
                              className="flex-1 h-9 border-green-200 text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus === campaign.id ? (
                                <>
                                  <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Publicando...
                                </>
                              ) : (
                                <>
                                  🚀
                                  <span className="ml-2">Publicar</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        
                        <Link href={`/my-campaigns/${campaign.id}/updates/create`}>
                          <Button 
                            size="sm" 
                            className="w-full h-9 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={campaign.status === 'CANCELLED' || campaign.status === 'DRAFT'}
                          >
                            <FileText className="w-4 h-4 mr-2" />
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

