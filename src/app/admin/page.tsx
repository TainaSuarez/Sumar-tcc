import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <AdminLayout 
      title="Dashboard de Administración" 
      subtitle="Vista general del sistema y estadísticas clave"
    >
      <AdminDashboard />
    </AdminLayout>
  );
}
