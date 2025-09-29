'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MockDonateButton, MockPaymentForm } from '@/components/donations';
import { ArrowLeft, Heart, Users, Target, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Datos de campaña de ejemplo
const mockCampaign = {
  id: 'demo-campaign-1',
  title: 'Ayuda para Refugio de Animales',
  description: 'Necesitamos tu ayuda para construir un nuevo refugio para animales abandonados. Con tu donación podremos brindar un hogar seguro y cálido a más de 100 animales.',
  goalAmount: 50000,
  currentAmount: 32750,
  image: '/uploads/campaigns/campaign-1755110895138-946929447.jpg',
  creator: {
    name: 'Fundación Patitas Felices',
    avatar: '/user-icon.svg'
  },
  category: 'Animales',
  daysLeft: 15,
  donorsCount: 127,
  createdAt: '2024-01-15',
};

export default function DemoPaymentPage() {
  const [showForm, setShowForm] = useState(false);
  const [donations, setDonations] = useState<any[]>([]);

  const progress = (mockCampaign.currentAmount / mockCampaign.goalAmount) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
    }).format(amount);
  };

  const handleDonationSuccess = (donationData: any) => {
    console.log('Nueva donación:', donationData);
    setDonations(prev => [donationData, ...prev]);
    setShowForm(false);
    
    // Actualizar el monto actual de la campaña
    mockCampaign.currentAmount += donationData.amount;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/campaigns">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Demo de Pago Ficticio</h1>
            <p className="text-gray-600">Prueba el sistema de donaciones simulado</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información de la campaña */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card principal */}
            <Card>
              <div className="aspect-video w-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <Heart className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <h2 className="text-2xl font-bold">{mockCampaign.title}</h2>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{mockCampaign.category}</Badge>
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {mockCampaign.daysLeft} días restantes
                  </Badge>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  {mockCampaign.description}
                </p>

                {/* Progreso */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Progreso</span>
                    <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  
                  <Progress value={progress} className="h-3" />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(mockCampaign.currentAmount)}
                      </div>
                      <div className="text-sm text-gray-600">Recaudado</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(mockCampaign.goalAmount)}
                      </div>
                      <div className="text-sm text-gray-600">Meta</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {mockCampaign.donorsCount + donations.length}
                      </div>
                      <div className="text-sm text-gray-600">Donantes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donaciones recientes */}
            {donations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Donaciones Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {donations.map((donation, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{donation.donorName}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(donation.createdAt).toLocaleString('es-UY')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            {formatCurrency(donation.amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            **** {donation.cardLastFour}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Botón de donación */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Hacer una Donación</h3>
                  <p className="text-sm text-gray-600">
                    Tu ayuda hace la diferencia
                  </p>
                </div>

                <div className="space-y-3">
                  <MockDonateButton
                    campaign={mockCampaign}
                    onDonationSuccess={handleDonationSuccess}
                    size="lg"
                    className="w-full"
                  />
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(!showForm)}
                    className="w-full"
                  >
                    {showForm ? 'Ocultar' : 'Mostrar'} Formulario Directo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Información del creador */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">{mockCampaign.creator.name}</div>
                    <div className="text-sm text-gray-600">Organizador</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Organización dedicada al rescate y cuidado de animales abandonados desde 2015.
                </p>
              </CardContent>
            </Card>

            {/* Información de seguridad */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-green-700 font-semibold mb-2">🔒 Pago Simulado</div>
                  <p className="text-sm text-green-600">
                    Esta es una demostración. No se procesarán pagos reales ni se cobrará dinero.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Datos de prueba */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="text-blue-700 font-semibold mb-3">💳 Datos de Prueba</div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Tarjeta:</span>
                    <div className="font-mono text-xs mt-1">4532123456789012</div>
                  </div>
                  <div>
                    <span className="font-medium">Fecha:</span>
                    <span className="ml-2">12/25</span>
                  </div>
                  <div>
                    <span className="font-medium">CVV:</span>
                    <span className="ml-2">123</span>
                  </div>
                  <div>
                    <span className="font-medium">Nombre:</span>
                    <span className="ml-2">Juan Pérez</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Formulario directo */}
        {showForm && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Formulario de Pago Directo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <MockPaymentForm
                    campaign={mockCampaign}
                    onSuccess={handleDonationSuccess}
                    onCancel={() => setShowForm(false)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
