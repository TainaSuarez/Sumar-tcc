'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Shield,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Calendar,
  Users,
  Settings,
  SortAsc,
  SortDesc
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserActivity } from './UserActivity';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  organizationName?: string;
  userType: 'INDIVIDUAL' | 'ORGANIZATION';
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  avatar?: string;
  phone?: string;
  city?: string;
  country: string;
  isVerified: boolean;
  isActive: boolean;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    campaigns: number;
    donations: number;
    comments: number;
  };
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface UserWithStats extends User {
  stats?: {
    campaigns?: { total: number; totalRaised: number };
    donations?: { total: number };
    comments?: number;
  };
  campaigns?: Array<{
    id: string;
    title: string;
    status: string;
    currentAmount: number;
    goalAmount: number;
    createdAt: string;
  }>;
  donations?: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    campaign: { id: string; title: string };
  }>;
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<UsersResponse['pagination'] | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && roleFilter !== 'all' && { role: roleFilter }),
        ...(typeFilter && typeFilter !== 'all' && { userType: typeFilter }),
        ...(statusFilter && statusFilter !== 'all' && { isActive: statusFilter }),
        ...(verifiedFilter && verifiedFilter !== 'all' && { isVerified: verifiedFilter }),
        ...(dateFromFilter && { dateFrom: dateFromFilter }),
        ...(dateToFilter && { dateTo: dateToFilter }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/users?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los usuarios');
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter, typeFilter, statusFilter, verifiedFilter, dateFromFilter, dateToFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, updates }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el usuario');
      }

      // Actualizar la lista local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));

      // Mostrar notificación de éxito (puedes agregar un toast aquí)
      alert('Usuario actualizado exitosamente');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) {
      alert('Selecciona al menos un usuario');
      return;
    }

    const userIds = Array.from(selectedUsers);
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, userIds }),
      });

      if (!response.ok) {
        throw new Error('Error al ejecutar la acción masiva');
      }

      const result = await response.json();
      
      // Recargar usuarios
      await fetchUsers();
      
      // Limpiar selección
      setSelectedUsers(new Set());
      
      alert(`Acción ejecutada exitosamente en ${result.affectedRows} usuarios`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(user => user.id)));
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleViewUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) {
        throw new Error('Error al cargar detalles del usuario');
      }
      const data = await response.json();
      setSelectedUser(data.user);
      setShowUserDetails(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
    setVerifiedFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const getUserInitials = (user: User) => {
    if (user.organizationName) {
      return user.organizationName.charAt(0).toUpperCase();
    }
    return `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getUserDisplayName = (user: User) => {
    if (user.organizationName) {
      return user.organizationName;
    }
    return `${user.firstName} ${user.lastName || ''}`.trim();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'MODERATOR': return 'bg-yellow-100 text-yellow-800';
      case 'USER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ORGANIZATION': return 'bg-blue-100 text-blue-800';
      case 'INDIVIDUAL': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 animate-pulse rounded-lg" />
        <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <Button onClick={fetchUsers}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="USER">Usuario</SelectItem>
                <SelectItem value="MODERATOR">Moderador</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="ORGANIZATION">Organización</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Verificación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Verificados</SelectItem>
                <SelectItem value="false">No verificados</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('createdAt')}
                className="flex items-center gap-1"
              >
                <Calendar className="h-4 w-4" />
                Fecha
                {sortBy === 'createdAt' && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              type="date"
              placeholder="Fecha desde"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
            />
            <Input
              type="date"
              placeholder="Fecha hasta"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
            />
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Fecha de registro</SelectItem>
                <SelectItem value="firstName">Nombre</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="lastLoginAt">Último acceso</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Orden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descendente</SelectItem>
                <SelectItem value="asc">Ascendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Acciones masivas */}
      {selectedUsers.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {selectedUsers.size} usuario{selectedUsers.size !== 1 ? 's' : ''} seleccionado{selectedUsers.size !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('bulk_activate')}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('bulk_deactivate')}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Desactivar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('bulk_verify')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verificar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('bulk_make_moderator')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Hacer moderador
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUsers(new Set())}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de usuarios */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Usuarios ({pagination?.totalCount || 0})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={users.length > 0 && selectedUsers.size === users.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-gray-600">Seleccionar todos</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={() => handleSelectUser(user.id)}
                  />
                  
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={getUserDisplayName(user)} />
                    <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{getUserDisplayName(user)}</h3>
                      {user.isVerified && (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      )}
                      {!user.isActive && (
                        <UserX className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600">{user.email}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge className={getTypeColor(user.userType)}>
                        {user.userType === 'INDIVIDUAL' ? 'Individual' : 'Organización'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {user.city && `${user.city}, `}{user.country}
                      </span>
                      {user.lastLoginAt && (
                        <span className="text-xs text-gray-500">
                          Último acceso: {new Date(user.lastLoginAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="text-gray-900">
                      {user.stats.campaigns} campañas
                    </div>
                    <div className="text-gray-500">
                      {user.stats.donations} donaciones
                    </div>
                    <div className="text-gray-500">
                      {user.stats.comments} comentarios
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem
                        onClick={() => handleUserUpdate(user.id, { isActive: !user.isActive })}
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={() => handleUserUpdate(user.id, { isVerified: !user.isVerified })}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        {user.isVerified ? 'Desverificar' : 'Verificar'}
                      </DropdownMenuItem>
                      
                      {user.role !== 'ADMIN' && (
                        <DropdownMenuItem
                          onClick={() => handleUserUpdate(user.id, { 
                            role: user.role === 'MODERATOR' ? 'USER' : 'MODERATOR' 
                          })}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          {user.role === 'MODERATOR' ? 'Quitar moderador' : 'Hacer moderador'}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No se encontraron usuarios
              </div>
            )}
          </div>

          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} de {pagination.totalCount} usuarios
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <span className="text-sm px-4">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNext}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles del usuario */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
            <DialogDescription>
              Información completa y estadísticas del usuario
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="activity">Actividad</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6 mt-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Personal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedUser.avatar} alt={getUserDisplayName(selectedUser)} />
                        <AvatarFallback className="text-lg">{getUserInitials(selectedUser)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{getUserDisplayName(selectedUser)}</h3>
                        <p className="text-gray-600">{selectedUser.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Tipo:</span>
                        <p>{selectedUser.userType === 'INDIVIDUAL' ? 'Individual' : 'Organización'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Rol:</span>
                        <p>
                          <Badge className={getRoleColor(selectedUser.role)}>
                            {selectedUser.role}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">País:</span>
                        <p>{selectedUser.country}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Ciudad:</span>
                        <p>{selectedUser.city || 'No especificada'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Teléfono:</span>
                        <p>{selectedUser.phone || 'No especificado'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Estado:</span>
                        <p className="flex items-center gap-2">
                          {selectedUser.isActive ? (
                            <>
                              <UserCheck className="h-4 w-4 text-green-600" />
                              Activo
                            </>
                          ) : (
                            <>
                              <UserX className="h-4 w-4 text-red-600" />
                              Inactivo
                            </>
                          )}
                          {selectedUser.isVerified && (
                            <>
                              <Shield className="h-4 w-4 text-blue-600" />
                              Verificado
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {selectedUser.bio && (
                      <div>
                        <span className="font-medium text-gray-500">Biografía:</span>
                        <p className="text-sm mt-1">{selectedUser.bio}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Fechas Importantes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-500">Registro:</span>
                      <p>{new Date(selectedUser.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Última actualización:</span>
                      <p>{new Date(selectedUser.updatedAt).toLocaleString()}</p>
                    </div>
                    {selectedUser.emailVerifiedAt && (
                      <div>
                        <span className="font-medium text-gray-500">Email verificado:</span>
                        <p>{new Date(selectedUser.emailVerifiedAt).toLocaleString()}</p>
                      </div>
                    )}
                    {selectedUser.lastLoginAt && (
                      <div>
                        <span className="font-medium text-gray-500">Último acceso:</span>
                        <p>{new Date(selectedUser.lastLoginAt).toLocaleString()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Estadísticas */}
              {selectedUser.stats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estadísticas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedUser.stats.campaigns?.total || 0}
                        </div>
                        <div className="text-sm text-gray-600">Campañas</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedUser.stats.donations?.total || 0}
                        </div>
                        <div className="text-sm text-gray-600">Donaciones</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedUser.stats.comments || 0}
                        </div>
                        <div className="text-sm text-gray-600">Comentarios</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          €{selectedUser.stats.campaigns?.totalRaised || 0}
                        </div>
                        <div className="text-sm text-gray-600">Total recaudado</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actividad reciente */}
              {selectedUser.campaigns && selectedUser.campaigns.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Campañas Recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedUser.campaigns!.slice(0, 5).map((campaign) => (
                        <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{campaign.title}</h4>
                            <p className="text-sm text-gray-600">
                              Estado: <Badge>{campaign.status}</Badge>
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium">€{campaign.currentAmount} / €{campaign.goalAmount}</p>
                            <p className="text-gray-500">{new Date(campaign.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Donaciones recientes */}
              {selectedUser.donations && selectedUser.donations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Donaciones Recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedUser.donations!.slice(0, 5).map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{donation.campaign.title}</h4>
                            <p className="text-sm text-gray-600">
                              Estado: <Badge>{donation.status}</Badge>
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium">€{donation.amount}</p>
                            <p className="text-gray-500">{new Date(donation.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              </TabsContent>
              
              <TabsContent value="activity" className="mt-6">
                <UserActivity userId={selectedUser.id} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
