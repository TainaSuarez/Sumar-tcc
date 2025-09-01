'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, MapPin, Users, Target } from 'lucide-react';

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
  donationCount?: number;
  isFeatured: boolean;
  createdAt: string;
}

interface FeaturedCampaignsProps {
  limit?: number;
}

export function FeaturedCampaigns({ limit = 6 }: FeaturedCampaignsProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          limit: limit.toString(),
          isFeatured: 'true',
          status: 'ACTIVE'
        });

        const response = await fetch(`/api/campaigns?${params}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar las campañas destacadas');
        }

        const data = await response.json();
        setCampaigns(data.campaigns || []);
      } catch (error) {
        console.error('Error fetching featured campaigns:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCampaigns();
  }, [limit]);

  const getCreatorName = (creator: Campaign['creator']) => {
    return creator.organizationName || 
      `${creator.firstName} ${creator.lastName || ''}`.trim();
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Campañas Destacadas
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conoce las causas que están generando mayor impacto ahora mismo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Campañas Destacadas
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (campaigns.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Campañas Destacadas
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Conoce las causas que están generando mayor impacto ahora mismo
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay campañas destacadas disponibles en este momento.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Campañas Destacadas
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conoce las causas que están generando mayor impacto ahora mismo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => {
            const progress = calculateProgress(campaign.currentAmount, campaign.goalAmount);
            const creatorName = getCreatorName(campaign.creator);

            return (
              <Link key={campaign.id} href={`/campaigns/${campaign.slug || campaign.id}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-purple-100 hover:border-purple-200 overflow-hidden">
                  {/* Imagen */}
                  <div className="relative aspect-video overflow-hidden">
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
                      <Badge className="bg-yellow-500 text-white shadow-lg">
                        ⭐ Destacada
                      </Badge>
                      <Badge className="bg-green-500 text-white shadow-lg">
                        Activa
                      </Badge>
                    </div>

                    {/* Overlay de hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <CardContent className="p-6 space-y-4">
                    {/* Categoría */}
                    <Badge variant="outline" className="border-purple-200 text-purple-700 text-xs">
                      {campaign.category.name}
                    </Badge>

                    {/* Título */}
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                      {campaign.title}
                    </h3>

                    {/* Descripción */}
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {campaign.shortDescription}
                    </p>

                    {/* Progreso */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Progreso</span>
                        <span className="font-medium text-purple-600">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Estadísticas */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Target className="h-4 w-4" />
                        <span>{formatCurrency(campaign.goalAmount)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{campaign.donationCount || 0} donantes</span>
                      </div>
                    </div>

                    {/* Recaudado */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Recaudado</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(campaign.currentAmount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Creado por</p>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                            {creatorName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Botón para ver más */}
        <div className="text-center mt-12">
          <Link href="/campaigns">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
              Ver Todas las Campañas
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}