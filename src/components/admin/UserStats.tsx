'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  Shield, 
  UserPlus, 
  TrendingUp,
  Award,
  DollarSign,
  Activity
} from 'lucide-react';

interface UserStatsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    recentUsers: number;
    inactiveUsers: number;
    usersWithCampaigns: number;
    usersWithDonations: number;
  };
  distribution: {
    byType: Record<string, number>;
    byRole: Record<string, number>;
  };
  growth: Array<{
    month: string;
    count: number;
  }>;
  topUsers: {
    byCampaigns: Array<{
      id: string;
      name: string;
      email: string;
      type: string;
      campaignCount: number;
    }>;
    byDonations: Array<{
      id: string;
      name: string;
      email: string;
      type: string;
      totalDonated: number;
      donationCount: number;
    }>;
  };
}

export function UserStats() {
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users/stats');
      
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
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

  const activePercentage = Math.round((stats.overview.activeUsers / stats.overview.totalUsers) * 100);
  const verifiedPercentage = Math.round((stats.overview.verifiedUsers / stats.overview.totalUsers) * 100);

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.overview.recentUsers} en los últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {activePercentage}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Verificados</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.verifiedUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {verifiedPercentage}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Usuarios</CardTitle>
            <UserPlus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.recentUsers}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas de actividad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Campañas</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.usersWithCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.overview.usersWithCampaigns / stats.overview.totalUsers) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Han Donado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.usersWithDonations}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.overview.usersWithDonations / stats.overview.totalUsers) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Inactivos</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.inactiveUsers}</div>
            <p className="text-xs text-muted-foreground">
              Sin actividad en 90 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución de usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.distribution.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {type === 'INDIVIDUAL' ? 'Individual' : 'Organización'}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{count}</span>
                    <span className="text-gray-500 ml-1">
                      ({Math.round((count / stats.overview.totalUsers) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Rol</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.distribution.byRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={
                        role === 'ADMIN' ? 'border-red-200 text-red-800' :
                        role === 'MODERATOR' ? 'border-yellow-200 text-yellow-800' :
                        'border-green-200 text-green-800'
                      }
                    >
                      {role === 'ADMIN' ? 'Administrador' : 
                       role === 'MODERATOR' ? 'Moderador' : 'Usuario'}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{count}</span>
                    <span className="text-gray-500 ml-1">
                      ({Math.round((count / stats.overview.totalUsers) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-600" />
              Top Creadores de Campañas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topUsers.byCampaigns.slice(0, 5).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{user.campaignCount}</div>
                    <div className="text-xs text-gray-500">campañas</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Top Donantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topUsers.byDonations.slice(0, 5).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">${user.totalDonated.toLocaleString()} UYU</div>
                    <div className="text-xs text-gray-500">{user.donationCount} donaciones</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


