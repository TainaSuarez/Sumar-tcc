import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';

import { LoginForm } from '@/components/auth/login-form';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Sumar+',
  description: 'Inicia sesión en tu cuenta de Sumar+ para continuar ayudando.',
};

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  // Si ya está autenticado, redirigir al dashboard
  if (session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-violet-600 to-purple-700">
        <div className="absolute inset-0 bg-black/20" />
        <Image
          src="/autth.png"
          alt="Sumar+ Authentication"
          fill
          className="object-cover"
          priority
        />

      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenido a Sumar+
            </h1>
            <p className="text-gray-600">
              La plataforma donde cada donación cuenta
            </p>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </div>
  );
}