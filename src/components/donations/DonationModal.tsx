'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DonationForm } from './DonationForm';

interface Campaign {
  id: string;
  title: string;
  goalAmount: number;
  currentAmount: number;
  currency: string;
  creator: {
    firstName: string;
    lastName: string;
    organizationName?: string;
  };
}

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  onSuccess?: (donationId: string) => void;
}

export function DonationModal({ 
  isOpen, 
  onClose, 
  campaign, 
  onSuccess 
}: DonationModalProps) {
  const handleSuccess = (donationId: string) => {
    if (onSuccess) {
      onSuccess(donationId);
    }
    // No cerramos el modal automáticamente para mostrar el mensaje de éxito
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="sr-only">
            Realizar donación a {campaign.title}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <DonationForm
            campaign={campaign}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DonationModal;