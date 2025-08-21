import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea administrador
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || '';
    const isVerified = searchParams.get('isVerified');
    const isFeatured = searchParams.get('isFeatured');
    const urgencyLevel = searchParams.get('urgencyLevel');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const limit = parseInt(searchParams.get('limit') || '1000'); // Límite máximo para IDs

    // Construir filtros (misma lógica que el endpoint principal)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { creator: { 
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { organizationName: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ];
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.categoryId = category;
    }

    if (type) {
      where.type = type;
    }

    if (isVerified !== null) {
      where.isVerified = isVerified === 'true';
    }

    if (isFeatured !== null) {
      where.isFeatured = isFeatured === 'true';
    }

    if (urgencyLevel) {
      where.urgencyLevel = parseInt(urgencyLevel);
    }

    // Filtros de fecha
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Filtros de montos
    if (minAmount || maxAmount) {
      where.goalAmount = {};
      if (minAmount) {
        where.goalAmount.gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        where.goalAmount.lte = parseFloat(maxAmount);
      }
    }

    // Obtener solo IDs y información básica
    const campaigns = await prisma.campaign.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        type: true,
        isVerified: true,
        isFeatured: true,
        goalAmount: true,
        currentAmount: true,
        createdAt: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            organizationName: true
          }
        },
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    const totalCount = await prisma.campaign.count({ where });

    // Formatear respuesta con información útil para selección
    const campaignOptions = campaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      status: campaign.status,
      type: campaign.type,
      isVerified: campaign.isVerified,
      isFeatured: campaign.isFeatured,
      goalAmount: campaign.goalAmount,
      currentAmount: campaign.currentAmount,
      createdAt: campaign.createdAt,
      creatorName: campaign.creator.organizationName || 
                   `${campaign.creator.firstName} ${campaign.creator.lastName || ''}`.trim(),
      categoryName: campaign.category.name,
      progress: Number(campaign.goalAmount) > 0 ? 
                (Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100 : 0
    }));

    return NextResponse.json({
      campaigns: campaignOptions,
      totalCount,
      filters: {
        search,
        status,
        category,
        type,
        isVerified,
        isFeatured,
        urgencyLevel,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount
      }
    });

  } catch (error) {
    console.error('Error al obtener IDs de campañas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea administrador
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, filters } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Acción requerida' },
        { status: 400 }
      );
    }

    // Construir filtros basados en los criterios proporcionados
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (filters) {
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { creator: { 
            OR: [
              { firstName: { contains: filters.search, mode: 'insensitive' } },
              { lastName: { contains: filters.search, mode: 'insensitive' } },
              { organizationName: { contains: filters.search, mode: 'insensitive' } }
            ]
          }}
        ];
      }

      if (filters.status) where.status = filters.status;
      if (filters.category) where.categoryId = filters.category;
      if (filters.type) where.type = filters.type;
      if (filters.isVerified !== undefined) where.isVerified = filters.isVerified;
      if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
      if (filters.urgencyLevel) where.urgencyLevel = filters.urgencyLevel;

      // Filtros de fecha
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
        if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
      }

      // Filtros de montos
      if (filters.minAmount || filters.maxAmount) {
        where.goalAmount = {};
        if (filters.minAmount) where.goalAmount.gte = parseFloat(filters.minAmount);
        if (filters.maxAmount) where.goalAmount.lte = parseFloat(filters.maxAmount);
      }
    }

    // Obtener IDs de campañas que coinciden con los filtros
    const campaigns = await prisma.campaign.findMany({
      where,
      select: { id: true }
    });

    const campaignIds = campaigns.map(c => c.id);

    // Ejecutar acción masiva en todas las campañas que coinciden
    let result;
    switch (action) {
      case 'select_all_filtered':
        return NextResponse.json({
          message: 'IDs obtenidos exitosamente',
          campaignIds,
          count: campaignIds.length
        });

      case 'bulk_activate_filtered':
        result = await prisma.campaign.updateMany({
          where: { id: { in: campaignIds } },
          data: { status: 'ACTIVE' }
        });
        break;

      case 'bulk_pause_filtered':
        result = await prisma.campaign.updateMany({
          where: { id: { in: campaignIds } },
          data: { status: 'PAUSED' }
        });
        break;

      case 'bulk_verify_filtered':
        result = await prisma.campaign.updateMany({
          where: { id: { in: campaignIds } },
          data: { isVerified: true }
        });
        break;

      case 'bulk_unverify_filtered':
        result = await prisma.campaign.updateMany({
          where: { id: { in: campaignIds } },
          data: { isVerified: false }
        });
        break;

      case 'bulk_feature_filtered':
        result = await prisma.campaign.updateMany({
          where: { id: { in: campaignIds } },
          data: { isFeatured: true }
        });
        break;

      case 'bulk_unfeature_filtered':
        result = await prisma.campaign.updateMany({
          where: { id: { in: campaignIds } },
          data: { isFeatured: false }
        });
        break;

      case 'bulk_cancel_filtered':
        result = await prisma.campaign.updateMany({
          where: { id: { in: campaignIds } },
          data: { status: 'CANCELLED' }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Acción ${action} ejecutada exitosamente`,
      affectedRows: result?.count || 0,
      campaignIds
    });

  } catch (error) {
    console.error('Error en acción masiva por filtros:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
