import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre debe tener máximo 50 caracteres').optional(),
  lastName: z.string().min(1, 'El apellido es requerido').max(50, 'El apellido debe tener máximo 50 caracteres').optional(),
  organizationName: z.string().max(100, 'El nombre de la organización debe tener máximo 100 caracteres').optional(),
  bio: z.string().max(500, 'La biografía debe tener máximo 500 caracteres').optional(),
  phone: z.string().max(20, 'El teléfono debe tener máximo 20 caracteres').optional(),
  address: z.string().max(200, 'La dirección debe tener máximo 200 caracteres').optional(),
  city: z.string().max(100, 'La ciudad debe tener máximo 100 caracteres').optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        firstName: true,
        lastName: true,
        organizationName: true,
        bio: true,
        phone: true,
        address: true,
        city: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, organizationName, bio, phone, address, city } = validation.data;

    // Construir el nombre completo si se proporcionan firstName y lastName
    let updateData: any = {
      firstName,
      lastName,
      organizationName,
      bio,
      phone,
      address,
      city,
    };

    // Si se actualizan firstName o lastName, actualizar también el campo name
    if (firstName !== undefined || lastName !== undefined) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { firstName: true, lastName: true }
      });

      const newFirstName = firstName !== undefined ? firstName : currentUser?.firstName || '';
      const newLastName = lastName !== undefined ? lastName : currentUser?.lastName || '';
      
      updateData.name = `${newFirstName} ${newLastName}`.trim();
    }

    // Filtrar campos undefined
    updateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        firstName: true,
        lastName: true,
        organizationName: true,
        bio: true,
        phone: true,
        address: true,
        city: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser,
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}