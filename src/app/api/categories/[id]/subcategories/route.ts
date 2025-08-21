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

    // Las subcategorías son públicas para usuarios registrados
    // Solo se requiere autenticación, no permisos de admin

    const resolvedParams = await params;
    const categoryId = resolvedParams.id;

    // Obtener subcategorías de la categoría
    const subcategories = await prisma.subcategory.findMany({
      where: { categoryId },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      subcategories: subcategories.filter(sub => sub.isActive)
    });

  } catch (error) {
    console.error('Error al obtener subcategorías:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

