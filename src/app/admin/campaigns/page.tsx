'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CampaignsManagement } from '@/components/admin/CampaignsManagement';
import { CampaignStats } from '@/components/admin/CampaignStats';
import { BulkCampaignActions } from '@/components/admin/BulkCampaignActions';
import { CampaignQuickSearch } from '@/components/admin/CampaignQuickSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminCampaignsPage() {
  const handleActionComplete = (action: string, count: number) => {
    console.log(`Acción ${action} completada en ${count} campañas`);
    // Aquí podrías agregar notificaciones o refrescar datos
  };

  return (
    <AdminLayout 
      title="Gestión de Campañas" 
      subtitle="Administrar campañas y su estado en la plataforma"
    >
      <Tabs defaultValue="management" className="space-y-3">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="management">Gestión</TabsTrigger>
          <TabsTrigger value="quick-search">Búsqueda</TabsTrigger>
          <TabsTrigger value="bulk-actions">Acciones Masivas</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="management">
          <CampaignsManagement />
        </TabsContent>
        
        <TabsContent value="quick-search">
          <CampaignQuickSearch />
        </TabsContent>
        
        <TabsContent value="bulk-actions">
          <BulkCampaignActions 
            onActionComplete={handleActionComplete}
          />
        </TabsContent>
        
        <TabsContent value="stats">
          <CampaignStats />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
