'use client';

import React from 'react';
import { TrendingUp, Users, Heart, Target, DollarSign, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatisticItem {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  description: string;
  color: string;
}

const statistics: StatisticItem[] = [
  {
    icon: Users,
    value: '47.892',
    label: 'Personas Beneficiadas',
    description: 'Vidas transformadas a través de donaciones',
    color: 'bg-purple-500'
  },
  {
    icon: Heart,
    value: '3.247',
    label: 'Causas Ayudadas',
    description: 'Campañas exitosas que cambiaron realidades',
    color: 'bg-violet-500'
  },
  {
    icon: DollarSign,
    value: '$2.8M',
    label: 'Fondos Recaudados',
    description: 'Total donado para causas sociales',
    color: 'bg-purple-600'
  },
  {
    icon: Target,
    value: '92%',
    label: 'Tasa de Impacto',
    description: 'Campañas que lograron su objetivo',
    color: 'bg-violet-600'
  }
];

export function StatisticsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nuestro Impacto en Números
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cada donación cuenta una historia de esperanza y transformación
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statistics.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className={`${stat.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                      {stat.value}
                    </h3>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {stat.label}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {stat.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Separador visual */}
        <div className="mt-16 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    </section>
  );
}