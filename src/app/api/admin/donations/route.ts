import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Esquema de validación para los parámetros de consulta
const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional().default(''),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  sortBy: z.enum(['createdAt', 'amount', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const validatedParams = querySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    const page = parseInt(validatedParams.page);
    const limit = parseInt(validatedParams.limit);
    const offset = (page - 1) * limit;

    // Construir filtros de búsqueda
    const searchFilter = validatedParams.search
      ? {
          OR: [
            {
              donor: {
                OR: [
                  { firstName: { contains: validatedParams.search, mode: 'insensitive' as const } },
                  { lastName: { contains: validatedParams.search, mode: 'insensitive' as const } },
                  { email: { contains: validatedParams.search, mode: 'insensitive' as const } },
                  { organizationName: { contains: validatedParams.search, mode: 'insensitive' as const } },
                ]
              }
            },
            {
              campaign: {
                title: { contains: validatedParams.search, mode: 'insensitive' as const }
              }
            },
            { id: { contains: validatedParams.search, mode: 'insensitive' as const } }
          ]
        }
      : {};

    const statusFilter = validatedParams.status
      ? { status: validatedParams.status }
      : {};

    const whereClause = {
      ...searchFilter,
      ...statusFilter,
    };

    // Obtener donaciones con paginación
    const [donations, totalCount] = await Promise.all([
      prisma.donation.findMany({
        where: whereClause,
        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              organizationName: true,
            }
          },
          campaign: {
            select: {
              id: true,
              title: true,
              slug: true,
            }
          }
        },
        orderBy: {
          [validatedParams.sortBy]: validatedParams.sortOrder
        },
        skip: offset,
        take: limit,
      }),
      prisma.donation.count({ where: whereClause })
    ]);

    // Calcular estadísticas
    const stats = await prisma.donation.aggregate({
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
      _avg: {
        amount: true,
      },
      where: whereClause,
    });

    const statusStats = await prisma.donation.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
      where: whereClause,
    });

    // Procesar estadísticas por estado
    const statusCounts = statusStats.reduce((acc, stat) => {
      acc[stat.status] = {
        count: stat._count.id,
        amount: stat._sum.amount || 0,
      };
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    const donationsStats = {
      total: stats._count.id || 0,
      completed: statusCounts.COMPLETED?.count || 0,
      pending: statusCounts.PENDING?.count || 0,
      failed: statusCounts.FAILED?.count || 0,
      totalAmount: stats._sum.amount || 0,
      completedAmount: statusCounts.COMPLETED?.amount || 0,
      averageDonation: stats._avg.amount || 0,
    };

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      donations,
      stats: donationsStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Error en GET /api/admin/donations:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}