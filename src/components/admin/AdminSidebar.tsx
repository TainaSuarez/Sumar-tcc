'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Users,
  FolderOpen,
  Tag,
  CreditCard,
  Settings,
  Shield,
  Menu,
  X,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    description: 'Estadísticas generales'
  },
  {
    label: 'Usuarios',
    href: '/admin/users',
    icon: Users,
    description: 'Gestión de usuarios'
  },
  {
    label: 'Campañas',
    href: '/admin/campaigns',
    icon: FolderOpen,
    description: 'Gestión de campañas'
  },
  {
    label: 'Categorías',
    href: '/admin/categories',
    icon: Tag,
    description: 'Gestión de categorías'
  },
  {
    label: 'Donaciones',
    href: '/admin/donations',
    icon: CreditCard,
    description: 'Historial de donaciones'
  },
  {
    label: 'Moderación',
    href: '/admin/moderation',
    icon: Shield,
    description: 'Herramientas de moderación'
  },
  {
    label: 'Configuración',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configuración del sistema'
  }
];

export function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-72 bg-white border-r border-gray-200 transition-transform duration-300",
        "lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-1 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Panel Admin
              </h1>
              <p className="text-xs text-gray-500">Sumar+</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navegación */}
        <nav className="p-4 space-y-2">
          {/* Link de regreso al sitio principal */}
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            <Home className="w-4 h-4" />
            <span>Volver al sitio</span>
          </Link>

          <div className="border-t border-gray-200 my-4" />

          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-gray-50",
                  isActive 
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                    : "text-gray-700 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-blue-600" : "text-gray-500"
                )} />
                
                <div className="flex-1">
                  <div className={cn(
                    "font-medium text-sm",
                    isActive ? "text-blue-900" : "text-gray-900"
                  )}>
                    {item.label}
                  </div>
                  <div className={cn(
                    "text-xs",
                    isActive ? "text-blue-600" : "text-gray-500"
                  )}>
                    {item.description}
                  </div>
                </div>

                {isActive && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            <div className="font-medium">Sumar+ Admin Panel</div>
            <div>Versión 1.0.0</div>
          </div>
        </div>
      </aside>
    </>
  );
}
