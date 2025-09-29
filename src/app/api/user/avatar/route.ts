import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const uploadSchema = z.object({
  file: z.any().refine(
    (file) => file instanceof File,
    'Debe ser un archivo válido'
  ).refine(
    (file) => file.size <= MAX_FILE_SIZE,
    'El archivo debe ser menor a 5MB'
  ).refine(
    (file) => ALLOWED_TYPES.includes(file.type),
    'Solo se permiten imágenes (JPEG, PNG, WebP)'
  ),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Avatar upload started');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', session.user.id);
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.log('❌ No file in formData');
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    console.log('✅ File received:', { name: file.name, size: file.size, type: file.type });

    // Validar el archivo
    console.log('🔍 Validating file...');
    const validation = uploadSchema.safeParse({ file });
    if (!validation.success) {
      console.log('❌ File validation failed:', validation.error.errors);
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    console.log('✅ File validation passed');

    // Crear directorio si no existe
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    console.log('📁 Upload directory:', uploadDir);
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log('✅ Directory ready');
    } catch (error) {
      console.log('⚠️ Directory error (may already exist):', error);
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${session.user.id}-${timestamp}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);
    console.log('📝 File path:', filePath);

    // Guardar el archivo
    console.log('💾 Saving file...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    console.log('✅ File saved successfully');

    // URL pública del archivo
    const avatarUrl = `/uploads/avatars/${fileName}`;
    console.log('🔗 Avatar URL:', avatarUrl);

    // Actualizar el usuario en la base de datos
    console.log('🗄️ Updating database...');
    console.log('User ID to update:', session.user.id);
    
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
      },
    });
    console.log('✅ Database updated successfully');

    return NextResponse.json({
      message: 'Avatar actualizado exitosamente',
      user: updatedUser,
      avatarUrl,
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Eliminar el avatar del usuario (establecer como null)
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      message: 'Avatar eliminado exitosamente',
      user: updatedUser,
    });

  } catch (error) {
    console.error('Error deleting avatar:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}