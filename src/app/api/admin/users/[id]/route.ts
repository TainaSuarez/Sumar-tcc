import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // Obtener usuario con detalles completos
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        campaigns: {
          select: {
            id: true,
            title: true,
            status: true,
            goalAmount: true,
            currentAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        donations: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
            campaign: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            campaign: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            campaigns: true,
            donations: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Calcular estadísticas adicionales
    const donationStats = await prisma.donation.aggregate({
      where: { 
        donorId: userId,
        status: 'COMPLETED'
      },
      _sum: { amount: true },
      _avg: { amount: true },
      _count: true
    });

    const campaignStats = await prisma.campaign.aggregate({
      where: { creatorId: userId },
      _sum: { 
        currentAmount: true,
        goalAmount: true,
        viewCount: true
      },
      _count: true
    });

    // Formatear respuesta sin contraseña
    const userDetails = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationName: user.organizationName,
      userType: user.userType,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      address: user.address,
      city: user.city,
      country: user.country,
      isVerified: user.isVerified,
      isActive: user.isActive,
      emailVerifiedAt: user.emailVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      campaigns: user.campaigns,
      donations: user.donations,
      comments: user.comments,
      stats: {
        campaigns: {
          total: user._count.campaigns,
          totalRaised: campaignStats._sum.currentAmount || 0,
          totalGoal: campaignStats._sum.goalAmount || 0,
          totalViews: campaignStats._sum.viewCount || 0
        },
        donations: {
          total: user._count.donations,
          totalAmount: donationStats._sum.amount || 0,
          averageAmount: donationStats._avg.amount || 0,
          completedCount: donationStats._count
        },
        comments: user._count.comments
      }
    };

    return NextResponse.json({ user: userDetails });

  } catch (error) {
    console.error('Error al obtener detalles del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const updates = await request.json();

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
      bio: updatedUser.bio,
      phone: updatedUser.phone,
      address: updatedUser.address,
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

