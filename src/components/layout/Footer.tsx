'use client';

import Link from 'next/link';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-purple-300 text-black text-lg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-6 w-6 fill-current text-purple-400" />
            <span className="text-xl font-bold">Sumar+</span>
          </div>
          <p className="text-black mb-4">
            Conectamos corazones solidarios con causas que transforman vidas. Juntos podemos hacer la diferencia.
          </p>
          <p className="text-sm text-black">
            © 2025 Sumar+. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
