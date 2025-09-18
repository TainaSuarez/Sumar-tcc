import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const resolvedParams = await params;
    const { filename } = resolvedParams;

    // Validar que el filename no contenga caracteres peligrosos
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: 'Nombre de archivo inválido' },
        { status: 400 }
      );
    }

    // Construir la ruta del archivo
    const filePath = path.join(process.cwd(), 'public/uploads/updates/videos', filename);

    // Verificar que el archivo existe
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'Archivo no encontrado' },
        { status: 404 }
      );
    }

    // Leer el archivo
    const fileBuffer = await fs.readFile(filePath);

    // Determinar el tipo de contenido basado en la extensión
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.mp4':
        contentType = 'video/mp4';
        break;
      case '.webm':
        contentType = 'video/webm';
        break;
      case '.ogg':
        contentType = 'video/ogg';
        break;
      case '.avi':
        contentType = 'video/x-msvideo';
        break;
    }

    // Devolver el archivo con los headers apropiados
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('Error sirviendo video de actualización:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}