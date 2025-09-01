import { getServerSession } from 'next-auth';
import { Heart, Users, Target, Shield } from 'lucide-react';

import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { authOptions } from '@/lib/auth';
import { FeaturedCampaigns } from '@/components/features/FeaturedCampaigns';
import { HeroCarousel } from '@/components/features/HeroCarousel';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      <Navbar />
      
      {/* Hero Carousel Section */}
      <HeroCarousel session={session} />

      {/* Featured Campaigns Section */}
      <FeaturedCampaigns limit={6} />

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Sumar+?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nuestra plataforma está diseñada para maximizar el impacto de tu generosidad
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                100% Transparente
              </h3>
              <p className="text-gray-600">
                Seguimiento completo de cada donación desde el origen hasta el destino
              </p>
            </div>

            <div className="text-center">
              <div className="bg-violet-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Comunidad Activa
              </h3>
              <p className="text-gray-600">
                Miles de personas comprometidas trabajando juntas por un mundo mejor
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Impacto Medible
              </h3>
              <p className="text-gray-600">
                Reportes detallados del impacto real de cada campaña y donación
              </p>
            </div>

            <div className="text-center">
              <div className="bg-violet-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Fácil de Usar
              </h3>
              <p className="text-gray-600">
                Interfaz intuitiva que hace que donar y crear campañas sea simple
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-violet-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para hacer la diferencia?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Únete a Sumar+ hoy y comienza a transformar vidas con tu generosidad
          </p>
          
          {!session && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Crear Cuenta Gratis
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-purple-600">
                Ver Cómo Funciona
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-6 w-6 fill-current text-purple-400" />
              <span className="text-xl font-bold">Sumar+</span>
            </div>
            <p className="text-gray-400 mb-4">
              Conectando corazones generosos con causas que transforman vidas
            </p>
            <p className="text-sm text-gray-500">
              © 2024 Sumar+. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
