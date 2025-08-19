'use client';

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Contenido principal */}
      <div className="lg:ml-72">
        {/* Header */}
        <AdminHeader 
          onToggleSidebar={toggleSidebar}
          title={title}
          subtitle={subtitle}
        />
        
        {/* Contenido */}
        <main className="px-6 py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
