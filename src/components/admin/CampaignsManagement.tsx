'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  MoreHorizontal, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  images: string[];
  goalAmount: number;
  currentAmount: number;
  currency: string;
  type: 'DONATION' | 'CROWDFUNDING';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  location?: string;
  urgencyLevel: number;
  isVerified: boolean;
  isFeatured: boolean;
  viewCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName?: string;
    organizationName?: string;
    avatar?: string;
    userType: 'INDIVIDUAL' | 'ORGANIZATION';
  };
  category: {
    id: string;
    name: string;
    color?: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
  _count: {
    donations: number;
    comments: number;
    updates: number;
  };
}

interface CampaignsResponse {
  campaigns: Campaign[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function CampaignsManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<CampaignsResponse['pagination'] | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
      });

      const response = await fetch(`/api/admin/campaigns?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las campañas');
      }

      const data: CampaignsResponse = await response.json();
      setCampaigns(data.campaigns);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignUpdate = async (campaignId: string, updates: Partial<Campaign>) => {
    try {
      const response = await fetch('/api/admin/campaigns', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId, updates }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la campaña');
      }

      // Actualizar la lista local
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId ? { ...campaign, ...updates } : campaign
      ));

      alert('Campaña actualizada exitosamente');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const getCreatorName = (creator: Campaign['creator']) => {
    if (creator.organizationName) {
      return creator.organizationName;
    }
    return `${creator.firstName} ${creator.lastName || ''}`.trim();
  };

  const getCreatorInitials = (creator: Campaign['creator']) => {
    if (creator.organizationName) {
      return creator.organizationName.charAt(0).toUpperCase();
    }
    return `${creator.firstName.charAt(0)}${creator.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'PAUSED': return 'bg-orange-100 text-orange-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activa';
      case 'DRAFT': return 'Borrador';
      case 'COMPLETED': return 'Completada';
      case 'PAUSED': return 'Pausada';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DONATION': return 'bg-purple-100 text-purple-800';
      case 'CROWDFUNDING': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'DONATION': return 'Donación';
      case 'CROWDFUNDING': return 'Crowdfunding';
      default: return type;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 animate-pulse rounded-lg" />
        <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <Button onClick={fetchCampaigns}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar campañas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activas</SelectItem>
                <SelectItem value="DRAFT">Borrador</SelectItem>
                <SelectItem value="COMPLETED">Completadas</SelectItem>
                <SelectItem value="PAUSED">Pausadas</SelectItem>
                <SelectItem value="CANCELLED">Canceladas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                <SelectItem value="DONATION">Donación</SelectItem>
                <SelectItem value="CROWDFUNDING">Crowdfunding</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de campañas */}
      <Card>
        <CardHeader>
          <CardTitle>
            Campañas ({pagination?.totalCount || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  {/* Información principal */}
                  <div className="flex gap-4 flex-1">
                    {/* Imagen de la campaña */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {campaign.images[0] ? (
                        <img 
                          src={campaign.images[0]} 
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Target className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Detalles */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-lg truncate">{campaign.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {campaign.shortDescription || campaign.description}
                          </p>
                        </div>
                      </div>

                      {/* Creator info */}
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={campaign.creator.avatar} alt={getCreatorName(campaign.creator)} />
                          <AvatarFallback className="text-xs">
                            {getCreatorInitials(campaign.creator)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">
                          {getCreatorName(campaign.creator)}
                        </span>
                        <Badge className={getTypeColor(campaign.creator.userType)}>
                          {campaign.creator.userType === 'INDIVIDUAL' ? 'Individual' : 'Organización'}
                        </Badge>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{formatCurrency(campaign.currentAmount)}</span>
                          <span className="text-gray-500">
                            {formatCurrency(campaign.goalAmount)} objetivo
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${calculateProgress(campaign.currentAmount, campaign.goalAmount)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {calculateProgress(campaign.currentAmount, campaign.goalAmount).toFixed(1)}% completado
                        </div>
                      </div>

                      {/* Badges y stats */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getStatusColor(campaign.status)}>
                          {getStatusLabel(campaign.status)}
                        </Badge>
                        <Badge className={getTypeColor(campaign.type)}>
                          {getTypeLabel(campaign.type)}
                        </Badge>
                        <Badge variant="outline">
                          {campaign.category.name}
                        </Badge>
                        {campaign.isVerified && (
                          <Badge className="bg-green-100 text-green-800">
                            Verificada
                          </Badge>
                        )}
                        {campaign.isFeatured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Destacada
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {campaign.viewCount} vistas
                        </span>
                        <span>{campaign._count.donations} donaciones</span>
                        <span>{campaign._count.comments} comentarios</span>
                        <span>{campaign._count.updates} actualizaciones</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(campaign.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {campaign.status === 'ACTIVE' && (
                        <DropdownMenuItem
                          onClick={() => handleCampaignUpdate(campaign.id, { status: 'PAUSED' })}
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          Pausar
                        </DropdownMenuItem>
                      )}
                      
                      {(campaign.status === 'PAUSED' || campaign.status === 'DRAFT') && (
                        <DropdownMenuItem
                          onClick={() => handleCampaignUpdate(campaign.id, { status: 'ACTIVE' })}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Activar
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem
                        onClick={() => handleCampaignUpdate(campaign.id, { isVerified: !campaign.isVerified })}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {campaign.isVerified ? 'Desverificar' : 'Verificar'}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={() => handleCampaignUpdate(campaign.id, { isFeatured: !campaign.isFeatured })}
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        {campaign.isFeatured ? 'Quitar destacado' : 'Destacar'}
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem
                        onClick={() => handleCampaignUpdate(campaign.id, { status: 'CANCELLED' })}
                        className="text-red-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancelar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {campaigns.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No se encontraron campañas
              </div>
            )}
          </div>

          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} de {pagination.totalCount} campañas
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <span className="text-sm px-4">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNext}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
