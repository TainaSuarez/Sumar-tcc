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
  Filter
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CampaignOption {
  id: string;
  title: string;
  status: string;
  type: string;
  isVerified: boolean;
  isFeatured: boolean;
  goalAmount: number;
  currentAmount: number;
  createdAt: string;
  creatorName: string;
  categoryName: string;
  progress: number;
}

interface CampaignSelectorProps {
  onSelectionChange?: (selectedIds: string[]) => void;
  preSelectedIds?: string[];
  maxSelection?: number;
  title?: string;
  description?: string;
}

export function CampaignSelector({ 
  onSelectionChange, 
  preSelectedIds = [], 
  maxSelection,
  title = "Seleccionar Campañas",
  description = "Selecciona las campañas para la acción"
}: CampaignSelectorProps) {
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(preSelectedIds));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '500', // Límite alto para selector
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter && typeFilter !== 'all' && { type: typeFilter }),
        ...(verifiedFilter && verifiedFilter !== 'all' && { isVerified: verifiedFilter }),
        ...(featuredFilter && featuredFilter !== 'all' && { isFeatured: featuredFilter }),
        ...(categoryFilter && categoryFilter !== 'all' && { category: categoryFilter }),
      });

      const response = await fetch(`/api/admin/campaigns/ids?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar campañas');
      }

      const data = await response.json();
      setCampaigns(data.campaigns);
    } catch (err) {
      console.error('Error loading campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, typeFilter, verifiedFilter, featuredFilter, categoryFilter]);

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

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedIds));
    }
  }, [selectedIds, onSelectionChange]);

  const handleSelectCampaign = (campaignId: string) => {
    const newSelection = new Set(selectedIds);
    
    if (newSelection.has(campaignId)) {
      newSelection.delete(campaignId);
    } else {
      if (maxSelection && newSelection.size >= maxSelection) {
        alert(`Solo puedes seleccionar un máximo de ${maxSelection} campañas`);
        return;
      }
      newSelection.add(campaignId);
    }
    
    setSelectedIds(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === campaigns.length) {
      setSelectedIds(new Set());
    } else {
      if (maxSelection && campaigns.length > maxSelection) {
        alert(`Solo puedes seleccionar un máximo de ${maxSelection} campañas`);
        return;
      }
      setSelectedIds(new Set(campaigns.map(c => c.id)));
    }
  };

  const handleSelectFiltered = async () => {
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter && typeFilter !== 'all' && { type: typeFilter }),
        ...(verifiedFilter && verifiedFilter !== 'all' && { isVerified: verifiedFilter }),
        ...(featuredFilter && featuredFilter !== 'all' && { isFeatured: featuredFilter }),
        ...(categoryFilter && categoryFilter !== 'all' && { category: categoryFilter }),
      });

      const response = await fetch('/api/admin/campaigns/ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'select_all_filtered',
          filters: Object.fromEntries(params)
        }),
      });

      if (!response.ok) {
        throw new Error('Error al seleccionar campañas filtradas');
      }

      const data = await response.json();
      
      if (maxSelection && data.campaignIds.length > maxSelection) {
        alert(`Los filtros actuales devuelven ${data.campaignIds.length} campañas, pero solo puedes seleccionar ${maxSelection}`);
        return;
      }

      setSelectedIds(new Set(data.campaignIds));
      alert(`${data.count} campañas seleccionadas basadas en los filtros actuales`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setVerifiedFilter('all');
    setFeaturedFilter('all');
    setCategoryFilter('all');
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
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

  return (
    <div className="space-y-4">
      {/* Header con información de selección */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {selectedIds.size} seleccionada{selectedIds.size !== 1 ? 's' : ''}
            {maxSelection && ` / ${maxSelection}`}
          </Badge>
          {selectedIds.size > 0 && (
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Limpiar selección
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Filtros de Búsqueda</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
            <Button variant="outline" size="sm" onClick={handleSelectFiltered}>
              <Filter className="h-4 w-4 mr-2" />
              Seleccionar filtradas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
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
                <SelectItem value="all">Todos</SelectItem>
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
                <SelectItem value="all">Todos</SelectItem>
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
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de campañas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Campañas ({campaigns.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={campaigns.length > 0 && selectedIds.size === campaigns.length}
              onCheckedChange={handleSelectAll}
              disabled={maxSelection ? campaigns.length > maxSelection : false}
            />
            <span className="text-sm text-gray-600">Seleccionar todas</span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {campaigns.map((campaign) => (
                <div 
                  key={campaign.id} 
                  className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                    selectedIds.has(campaign.id) ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleSelectCampaign(campaign.id)}
                >
                  <Checkbox
                    checked={selectedIds.has(campaign.id)}
                    onCheckedChange={() => handleSelectCampaign(campaign.id)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate">{campaign.title}</h4>
                      <div className="flex gap-1 ml-2">
                        <Badge className={getStatusColor(campaign.status)} variant="outline">
                          {campaign.status}
                        </Badge>
                        {campaign.isVerified && (
                          <Badge className="bg-green-100 text-green-800" variant="outline">
                            ✓
                          </Badge>
                        )}
                        {campaign.isFeatured && (
                          <Badge className="bg-yellow-100 text-yellow-800" variant="outline">
                            ⭐
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                      <span>{campaign.creatorName} • {campaign.categoryName}</span>
                      <span>
                        {formatCurrency(campaign.currentAmount)} / {formatCurrency(campaign.goalAmount)}
                        ({campaign.progress.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {campaigns.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron campañas con los filtros actuales
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente wrapper para uso en modales
export function CampaignSelectorModal({ 
  children, 
  onSelectionConfirm,
  maxSelection,
  title,
  description 
}: {
  children: React.ReactNode;
  onSelectionConfirm: (selectedIds: string[]) => void;
  maxSelection?: number;
  title?: string;
  description?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleConfirm = () => {
    onSelectionConfirm(selectedIds);
    setOpen(false);
    setSelectedIds([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title || "Seleccionar Campañas"}</DialogTitle>
          <DialogDescription>
            {description || "Selecciona las campañas para realizar la acción"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[70vh]">
          <CampaignSelector
            onSelectionChange={setSelectedIds}
            maxSelection={maxSelection}
            title=""
            description=""
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
          >
            Confirmar ({selectedIds.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
