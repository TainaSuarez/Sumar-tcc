'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Heart, TrendingUp, Clock, DollarSign } from 'lucide-react';

interface Donor {
  id: string;
  amount: number;
  currency: string;
  donorName?: string;
  isAnonymous: boolean;
  createdAt: string;
  donor?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface CampaignDonorsProps {
  campaignId: string;
  recentDonors: Donor[];
  topDonors: Donor[];
  totalDonors: number;
  totalAmount: number;
  currency?: string;
}

export function CampaignDonors({
  campaignId,
  recentDonors,
  topDonors,
  totalDonors,
  totalAmount,
  currency = 'UYU',
}: CampaignDonorsProps) {
  const [showTopDonors, setShowTopDonors] = useState(false);

  const displayedDonors = showTopDonors ? topDonors : recentDonors;

  const formatCurrency = (amount: number, curr: string = currency) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
      }
      return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else {
      return date.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' });
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'A'; // Anonymous
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  const getDonorName = (donor: Donor) => {
    if (donor.isAnonymous) {
      return 'Donante Anónimo';
    }
    if (donor.donor) {
      return `${donor.donor.firstName} ${donor.donor.lastName || ''}`.trim();
    }
    return donor.donorName || 'Donante';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">
              {showTopDonors ? 'Mayores Donadores' : 'Donaciones Recientes'}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="donor-switch" className="text-sm text-gray-600 cursor-pointer">
              {showTopDonors ? (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Mayores
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Recientes
                </span>
              )}
            </Label>
            <Switch
              id="donor-switch"
              checked={showTopDonors}
              onCheckedChange={setShowTopDonors}
            />
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-700">
              <Heart className="h-4 w-4" />
              <span className="text-xs font-medium">Total Donadores</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{totalDonors}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-700">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Total Recaudado</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {displayedDonors.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {showTopDonors
                ? 'Aún no hay donaciones para mostrar'
                : 'Sé el primero en apoyar esta campaña'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedDonors.map((donor, index) => (
              <div
                key={donor.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all"
              >
                {/* Posición para top donors */}
                {showTopDonors && (
                  <div className="flex-shrink-0">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400'
                            : index === 1
                            ? 'bg-gray-100 text-gray-700 ring-2 ring-gray-400'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-400'
                            : 'bg-blue-50 text-blue-700'
                        }
                      `}
                    >
                      {index + 1}
                    </div>
                  </div>
                )}

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={donor.donor?.avatar} />
                  <AvatarFallback className={donor.isAnonymous ? 'bg-gray-200' : 'bg-blue-100'}>
                    {getInitials(donor.donor?.firstName, donor.donor?.lastName)}
                  </AvatarFallback>
                </Avatar>

                {/* Información del donador */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {getDonorName(donor)}
                    </p>
                    {donor.isAnonymous && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        Anónimo
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {showTopDonors
                      ? formatDate(donor.createdAt)
                      : formatDate(donor.createdAt)}
                  </p>
                </div>

                {/* Monto */}
                <div className="flex-shrink-0">
                  <p className="font-bold text-green-600">
                    {formatCurrency(donor.amount, donor.currency)}
                  </p>
                </div>
              </div>
            ))}

            {/* Mensaje si hay más donadores */}
            {totalDonors > 5 && (
              <div className="text-center py-2">
                <p className="text-xs text-gray-500">
                  {showTopDonors
                    ? `Mostrando los 5 mayores de ${totalDonors} donadores`
                    : `Mostrando las últimas 5 de ${totalDonors} donaciones`}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
