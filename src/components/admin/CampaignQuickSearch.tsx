'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Eye,
  Edit,
  Loader2,
  ExternalLink,
  Calendar,
  User
} from 'lucide-react';
import Link from 'next/link';

interface Campaign {
  id: string;
  title: string;
  slug: string;
  status: string;
  type: string;
  isVerified: boolean;
  isFeatured: boolean;
  goalAmount: number;
  currentAmount: number;
  createdAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
  };
  category: {
    id: string;
    name: string;
    color?: string;
  };
  _count: {
    donations: number;
  };
}

interface Category {
  id: string;
  name: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800';
    case 'DRAFT': return 'bg-gray-100 text-gray-800';
    case 'COMPLETED': return 'bg-blue-100 text-blue-800';
    case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
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

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'DONATION': return 'Donación';
    case 'CROWDFUNDING': return 'Crowdfunding';
    default: return type;
  }
};

export function CampaignQuickSearch() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchCampaigns = useCallback(async () => {
    if (!searchTerm && statusFilter === 'all' && typeFilter === 'all' && categoryFilter === 'all') {
      setCampaigns([]);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
      });

      const response = await fetch(`/api/admin/campaigns?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al buscar campañas');
      }

      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      console.error('Error searching campaigns:', err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, typeFilter, categoryFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCampaigns();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [fetchCampaigns]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setCategoryFilter('all');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgress = (current: number, goal: number) => {
    return goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Búsqueda Rápida de Campañas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título, descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activas</SelectItem>
                <SelectItem value="DRAFT">Borrador</SelectItem>
                <SelectItem value="COMPLETED">Completadas</SelectItem>
                <SelectItem value="PAUSED">Pausadas</SelectItem>
                <SelectItem value="CANCELLED">Canceladas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="DONATION">Donación</SelectItem>
                <SelectItem value="CROWDFUNDING">Crowdfunding</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {campaigns.length === 0 && !loading && (searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || categoryFilter !== 'all') && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron campañas con los criterios de búsqueda.</p>
          </CardContent>
        </Card>
      )}

      {campaigns.length === 0 && !loading && searchTerm === '' && statusFilter === 'all' && typeFilter === 'all' && categoryFilter === 'all' && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Utiliza los filtros de arriba para buscar campañas.</p>
          </CardContent>
        </Card>
      )}

      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate" title={campaign.title}>
                        {campaign.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
                          {getStatusLabel(campaign.status)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(campaign.type)}
                        </Badge>
                        {campaign.isVerified && (
                          <Badge className="text-xs bg-blue-100 text-blue-800">
                            Verificada
                          </Badge>
                        )}
                        {campaign.isFeatured && (
                          <Badge className="text-xs bg-purple-100 text-purple-800">
                            Destacada
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{formatCurrency(campaign.currentAmount)}</span>
                      <span>{formatCurrency(campaign.goalAmount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgress(campaign.currentAmount, campaign.goalAmount)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{getProgress(campaign.currentAmount, campaign.goalAmount).toFixed(1)}% completado</span>
                      <span>{campaign._count.donations} donaciones</span>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="truncate">
                        {campaign.creator.organizationName || 
                         `${campaign.creator.firstName} ${campaign.creator.lastName || ''}`.trim()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(campaign.createdAt)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      📁 {campaign.category.name}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/campaigns/${campaign.slug}`} target="_blank">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {campaigns.length >= 20 && (
        <Card>
          <CardContent className="py-4 text-center text-sm text-gray-500">
            Se muestran los primeros 20 resultados. Refina tu búsqueda para ver resultados más específicos.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
