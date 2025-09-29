'use client';

import { useState } from 'react';
import { Heart, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MockDonationModal } from './MockDonationModal';
import { cn } from '@/lib/utils';

interface MockDonateButtonProps {
  campaign: {
    id: string;
    title: string;
    goalAmount: number;
    currentAmount: number;
  };
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showIcon?: boolean;
  onDonationSuccess?: (donationData: any) => void;
}

export function MockDonateButton({
  campaign,
  variant = 'default',
  size = 'default',
  className = '',
  showIcon = true,
  onDonationSuccess
}: MockDonateButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDonationSuccess = (donationData: any) => {
    console.log('Donación simulada exitosa:', donationData);
    
    // Llamar al callback si existe
    if (onDonationSuccess) {
      onDonationSuccess(donationData);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={cn(
          'font-medium transition-all duration-200',
          variant === 'default' && 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl',
          className
        )}
      >
        {showIcon && (
          <Heart className={cn(
            'mr-2',
            size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
          )} />
        )}
        Donar Ahora
        <CreditCard className={cn(
          'ml-2',
          size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
        )} />
      </Button>

      <MockDonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={campaign}
        onSuccess={handleDonationSuccess}
      />
    </>
  );
}


