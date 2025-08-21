'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Target,
  Users,
  CheckCircle,
  Star,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface CampaignStatsData {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    verifiedCampaigns: number;
    featuredCampaigns: number;
    recentCampaigns: number;
    completedCampaigns: number;
    pausedCampaigns: number;
    cancelledCampaigns: number;
  };
  distribution: {
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byCategory: Array<{
      categoryId: string;
      categoryName: string;
      categoryColor?: string;
      count: number;
    }>;
  };
  growth: Array<{
    month: string;
    count: number;
    totalGoal: number;
    totalRaised: number;
  }>;
  topCampaigns: {
    byRaised: Array<{
      id: string;
      title: string;
      currentAmount: number;
      goalAmount: number;
      status: string;
      creatorName: string;
      creatorType: string;
      categoryName: string;
      categoryColor?: string;
      progress: number;
    }>;
    byDonations: Array<{
      id: string;
      title: string;
      currentAmount: number;
      goalAmount: number;
      status: string;
      donationCount: number;
      creatorName: string;
      creatorType: string;
      categoryName: string;
      categoryColor?: string;
    }>;
    withHighestProgress: Array<{
      id: string;
      title: string;
      currentAmount: number;
      goalAmount: number;
      progress: number;
    }>;
  };
  financials: {
    totalGoalAmount: number;
    totalRaisedAmount: number;
    averageGoalAmount: number;
    averageRaisedAmount: number;
    totalDonations: number;
    totalDonationAmount: number;
    averageDonationAmount: number;
  };
}

export function CampaignStats() {
  const [stats, setStats] = useState<CampaignStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/campaigns/stats');
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PAUSED': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {error}</div>
      </div>
    );
  }

  const activePercentage = Math.round((stats.overview.activeCampaigns / stats.overview.totalCampaigns) * 100);
  const verifiedPercentage = Math.round((stats.overview.verifiedCampaigns / stats.overview.totalCampaigns) * 100);
  const completionRate = Math.round((stats.overview.completedCampaigns / stats.overview.totalCampaigns) * 100);
  const overallProgress = Math.round((stats.financials.totalRaisedAmount / stats.financials.totalGoalAmount) * 100);

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campañas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalCampaigns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.overview.recentCampaigns} en los últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campañas Activas</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.activeCampaigns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {activePercentage}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.verifiedCampaigns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {verifiedPercentage}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destacadas</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.featuredCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.overview.featuredCampaigns / stats.overview.totalCampaigns) * 100)}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas financieras */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Objetivo</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.financials.totalGoalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Objetivo total de todas las campañas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.financials.totalRaisedAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {overallProgress}% del objetivo total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donaciones Totales</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.financials.totalDonations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: {formatCurrency(stats.financials.averageDonationAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.overview.completedCampaigns} campañas completadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por estado y tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribución por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.distribution.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(status)}>
                      {status === 'ACTIVE' ? 'Activas' :
                       status === 'DRAFT' ? 'Borrador' :
                       status === 'COMPLETED' ? 'Completadas' :
                       status === 'PAUSED' ? 'Pausadas' :
                       status === 'CANCELLED' ? 'Canceladas' : status}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{count}</span>
                    <span className="text-gray-500 ml-1">
                      ({Math.round((count / stats.overview.totalCampaigns) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribución por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.distribution.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {type === 'DONATION' ? 'Donación' : 'Crowdfunding'}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{count}</span>
                    <span className="text-gray-500 ml-1">
                      ({Math.round((count / stats.overview.totalCampaigns) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top categorías */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Top Categorías
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.distribution.byCategory.slice(0, 10).map((category, index) => (
              <div key={category.categoryId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{category.categoryName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{category.count}</div>
                  <div className="text-xs text-gray-500">campañas</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top campañas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Top por Recaudación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCampaigns.byRaised.slice(0, 5).map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{campaign.title}</div>
                      <div className="text-xs text-gray-500">
                        por {campaign.creatorName} • {campaign.categoryName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(campaign.currentAmount)}</div>
                    <div className="text-xs text-gray-500">{campaign.progress.toFixed(1)}% completado</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Top por Donaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCampaigns.byDonations.slice(0, 5).map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{campaign.title}</div>
                      <div className="text-xs text-gray-500">
                        por {campaign.creatorName} • {campaign.categoryName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{campaign.donationCount}</div>
                    <div className="text-xs text-gray-500">donaciones</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campañas con mayor progreso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Campañas con Mayor Progreso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topCampaigns.withHighestProgress.slice(0, 5).map((campaign, index) => (
              <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{campaign.title}</div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(campaign.currentAmount)} de {formatCurrency(campaign.goalAmount)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600">{campaign.progress.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
