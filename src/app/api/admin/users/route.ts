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
    const role = searchParams.get('role') || '';
    const userType = searchParams.get('userType') || '';
    const isActive = searchParams.get('isActive');
    const isVerified = searchParams.get('isVerified');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const skip = (page - 1) * limit;

    // Construir filtros
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { organizationName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (userType) {
      where.userType = userType;
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    if (isVerified !== null) {
      where.isVerified = isVerified === 'true';
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

    // Obtener usuarios con paginación
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: {
            select: {
              campaigns: true,
              donations: true,
              comments: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    // Formatear respuesta sin incluir contraseñas
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationName: user.organizationName,
      userType: user.userType,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      city: user.city,
      country: user.country,
      isVerified: user.isVerified,
      isActive: user.isActive,
      emailVerifiedAt: user.emailVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        campaigns: user._count.campaigns,
        donations: user._count.donations,
        comments: user._count.comments
      }
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      users: formattedUsers,
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
    console.error('Error al obtener usuarios:', error);
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
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Validar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
      include: {
        _count: {
          select: {
            campaigns: true,
            donations: true,
            comments: true
          }
        }
      }
    });

    // Formatear respuesta sin contraseña
    const formattedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      organizationName: updatedUser.organizationName,
      userType: updatedUser.userType,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone,
      city: updatedUser.city,
      country: updatedUser.country,
      isVerified: updatedUser.isVerified,
      isActive: updatedUser.isActive,
      emailVerifiedAt: updatedUser.emailVerifiedAt,
      lastLoginAt: updatedUser.lastLoginAt,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      stats: {
        campaigns: updatedUser._count.campaigns,
        donations: updatedUser._count.donations,
        comments: updatedUser._count.comments
      }
    };

    return NextResponse.json({
      message: 'Usuario actualizado exitosamente',
      user: formattedUser
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
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
    const { action, userIds, updates } = body;

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'Acción y IDs de usuarios requeridos' },
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
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: updates
        });
        break;
      
      case 'bulk_activate':
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: true }
        });
        break;
      
      case 'bulk_deactivate':
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: false }
        });
        break;
      
      case 'bulk_verify':
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isVerified: true }
        });
        break;
      
      case 'bulk_unverify':
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isVerified: false }
        });
        break;
      
      case 'bulk_make_moderator':
        result = await prisma.user.updateMany({
          where: { 
            id: { in: userIds },
            role: { not: UserRole.ADMIN }
          },
          data: { role: UserRole.MODERATOR }
        });
        break;
      
      case 'bulk_remove_moderator':
        result = await prisma.user.updateMany({
          where: { 
            id: { in: userIds },
            role: UserRole.MODERATOR
          },
          data: { role: UserRole.USER }
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
