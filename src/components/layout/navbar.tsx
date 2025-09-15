'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Menu, X, Heart, User, LogOut, Settings, FolderOpen, Search, ShoppingCart, Plus, Home, HelpCircle, Target } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Detectar scroll para header flotante
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sincronizar el término de búsqueda con los parámetros de URL
  useEffect(() => {
    if (pathname === '/campaigns') {
      const urlSearchTerm = searchParams.get('search') || '';
      setSearchTerm(urlSearchTerm);
    } else {
      setSearchTerm('');
    }
  }, [pathname, searchParams]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathname === '/campaigns') {
      // Si estamos en la página de campañas, actualizar los parámetros de URL
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim());
      } else {
        params.delete('search');
      }
      params.delete('page'); // Resetear a la primera página
      router.push(`/campaigns?${params.toString()}`);
    } else {
      // Si no estamos en campañas, navegar allí con el término de búsqueda
      router.push(`/campaigns?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const navigation = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Campañas', href: '/campaigns', icon: Target },
    { name: 'Cómo Funciona', href: '/how-it-works', icon: HelpCircle },
  ];

  const isOnCampaignsPage = pathname === '/campaigns';

  return (
    <nav
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 rounded-full px-8 py-3 max-w-5xl w-11/12 ${
          isScrolled
            ? 'bg-black/40 backdrop-blur-md'
            : 'bg-black/30 backdrop-blur-sm'
        }`}
      >
      {/* Header Principal */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-12 py-2' : 'h-14 py-3'
          }`}>
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/')}
              className={`flex items-center space-x-3 font-bold text-white hover:text-purple-300 transition-all duration-300 ${
                isScrolled ? 'text-2xl' : 'text-3xl'
              }`}
            >
              <Heart className={`fill-current text-purple-400 transition-all duration-300 ${
                isScrolled ? 'h-8 w-8' : 'h-10 w-10'
              }`} />
              <span className="text-purple-400 hover:text-purple-300 transition-colors duration-300">Sumar+</span>
            </button>
          </div>

          {/* Navegación Central */}
            <div className="hidden md:flex items-center space-x-10">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className="flex items-center space-x-2 text-xl font-medium text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

          {/* Buscador - Solo en página de campañas */}
          {isOnCampaignsPage && (
            <div className="hidden md:flex items-center">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Buscar campañas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 h-10 pl-4 pr-12 text-gray-700 bg-white border-2 border-purple-200 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-0 h-10 px-3 bg-purple-600 hover:bg-purple-700 rounded-r-lg transition-colors"
                >
                  <Search className="h-4 w-4 text-white" />
                </button>
              </form>
            </div>
          )}

          {/* Sección de Usuario */}
          <div className="flex items-center space-x-5">
            {status === 'loading' ? (
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            ) : session ? (
                <div className="flex items-center space-x-4">
                  <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center space-x-2 text-purple-400 hover:text-purple-300 hover:bg-white/10 transition-all duration-300 ${
                       isScrolled ? 'p-2' : 'p-3'
                     }`}
                   >
                     <User className={`transition-all duration-300 text-purple-400 ${
                       isScrolled ? 'h-9 w-9' : 'h-10 w-10'
                     }`} />
                    <span className="hidden sm:block text-base">Mi Cuenta</span>
                  </Button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-black/40 backdrop-blur-md rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <button
                      onClick={() => router.push('/my-campaigns')}
                      className="flex items-center px-4 py-3 text-base text-purple-600 hover:bg-white/10 w-full text-left"
                    >
                      <FolderOpen className="h-5 w-5 mr-3" />
                      Mis Campañas
                    </button>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="flex items-center px-4 py-3 text-base text-purple-600 hover:bg-white/10 w-full text-left"
                    >
                      <User className="h-5 w-5 mr-3" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => router.push('/profile')}
                      className="flex items-center px-4 py-3 text-base text-purple-600 hover:bg-white/10 w-full text-left"
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      Configuración
                    </button>
                    <hr className="my-1 border-white/20" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center px-4 py-3 text-base text-purple-600 hover:bg-white/10 w-full text-left"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
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
                   className="text-gray-700 hover:text-gray-900 hover:bg-purple-100"
                >
                  Iniciar Sesión
                </Button>
                <Button
                  onClick={() => router.push('/auth/signup')}
                   className="bg-purple-600 hover:bg-purple-700 text-white"
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
              className="text-gray-700 hover:text-gray-900 p-3"
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