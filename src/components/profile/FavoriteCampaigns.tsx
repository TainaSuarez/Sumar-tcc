'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, Calendar, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  status: string;
  location: string;
  endDate: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    avatar: string;
  };
  category: {
    id: string;
    name: string;
    color: string;
  };
  _count: {
    donations: number;
  };
}

interface FavoritesResponse {
  favorites: Campaign[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function FavoriteCampaigns() {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<FavoritesResponse['pagination'] | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchFavorites();
    }
  }, [session, currentPage]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/favorites?page=${currentPage}&limit=6`);
      if (response.ok) {
        const data: FavoritesResponse = await response.json();
        setFavorites(data.favorites);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      toast.error('Error al cargar las campañas favoritas');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/favorites?campaignId=${campaignId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites(favorites.filter(campaign => campaign.id !== campaignId));
        toast.success('Campaña eliminada de favoritos');
        
        // Si no quedan favoritos en la página actual y no es la primera página, ir a la anterior
        if (favorites.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchFavorites(); // Recargar para actualizar la paginación
        }
      } else {
        toast.error('Error al eliminar de favoritos');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Error al eliminar de favoritos');
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Finalizada';
    } else if (diffDays === 0) {
      return 'Último día';
    } else if (diffDays === 1) {
      return '1 día restante';
    } else {
      return `${diffDays} días restantes`;
    }
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

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes favoritos aún</h3>
          <p className="text-gray-600 text-center mb-6">
            Explora las campañas y guarda las que más te interesen haciendo clic en el corazón.
          </p>
          <Link href="/campaigns">
            <Button>Explorar Campañas</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((campaign) => {
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
                
                <button
                  onClick={() => removeFavorite(campaign.id)}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white text-red-500 p-2 rounded-full shadow-md transition-colors"
                  title="Quitar de favoritos"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>

                <Badge 
                  className="absolute top-3 left-3" 
                  style={{ backgroundColor: campaign.category.color }}
                >
                  {campaign.category.name}
                </Badge>
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

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <img
                        src={campaign.creator.avatar || '/default-avatar.png'}
                        alt={campaign.creator.firstName}
                        className="w-4 h-4 rounded-full"
                      />
                      <span>
                        {campaign.creator.organizationName || 
                         `${campaign.creator.firstName} ${campaign.creator.lastName || ''}`}
                      </span>
                    </div>
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

                  {campaign.endDate && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(campaign.endDate)}</span>
                    </div>
                  )}

                  <Link href={`/campaigns/${campaign.slug}`}>
                    <Button className="w-full mt-3" size="sm">
                      Ver Campaña
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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