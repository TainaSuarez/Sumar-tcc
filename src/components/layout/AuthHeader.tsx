'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, Megaphone, BarChart3, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function AuthHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Detectar scroll para efectos visuales
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

  // No mostrar en páginas de autenticación
  if (pathname.includes('/auth/')) {
    return null;
  }

  return (
    <div
      className={`absolute top-4 right-4 z-40 transition-all duration-300 ${
        isHomePage 
          ? `rounded-full px-8 py-4 ${
              isScrolled
                ? 'bg-black/40 backdrop-blur-md'
                : 'bg-black/30 backdrop-blur-sm'
            }`
          : 'bg-white/95 backdrop-blur-md rounded-full px-8 py-4 shadow-lg border border-gray-200/50'
      }`}
    >
      {status === 'loading' ? (
        <div className="animate-pulse">
          <div className={`h-12 w-28 rounded ${
            isHomePage ? 'bg-white/20' : 'bg-gray-200'
          }`}></div>
        </div>
      ) : session ? (
        <div className="flex items-center space-x-2">
          <div className="relative group">
            <Button
              variant="ghost"
              size="md"
              className={`flex items-center space-x-3 transition-all duration-300 p-3 rounded-full ${
                isHomePage
                  ? 'text-white hover:text-purple-300 hover:bg-white/10'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <img 
                src={session?.user?.image || "/user-icon.svg"} 
                alt="Usuario" 
                className="h-10 w-10 rounded-full object-cover" 
              />
              <span className="hidden sm:block text-base font-medium">
                {session?.user?.name || 'Mi Cuenta'}
              </span>
            </Button>
            
            {/* Dropdown Menu */}
            <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
              isHomePage 
                ? 'bg-gray-900/95 backdrop-blur-md border border-white/10' 
                : 'bg-white/95 backdrop-blur-md border border-gray-200'
            }`}>
              {/* Mostrar Dashboard solo para administradores */}
              {session?.user?.role === 'ADMIN' && (
                <>
                  <button
                    onClick={() => router.push('/admin')}
                    className={`flex items-center px-4 py-3 text-sm w-full text-left transition-colors ${
                      isHomePage
                        ? 'text-white hover:bg-white/10'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4 mr-3" />
                    Dashboard
                  </button>
                  <hr className={`my-1 ${
                    isHomePage ? 'border-white/20' : 'border-gray-200'
                  }`} />
                </>
              )}
              <button
                onClick={() => router.push('/my-campaigns')}
                className={`flex items-center px-4 py-3 text-sm w-full text-left transition-colors ${
                  isHomePage
                    ? 'text-white hover:bg-white/10'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Megaphone className="h-4 w-4 mr-3" />
                Mis Campañas
              </button>
              <button
                onClick={() => router.push('/profile')}
                className={`flex items-center px-4 py-3 text-sm w-full text-left transition-colors ${
                  isHomePage
                    ? 'text-white hover:bg-white/10'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="h-4 w-4 mr-3" />
                Mi Perfil
              </button>
              <hr className={`my-1 ${
                isHomePage ? 'border-white/20' : 'border-gray-200'
              }`} />
              <button
                onClick={handleSignOut}
                className={`flex items-center px-4 py-3 text-sm w-full text-left transition-colors ${
                  isHomePage
                    ? 'text-white hover:bg-white/10'
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <Button
            size="md"
            onClick={() => router.push('/auth/signin')}
            className={`text-base transition-all duration-300 px-6 py-3 font-medium ${
              isHomePage 
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            Iniciar Sesión
          </Button>
          <Button
            size="md"
            onClick={() => router.push('/auth/signup')}
            className="bg-purple-600 hover:bg-purple-700 text-white text-base px-6 py-3 font-medium"
          >
            Registrarse
          </Button>
        </div>
      )}
    </div>
  );
}