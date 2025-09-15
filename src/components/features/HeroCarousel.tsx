'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HeroCarouselProps {
  session?: any;
}

const carouselImages = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Niños sonriendo en escuela',
    fallback: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Voluntarios distribuyendo alimentos con camisetas Sumar+',
    fallback: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Personas unidas en comunidad',
    fallback: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

export function HeroCarousel({ session }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(timer);
  }, []);

  const handleImageError = (imageId: number) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  const getImageSrc = (image: typeof carouselImages[0]) => {
    return imageErrors[image.id] ? image.fallback : image.src;
  };

  return (
    <section className="relative h-[120vh] overflow-hidden -mt-20">
      {/* Background Images */}
      {carouselImages.map((image, index) => (
        <div
          key={image.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={getImageSrc(image)}
            alt={image.alt}
            className="w-full h-full object-cover"
            onError={() => handleImageError(image.id)}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full px-6 sm:px-8 lg:px-16 ml-8 sm:ml-12 lg:ml-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 font-sans text-white">
              <span className="font-medium">Sumar+</span>
              <span className="block text-purple-300 font-bold">transforma</span>
              <span className="text-violet-300 font-semibold">pequeños gestos</span>
              <span className="font-light"> en </span>
              <span className="text-purple-300 font-bold">grandes cambios</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-8 max-w-2xl">
              Conectamos personas con causas sociales para crear un impacto 
              positivo en la sociedad. Cada donación, por pequeña que sea, 
              puede marcar una gran diferencia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {session ? (
                <Link href="/campaigns">
                  <Button size="lg" className="text-lg px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white">
                    Explorar campañas
                  </Button>
                </Link>
              ) : (
                <>
                  <Button size="lg" className="text-lg px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white">
                    Comenzar a donar
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-purple-600">
                    Crear campaña
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>


    </section>
  );
}