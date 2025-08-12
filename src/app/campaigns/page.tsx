'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Heart, Users, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CampaignStatusLabels, CampaignStatusColors } from '@/types/campaign';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

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
  creator: {
    id: string;
    firstName: string;
    lastName: string | null;
    organizationName: string | null;
  };
  donationCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CampaignsResponse {
  campaigns: Campaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error cargando categorías:', error);
      }
    };

    fetchCategories();
  }, []);

  // Cargar campañas
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12',
        });

        if (searchTerm) {
          params.append('search', searchTerm);
        }

        if (selectedCategory) {
          params.append('categoryId', selectedCategory);
        }

        const response = await fetch(`/api/campaigns?${params}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar las campañas');
        }

        const data: CampaignsResponse = await response.json();
        setCampaigns(data.campaigns);
        setPagination(data.pagination);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [currentPage, searchTerm, selectedCategory]);

  // Función para buscar
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Función para cambiar categoría
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
    setCurrentPage(1);
  };

  // Función para calcular porcentaje de progreso
  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  // Función para formatear números
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Función para obtener nombre del creador
  const getCreatorName = (creator: Campaign['creator']) => {
    if (creator.organizationName) {
      return creator.organizationName;
    }
    return `${creator.firstName} ${creator.lastName || ''}`.trim();
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      {/* Header */}
      <div className="bg-white border-b border-purple-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Campañas Activas
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre proyectos increíbles y ayuda a hacer realidad los sueños de personas como tú.
              Cada donación cuenta y puede marcar la diferencia.
            </p>
          </div>

          {/* Búsqueda y filtros */}
          <div className="mt-8 space-y-4">
            {/* Barra de búsqueda */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar campañas por título o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 h-8"
                >
                  Buscar
                </Button>
              </div>
            </form>

            {/* Filtros por categoría */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                onClick={() => handleCategoryChange('')}
                className={`${
                  selectedCategory === ''
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'border-purple-200 text-purple-700 hover:bg-purple-50'
                }`}
              >
                Todas las categorías
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`${
                    selectedCategory === category.id
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'border-purple-200 text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estado de carga */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-2 bg-gray-200 rounded w-full" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-3 bg-gray-200 rounded w-12" />
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
              <p className="text-red-600 font-medium">Error al cargar las campañas</p>
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
              <Heart className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron campañas
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Aún no hay campañas disponibles'}
              </p>
              {(searchTerm || selectedCategory) && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setCurrentPage(1);
                  }}
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Grid de campañas */}
        {!loading && !error && campaigns.length > 0 && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                Mostrando {campaigns.length} de {pagination.total} campañas
              </p>
              <Link href="/campaigns/create">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Crear Campaña
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {campaigns.map((campaign) => {
                const progressPercentage = getProgressPercentage(
                  campaign.currentAmount,
                  campaign.goalAmount
                );

                              return (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-purple-100 hover:border-purple-200">
                      {/* Imagen */}
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        {campaign.images.length > 0 ? (
                          <Image
                            src={campaign.images[0]}
                            alt={campaign.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                            <Heart className="h-12 w-12 text-purple-300" />
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {campaign.isFeatured && (
                            <Badge className="bg-yellow-500 text-white">
                              Destacada
                            </Badge>
                          )}
                          <Badge
                            className={CampaignStatusColors[campaign.status as keyof typeof CampaignStatusColors]}
                          >
                            {CampaignStatusLabels[campaign.status as keyof typeof CampaignStatusLabels]}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-3">
                        {/* Título */}
                        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                          {campaign.title}
                        </h3>

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
                              {progressPercentage.toFixed(0)}%
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

                        {/* Información adicional */}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-purple-50">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{campaign.donationCount} donantes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(campaign.createdAt)}</span>
                          </div>
                        </div>

                        {/* Creador y categoría */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-purple-600">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{getCreatorName(campaign.creator)}</span>
                          </div>
                          <Badge variant="outline" className="border-purple-200 text-purple-700 text-xs">
                            {campaign.category.name}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  disabled={!pagination.hasPrev}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                >
                  Anterior
                </Button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    const current = pagination.page;
                    return page === 1 || page === pagination.totalPages || 
                           (page >= current - 1 && page <= current + 1);
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <Button
                        variant={page === pagination.page ? 'default' : 'outline'}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 ${
                          page === pagination.page
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'border-purple-200 text-purple-700 hover:bg-purple-50'
                        }`}
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
                
                <Button
                  variant="outline"
                  disabled={!pagination.hasNext}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
