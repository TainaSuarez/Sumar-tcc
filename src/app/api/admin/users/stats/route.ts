import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function GET() {
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

    // Obtener estadísticas generales
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      recentUsers,
      usersByType,
      usersByRole,
      usersWithCampaigns,
      usersWithDonations
    ] = await Promise.all([
      // Total de usuarios
      prisma.user.count(),
      
      // Usuarios activos
      prisma.user.count({ where: { isActive: true } }),
      
      // Usuarios verificados
      prisma.user.count({ where: { isVerified: true } }),
      
      // Usuarios registrados en los últimos 30 días
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Usuarios por tipo
      prisma.user.groupBy({
        by: ['userType'],
        _count: { userType: true }
      }),
      
      // Usuarios por rol
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),
      
      // Usuarios con campañas
      prisma.user.count({
        where: {
          campaigns: {
            some: {}
          }
        }
      }),
      
      // Usuarios que han donado
      prisma.user.count({
        where: {
          donations: {
            some: {}
          }
        }
      })
    ]);

    // Estadísticas de crecimiento por mes (últimos 12 meses)
    const monthlyGrowth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*)::int as count
      FROM users 
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    // Top usuarios por actividad
    const topUsersByCampaigns = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        organizationName: true,
        email: true,
        userType: true,
        _count: {
          select: {
            campaigns: true
          }
        }
      },
      orderBy: {
        campaigns: {
          _count: 'desc'
        }
      },
      take: 10,
      where: {
        campaigns: {
          some: {}
        }
      }
    });

    const topUsersByDonations = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        organizationName: true,
        email: true,
        userType: true,
        donations: {
          select: {
            amount: true
          },
          where: {
            status: 'COMPLETED'
          }
        }
      },
      take: 10,
      where: {
        donations: {
          some: {
            status: 'COMPLETED'
          }
        }
      }
    }).then(users => 
      users
        .map(user => ({
          ...user,
          totalDonated: user.donations.reduce((sum, donation) => sum + Number(donation.amount), 0),
          donationCount: user.donations.length
        }))
        .sort((a, b) => b.totalDonated - a.totalDonated)
    );

    // Usuarios inactivos (sin login en 90 días)
    const inactiveUsers = await prisma.user.count({
      where: {
        OR: [
          { lastLoginAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
          { lastLoginAt: null }
        ]
      }
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        recentUsers,
        inactiveUsers,
        usersWithCampaigns,
        usersWithDonations
      },
      distribution: {
        byType: usersByType.reduce((acc, item) => {
          acc[item.userType] = item._count.userType;
          return acc;
        }, {} as Record<string, number>),
        byRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count.role;
          return acc;
        }, {} as Record<string, number>)
      },
      growth: monthlyGrowth,
      topUsers: {
        byCampaigns: topUsersByCampaigns.map(user => ({
          id: user.id,
          name: user.organizationName || `${user.firstName} ${user.lastName || ''}`.trim(),
          email: user.email,
          type: user.userType,
          campaignCount: user._count.campaigns
        })),
        byDonations: topUsersByDonations.map(user => ({
          id: user.id,
          name: user.organizationName || `${user.firstName} ${user.lastName || ''}`.trim(),
          email: user.email,
          type: user.userType,
          totalDonated: user.totalDonated,
          donationCount: user.donationCount
        }))
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

