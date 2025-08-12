'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, User, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { registerSchema, type RegisterInput } from '@/lib/validations/auth';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      organizationName: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: 'INDIVIDUAL',
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          // Errores de validación
          const errorMessages = result.details.map((detail: { message: string }) => detail.message).join(', ');
          setError(errorMessages);
        } else {
          setError(result.error || 'Error al registrar usuario');
        }
        return;
      }

      setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
      
      // Opcional: Auto-login después del registro
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);

    } catch (error) {
      console.error('Error en registro:', error);
      setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Error en registro con Google:', error);
      setError('Error al registrarse con Google.');
      setIsLoading(false);
    }
  };

  const userType = form.watch('userType');

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center text-gray-900">
          Crear Cuenta
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          Únete a Sumar+ y comienza a hacer la diferencia
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            {success}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tu nombre"
                        disabled={isLoading}
                        className="h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido <span className="text-muted-foreground">(opcional)</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tu apellido (opcional)"
                        disabled={isLoading}
                        className="h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {userType === 'ORGANIZATION' && (
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la organización</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre de tu organización"
                        disabled={isLoading}
                        className="h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      disabled={isLoading}
                      className="h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de usuario</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={field.value === 'INDIVIDUAL' ? 'default' : 'outline'}
                        className={`h-auto p-4 flex flex-col items-center space-y-2 transition-colors ${
                          field.value === 'INDIVIDUAL' 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => field.onChange('INDIVIDUAL')}
                        disabled={isLoading}
                      >
                        <User className="h-6 w-6" />
                        <span className="text-sm">Individual</span>
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === 'ORGANIZATION' ? 'default' : 'outline'}
                        className={`h-auto p-4 flex flex-col items-center space-y-2 transition-colors ${
                          field.value === 'ORGANIZATION' 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => field.onChange('ORGANIZATION')}
                        disabled={isLoading}
                      >
                        <Building2 className="h-6 w-6" />
                        <span className="text-sm">Organización</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 pr-12"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 pr-12"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <Label className="text-sm">
                      Acepto los{' '}
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal text-sm underline"
                        onClick={() => window.open('/terms', '_blank')}
                      >
                        términos y condiciones
                      </Button>
                      {' '}y la{' '}
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal text-sm underline"
                        onClick={() => window.open('/privacy', '_blank')}
                      >
                        política de privacidad
                      </Button>
                    </Label>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Cuenta
            </Button>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              O regístrate con
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full py-3 border-gray-300 hover:bg-gray-50 transition-colors"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continuar con Google
        </Button>
      </CardContent>

      <CardFooter className="flex justify-center">
        <div className="text-sm text-center text-muted-foreground">
          ¿Ya tienes una cuenta?{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => router.push('/auth/signin')}
          >
            Inicia sesión aquí
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}