'use client';

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { AdminUserDropdown } from './AdminUserDropdown';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Contenido principal */}
      <div className="lg:ml-72 min-h-screen bg-white">
        {/* Header integrado con contenido */}
        <div className="px-6 pt-0 pb-0">
          <div className="flex items-center justify-between mb-0">
            {/* Lado izquierdo - Botón menú */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="lg:hidden"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>

            {/* Lado derecho - Usuario */}
            <AdminUserDropdown />
          </div>
          
          {/* Título principal como header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-0">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Contenido */}
        <main className="px-6 pt-0 pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
