import { getServerSession } from 'next-auth';
import { Heart, Users, Target, Shield } from 'lucide-react';

import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { authOptions } from '@/lib/auth';
import { FeaturedCampaigns } from '@/components/features/FeaturedCampaigns';
import { HeroCarousel } from '@/components/features/HeroCarousel';
import { Footer } from '@/components/layout/Footer';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #ffffff 0%, #f5e9ff 100%)'}}>
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



      {/* Footer */}
      <Footer />
    </div>
  );
}
