'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit, Eye, MapPin, Calendar, Users, TrendingUp, Pause, Play, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  images: string[];
  goalAmount: number;
  currentAmount: number;
  currency: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  location: string;
  endDate: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  _count: {
    donations: number;
  };
}

interface CampaignsResponse {
  campaigns: Campaign[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function UserCampaigns() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<CampaignsResponse['pagination'] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (session?.user) {
      fetchCampaigns();
    }
  }, [session, currentPage, statusFilter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '6',
        creator: session?.user?.id || '',
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/campaigns?${params}`);
      if (response.ok) {
        const data: CampaignsResponse = await response.json();
        setCampaigns(data.campaigns);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error al cargar campañas:', error);
      toast.error('Error al cargar las campañas');
    } finally {
      setLoading(false);
    }
  };

  const updateCampaignStatus = async (campaignId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Estado de la campaña actualizado');
        fetchCampaigns();
      } else {
        toast.error('Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta campaña? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Campaña eliminada correctamente');
        fetchCampaigns();
      } else {
        toast.error('Error al eliminar la campaña');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Error al eliminar la campaña');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
    }).format(amount);
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Borrador', variant: 'secondary' as const },
      ACTIVE: { label: 'Activa', variant: 'default' as const },
      PAUSED: { label: 'Pausada', variant: 'outline' as const },
      COMPLETED: { label: 'Completada', variant: 'default' as const },
      CANCELLED: { label: 'Cancelada', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-UY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros y botón crear */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            Todas
          </Button>
          <Button
            variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ACTIVE')}
          >
            Activas
          </Button>
          <Button
            variant={statusFilter === 'DRAFT' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('DRAFT')}
          >
            Borradores
          </Button>
          <Button
            variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('COMPLETED')}
          >
            Completadas
          </Button>
        </div>
        
        <Link href="/campaigns/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva Campaña
          </Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter === 'all' ? 'No tienes campañas aún' : `No tienes campañas ${statusFilter.toLowerCase()}`}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Crea tu primera campaña y comienza a recaudar fondos para tu causa.
            </p>
            <Link href="/campaigns/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Crear Campaña
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const progress = getProgressPercentage(campaign.currentAmount, campaign.goalAmount);
            
            return (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="h-48 relative overflow-hidden">
                    {campaign.images && campaign.images.length > 0 ? (
                      <Image
                        src={campaign.images[0]}
                        alt={campaign.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <TrendingUp className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge 
                      style={{ backgroundColor: campaign.category.color }}
                    >
                      {campaign.category.name}
                    </Badge>
                    {getStatusBadge(campaign.status)}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                      >
                        •••
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/campaigns/${campaign.slug}`} className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Ver campaña
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/campaigns/${campaign.id}/edit`} className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      {campaign.status === 'ACTIVE' && (
                        <DropdownMenuItem
                          onClick={() => updateCampaignStatus(campaign.id, 'PAUSED')}
                          className="flex items-center gap-2"
                        >
                          <Pause className="w-4 h-4" />
                          Pausar
                        </DropdownMenuItem>
                      )}
                      {campaign.status === 'PAUSED' && (
                        <DropdownMenuItem
                          onClick={() => updateCampaignStatus(campaign.id, 'ACTIVE')}
                          className="flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Reactivar
                        </DropdownMenuItem>
                      )}
                      {campaign.status === 'DRAFT' && (
                        <DropdownMenuItem
                          onClick={() => deleteCampaign(campaign.id)}
                          className="flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                        {campaign.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {campaign.shortDescription}
                      </p>
                    </div>

                    {campaign.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{campaign.location}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-green-600">
                          {formatCurrency(campaign.currentAmount)}
                        </span>
                        <span className="text-gray-500">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Meta: {formatCurrency(campaign.goalAmount)}</span>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{campaign._count.donations}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Creada el {formatDate(campaign.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!pagination.hasPrevPage}
          >
            Anterior
          </Button>
          
          <span className="text-sm text-gray-600">
            Página {pagination.currentPage} de {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!pagination.hasNextPage}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}