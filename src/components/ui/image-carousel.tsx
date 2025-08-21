'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import '../../styles/image-carousel.css';

interface ImageCarouselProps {
  images: string[];
  title?: string;
  className?: string;
}

export function ImageCarousel({ images, title, className = '' }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Carrusel principal */}
      <div className={`relative ${className}`}>
        {/* Imagen principal */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100 group cursor-pointer">
          <div 
            className="w-full h-full image-zoom-container carousel-main-image"
            onClick={openModal}
            style={{
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: 'center center',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Image
              src={images[currentIndex]}
              alt={title ? `${title} - Imagen ${currentIndex + 1}` : `Imagen ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority={currentIndex === 0}
            />
          </div>
          
          {/* Overlay con información - más sutil en hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/10 transition-all duration-500" />
          

          
          {/* Controles de navegación */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 text-gray-800 rounded-full p-2 h-8 w-8"
                onClick={goToPrevious}
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 text-gray-800 rounded-full p-2 h-8 w-8"
                onClick={goToNext}
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Indicador de imagen actual */}
          {images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="mt-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-300 group ${
                    index === currentIndex
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  <div 
                    className="w-full h-full thumbnail-zoom-container carousel-thumbnail"
                    style={{
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transformOrigin: 'center center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Overlay de selección */}
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                  )}
                  
                  {/* Overlay de hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de imagen completa */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" 
          onClick={closeModal}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full mx-4 group">
            {/* Botón de cerrar */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 h-10 w-10 z-10 transition-all duration-200"
              onClick={closeModal}
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Imagen en modal con zoom avanzado */}
            <div 
              className="relative w-full h-full max-h-[80vh] overflow-hidden rounded-lg cursor-zoom-in" 
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="w-full h-full modal-zoom-container carousel-modal-image"
                style={{
                  transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                  transformOrigin: 'center center',
                  cursor: 'zoom-in'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Image
                  src={images[currentIndex]}
                  alt={title ? `${title} - Imagen ${currentIndex + 1}` : `Imagen ${currentIndex + 1}`}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              

            </div>

            {/* Controles en modal */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 h-12 w-12 transition-all duration-200 hover:scale-110"
                  onClick={goToPrevious}
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 h-12 w-12 transition-all duration-200 hover:scale-110"
                  onClick={goToNext}
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                {/* Indicador en modal mejorado */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-4 py-2 rounded-md backdrop-blur-sm">
                  <span className="font-medium">{currentIndex + 1}</span>
                  <span className="mx-1 opacity-60">/</span>
                  <span className="opacity-80">{images.length}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
