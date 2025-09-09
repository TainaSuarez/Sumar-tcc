'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Menu, X, Heart, User, LogOut, Settings, FolderOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Campañas', href: '/campaigns' },
    { name: 'Cómo Funciona', href: '/how-it-works' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="w-full px-6 sm:px-8 lg:px-16">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center ml-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors"
            >
              <Heart className="h-8 w-8 fill-current" />
              <span>Sumar+</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className="text-gray-700 hover:text-purple-600 px-3 py-2 text-base font-medium transition-colors"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Hola, {session.user?.name}
                </span>
                
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Mi Cuenta</span>
                  </Button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <button
                      onClick={() => router.push('/my-campaigns')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Mis Campañas
                    </button>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => router.push('/profile')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configuración
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/auth/signin')}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  onClick={() => router.push('/auth/signup')}
                >
                  Registrarse
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-purple-600 p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-purple-600 block px-3 py-2 text-base font-medium w-full text-left"
                >
                  {item.name}
                </button>
              ))}
              
              <hr className="my-2" />
              
              {session ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Hola, {session.user?.name}
                  </div>
                  <button
                    onClick={() => {
                      router.push('/my-campaigns');
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-purple-600 block px-3 py-2 text-base font-medium w-full text-left"
                  >
                    Mis Campañas
                  </button>
                  <button
                    onClick={() => {
                      router.push('/dashboard');
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-purple-600 block px-3 py-2 text-base font-medium w-full text-left"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      router.push('/profile');
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-purple-600 block px-3 py-2 text-base font-medium w-full text-left"
                  >
                    Configuración
                  </button>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-purple-600 block px-3 py-2 text-base font-medium w-full text-left"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      router.push('/auth/signin');
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-purple-600 block px-3 py-2 text-base font-medium w-full text-left"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => {
                      router.push('/auth/signup');
                      setIsMenuOpen(false);
                    }}
                    className="bg-purple-600 text-white hover:bg-purple-700 block px-3 py-2 text-base font-medium w-full text-left rounded-md"
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}