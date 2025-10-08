'use client';

import { useState } from 'react';
import { Heart, Search, CreditCard, CheckCircle, Users, Shield, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';

const steps = [
  {
    id: 1,
    title: 'Explora las Campañas',
    description: 'Navega por nuestra plataforma y encuentra causas que te inspiren a ayudar.',
    icon: Search,
    details: [
      'Utiliza los filtros por categoría para encontrar causas específicas',
      'Lee las historias completas de cada campaña',
      'Revisa las actualizaciones y progreso de las campañas',
      'Verifica que las campañas estén verificadas por nuestro equipo'
    ],
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'Selecciona una Causa',
    description: 'Elige la campaña que más te motive y revisa todos los detalles.',
    icon: Heart,
    details: [
      'Lee la historia completa del beneficiario',
      'Revisa el objetivo de recaudación y el progreso actual',
      'Consulta las actualizaciones del creador de la campaña',
      'Verifica la transparencia en el uso de los fondos'
    ],
    color: 'bg-purple-500'
  },
  {
    id: 3,
    title: 'Realiza tu Donación',
    description: 'Elige el monto que deseas donar y completa el proceso de pago seguro.',
    icon: CreditCard,
    details: [
      'Selecciona el monto que deseas donar (mínimo $100 UYU)',
      'Elige si quieres que tu donación sea anónima',
      'Agrega un mensaje de apoyo opcional',
      'Completa el pago de forma segura con nuestros métodos verificados'
    ],
    color: 'bg-green-500'
  },
  {
    id: 4,
    title: 'Recibe Confirmación',
    description: 'Obtén la confirmación de tu donación y mantente al tanto del progreso.',
    icon: CheckCircle,
    details: [
      'Recibe un email de confirmación con los detalles de tu donación',
      'Accede a tu historial de donaciones en tu perfil',
      'Recibe actualizaciones sobre el progreso de la campaña',
      'Obtén un comprobante fiscal si es aplicable'
    ],
    color: 'bg-emerald-500'
  }

];

const features = [
  {
    icon: Shield,
    title: 'Pagos Seguros',
    description: 'Utilizamos encriptación de nivel bancario para proteger tus datos de pago.'
  },
  {
    icon: Users,
    title: 'Campañas Verificadas',
    description: 'Nuestro equipo verifica cada campaña antes de publicarla en la plataforma.'
  },
  {
    icon: Heart,
    title: 'Transparencia Total',
    description: 'Seguimiento completo de cómo se utilizan los fondos donados.'
  }
];

const HowItWorksPage = () => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="min-h-screen bg-white pt-8">
      <Navbar />
      
      {/* Header específico para Cómo Funciona */}
      <div className="relative bg-gradient-to-r from-purple-100 to-violet-100 overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="Personas colaborando"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Contenido del banner */}
        <div className="relative max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-16 xl:px-24 2xl:px-32 py-20">
          <div className="max-w-5xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-purple-800">
              Cómo Funciona Sumar+
            </h1>
            <p className="text-xl md:text-2xl text-purple-700 leading-relaxed max-w-4xl">
              Una guía paso a paso para realizar donaciones de manera segura y transparente en nuestra plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-16 xl:px-24 2xl:px-32 py-24">
        <div className="max-w-5xl mx-auto">

        {/* Step Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`text-left p-6 rounded-xl border transition-all duration-200 ${
                  activeStep === step.id
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className={`p-3 rounded-xl ${
                    activeStep === step.id ? 'bg-purple-600' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      activeStep === step.id ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <span className={`text-base font-medium ${
                    activeStep === step.id ? 'text-purple-700' : 'text-gray-600'
                  }`}>
                    Paso {step.id}
                  </span>
                </div>
                <h3 className={`text-lg font-medium ${
                  activeStep === step.id ? 'text-purple-800' : 'text-gray-700'
                }`}>
                  {step.title}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Active Step Details */}
        <div className="max-w-full">
            {steps.map((step) => {
              const Icon = step.icon;
              if (step.id !== activeStep) return null;
              
              return (
                <div key={step.id} className="bg-white border border-purple-200 rounded-2xl shadow-md">
                  <div className="p-10">
                    <div className="flex items-start gap-6 mb-8">
                      <div className="bg-purple-600 p-4 rounded-xl">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl md:text-4xl font-light text-purple-700 mb-4">
                          {step.title}
                        </h3>
                        <p className="text-xl text-gray-700 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {step.details.map((detail, index) => (
                        <div key={index} className="flex items-start gap-6 p-6 bg-purple-50 rounded-xl">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-base font-medium">{index + 1}</span>
                            </div>
                          </div>
                          <p className="text-lg text-gray-800 leading-relaxed">{detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>

      {/* Features Section */}
      <div className="bg-purple-50 py-24">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-16 xl:px-24 2xl:px-32">
          <div className="max-w-6xl mx-auto">
            <div className="mb-20 text-center">
              <h2 className="text-4xl md:text-5xl font-light text-purple-700 mb-6">
                ¿Por qué elegir Sumar+?
              </h2>
              <p className="text-xl text-gray-700 max-w-4xl mx-auto">
                Nuestra plataforma garantiza los más altos estándares de seguridad, transparencia y confianza
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-white p-12 rounded-xl border border-purple-200 hover:border-purple-300 transition-colors shadow-sm hover:shadow-md ring-1 ring-purple-100 min-h-[280px] flex flex-col">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="bg-purple-600 p-3 rounded-xl flex-shrink-0">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-medium text-purple-800 leading-tight">
                        {feature.title}
                      </h3>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white border-t border-purple-200 py-24">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-16 xl:px-24 2xl:px-32">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-light text-purple-700 mb-8">
              ¿Listo para hacer la diferencia?
            </h2>
            <p className="text-xl text-gray-700 mb-10 leading-relaxed">
              Explora nuestras campañas activas y encuentra una causa que te inspire a contribuir.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700 px-10 py-4 text-lg rounded-2xl shadow-md"
                onClick={() => window.location.href = '/campaigns'}
              >
                Ver Campañas
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-purple-300 text-purple-700 hover:bg-purple-50 px-10 py-4 text-lg rounded-2xl"
                onClick={() => window.location.href = '/auth/signin'}
              >
                Crear Cuenta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorksPage;