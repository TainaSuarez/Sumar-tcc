import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().max(50, 'El nombre debe tener máximo 50 caracteres').optional(),
  lastName: z.string().max(50, 'El apellido debe tener máximo 50 caracteres').optional(),
  organizationName: z.string().max(100, 'El nombre de la organización debe tener máximo 100 caracteres').optional(),
  bio: z.string().max(500, 'La biografía debe tener máximo 500 caracteres').optional(),
  phone: z.string().max(20, 'El teléfono debe tener máximo 20 caracteres').optional(),
  address: z.string().max(200, 'La dirección debe tener máximo 200 caracteres').optional(),
  city: z.string().max(100, 'La ciudad debe tener máximo 100 caracteres').optional(),
  avatar: z.string().optional(),
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
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
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
    console.log('🔵 Profile update started');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', session.user.id);
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.errors);
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed');
    const { firstName, lastName, organizationName, bio, phone, address, city, avatar } = validation.data;

    // Construir el objeto de actualización
    let updateData: any = {
      firstName,
      lastName,
      organizationName,
      bio,
      phone,
      address,
      city,
      avatar,
    };

    console.log('📝 Update data before filtering:', updateData);

    // Filtrar campos undefined
    updateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    console.log('📝 Final update data:', updateData);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        organizationName: true,
        bio: true,
        phone: true,
        address: true,
        city: true,
        createdAt: true,
      },
    });

    console.log('✅ User updated successfully:', updatedUser);

    return NextResponse.json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser,
    });

  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}