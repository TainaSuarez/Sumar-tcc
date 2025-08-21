import { type Campaign as PrismaCampaign, type CampaignStatus, type CampaignType } from '@prisma/client';

// Tipos base de campaña
export interface Campaign extends PrismaCampaign {
  category: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    firstName: string;
    lastName: string | null;
    organizationName: string | null;
  };
  _count?: {
    donations: number;
  };
}

// Interface para crear una campaña (formulario frontend)
export interface CreateCampaignInput {
  title: string;
  categoryId: string;
  goalAmount: number;
  shortDescription: string;
  description: string;
  coverImage?: File;
  additionalImages?: File[];
}

// Interface para crear una campaña (backend con creatorId)
export interface CreateCampaignData extends Omit<CreateCampaignInput, 'coverImage' | 'additionalImages'> {
  creatorId: string;
  coverImage?: File;
  additionalImages?: File[];
  imageFilename?: string; // Compatibilidad hacia atrás
  images?: string[]; // URLs de imágenes procesadas
}

// Interface para actualizar una campaña
export interface UpdateCampaignInput {
  id: string;
  title?: string;
  categoryId?: string;
  goalAmount?: number;
  shortDescription?: string;
  description?: string;
  status?: CampaignStatus;
  coverImage?: File;
}

// Interface para respuesta de la API al crear/obtener campaña
export interface CampaignResponse {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  goalAmount: number;
  currentAmount: number;
  currency: string;
  status: CampaignStatus;
  type: CampaignType;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    firstName: string;
    lastName: string | null;
    organizationName: string | null;
  };
  donationCount?: number;
  isFeatured: boolean;
  isVerified: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para filtros de búsqueda de campañas
export interface CampaignFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: CampaignStatus;
  search?: string;
  creatorId?: string;
  isFeatured?: boolean;
  isVerified?: boolean;
}

// Interface para respuesta paginada de campañas
export interface CampaignsResponse {
  campaigns: CampaignResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos para estadísticas de campaña
export interface CampaignStats {
  totalDonations: number;
  totalAmount: number;
  donorCount: number;
  averageDonation: number;
  progressPercentage: number;
  daysRemaining?: number;
  recentDonations: Array<{
    id: string;
    amount: number;
    donorName?: string;
    isAnonymous: boolean;
    createdAt: Date;
  }>;
}

// Enum para estados de campaña (para uso en frontend)
export const CampaignStatusLabels: Record<CampaignStatus, string> = {
  DRAFT: 'Borrador',
  ACTIVE: 'Activa',
  PAUSED: 'Pausada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

// Enum para tipos de campaña (para uso en frontend)
export const CampaignTypeLabels: Record<CampaignType, string> = {
  DONATION: 'Donación',
  CROWDFUNDING: 'Crowdfunding',
};

// Colores para estados de campaña (para uso en UI)
export const CampaignStatusColors: Record<CampaignStatus, string> = {
  DRAFT: 'text-gray-600 bg-gray-100',
  ACTIVE: 'text-green-600 bg-green-100',
  PAUSED: 'text-yellow-600 bg-yellow-100',
  COMPLETED: 'text-blue-600 bg-blue-100',
  CANCELLED: 'text-red-600 bg-red-100',
};
