'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  TrendingUp,
  Download,
  Users,
  SortAsc,
  SortDesc,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignEditModal } from './CampaignEditModal';

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
  categoryId: string;
  subcategoryId?: string;
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

interface CampaignWithDetails extends Campaign {
  stats?: {
    donations: { total: number; completed: number; totalAmount: number };
    comments: number;
    updates: number;
  };
  analytics?: {
    monthlyDonations: Array<{ month: string; count: number; total: number }>;
    topDonors: Array<{ id: string; name: string; totalDonated: number; donationCount: number }>;
  };
}

export function CampaignsManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null); // ID de campaña siendo actualizada
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [minAmountFilter, setMinAmountFilter] = useState('');
  const [maxAmountFilter, setMaxAmountFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<CampaignsResponse['pagination'] | null>(null);
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithDetails | null>(null);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<{ action: () => void, title: string, message: string } | null>(null);


  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter && typeFilter !== 'all' && { type: typeFilter }),
        ...(verifiedFilter && verifiedFilter !== 'all' && { isVerified: verifiedFilter }),
        ...(featuredFilter && featuredFilter !== 'all' && { isFeatured: featuredFilter }),
        ...(categoryFilter && categoryFilter !== 'all' && { category: categoryFilter }),
        ...(urgencyFilter && urgencyFilter !== 'all' && { urgencyLevel: urgencyFilter }),
        ...(dateFromFilter && { dateFrom: dateFromFilter }),
        ...(dateToFilter && { dateTo: dateToFilter }),
        ...(minAmountFilter && { minAmount: minAmountFilter }),
        ...(maxAmountFilter && { maxAmount: maxAmountFilter }),
        sortBy,
        sortOrder,
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
  }, [currentPage, searchTerm, statusFilter, typeFilter, verifiedFilter, featuredFilter, categoryFilter, urgencyFilter, dateFromFilter, dateToFilter, minAmountFilter, maxAmountFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    // Cargar categorías
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

  const handleCampaignUpdate = async (campaignId: string, updates: Partial<Campaign>) => {
    try {
      setUpdating(campaignId);
      
      const response = await fetch('/api/admin/campaigns', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId, updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la campaña');
      }

      const result = await response.json();

      // Actualizar la lista local con los datos completos del servidor
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId ? { ...campaign, ...updates } : campaign
      ));

      // Refrescar la lista para asegurar consistencia
      await fetchCampaigns();

      // La acción se completó exitosamente, no necesitamos mostrar alert
      console.log('Campaña actualizada exitosamente:', updates);
    } catch (err) {
      console.error('Error actualizando campaña:', err);
      // Error logged to console, no need for alert
    } finally {
      setUpdating(null);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCampaigns.size === 0) {
      alert('Selecciona al menos una campaña');
      return;
    }

    const campaignIds = Array.from(selectedCampaigns);
    
    try {
      const response = await fetch('/api/admin/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, campaignIds }),
      });

      if (!response.ok) {
        throw new Error('Error al ejecutar la acción masiva');
      }

      const result = await response.json();
      
      // Recargar campañas
      await fetchCampaigns();
      
      // Limpiar selección
      setSelectedCampaigns(new Set());
      
      alert(`Acción ejecutada exitosamente en ${result.affectedRows} campañas`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleSelectAll = () => {
    if (selectedCampaigns.size === campaigns.length) {
      setSelectedCampaigns(new Set());
    } else {
      setSelectedCampaigns(new Set(campaigns.map(campaign => campaign.id)));
    }
  };

  const handleSelectCampaign = (campaignId: string) => {
    const newSelection = new Set(selectedCampaigns);
    if (newSelection.has(campaignId)) {
      newSelection.delete(campaignId);
    } else {
      newSelection.add(campaignId);
    }
    setSelectedCampaigns(newSelection);
  };

  const handleViewCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`);
      if (!response.ok) {
        throw new Error('Error al cargar detalles de la campaña');
      }
      const data = await response.json();
      setSelectedCampaign(data.campaign);
      setShowCampaignDetails(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowEditModal(true);
  };

  const handleSaveCampaign = async (campaignId: string, updates: Partial<Campaign>) => {
    try {
      const response = await fetch('/api/admin/campaigns', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId, updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la campaña');
      }

      const result = await response.json();

      // Actualizar la lista local
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId ? { ...campaign, ...updates } : campaign
      ));

      // Refrescar datos para asegurar consistencia
      await fetchCampaigns();
      
      // Cerrar el modal de edición
      setShowEditModal(false);
      setEditingCampaign(null);
      
      console.log('💾 Campaña guardada exitosamente');
    } catch (err) {
      console.error('Error guardando campaña:', err);
      throw new Error(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setVerifiedFilter('all');
    setFeaturedFilter('all');
    setCategoryFilter('all');
    setUrgencyFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
    setMinAmountFilter('');
    setMaxAmountFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
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
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU'
    }).format(amount);
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const handleRequestConfirmation = (action: () => void, title: string, message: string) => {
    setConfirmationAction({ action, title, message });
    setShowConfirmationModal(true);
  };

  const handleConfirm = () => {
    if (confirmationAction) {
      confirmationAction.action();
      setShowConfirmationModal(false);
      setConfirmationAction(null);
    }
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
      {/* Filtros avanzados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filtros de Búsqueda Avanzada</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
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

            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Verificación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="true">Verificadas</SelectItem>
                <SelectItem value="false">No verificadas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Destacadas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="true">Destacadas</SelectItem>
                <SelectItem value="false">No destacadas</SelectItem>
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

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Urgencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="1">Baja (1)</SelectItem>
                <SelectItem value="2">Media-Baja (2)</SelectItem>
                <SelectItem value="3">Media (3)</SelectItem>
                <SelectItem value="4">Media-Alta (4)</SelectItem>
                <SelectItem value="5">Alta (5)</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Fecha desde"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
            />

            <Input
              type="date"
              placeholder="Fecha hasta"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
            />

            <Input
              type="number"
              placeholder="Monto mínimo"
              value={minAmountFilter}
              onChange={(e) => setMinAmountFilter(e.target.value)}
            />

            <Input
              type="number"
              placeholder="Monto máximo"
              value={maxAmountFilter}
              onChange={(e) => setMaxAmountFilter(e.target.value)}
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('createdAt')}
                className="flex items-center gap-1"
              >
                <Calendar className="h-4 w-4" />
                Fecha
                {sortBy === 'createdAt' && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones masivas */}
      {selectedCampaigns.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {selectedCampaigns.size} campaña{selectedCampaigns.size !== 1 ? 's' : ''} seleccionada{selectedCampaigns.size !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('bulk_activate')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Activar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('bulk_pause')}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('bulk_verify')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verificar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('bulk_feature')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Destacar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCampaigns(new Set())}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de campañas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Campañas ({pagination?.totalCount || 0})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={campaigns.length > 0 && selectedCampaigns.size === campaigns.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-gray-600">Seleccionar todas</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  {/* Información principal */}
                  <div className="flex gap-4 flex-1">
                    <Checkbox
                      checked={selectedCampaigns.has(campaign.id)}
                      onCheckedChange={() => handleSelectCampaign(campaign.id)}
                    />
                    
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
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {campaign.shortDescription || campaign.description}
                          </div>
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
                        <Badge variant="outline">
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
                      <div className="flex items-center gap-2 flex-wrap mb-3">
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
                        <Badge variant="outline">
                          Urgencia: {campaign.urgencyLevel}
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={updating === campaign.id}
                      >
                        {updating === campaign.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={() => handleViewCampaign(campaign.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => handleEditCampaign(campaign)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {campaign.status === 'ACTIVE' && (
                        <DropdownMenuItem
                          onClick={() => {
                            handleRequestConfirmation(
                              () => handleCampaignUpdate(campaign.id, { status: 'PAUSED' }),
                              'Pausar Campaña',
                              '¿Estás seguro de que quieres pausar esta campaña? Los donantes no podrán hacer nuevas donaciones.'
                            );
                          }}
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          Pausar
                        </DropdownMenuItem>
                      )}
                      
                      {(campaign.status === 'PAUSED' || campaign.status === 'DRAFT') && (
                        <DropdownMenuItem
                          onClick={() => {
                            handleRequestConfirmation(
                              () => handleCampaignUpdate(campaign.id, { status: 'ACTIVE' }),
                              'Activar Campaña',
                              '¿Estás seguro de que quieres activar esta campaña? Los donantes podrán hacer nuevas donaciones.'
                            );
                          }}
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
                        onClick={() => {
                          if (confirm('¿Estás seguro de que quieres CANCELAR esta campaña? Esta acción es irreversible y se notificará a todos los donantes.')) {
                            handleCampaignUpdate(campaign.id, { status: 'CANCELLED' });
                          }
                        }}
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

      {/* Modal de detalles de campaña */}
      <Dialog open={showCampaignDetails} onOpenChange={setShowCampaignDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Campaña</DialogTitle>
            <DialogDescription>
              Información completa y estadísticas de la campaña
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                <TabsTrigger value="activity">Actividad</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6 mt-6">
                {/* Información básica de la campaña */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información de la Campaña</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                          {selectedCampaign.images[0] ? (
                            <img 
                              src={selectedCampaign.images[0]} 
                              alt={selectedCampaign.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Target className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{selectedCampaign.title}</h3>
                          <p className="text-gray-600">{selectedCampaign.category.name}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">Estado:</span>
                          <p>
                            <Badge className={getStatusColor(selectedCampaign.status)}>
                              {getStatusLabel(selectedCampaign.status)}
                            </Badge>
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Tipo:</span>
                          <p>
                            <Badge className={getTypeColor(selectedCampaign.type)}>
                              {getTypeLabel(selectedCampaign.type)}
                            </Badge>
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Objetivo:</span>
                          <p>{formatCurrency(selectedCampaign.goalAmount)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Recaudado:</span>
                          <p>{formatCurrency(selectedCampaign.currentAmount)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Progreso:</span>
                          <p>{calculateProgress(selectedCampaign.currentAmount, selectedCampaign.goalAmount).toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Urgencia:</span>
                          <p>Nivel {selectedCampaign.urgencyLevel}</p>
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-500">Descripción:</span>
                        <p className="text-sm mt-1">{selectedCampaign.description}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Creador</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={selectedCampaign.creator.avatar} alt={getCreatorName(selectedCampaign.creator)} />
                          <AvatarFallback className="text-lg">{getCreatorInitials(selectedCampaign.creator)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-semibold">{getCreatorName(selectedCampaign.creator)}</h3>
                          <p className="text-gray-600">
                            {selectedCampaign.creator.userType === 'INDIVIDUAL' ? 'Individual' : 'Organización'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="stats" className="mt-6">
                <div className="text-center py-12 text-gray-500">
                  Estadísticas detalladas (próximamente)
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="mt-6">
                <div className="text-center py-12 text-gray-500">
                  Historial de actividad (próximamente)
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de edición de campaña */}
      <CampaignEditModal
        campaign={editingCampaign}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCampaign(null);
        }}
        onSave={handleSaveCampaign}
      />

      {/* Modal de confirmación */}
      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmationAction?.title}</DialogTitle>
            <DialogDescription>
              {confirmationAction?.message}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfirmationModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm}>Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
