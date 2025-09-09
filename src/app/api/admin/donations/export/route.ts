import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Esquema de validación para los parámetros de consulta
const querySchema = z.object({
  search: z.string().optional().default(''),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
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
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || undefined,
    });

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

    // Obtener todas las donaciones para exportar
    const donations = await prisma.donation.findMany({
      where: whereClause,
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            organizationName: true,
            userType: true,
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
        createdAt: 'desc'
      },
    });

    // Generar CSV
    const csvHeaders = [
      'ID Donación',
      'Donante',
      'Email Donante',
      'Tipo Donante',
      'Campaña',
      'Monto',
      'Moneda',
      'Estado',
      'Método de Pago',
      'Fecha Creación',
      'Fecha Actualización'
    ];

    const csvRows = donations.map(donation => [
      donation.id,
      donation.donor.organizationName || `${donation.donor.firstName} ${donation.donor.lastName}`,
      donation.donor.email,
      donation.donor.userType,
      donation.campaign.title,
      donation.amount.toString(),
      donation.currency,
      donation.status,
      donation.paymentMethod,
      new Date(donation.createdAt).toLocaleString('es-ES'),
      new Date(donation.updatedAt).toLocaleString('es-ES')
    ]);

    // Escapar comillas y comas en CSV
    const escapeCsvField = (field: string) => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    const csvContent = [
      csvHeaders.map(escapeCsvField).join(','),
      ...csvRows.map(row => row.map(field => escapeCsvField(field.toString())).join(','))
    ].join('\n');

    // Configurar headers para descarga
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv; charset=utf-8');
    headers.set('Content-Disposition', `attachment; filename="donaciones_${new Date().toISOString().split('T')[0]}.csv"`);

    // Agregar BOM para UTF-8 (para Excel)
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error en GET /api/admin/donations/export:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}