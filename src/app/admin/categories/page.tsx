import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CategoriesManagement } from '@/components/admin/CategoriesManagement';

export default function AdminCategoriesPage() {
  return (
    <AdminLayout 
      title="Gestión de Categorías" 
      subtitle="Administrar categorías y subcategorías del sistema"
    >
      <CategoriesManagement />
    </AdminLayout>
  );
}
