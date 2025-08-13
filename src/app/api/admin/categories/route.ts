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
    const includeStats = searchParams.get('includeStats') === 'true';

    let categories;

    if (includeStats) {
      categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              campaigns: true,
              subcategories: true
            }
          },
          subcategories: {
            include: {
              _count: {
                select: {
                  campaigns: true
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      });
    } else {
      categories = await prisma.category.findMany({
        include: {
          subcategories: true
        },
        orderBy: { name: 'asc' }
      });
    }

    return NextResponse.json({
      categories
    });

  } catch (error) {
    console.error('Error al obtener categorías:', error);
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
    const { name, description, icon, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre de la categoría es requerido' },
        { status: 400 }
      );
    }

    // Verificar que no exista una categoría con el mismo nombre
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con este nombre' },
        { status: 400 }
      );
    }

    // Crear nueva categoría
    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
        icon,
        color
      },
      include: {
        _count: {
          select: {
            campaigns: true,
            subcategories: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Categoría creada exitosamente',
      category: newCategory
    });

  } catch (error) {
    console.error('Error al crear categoría:', error);
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
    const { categoryId, updates } = body;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'ID de categoría requerido' },
        { status: 400 }
      );
    }

    // Validar que la categoría existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Si se está actualizando el nombre, verificar que no exista otra categoría con el mismo nombre
    if (updates.name && updates.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findUnique({
        where: { name: updates.name }
      });

      if (duplicateCategory) {
        return NextResponse.json(
          { error: 'Ya existe una categoría con este nombre' },
          { status: 400 }
        );
      }
    }

    // Actualizar categoría
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updates,
      include: {
        _count: {
          select: {
            campaigns: true,
            subcategories: true
          }
        },
        subcategories: {
          include: {
            _count: {
              select: {
                campaigns: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Categoría actualizada exitosamente',
      category: updatedCategory
    });

  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const categoryId = searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'ID de categoría requerido' },
        { status: 400 }
      );
    }

    // Verificar que la categoría existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            campaigns: true
          }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que no haya campañas asociadas
    if (existingCategory._count.campaigns > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la categoría porque tiene campañas asociadas' },
        { status: 400 }
      );
    }

    // Eliminar categoría
    await prisma.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({
      message: 'Categoría eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
