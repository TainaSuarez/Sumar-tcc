export interface Campaign {
  id: string;
  title: string;
  goalAmount: number;
  currentAmount: number;
  currency: string;
  status: string;
  creator: {
    id?: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
  };
}

export interface DonationFormProps {
  campaign: Campaign;
  onSuccess?: (donationId: string) => void;
  onCancel?: () => void;
}

export interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  onSuccess?: (donationId: string) => void;
}

export interface DonateButtonProps {
  campaign: Campaign;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showIcon?: boolean;
  onDonationSuccess?: (donationId: string) => void;
}

export interface DonationData {
  id: string;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  campaign: {
    id: string;
    title: string;
    slug: string;
  };
  donor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface PaymentIntentResponse {
  clientSecret: string;
  donationId: string;
}

export interface ConfirmDonationRequest {
  donationId: string;
  paymentIntentId: string;
}

export interface CreatePaymentIntentRequest {
  campaignId: string;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
}