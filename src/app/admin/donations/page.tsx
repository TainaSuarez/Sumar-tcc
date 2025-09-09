'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { DonationsManagement } from '@/components/admin/DonationsManagement';

export default function AdminDonationsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Donaciones</h1>
          <p className="text-muted-foreground">
            Administra y supervisa todas las donaciones del sistema
          </p>
        </div>
        <DonationsManagement />
      </div>
    </AdminLayout>
  );
}