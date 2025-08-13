import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CampaignsManagement } from '@/components/admin/CampaignsManagement';

export default function AdminCampaignsPage() {
  return (
    <AdminLayout 
      title="Gestión de Campañas" 
      subtitle="Administrar campañas y su estado en la plataforma"
    >
      <CampaignsManagement />
    </AdminLayout>
  );
}
