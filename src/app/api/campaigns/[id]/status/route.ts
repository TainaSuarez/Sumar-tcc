import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CampaignService } from '@/lib/services/campaignService';
import { CampaignStatus } from '@prisma/client';

interface UpdateStatusRequest {
  status: CampaignStatus;
}

/**
 * PATCH /api/campaigns/[id]/status
 * Actualiza el estado de una campaña
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id: campaignId } = resolvedParams;
    
    // Obtener y validar datos del request
    const body: UpdateStatusRequest = await request.json();
    const { status } = body;

    // Validar que el estado sea válido
    const validStatuses = Object.values(CampaignStatus);
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado de campaña inválido' },
        { status: 400 }
      );
    }

    // Actualizar el estado de la campaña
    const updatedCampaign = await CampaignService.updateStatus(
      campaignId,
      status,
      session.user.id
    );

    return NextResponse.json({
      message: 'Estado actualizado exitosamente',
      campaign: {
        id: updatedCampaign.id,
        status: updatedCampaign.status,
        updatedAt: updatedCampaign.updatedAt,
      },
    });

  } catch (error) {
    console.error('Error en PATCH /api/campaigns/[id]/status:', error);

    // Error específico de permisos o no encontrado
    if (error instanceof Error) {
      if (error.message.includes('no encontrada')) {
        return NextResponse.json(
          { error: 'Campaña no encontrada' },
          { status: 404 }
        );
      }
      if (error.message.includes('permisos')) {
        return NextResponse.json(
          { error: 'No tienes permisos para actualizar esta campaña' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Error genérico del servidor
    return NextResponse.json(
      { error: 'Error interno del servidor. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}

