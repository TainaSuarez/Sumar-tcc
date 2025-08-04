import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';

import { RegisterForm } from '@/components/auth/register-form';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Crear Cuenta | Sumar+',
  description: 'Únete a Sumar+ y comienza a hacer la diferencia en tu comunidad.',
};

export default async function SignUpPage() {
  const session = await getServerSession(authOptions);

  // Si ya está autenticado, redirigir al dashboard
  if (session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-600 to-green-700">
        <div className="absolute inset-0 bg-black/20" />
        <Image
          src="/autth.png"
          alt="Sumar+ Authentication"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold mb-6">
              Únete a Sumar+
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Crea tu cuenta y comienza a transformar vidas en tu comunidad
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-white/90">Registro rápido y seguro</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-white/90">Acceso a miles de causas</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-white/90">Comunidad comprometida</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Únete a Sumar+
            </h1>
            <p className="text-gray-600">
              Crea tu cuenta y comienza a transformar vidas
            </p>
          </div>
          
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}