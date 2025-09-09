'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Eye, Download, Filter, CreditCard, TrendingUp, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Donation {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  donor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    organizationName?: string;
  };
  campaign: {
    id: string;
    title: string;
    slug: string;
  };
}

interface DonationsStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalAmount: number;
  completedAmount: number;
  averageDonation: number;
}

interface DonationsResponse {
  donations: Donation[];
  stats: DonationsStats;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function DonationsManagement() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DonationsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/donations?${params}`);
      if (!response.ok) {
        throw new Error('Error al cargar donaciones');
      }

      const data: DonationsResponse = await response.json();
      setDonations(data.donations);
      setStats(data.stats);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las donaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { label: 'Completada', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      PENDING: { label: 'Pendiente', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      FAILED: { label: 'Fallida', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      REFUNDED: { label: 'Reembolsada', variant: 'outline' as const, className: 'bg-gray-100 text-gray-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'UYU') => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const exportDonations = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter,
        export: 'true',
      });

      const response = await fetch(`/api/admin/donations/export?${params}`);
      if (!response.ok) {
        throw new Error('Error al exportar donaciones');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `donaciones_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Donaciones exportadas exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al exportar las donaciones');
    }
  };

  if (loading && !donations.length) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donaciones</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completed} completadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.completedAmount)} completado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donación Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.averageDonation)}</div>
              <p className="text-xs text-muted-foreground">
                Por donación completada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                {stats.failed} fallidas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Donaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por donante, campaña o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="COMPLETED">Completadas</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="FAILED">Fallidas</SelectItem>
                <SelectItem value="REFUNDED">Reembolsadas</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportDonations} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Tabla de donaciones */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donante</TableHead>
                  <TableHead>Campaña</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {donation.donor.organizationName || 
                           `${donation.donor.firstName} ${donation.donor.lastName}`}
                        </div>
                        <div className="text-sm text-gray-500">{donation.donor.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{donation.campaign.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(donation.amount, donation.currency)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(donation.status)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{donation.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(donation.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDonation(donation)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <Dialog open={!!selectedDonation} onOpenChange={() => setSelectedDonation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Donación</DialogTitle>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Información del Donante</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nombre:</strong> {selectedDonation.donor.organizationName || 
                      `${selectedDonation.donor.firstName} ${selectedDonation.donor.lastName}`}</p>
                    <p><strong>Email:</strong> {selectedDonation.donor.email}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Información de la Donación</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>ID:</strong> {selectedDonation.id}</p>
                    <p><strong>Monto:</strong> {formatCurrency(selectedDonation.amount, selectedDonation.currency)}</p>
                    <p><strong>Estado:</strong> {getStatusBadge(selectedDonation.status)}</p>
                    <p><strong>Método:</strong> {selectedDonation.paymentMethod}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Campaña</h3>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">{selectedDonation.campaign.title}</h4>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Fecha de creación:</strong>
                  <p>{new Date(selectedDonation.createdAt).toLocaleString('es-ES')}</p>
                </div>
                <div>
                  <strong>Última actualización:</strong>
                  <p>{new Date(selectedDonation.updatedAt).toLocaleString('es-ES')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}