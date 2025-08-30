import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { UserStats } from '@/components/admin/UserStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminUsersPage() {
  return (
    <AdminLayout 
      title="Gestión de Usuarios" 
      subtitle="Administrar usuarios registrados en la plataforma"
    >
      <Tabs defaultValue="management" className="space-y-3">
        <TabsList>
          <TabsTrigger value="management">Gestión de Usuarios</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="management">
          <UsersManagement />
        </TabsContent>
        
        <TabsContent value="stats">
          <UserStats />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
