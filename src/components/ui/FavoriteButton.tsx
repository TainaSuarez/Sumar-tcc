'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  campaignId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showText?: boolean;
}

export function FavoriteButton({ 
  campaignId, 
  className, 
  size = 'md', 
  variant = 'ghost',
  showText = false 
}: FavoriteButtonProps) {
  const { data: session, status } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    if (session?.user && campaignId) {
      checkFavoriteStatus();
    } else {
      setIsCheckingStatus(false);
    }
  }, [session, campaignId]);

  const checkFavoriteStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const response = await fetch(`/api/favorites/${campaignId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const toggleFavorite = async () => {
    if (!session?.user) {
      toast.error('Debes iniciar sesión para guardar favoritos');
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      
      if (isFavorite) {
        // Remover de favoritos
        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ campaignId }),
        });

        if (response.ok) {
          setIsFavorite(false);
          toast.success('Campaña removida de favoritos');
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Error al remover de favoritos');
        }
      } else {
        // Agregar a favoritos
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ campaignId }),
        });

        if (response.ok) {
          setIsFavorite(true);
          toast.success('Campaña agregada a favoritos');
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Error al agregar a favoritos');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error al actualizar favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8';
      case 'lg':
        return 'h-12 w-12';
      default:
        return 'h-10 w-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  // No mostrar el botón si el usuario no está autenticado
  if (status === 'loading' || isCheckingStatus) {
    return (
      <Button
        variant={variant}
        size="icon"
        className={cn(getSizeClasses(), 'opacity-50', className)}
        disabled
      >
        <Heart className={cn(getIconSize(), 'animate-pulse')} />
      </Button>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={showText ? 'sm' : 'icon'}
      className={cn(
        !showText && getSizeClasses(),
        'transition-all duration-200 hover:scale-105',
        isFavorite && 'text-red-500 hover:text-red-600',
        className
      )}
      onClick={toggleFavorite}
      disabled={isLoading}
      title={isFavorite ? 'Remover de favoritos' : 'Agregar a favoritos'}
    >
      <Heart 
        className={cn(
          getIconSize(),
          isFavorite && 'fill-current',
          isLoading && 'animate-pulse'
        )} 
      />
      {showText && (
        <span className="ml-2">
          {isFavorite ? 'Favorito' : 'Guardar'}
        </span>
      )}
    </Button>
  );
}

// Hook personalizado para usar en otros componentes
export function useFavoriteStatus(campaignId: string) {
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user && campaignId) {
      checkFavoriteStatus();
    }
  }, [session, campaignId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorites/${campaignId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!session?.user || isLoading) return;

    try {
      setIsLoading(true);
      
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch('/api/favorites', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        toast.success(
          isFavorite 
            ? 'Campaña removida de favoritos' 
            : 'Campaña agregada a favoritos'
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al actualizar favoritos');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error al actualizar favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFavorite,
    isLoading,
    toggleFavorite,
    refreshStatus: checkFavoriteStatus,
  };
}