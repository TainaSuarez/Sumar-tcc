import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { createCampaignSchema } from '@/lib/validations/campaign';
import { CampaignService } from '@/lib/services/campaignService';
import { handleMultipleFileUpload, getPublicImageUrl } from '@/lib/services/uploadService';
import { CampaignStatus } from '@prisma/client';
import { prisma } from '@/lib/db';

/**
 * POST /api/campaigns
 * Crea una nueva campaña
 */
export async function POST(request: NextRequest) {
  console.log('🚀 [API] Iniciando creación de campaña');
  
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ [API] Usuario no autenticado');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('✅ [API] Usuario autenticado:', session.user.id);

    // Procesar FormData y archivos
    const uploadResult = await handleMultipleFileUpload(request);

    console.log('📁 [API] Resultado del upload:', {
      hasError: !!uploadResult.error,
      filesCount: uploadResult.files?.length || 0,
      fieldsReceived: Object.keys(uploadResult.fields || {}),
      error: uploadResult.error || 'ninguno'
    });

    if (uploadResult.error) {
      console.log('❌ [API] Error en upload:', uploadResult.error);
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 400 }
      );
    }

    const { fields, files } = uploadResult;

    console.log('📋 [API] Campos recibidos:', {
      title: fields.title,
      categoryId: fields.categoryId,
      goalAmount: fields.goalAmount,
      shortDescription: fields.shortDescription?.substring(0, 50) + '...',
      description: fields.description?.substring(0, 50) + '...',
    });

    console.log('🖼️ [API] Archivos procesados:', files.map(f => ({
      filename: f.filename,
      originalName: f.originalName,
      size: f.size,
    })));

    // Validar campos básicos
    const formDataSchema = z.object({
      title: z.string().min(1, 'El título es requerido'),
      categoryId: z.string().min(1, 'La categoría es requerida'),
      goalAmount: z.string().min(1, 'La meta de recaudación es requerida'),
      shortDescription: z.string().min(1, 'La descripción corta es requerida'),
      description: z.string().min(1, 'La descripción es requerida'),
    });

    const validation = formDataSchema.safeParse(fields);
    if (!validation.success) {
      console.log('❌ [API] Error de validación de campos:', validation.error.issues);
      
      // Limpiar archivos subidos si hay error
      if (files.length > 0) {
        const { deleteMultipleUploadedFiles } = await import('@/lib/services/uploadService');
        await deleteMultipleUploadedFiles(files.map(f => f.filename));
        console.log('🧹 [API] Archivos limpiados después de error de validación');
      }
      
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Convertir goalAmount a número
    const goalAmount = parseFloat(fields.goalAmount);
    if (isNaN(goalAmount) || goalAmount <= 0) {
      console.log('❌ [API] Meta de recaudación inválida:', fields.goalAmount);
      
      // Limpiar archivos subidos si hay error
      if (files.length > 0) {
        const { deleteMultipleUploadedFiles } = await import('@/lib/services/uploadService');
        await deleteMultipleUploadedFiles(files.map(f => f.filename));
        console.log('🧹 [API] Archivos limpiados después de error de meta');
      }
      
      return NextResponse.json(
        { error: 'La meta de recaudación debe ser un número válido mayor a 0' },
        { status: 400 }
      );
    }

    console.log('💰 [API] Meta de recaudación válida:', goalAmount);

    // Verificar que la categoría existe y está activa
    const category = await prisma.category.findUnique({
      where: { id: fields.categoryId },
    });

    if (!category) {
      console.log('❌ [API] Categoría no encontrada:', fields.categoryId);
      
      // Limpiar archivos subidos si hay error
      if (files.length > 0) {
        const { deleteMultipleUploadedFiles } = await import('@/lib/services/uploadService');
        await deleteMultipleUploadedFiles(files.map(f => f.filename));
        console.log('🧹 [API] Archivos limpiados después de error de categoría');
      }
      
      return NextResponse.json(
        { error: 'La categoría seleccionada no existe' },
        { status: 400 }
      );
    }

    if (!category.isActive) {
      console.log('❌ [API] Categoría inactiva:', fields.categoryId);
      
      // Limpiar archivos subidos si hay error
      if (files.length > 0) {
        const { deleteMultipleUploadedFiles } = await import('@/lib/services/uploadService');
        await deleteMultipleUploadedFiles(files.map(f => f.filename));
        console.log('🧹 [API] Archivos limpiados después de error de categoría inactiva');
      }
      
      return NextResponse.json(
        { error: 'La categoría seleccionada no está disponible' },
        { status: 400 }
      );
    }

    console.log('✅ [API] Categoría válida:', category.name);

    // Preparar URLs de las imágenes
    const imageUrls = files.map(file => getPublicImageUrl(file.filename));
    console.log('🔗 [API] URLs de imágenes generadas:', imageUrls);

    // Preparar datos para crear la campaña
    const campaignData = {
      title: fields.title,
      categoryId: fields.categoryId,
      goalAmount,
      shortDescription: fields.shortDescription,
      description: fields.description,
      creatorId: session.user.id,
      images: imageUrls,
    };

    console.log('📝 [API] Datos preparados para crear campaña:', {
      ...campaignData,
      description: campaignData.description.substring(0, 50) + '...',
      shortDescription: campaignData.shortDescription.substring(0, 50) + '...',
    });

    // Validar datos con el esquema completo (omitir coverImage y additionalImages ya que se manejan por separado)
    const finalValidation = createCampaignSchema.omit({ coverImage: true, additionalImages: true }).safeParse({
      title: campaignData.title,
      categoryId: campaignData.categoryId,
      goalAmount: campaignData.goalAmount,
      shortDescription: campaignData.shortDescription,
      description: campaignData.description,
    });

    if (!finalValidation.success) {
      console.log('❌ [API] Error de validación final:', finalValidation.error.issues);
      
      // Limpiar archivos subidos si hay error
      if (files.length > 0) {
        const { deleteMultipleUploadedFiles } = await import('@/lib/services/uploadService');
        await deleteMultipleUploadedFiles(files.map(f => f.filename));
        console.log('🧹 [API] Archivos limpiados después de error de validación final');
      }
      
      return NextResponse.json(
        {
          error: 'Datos de campaña inválidos',
          details: finalValidation.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.log('✅ [API] Validación final exitosa');

    // Crear la campaña
    console.log('🔄 [API] Iniciando creación de campaña en base de datos...');
    const campaign = await CampaignService.create(campaignData);
    console.log('✅ [API] Campaña creada exitosamente:', {
      id: campaign.id,
      title: campaign.title,
      slug: campaign.slug,
      imagesCount: campaign.images?.length || 0,
    });

    // Respuesta exitosa
    return NextResponse.json(
      {
        message: 'Campaña creada exitosamente',
        campaign: {
          id: campaign.id,
          title: campaign.title,
          slug: campaign.slug,
          shortDescription: campaign.shortDescription,
          goalAmount: campaign.goalAmount,
          currentAmount: campaign.currentAmount,
          currency: campaign.currency,
          status: campaign.status,
          images: campaign.images,
          category: campaign.category,
          creator: campaign.creator,
          createdAt: campaign.createdAt,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('💥 [API] Error en POST /api/campaigns:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Error específico de validación o negocio
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Error genérico del servidor
    return NextResponse.json(
      { error: 'Error interno del servidor. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/campaigns
 * Obtiene campañas con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
      const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Máx. 50 por página
  const categoryId = searchParams.get('categoryId');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const creatorId = searchParams.get('creatorId');
  const isFeatured = searchParams.get('isFeatured');

    const { prisma } = await import('@/lib/db');

    // Construir filtros
    const where: Record<string, unknown> = {};

    // Si no se especifica creatorId, solo mostrar campañas activas por defecto
    if (!creatorId) {
      where.status = CampaignStatus.ACTIVE;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status && Object.values(CampaignStatus).includes(status as CampaignStatus)) {
      where.status = status as CampaignStatus;
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    if (isFeatured !== null) {
      where.isFeatured = isFeatured === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
        { creator: { firstName: { contains: search, mode: 'insensitive' } } },
        { creator: { lastName: { contains: search, mode: 'insensitive' } } },
        { creator: { organizationName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Obtener campañas
    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              organizationName: true,
            },
          },
          _count: {
            select: {
              donations: true,
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    return NextResponse.json({
      campaigns: campaigns.map(campaign => {
        // Parsear las imágenes de JSON string a array
        let images: string[] = [];
        if (campaign.images) {
          try {
            images = JSON.parse(campaign.images);
          } catch (error) {
            console.error('Error parsing images JSON for campaign:', campaign.id, error);
            images = [];
          }
        }

        return {
          id: campaign.id,
          title: campaign.title,
          slug: campaign.slug,
          shortDescription: campaign.shortDescription,
          goalAmount: campaign.goalAmount,
          currentAmount: campaign.currentAmount,
          currency: campaign.currency,
          status: campaign.status,
          images: images,
          category: campaign.category,
          creator: campaign.creator,
          donationCount: campaign._count.donations,
          isFeatured: campaign.isFeatured,
          createdAt: campaign.createdAt,
          updatedAt: campaign.updatedAt,
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Error en GET /api/campaigns:', error);
    return NextResponse.json(
      { error: 'Error al obtener las campañas' },
      { status: 500 }
    );
  }
}
