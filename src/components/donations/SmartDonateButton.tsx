'use client';

import { DonateButton } from './DonateButton';
import { MockDonateButton } from './MockDonateButton';

// Configuración para alternar entre pago real y ficticio
const USE_MOCK_PAYMENT = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_PAYMENT === 'true';

interface SmartDonateButtonProps {
  campaign: {
    id: string;
    title: string;
    goalAmount: number;
    currentAmount: number;
    currency?: string;
    status?: string;
    creator?: {
      id: string;
      firstName: string;
      lastName: string;
      organizationName?: string;
    };
  };
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showIcon?: boolean;
  onDonationSuccess?: (donationData: any) => void;
}

export function SmartDonateButton(props: SmartDonateButtonProps) {
  if (USE_MOCK_PAYMENT) {
    // Usar componente de pago ficticio
    return (
      <MockDonateButton
        campaign={{
          id: props.campaign.id,
          title: props.campaign.title,
          goalAmount: props.campaign.goalAmount,
          currentAmount: props.campaign.currentAmount,
        }}
        variant={props.variant}
        size={props.size}
        className={props.className}
        showIcon={props.showIcon}
        onDonationSuccess={props.onDonationSuccess}
      />
    );
  }

  // Usar componente de pago real (Stripe)
  if (!props.campaign.currency || !props.campaign.status || !props.campaign.creator) {
    console.warn('SmartDonateButton: Missing required fields for real payment. Using mock payment instead.');
    return (
      <MockDonateButton
        campaign={{
          id: props.campaign.id,
          title: props.campaign.title,
          goalAmount: props.campaign.goalAmount,
          currentAmount: props.campaign.currentAmount,
        }}
        variant={props.variant}
        size={props.size}
        className={props.className}
        showIcon={props.showIcon}
        onDonationSuccess={props.onDonationSuccess}
      />
    );
  }

  return (
    <DonateButton
      campaign={{
        id: props.campaign.id,
        title: props.campaign.title,
        goalAmount: props.campaign.goalAmount,
        currentAmount: props.campaign.currentAmount,
        currency: props.campaign.currency,
        status: props.campaign.status,
        creator: props.campaign.creator,
      }}
      variant={props.variant}
      size={props.size}
      className={props.className}
      showIcon={props.showIcon}
      onDonationSuccess={(donationId: string) => {
        if (props.onDonationSuccess) {
          props.onDonationSuccess({ id: donationId, type: 'real' });
        }
      }}
    />
  );
}


