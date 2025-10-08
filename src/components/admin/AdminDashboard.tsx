'use client';

import React, { useState, useEffect } from 'react';
import { StatCard } from './StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Megaphone,
  CreditCard,
  DollarSign,
  TrendingUp,
  Activity,
  Eye,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface AdminStats {
  overview: {
    totalUsers: number;
    totalCampaigns: number;
    totalDonations: number;
    totalDonationAmount: number;
    activeCampaigns: number;
    completedCampaigns: number;
    pendingDonations: number;
    completedDonations: number;
  };
  growth: {
    users: {
      total: number;
      recent: number;
      percentage: string;
    };
    campaigns: {
      total: number;
      recent: number;
      percentage: string;
    };
  };
  charts: {
    usersByType: Array<{ type: string; count: number }>;
    campaignsByStatus: Array<{ status: string; count: number }>;
    donationsByMonth: Array<{ month: string; count: number; total: number }>;
    topCategories: Array<{ 
      id: string; 
      name: string; 
      campaignCount: number; 
      color: string;
    }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const statusColors: Record<string, string> = {
  'ACTIVE': '#10b981',
  'DRAFT': '#f59e0b',
  'COMPLETED': '#3b82f6',
  'PAUSED': '#ef4444',
  'CANCELLED': '#6b7280'
};

const statusLabels: Record<string, string> = {
  'ACTIVE': 'Activas',
  'DRAFT': 'Borrador',
  'COMPLETED': 'Completadas',
  'PAUSED': 'Pausadas',
  'CANCELLED': 'Canceladas'
};

const typeLabels: Record<string, string> = {
  'INDIVIDUAL': 'Individuales',
  'ORGANIZATION': 'Organizaciones'
};

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('🔍 Iniciando carga de estadísticas...');
      
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies de sesión
      });
      
      console.log('📡 Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en la respuesta:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      setStats(data);
    } catch (err) {
      console.error('❌ Error en fetchStats:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Usuarios"
          value={stats.overview.totalUsers}
          description="Usuarios registrados"
          icon={Users}
          trend={{
            value: parseFloat(stats.growth.users.percentage),
            label: "últimos 7 días",
            isPositive: parseFloat(stats.growth.users.percentage) >= 0
          }}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />

        <StatCard
          title="Campañas Activas"
          value={stats.overview.activeCampaigns}
          description={`${stats.overview.totalCampaigns} campañas totales`}
          icon={Megaphone}
          trend={{
            value: parseFloat(stats.growth.campaigns.percentage),
            label: "últimos 7 días",
            isPositive: parseFloat(stats.growth.campaigns.percentage) >= 0
          }}
          iconColor="text-green-600"
          bgColor="bg-green-50"
        />

        <StatCard
          title="Total Donaciones"
          value={stats.overview.totalDonations}
          description={`${stats.overview.completedDonations} completadas`}
          icon={CreditCard}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
        />

        <StatCard
          title="Monto Recaudado"
          value={formatCurrency(stats.overview.totalDonationAmount)}
          description="Total recaudado"
          icon={DollarSign}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Gráficos y estadísticas detalladas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Usuarios por tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuarios por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.charts.usersByType.map(item => ({
                      name: typeLabels[item.type] || item.type,
                      value: item.count
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.charts.usersByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Campañas por estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Campañas por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.charts.campaignsByStatus.map(item => ({
                  name: statusLabels[item.status] || item.status,
                  value: item.count,
                  fill: statusColors[item.status] || '#8884d8'
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donaciones por mes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Donaciones por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.charts.donationsByMonth.map(item => ({
                  month: formatDate(item.month),
                  count: item.count,
                  total: item.total
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'count' ? value : formatCurrency(Number(value)),
                      name === 'count' ? 'Donaciones' : 'Monto'
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="count" />
                  <Line yAxisId="right" type="monotone" dataKey="total" stroke="#82ca9d" name="total" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top categorías */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Categorías Más Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.charts.topCategories.slice(0, 5).map((category, index) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-gray-500">
                        {category.campaignCount} campañas
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: category.color + '20',
                      color: category.color,
                      borderColor: category.color + '40'
                    }}
                  >
                    {category.campaignCount}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Campañas Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.completedCampaigns}</div>
            <p className="text-xs text-gray-500">
              {((stats.overview.completedCampaigns / stats.overview.totalCampaigns) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Donaciones Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.pendingDonations}</div>
            <p className="text-xs text-gray-500">
              Requieren procesamiento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tasa de Éxito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats.overview.completedDonations / stats.overview.totalDonations) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">
              Donaciones completadas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
