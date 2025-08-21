'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  DollarSign, 
  MessageSquare, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'campaign' | 'donation' | 'comment' | 'update';
  action: string;
  title: string;
  details: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface UserActivityData {
  user: {
    id: string;
    email: string;
    name: string;
  };
  activities: ActivityItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    campaigns: number;
    donations: number;
    comments: number;
    updates: number;
  };
}

interface UserActivityProps {
  userId: string;
}

export function UserActivity({ userId }: UserActivityProps) {
  const [data, setData] = useState<UserActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/activity?page=${currentPage}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Error al cargar actividad del usuario');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [userId, currentPage]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'campaign': return <TrendingUp className="h-4 w-4" />;
      case 'donation': return <DollarSign className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'update': return <FileText className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'campaign': return 'text-blue-600 bg-blue-100';
      case 'donation': return 'text-green-600 bg-green-100';
      case 'comment': return 'text-purple-600 bg-purple-100';
      case 'update': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = (activity: ActivityItem) => {
    if (activity.type === 'campaign' && activity.details.status) {
      return <Badge variant="outline">{activity.details.status}</Badge>;
    }
    if (activity.type === 'donation' && activity.details.status) {
      return <Badge variant="outline">{activity.details.status}</Badge>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <Button onClick={fetchActivity}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de actividad */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{data.summary.campaigns}</div>
                <p className="text-xs text-muted-foreground">Campañas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{data.summary.donations}</div>
                <p className="text-xs text-muted-foreground">Donaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{data.summary.comments}</div>
                <p className="text-xs text-muted-foreground">Comentarios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{data.summary.updates}</div>
                <p className="text-xs text-muted-foreground">Actualizaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de actividad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad de {data.user.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.activities.map((activity) => (
              <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{activity.title}</p>
                      
                      {activity.type === 'comment' && activity.details.content && (
                        <p className="text-sm text-gray-600 mt-1">
                          &quot;{activity.details.content}...&quot;
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {activity.type === 'campaign' ? 'Campaña' :
                           activity.type === 'donation' ? 'Donación' :
                           activity.type === 'comment' ? 'Comentario' :
                           'Actualización'}
                        </Badge>
                        {getStatusBadge(activity)}
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(activity.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {data.activities.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No se encontró actividad para este usuario
              </div>
            )}
          </div>

          {/* Paginación */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Mostrando {((data.pagination.page - 1) * data.pagination.limit) + 1} - {Math.min(data.pagination.page * data.pagination.limit, data.pagination.totalCount)} de {data.pagination.totalCount} actividades
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={!data.pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <span className="text-sm px-4">
                  Página {data.pagination.page} de {data.pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!data.pagination.hasNext}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

