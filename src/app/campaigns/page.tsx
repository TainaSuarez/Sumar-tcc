'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Heart, Users, Calendar, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
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
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros - inicializar con parámetros de URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('categoryId') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [showCategories, setShowCategories] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Sincronizar con parámetros de URL
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search') || '';
    const urlCategory = searchParams.get('categoryId') || '';
    const urlPage = parseInt(searchParams.get('page') || '1');
    
    setSearchTerm(urlSearchTerm);
    setSelectedCategory(urlCategory);
    setCurrentPage(urlPage);
  }, [searchParams]);

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
    updateURL({ search: searchTerm, page: 1 });
  };

  // Función para cambiar categoría
  const handleCategoryChange = (categoryId: string) => {
    const newCategory = categoryId === selectedCategory ? '' : categoryId;
    updateURL({ categoryId: newCategory, page: 1 });
  };

  // Función para actualizar URL
  const updateURL = (updates: { search?: string; categoryId?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.search !== undefined) {
      if (updates.search.trim()) {
        params.set('search', updates.search.trim());
      } else {
        params.delete('search');
      }
    }
    
    if (updates.categoryId !== undefined) {
      if (updates.categoryId) {
        params.set('categoryId', updates.categoryId);
      } else {
        params.delete('categoryId');
      }
    }
    
    if (updates.page !== undefined) {
      if (updates.page > 1) {
        params.set('page', updates.page.toString());
      } else {
        params.delete('page');
      }
    }
    
    router.push(`/campaigns?${params.toString()}`);
  };

  // Función para calcular porcentaje de progreso
  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
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
      {/* Navbar */}
      <Navbar />
      
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
        </div>
      </div>

      {/* Filtros de categorías */}
      <div className="bg-white border-b">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 py-6">
          <div className="space-y-6">
            {/* Botón de categorías */}
            <div className="max-w-md mx-auto relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700 font-medium">
                  {selectedCategory ? 
                    categories.find(cat => cat.id === selectedCategory)?.name || 'Categorías' 
                    : 'Categorías'
                  }
                </span>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showCategories ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Lista desplegable de categorías */}
              {showCategories && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                  <button
                    onClick={() => {
                      setSelectedCategory('')
                      setShowCategories(false)
                    }}
                    className={`w-full px-4 py-3 text-left border-b border-gray-200 transition-colors ${
                      selectedCategory === ''
                        ? 'bg-purple-50 text-purple-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Todas las categorías
                  </button>
                  {categories.map((category, index) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id)
                        setShowCategories(false)
                      }}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        index === categories.length - 1 ? '' : 'border-b border-gray-200'
                      } ${
                        selectedCategory === category.id
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 py-8">
        {/* Estado de carga */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse h-full">
                <div className="aspect-[16/10] bg-gray-200 rounded-t-lg" />
                <CardContent className="p-8 space-y-5">
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-20" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="h-8 bg-gray-200 rounded w-24" />
                      <div className="h-6 bg-gray-200 rounded w-12" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-16" />
                      <div className="h-4 bg-gray-200 rounded w-20" />
                    </div>
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
                    updateURL({ search: '', categoryId: '', page: 1 });
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
                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Campaña
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {campaigns.map((campaign) => {
                const progressPercentage = getProgressPercentage(
                  campaign.currentAmount,
                  campaign.goalAmount
                );

                return (
                  <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white border-gray-100 hover:border-purple-200 rounded-2xl overflow-hidden h-full flex flex-col">
                      {/* Imagen más grande */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        {campaign.images.length > 0 ? (
                          <Image
                            src={campaign.images[0]}
                            alt={campaign.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-100 via-violet-50 to-purple-100 flex items-center justify-center">
                            <Heart className="h-16 w-16 text-purple-400" />
                          </div>
                        )}
                        
                        {/* Overlay gradiente */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          {campaign.isFeatured && (
                            <Badge className="bg-yellow-500 text-white shadow-lg backdrop-blur-sm">
                              Destacada
                            </Badge>
                          )}
                          <Badge
                            className={`${CampaignStatusColors[campaign.status as keyof typeof CampaignStatusColors]} shadow-lg backdrop-blur-sm`}
                          >
                            {CampaignStatusLabels[campaign.status as keyof typeof CampaignStatusLabels]}
                          </Badge>
                        </div>
                        
                        {/* Botón de favorito funcional */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                            <FavoriteButton 
                              campaignId={campaign.id} 
                              size="sm" 
                              variant="ghost"
                              className="hover:bg-white/50"
                            />
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-8 space-y-5 flex-1 flex flex-col">
                        {/* Categoría y Creador */}
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                            {campaign.category.name}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-24">{getCreatorName(campaign.creator)}</span>
                          </div>
                        </div>

                        {/* Título más grande */}
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-purple-700 transition-colors leading-tight min-h-[3.5rem]">
                          {campaign.title}
                        </h3>

                        {/* Descripción con altura fija */}
                        <div className="flex-1">
                          <p className="text-gray-600 line-clamp-4 leading-relaxed text-sm">
                            {campaign.shortDescription}
                          </p>
                        </div>

                        {/* Progreso mejorado */}
                        <div className="space-y-4 mt-auto">
                          <div className="flex justify-between items-end">
                            <div>
                              <div className="text-2xl font-bold text-purple-600">
                                {formatCurrency(campaign.currentAmount)}
                              </div>
                              <div className="text-sm text-gray-500">
                                de {formatCurrency(campaign.goalAmount)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-semibold text-gray-700">
                                {progressPercentage.toFixed(0)}%
                              </div>
                              <div className="text-xs text-gray-500">
                                completado
                              </div>
                            </div>
                          </div>
                          
                          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-violet-600 h-4 rounded-full transition-all duration-500 shadow-sm"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>

                          {/* Información adicional mejorada */}
                          <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-purple-400" />
                              <span className="font-medium">{campaign.donationCount}</span>
                              <span>donantes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-purple-400" />
                              <span>{formatDate(campaign.createdAt)}</span>
                            </div>
                          </div>
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
                  onClick={() => updateURL({ page: currentPage - 1 })}
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
                        onClick={() => updateURL({ page })}
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
                  onClick={() => updateURL({ page: currentPage + 1 })}
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
