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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || '';
    const isVerified = searchParams.get('isVerified');
    const isFeatured = searchParams.get('isFeatured');
    const urgencyLevel = searchParams.get('urgencyLevel');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    const skip = (page - 1) * limit;

    // Construir filtros
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

    // Obtener campañas con paginación
    const [campaigns, totalCount] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              organizationName: true,
              avatar: true,
              userType: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          subcategory: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              donations: true,
              comments: true,
              updates: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.campaign.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error al obtener campañas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const { campaignId, updates } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'ID de campaña requerido' },
        { status: 400 }
      );
    }

    // Validar que la campaña existe
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar campaña
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: updates,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            organizationName: true,
            avatar: true,
            userType: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        subcategory: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            donations: true,
            comments: true,
            updates: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Campaña actualizada exitosamente',
      campaign: updatedCampaign
    });

  } catch (error) {
    console.error('Error al actualizar campaña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { action, campaignIds, updates } = body;

    if (!action || !campaignIds || !Array.isArray(campaignIds)) {
      return NextResponse.json(
        { error: 'Acción y IDs de campañas requeridos' },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'bulk_update':
        if (!updates) {
          return NextResponse.json(
            { error: 'Actualizaciones requeridas para bulk_update' },
            { status: 400 }
          );
        }
        result = await prisma.campaign.updateMany({
          where: { id: { in: campaignIds } },
          data: updates
        });
        break;
      
      case 'bulk_activate':
        result = await prisma.campaign.updateMany({
          where: { id: { in: campaignIds } },
          data: { status: 'ACTIVE' }
        });
        break;
      
      case 'bulk_pause':
        result = await prisma.campaign.updateMany({
          where: { id: { in: campaignIds } },
          data: { status: 'PAUSED' }
        });
        break;
      
      case 'bulk_verify':
        result = await prisma.campaign.updateMany({
          where: { id: { in: campaignIds } },
          data: { isVerified: true }
        });
        break;
      
      case 'bulk_unverify':
        result = await prisma.campaign.updateMany({
          where: { id: { in: campaignIds } },
          data: { isVerified: false }
        });
        break;
      
      case 'bulk_feature':
        result = await prisma.campaign.updateMany({
          where: { id: { in: campaignIds } },
          data: { isFeatured: true }
        });
        break;
      
      case 'bulk_unfeature':
        result = await prisma.campaign.updateMany({
          where: { id: { in: campaignIds } },
          data: { isFeatured: false }
        });
        break;
      
      case 'bulk_cancel':
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
      affectedRows: result.count
    });

  } catch (error) {
    console.error('Error en acción masiva:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
