'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MockPaymentForm } from './MockPaymentForm';

interface MockDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    title: string;
    goalAmount: number;
    currentAmount: number;
  };
  onSuccess?: (donationData: any) => void;
}

export function MockDonationModal({ 
  isOpen, 
  onClose, 
  campaign, 
  onSuccess 
}: MockDonationModalProps) {
  
  const handleSuccess = (donationData: any) => {
    // Llamar al callback de éxito si existe
    if (onSuccess) {
      onSuccess(donationData);
    }
    
    // Cerrar el modal después de un delay para mostrar el éxito
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Realizar Donación</DialogTitle>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          <MockPaymentForm
            campaign={campaign}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}


