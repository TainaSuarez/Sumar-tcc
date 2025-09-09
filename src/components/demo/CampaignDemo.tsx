'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, Heart, Users, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Datos mock para demostración
const mockCampaigns = [
  {
    id: '1',
    title: 'Ayuda para el tratamiento médico de María',
    slug: 'ayuda-tratamiento-maria',
    shortDescription: 'María necesita nuestra ayuda para costear su tratamiento contra el cáncer. Cada donación cuenta para darle una segunda oportunidad.',
    goalAmount: 15000,
    currentAmount: 8750,
    currency: 'UYU',
    status: 'ACTIVE',
    images: ['/placeholder-medical.jpg'],
    category: { id: '1', name: 'Salud y Medicina' },
    creator: { id: '1', firstName: 'Carlos', lastName: 'García', organizationName: null },
    donationCount: 47,
    isFeatured: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Escuela rural necesita libros y material escolar',
    slug: 'escuela-rural-libros',
    shortDescription: 'Una pequeña escuela en zona rural necesita libros, cuadernos y material didáctico para 50 niños.',
    goalAmount: 3000,
    currentAmount: 1200,
    currency: 'UYU',
    status: 'ACTIVE',
    images: ['/placeholder-education.jpg'],
    category: { id: '2', name: 'Educación' },
    creator: { id: '2', firstName: 'Ana', lastName: 'Martínez', organizationName: 'Fundación Educación Rural' },
    donationCount: 23,
    isFeatured: false,
    createdAt: '2024-01-10T14:30:00Z',
  },
  {
    id: '3',
    title: 'Refugio de animales necesita comida y medicinas',
    slug: 'refugio-animales-comida',
    shortDescription: 'Nuestro refugio alberga 80 perros y gatos rescatados. Necesitamos ayuda para alimentarlos y mantenerlos sanos.',
    goalAmount: 5000,
    currentAmount: 3200,
    currency: 'UYU',
    status: 'ACTIVE',
    images: ['/placeholder-animals.jpg'],
    category: { id: '3', name: 'Animales y Mascotas' },
    creator: { id: '3', firstName: 'Luis', lastName: 'Rodríguez', organizationName: 'Refugio Esperanza Animal' },
    donationCount: 65,
    isFeatured: false,
    createdAt: '2024-01-08T09:15:00Z',
  },
  {
    id: '4',
    title: 'Reforestación del bosque dañado por incendios',
    slug: 'reforestacion-bosque-incendios',
    shortDescription: 'Ayúdanos a plantar 1000 árboles nativos para recuperar el ecosistema dañado por los incendios del verano.',
    goalAmount: 8000,
    currentAmount: 4500,
    currency: 'UYU',
    status: 'ACTIVE',
    images: ['/placeholder-environment.jpg'],
    category: { id: '4', name: 'Medio Ambiente' },
    creator: { id: '4', firstName: 'Elena', lastName: 'Torres', organizationName: 'EcoVerde' },
    donationCount: 89,
    isFeatured: true,
    createdAt: '2024-01-05T16:45:00Z',
  },
];

const mockCategories = [
  { id: '1', name: 'Salud y Medicina', description: '', color: '#ef4444', icon: 'heart-pulse' },
  { id: '2', name: 'Educación', description: '', color: '#3b82f6', icon: 'graduation-cap' },
  { id: '3', name: 'Animales y Mascotas', description: '', color: '#10b981', icon: 'heart' },
  { id: '4', name: 'Medio Ambiente', description: '', color: '#22c55e', icon: 'leaf' },
  { id: '5', name: 'Arte y Cultura', description: '', color: '#ec4899', icon: 'palette' },
];

export default function CampaignDemo() {
  // Función para calcular porcentaje de progreso
  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  // Función para formatear números
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Función para obtener nombre del creador
  const getCreatorName = (creator: { firstName: string; lastName: string | null; organizationName: string | null }) => {
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
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar campañas por título o descripción..."
                  className="pl-10 h-12 border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 h-8">
                  Buscar
                </Button>
              </div>
            </div>

            {/* Filtros por categoría */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <Button
                variant="default"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Todas las categorías
              </Button>
              {mockCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
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
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Mostrando {mockCampaigns.length} de {mockCampaigns.length} campañas
          </p>
          <Link href="/campaigns/create">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Crear Campaña
            </Button>
          </Link>
        </div>

        {/* Grid de campañas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockCampaigns.map((campaign) => {
            const progressPercentage = getProgressPercentage(
              campaign.currentAmount,
              campaign.goalAmount
            );

            return (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-purple-100 hover:border-purple-200">
                  {/* Imagen */}
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                      <Heart className="h-12 w-12 text-purple-300" />
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {campaign.isFeatured && (
                        <Badge className="bg-yellow-500 text-white">
                          Destacada
                        </Badge>
                      )}
                      <Badge className="bg-green-100 text-green-800">
                        Activa
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

        {/* Paginación mock */}
        <div className="mt-12 flex justify-center items-center gap-2">
          <Button
            variant="outline"
            disabled
            className="border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
          >
            Anterior
          </Button>
          
          <Button
            variant="default"
            className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white"
          >
            1
          </Button>
          
          <Button
            variant="outline"
            className="w-10 h-10 border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            2
          </Button>
          
          <Button
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
