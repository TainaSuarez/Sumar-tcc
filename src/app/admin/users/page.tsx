import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UsersManagement } from '@/components/admin/UsersManagement';

export default function AdminUsersPage() {
  return (
    <AdminLayout 
      title="Gestión de Usuarios" 
      subtitle="Administrar usuarios registrados en la plataforma"
    >
      <UsersManagement />
    </AdminLayout>
  );
}
