'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  title?: string;
  description?: string;
}

export function ImageModal({ 
  isOpen, 
  onClose, 
  images, 
  currentIndex, 
  title, 
  description 
}: ImageModalProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  // Definir las funciones de navegación primero
  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, goToPrevious, goToNext]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !images.length) return null;

  console.log('ImageModal - isOpen:', isOpen, 'images:', images, 'activeIndex:', activeIndex);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 max-w-7xl max-h-[90vh] mx-4">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex-1">
            {title && (
              <h3 className="text-white text-lg font-semibold truncate">
                {title}
              </h3>
            )}
            {images.length > 1 && (
              <p className="text-white/80 text-sm">
                {activeIndex + 1} de {images.length}
              </p>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 rounded-full p-3"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 rounded-full p-3"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </>
        )}

        {/* Image */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <img
            src={images[activeIndex]}
            alt={`${title || 'Imagen'} ${activeIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain"
            onLoad={() => {
              console.log('MODAL IMG - Imagen cargada exitosamente:', images[activeIndex]);
            }}
            onError={(e) => {
              console.error('MODAL IMG - Error loading image:', images[activeIndex]);
              const target = e.currentTarget;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-64 text-white">Error al cargar la imagen</div>';
            }}
          />
        </div>

        {/* Description */}
        {description && (
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <p className="text-white text-sm leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <div className="flex gap-2 bg-black/50 rounded-full p-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                    index === activeIndex 
                      ? 'border-white scale-110' 
                      : 'border-white/50 hover:border-white/80'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}