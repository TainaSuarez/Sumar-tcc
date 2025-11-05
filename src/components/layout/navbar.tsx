'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, Heart, HelpCircle, Menu, X, User, LogOut, Megaphone, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';


export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Detectar scroll para header flotante
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const isHomePage = pathname === '/';

  const navigation = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Campañas', href: '/campaigns', icon: Megaphone },
    { name: 'Cómo Funciona', href: '/how-it-works', icon: HelpCircle },
  ];

  return (
    <nav
        className={`z-50 transition-all duration-300 ${
          isHomePage 
            ? `fixed top-4 left-1/2 transform -translate-x-1/2 rounded-full px-8 ${
                isScrolled
                  ? 'bg-black/40 backdrop-blur-md py-1 max-w-md w-auto'
                  : 'bg-black/30 backdrop-blur-sm py-3 max-w-5xl w-11/12'
              }`
            : 'w-full bg-white shadow-md border-b border-gray-200 px-4 sm:px-6 lg:px-8 fixed top-0 left-0 right-0'
        }`}
      >
      {/* Header Principal */}
      <div className={`w-full ${
        isHomePage ? 'px-4 sm:px-6 lg:px-8' : ''
      }`}>
          <div className={`flex items-center justify-between transition-all duration-300 min-w-0 ${
            isHomePage 
              ? (isScrolled ? 'h-10 py-1' : 'h-14 py-3')
              : 'h-20 py-5'
          }`}>
          {/* Logo */}
          <div className="flex items-center mr-2 flex-shrink-0">
            <Link
              href="/"
              className={`flex items-center space-x-2 font-bold transition-all duration-300 ${
                isHomePage 
                  ? 'text-white hover:text-purple-300 text-4xl'
                  : 'text-purple-600 hover:text-purple-700 text-3xl'
              }`}
            >
              <Heart className={`fill-current transition-all duration-300 ${
                isHomePage
                  ? 'text-purple-400 h-8 w-8'
                  : 'text-purple-500 h-7 w-7'
              }`} />
              <span className={`transition-all duration-300 overflow-hidden leading-none flex items-center ${
                isHomePage && isScrolled 
                  ? 'w-0 opacity-0 ml-0' 
                  : 'w-auto opacity-100'
              } ${
                isHomePage 
                  ? 'text-purple-400 hover:text-purple-300'
                  : 'text-purple-500 hover:text-purple-600'
              }`}>Sumar+</span>
            </Link>
          </div>

          {/* Navegación Central - Ahora ocupa más espacio */}
            <div className={`hidden md:flex items-center justify-center flex-1 transition-all duration-300 ${
              isHomePage && isScrolled ? 'space-x-4 ml-2' : 'space-x-6 ml-4'
            }`}>
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 text-xl font-medium transition-all duration-300 whitespace-nowrap ${
                      isHomePage
                        ? 'text-purple-400 hover:text-purple-300'
                        : 'text-purple-500 hover:text-purple-600'
                    }`}
                  >
                    <IconComponent className="h-8 w-8" />
                    <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap flex items-center ${
                      isHomePage && isScrolled 
                        ? 'w-0 opacity-0 ml-0' 
                        : 'w-auto opacity-100'
                    }`}>{item.name}</span>
                  </Link>
                );
              })}
            </div>

          {/* Usuario logueado - Solo en páginas que no son home */}
          {!isHomePage && session && (
            <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
              <div className="relative group">
                <div className="flex items-center space-x-3 px-4 py-2 bg-purple-50 rounded-full border border-purple-200 cursor-pointer">
                  <img 
                    src={session?.user?.image || "/user-icon.svg"} 
                    alt="Usuario" 
                    className="h-8 w-8 rounded-full object-cover" 
                  />
                  <span className="text-purple-700 font-medium">
                    {session?.user?.name || 'Mi Cuenta'}
                  </span>
                </div>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white/95 backdrop-blur-md border border-gray-200">
                  {/* Mostrar Dashboard solo para administradores */}
                  {session?.user?.role === 'ADMIN' && (
                    <>
                      <button
                        onClick={() => router.push('/admin')}
                        className="flex items-center px-4 py-3 text-sm w-full text-left transition-colors text-gray-700 hover:bg-gray-50"
                      >
                        <BarChart3 className="h-4 w-4 mr-3" />
                        Dashboard
                      </button>
                      <hr className="my-1 border-gray-200" />
                    </>
                  )}
                  <button
                    onClick={() => router.push('/my-campaigns')}
                    className="flex items-center px-4 py-3 text-sm w-full text-left transition-colors text-gray-700 hover:bg-gray-50"
                  >
                    <Megaphone className="h-4 w-4 mr-3" />
                    Mis Campañas
                  </button>
                  <button
                    onClick={() => router.push('/profile')}
                    className="flex items-center px-4 py-3 text-sm w-full text-left transition-colors text-gray-700 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Mi Perfil
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center px-4 py-3 text-sm w-full text-left transition-colors text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-3 transition-colors ${
                isHomePage 
                  ? 'text-white hover:text-purple-300' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {isMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </div>





      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-purple-600 block px-3 py-2 text-base font-medium w-full text-left"
              >
                {item.name}
              </Link>
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
                  onClick={handleSignOut}
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
    </nav>
  );
}