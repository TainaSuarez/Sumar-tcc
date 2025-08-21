import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleFileUpload, getPublicImageUrl } from '@/lib/services/uploadService';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Procesar el archivo subido
    const uploadResult = await handleFileUpload(request);
    
    if (uploadResult.error) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 400 }
      );
    }

    if (!uploadResult.file) {
      return NextResponse.json(
        { error: 'No se recibió ningún archivo' },
        { status: 400 }
      );
    }

    // Generar URL pública
    const publicUrl = getPublicImageUrl(uploadResult.file.filename);

    return NextResponse.json({
      message: 'Imagen subida exitosamente',
      url: publicUrl,
      filename: uploadResult.file.filename,
      size: uploadResult.file.size,
      type: uploadResult.file.mimetype
    });

  } catch (error) {
    console.error('Error en POST /api/upload:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
