'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, CreditCard } from 'lucide-react';
import { DonationModal } from './DonationModal';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  title: string;
  goalAmount: number;
  currentAmount: number;
  currency: string;
  status: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
  };
}

interface DonateButtonProps {
  campaign: Campaign;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showIcon?: boolean;
  onDonationSuccess?: (donationId: string) => void;
}

export function DonateButton({
  campaign,
  variant = 'default',
  size = 'default',
  className = '',
  showIcon = true,
  onDonationSuccess
}: DonateButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleDonateClick = () => {
    // Verificar si la campaña está disponible para donaciones
    if (campaign.status !== 'ACTIVE' && campaign.status !== 'PENDING') {
      toast.error('Esta campaña no está disponible para donaciones');
      return;
    }

    // Verificar si el usuario está autenticado
    if (!session) {
      toast.error('Debes iniciar sesión para realizar una donación');
      router.push('/auth/login');
      return;
    }

    // Verificar si el usuario no es el creador de la campaña
    if (session.user?.id === campaign.creator.id) {
      toast.error('No puedes donar a tu propia campaña');
      return;
    }

    setIsModalOpen(true);
  };

  const handleDonationSuccess = (donationId: string) => {
    if (onDonationSuccess) {
      onDonationSuccess(donationId);
    }
    
    // Cerrar el modal después de un breve delay para mostrar el mensaje de éxito
    setTimeout(() => {
      setIsModalOpen(false);
    }, 3000);
  };

  const isDisabled = campaign.status !== 'ACTIVE' && campaign.status !== 'PENDING';

  return (
    <>
      <Button
        onClick={handleDonateClick}
        variant={variant}
        size={size}
        className={`${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isDisabled}
      >
        {showIcon && (
          <Heart className="w-4 h-4 mr-2" />
        )}
        {size === 'sm' ? 'Donar' : 'Realizar Donación'}
      </Button>

      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={campaign}
        onSuccess={handleDonationSuccess}
      />
    </>
  );
}

export default DonateButton;