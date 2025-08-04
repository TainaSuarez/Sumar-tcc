# Documentación de Componentes - Sumar+

## Estructura de Componentes

### App Router (Next.js 13+)

El proyecto utiliza el nuevo App Router de Next.js, que proporciona una estructura más intuitiva y mejor rendimiento.

#### Layout Principal (`src/app/layout.tsx`)

```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sumar+",
  description: "Aplicación web moderna con Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

**Propósito**: Define el layout principal de la aplicación, incluyendo metadatos y estilos globales.

#### Página Principal (`src/app/page.tsx`)

```typescript
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* Contenido de la página principal */}
    </main>
  );
}
```

**Propósito**: Componente principal que renderiza la página de inicio.

### Estilos Globales (`src/app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Propósito**: Importa las utilidades de Tailwind CSS y define estilos globales.

## Convenciones de Nomenclatura

### Componentes

- **PascalCase**: Para nombres de componentes React
- **kebab-case**: Para nombres de archivos
- **camelCase**: Para props y variables

### Ejemplos

```typescript
// ✅ Correcto
export default function UserProfile() { }
export default function NavigationBar() { }

// ❌ Incorrecto
export default function userProfile() { }
export default function navigation-bar() { }
```

## Estructura de Carpetas Recomendada

```
src/
├── app/                    # App Router (páginas y layouts)
├── components/             # Componentes reutilizables
│   ├── ui/                # Componentes de UI básicos
│   ├── forms/             # Componentes de formularios
│   └── layout/            # Componentes de layout
├── lib/                   # Utilidades y configuraciones
├── hooks/                 # Custom hooks
├── types/                 # Definiciones de tipos TypeScript
└── styles/                # Estilos adicionales
```

## Patrones de Componentes

### Componente Funcional con TypeScript

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded ${
        variant === "primary"
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}
```

### Componente con Server Components

```typescript
// Server Component (por defecto en App Router)
export default async function UserList() {
  const users = await fetchUsers(); // Fetch en el servidor

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Componente con Client Components

```typescript
"use client"; // Necesario para interactividad

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

## Integración con Tailwind CSS

### Clases Utilitarias

```typescript
// Ejemplo de uso de Tailwind CSS
export default function Card() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Título de la Tarjeta
      </h2>
      <p className="text-gray-600">Contenido de la tarjeta</p>
    </div>
  );
}
```

### Responsive Design

```typescript
// Clases responsive de Tailwind
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Contenido */}
</div>
```

## Mejores Prácticas

1. **Separación de Responsabilidades**: Cada componente debe tener una responsabilidad específica
2. **Props Tipadas**: Siempre definir interfaces para las props
3. **Componentes Pequeños**: Mantener componentes pequeños y reutilizables
4. **Nombres Descriptivos**: Usar nombres que describan claramente la función del componente
5. **Documentación**: Comentar componentes complejos
6. **Testing**: Escribir tests para componentes críticos

## Ejemplos de Componentes Comunes

### Header Component

```typescript
interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-xl mt-2 opacity-90">{subtitle}</p>}
      </div>
    </header>
  );
}
```

### Loading Component

```typescript
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
}
```

### Error Component

```typescript
interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function Error({
  message = "Algo salió mal",
  onRetry,
}: ErrorProps) {
  return (
    <div className="text-center py-8">
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}
```
