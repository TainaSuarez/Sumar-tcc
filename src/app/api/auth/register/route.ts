import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { registerSchema } from '@/lib/validations/auth';
import { UserRole, UserType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = registerSchema.parse(body);

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        organizationName: validatedData.organizationName,
        email: validatedData.email,
        password: hashedPassword,
        userType: validatedData.userType as UserType,
        role: UserRole.USER,
        isActive: true,
        isVerified: false, // Requerirá verificación por email
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        organizationName: true,
        email: true,
        userType: true,
        role: true,
        isVerified: true,
        createdAt: true,
      }
    });

    // TODO: Enviar email de verificación
    // await sendVerificationEmail(user.email, user.id);

    return NextResponse.json(
      {
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationName: user.organizationName,
          email: user.email,
          userType: user.userType,
          isVerified: user.isVerified,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en registro:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}