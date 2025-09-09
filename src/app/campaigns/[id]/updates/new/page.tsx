import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CreateUpdatePage } from '@/components/features/campaigns/CreateUpdatePage';

interface CreateUpdatePageProps {
  params: Promise<{ id: string }>;
}

export default async function NewUpdatePage({ params }: { params: { id: string } }) {
  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const resolvedParams = await params;
  const campaignId = resolvedParams.id;

  // Obtener información de la campaña
  const campaign = await CampaignService.getById(campaignId);
  if (!campaign) {
    redirect('/campaigns');
  }

  // Verificar que el usuario es el propietario
  if (campaign.creator.id !== session.user.id) {
    redirect(`/campaigns/${campaignId}`);
  }

  return (
    <CreateUpdatePage 
      campaignId={campaignId} 
      campaignTitle={campaign.title} 
    />
  );
}

export async function generateMetadata({ params }: CreateUpdatePageProps) {
  const resolvedParams = await params;
  const campaignId = resolvedParams.id;
  
  const campaign = await CampaignService.getById(campaignId);
  
  return {
    title: campaign ? `Nueva Actualización - ${campaign.title}` : 'Nueva Actualización',
    description: 'Crea una nueva actualización para tu campaña',
  };
}