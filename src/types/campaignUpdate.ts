import { UpdateType } from '@/lib/validations/campaignUpdate';

// Interfaz base para actualización de campaña
export interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  type: UpdateType;
  images: string[];
  videos: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  campaignId: string;
  authorId: string;
  // Relaciones
  author: {
    id: string;
    firstName: string;
    lastName: string | null;
    organizationName: string | null;
    avatar: string | null;
  };
}

// Interfaz para crear actualización (frontend)
export interface CreateCampaignUpdateData {
  title: string;
  content: string;
  type: UpdateType;
  isPublic: boolean;
  images?: File[];
  videos?: File[];
}

// Interfaz para crear actualización (backend)
export interface CreateCampaignUpdateBackendData {
  title: string;
  content: string;
  type: UpdateType;
  isPublic: boolean;
  campaignId: string;
  authorId: string;
  images?: string[];
  videos?: string[];
}

// Interfaz para actualizar actualización
export interface UpdateCampaignUpdateData {
  id: string;
  title?: string;
  content?: string;
  type?: UpdateType;
  isPublic?: boolean;
  images?: File[];
  videos?: File[];
}

// Interfaz para respuesta de API
export interface CampaignUpdateResponse {
  update: CampaignUpdate;
  message: string;
}

// Interfaz para listado de actualizaciones
export interface CampaignUpdatesResponse {
  updates: CampaignUpdate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Interfaz para filtros de actualizaciones
export interface CampaignUpdateFilters {
  page?: number;
  limit?: number;
  type?: UpdateType;
  isPublic?: boolean;
  search?: string;
}

// Interfaz para estadísticas de actualizaciones
export interface CampaignUpdateStats {
  total: number;
  byType: {
    [key in UpdateType]: number;
  };
  recent: number; // Actualizaciones en los últimos 30 días
}

// Constantes para configuración
export const CAMPAIGN_UPDATE_CONSTANTS = {
  MAX_TITLE_LENGTH: 100,
  MIN_TITLE_LENGTH: 3,
  MAX_CONTENT_LENGTH: 5000,
  MIN_CONTENT_LENGTH: 10,
  MAX_IMAGES: 5,
  MAX_VIDEOS: 1,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 10 * 1024 * 1024, // 10MB
  ITEMS_PER_PAGE: 10,
} as const;
