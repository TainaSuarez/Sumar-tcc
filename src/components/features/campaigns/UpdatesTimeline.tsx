'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Clock, 
  EyeOff, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Plus
} from 'lucide-react';

import { ImageModal } from '@/components/ui/ImageModal';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  UpdateType, 
  UpdateTypeLabels, 
  UpdateTypeColors 
} from '@/lib/validations/campaignUpdate';
import type { CampaignUpdate } from '@/types/campaignUpdate';

interface UpdatesTimelineProps {
  campaignId: string;
  isOwner?: boolean;
  showPrivate?: boolean;
  onEdit?: (update: CampaignUpdate) => void;
  onDelete?: (updateId: string) => void;
}

interface UpdateItemProps {
  update: CampaignUpdate;
  isOwner?: boolean;
  onEdit?: (update: CampaignUpdate) => void;
  onDelete?: (updateId: string) => void;
}

// Componente para una actualización individual
function UpdateItem({ update, isOwner, onEdit, onDelete }: UpdateItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy 'a las' HH:mm", { 
        locale: es 
      });
    } catch {
      return dateString;
    }
  };

  const getAuthorDisplayName = (author: CampaignUpdate['author']) => {
    if (author.organizationName) {
      return author.organizationName;
    }
    return `${author.firstName} ${author.lastName || ''}`.trim();
  };

  const shouldTruncateContent = update.content.length > 300;
  const displayContent = shouldTruncateContent && !isExpanded 
    ? `${update.content.substring(0, 300)}...` 
    : update.content;

  const visibleImages = showAllImages ? update.images : update.images.slice(0, 3);
  const hasMoreImages = update.images.length > 3;

  return (
    <div className="relative">
      {/* Línea de conexión del timeline */}
      <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200"></div>
      
      {/* Punto del timeline */}
      <div className="absolute left-4 top-8 w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-md"></div>

      <Card className="ml-12 mb-6 hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge 
                  variant="outline" 
                  className={UpdateTypeColors[update.type]}
                >
                  {update.type === UpdateType.TEXT_ONLY && <FileText className="w-3 h-3 mr-1" />}
                  {update.type === UpdateType.TEXT_IMAGE && <ImageIcon className="w-3 h-3 mr-1" />}
                  {update.type === UpdateType.TEXT_VIDEO && <Video className="w-3 h-3 mr-1" />}
                  {UpdateTypeLabels[update.type]}
                </Badge>
                
                {!update.isPublic && (
                  <Badge variant="outline" className="text-gray-600 border-gray-300">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Privada
                  </Badge>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {update.title}
              </h3>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(update.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  Por {getAuthorDisplayName(update.author)}
                </div>
              </div>
            </div>

            {/* Acciones del propietario */}
            {isOwner && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(update)}
                  className="text-gray-600 hover:text-purple-600"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(update.id)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Contenido de texto */}
          <div className="prose prose-sm max-w-none mb-4">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {displayContent}
            </p>
            
            {shouldTruncateContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-purple-600 hover:text-purple-700 p-0 h-auto font-medium"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Ver menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Ver más
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Imágenes */}
          {update.images.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={imageUrl}
                      alt={`Actualización ${update.title} - Imagen ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                      unoptimized
                      onError={(e) => {
                        console.error('Error cargando imagen:', imageUrl);
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.backgroundColor = '#f3f4f6';
                        target.style.display = 'flex';
                        target.style.alignItems = 'center';
                        target.style.justifyContent = 'center';
                        target.innerHTML = '<span style="color: #6b7280; font-size: 14px;">Error al cargar imagen</span>';
                      }}
                      onClick={() => {
                        const actualIndex = update.images.indexOf(imageUrl);
                        setSelectedImageIndex(actualIndex);
                        setIsImageModalOpen(true);
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                          Ver imagen
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {hasMoreImages && !showAllImages && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllImages(true)}
                  className="mt-3"
                >
                  Ver {update.images.length - 3} imagen{update.images.length - 3 > 1 ? 'es' : ''} más
                </Button>
              )}
              
              {hasMoreImages && showAllImages && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllImages(false)}
                  className="mt-3"
                >
                  Ver menos imágenes
                </Button>
              )}
            </div>
          )}

          {/* Videos */}
          {update.videos.length > 0 && (
            <div className="mb-4">
              {update.videos.map((videoUrl, index) => (
                <div key={index} className="relative">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full max-h-96 rounded-lg border"
                    preload="metadata"
                  >
                    Tu navegador no soporta el elemento video.
                  </video>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de imágenes */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={update.images}
        currentIndex={selectedImageIndex}
        title={update.title}
        description={update.content}
      />
    </div>
  );
}

// Componente principal del timeline
export function UpdatesTimeline({ 
  campaignId, 
  isOwner = false, 
  showPrivate = false,
  onEdit,
  onDelete 
}: UpdatesTimelineProps) {
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Cargar actualizaciones
  const fetchUpdates = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
      });

      if (showPrivate && isOwner) {
        // No agregar filtro isPublic para ver todas
      } else {
        params.append('isPublic', 'true');
      }

      const response = await fetch(`/api/campaigns/${campaignId}/updates?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las actualizaciones');
      }

      const data = await response.json();
      
      if (append) {
        setUpdates(prev => [...prev, ...data.updates]);
      } else {
        setUpdates(data.updates);
      }
      
      setHasMore(data.pagination.hasNext);
      setPage(pageNum);
      setError(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [campaignId, showPrivate, isOwner]);

  useEffect(() => {
    fetchUpdates(1, false);
  }, [campaignId, showPrivate, fetchUpdates]);

  // Cargar más actualizaciones
  const loadMore = () => {
    fetchUpdates(page + 1, true);
  };

  // Manejar eliminación de actualización
  const handleDelete = async (updateId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta actualización?')) {
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/updates/${updateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la actualización');
      }

      // Actualizar la lista local
      setUpdates(prev => prev.filter(update => update.id !== updateId));
      
      if (onDelete) {
        onDelete(updateId);
      }

    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar la actualización');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="relative">
            <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="absolute left-4 top-8 w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
            <Card className="ml-12 mb-6">
              <CardHeader>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchUpdates(1, false)} variant="outline">
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="space-y-6">
        {/* Título de la sección */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Actualizaciones de la campaña
              </h2>
              <p className="text-gray-600">
                Sigue el progreso y los últimos desarrollos de esta campaña
              </p>
            </div>
            {isOwner && (
              <Link href={`/my-campaigns/${campaignId}/updates/create`}>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Actualización
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay actualizaciones aún
            </h3>
            <p className="text-gray-600 mb-4">
              {isOwner 
                ? 'Sé el primero en compartir una actualización sobre el progreso de tu campaña.'
                : 'El creador de esta campaña aún no ha compartido actualizaciones.'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Título de la sección */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Actualizaciones de la campaña
            </h2>
            <p className="text-gray-600">
              Sigue el progreso y los últimos desarrollos de esta campaña
            </p>
          </div>
          {isOwner && (
            <Link href={`/my-campaigns/${campaignId}/updates/create`}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Actualización
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Timeline de actualizaciones */}
      <div className="relative">
        {updates.map((update) => (
          <UpdateItem
            key={update.id}
            update={update}
            isOwner={isOwner}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        ))}
        
        {/* Línea final del timeline */}
        {updates.length > 0 && (
          <div className="absolute left-4 bottom-0 w-4 h-4 bg-gray-300 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Botón cargar más */}
      {hasMore && (
        <div className="text-center pt-6">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            {loadingMore ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700 mr-2"></div>
                Cargando...
              </div>
            ) : (
              'Cargar más actualizaciones'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
