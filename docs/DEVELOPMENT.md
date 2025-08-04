# Guía de Desarrollo - Sumar+

## Configuración del Entorno de Desarrollo

### Herramientas Recomendadas

#### Editor de Código
- **Visual Studio Code** con las siguientes extensiones:
  - Prisma
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Auto Rename Tag
  - Bracket Pair Colorizer
  - GitLens
  - Thunder Client (para testing de APIs)

#### Configuración de VSCode

Crear `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

Crear `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Configuración de Linting y Formatting

#### ESLint Configuration

`.eslintrc.json`:

```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  },
  "ignorePatterns": ["node_modules/", ".next/", "out/"]
}
```

#### Prettier Configuration

`.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

#### Husky y Lint-staged

```bash
# Instalar herramientas de desarrollo
npm install --save-dev husky lint-staged

# Configurar husky
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

`package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

## Estructura del Proyecto

```
sumar+/
├── src/
│   ├── app/                    # App Router de Next.js 13+
│   │   ├── (auth)/            # Grupo de rutas de autenticación
│   │   ├── (dashboard)/       # Grupo de rutas del dashboard
│   │   ├── api/               # API Routes
│   │   ├── globals.css        # Estilos globales
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página de inicio
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/                # Componentes base (shadcn/ui)
│   │   ├── forms/             # Componentes de formularios
│   │   ├── layout/            # Componentes de layout
│   │   └── features/          # Componentes específicos de funcionalidades
│   ├── lib/                   # Utilidades y configuraciones
│   │   ├── auth.ts            # Configuración de autenticación
│   │   ├── db.ts              # Cliente de Prisma
│   │   ├── utils.ts           # Utilidades generales
│   │   └── validations.ts     # Esquemas de validación
│   ├── hooks/                 # Custom hooks
│   ├── types/                 # Definiciones de tipos TypeScript
│   └── styles/                # Archivos de estilos adicionales
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   ├── migrations/            # Migraciones de base de datos
│   └── seed.ts                # Script de población de datos
├── public/                    # Assets estáticos
├── docs/                      # Documentación del proyecto
├── tests/                     # Tests unitarios y de integración
└── e2e/                       # Tests end-to-end
```

## Convenciones de Código

### Nomenclatura

#### Archivos y Carpetas
- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Páginas**: kebab-case (`user-profile/page.tsx`)
- **Utilidades**: camelCase (`formatCurrency.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

#### Variables y Funciones
```typescript
// Variables: camelCase
const userName = 'Juan Pérez';
const isLoggedIn = true;

// Funciones: camelCase
function calculateTotal(amount: number): number {
  return amount * 1.21;
}

// Constantes: UPPER_SNAKE_CASE
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

// Tipos e Interfaces: PascalCase
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

type CampaignStatus = 'active' | 'completed' | 'cancelled';
```

### Estructura de Componentes

```typescript
// components/features/CampaignCard.tsx
import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Campaign } from '@/types/campaign';

interface CampaignCardProps {
  campaign: Campaign;
  onDonate?: (campaignId: string) => void;
}

export const CampaignCard: FC<CampaignCardProps> = ({ 
  campaign, 
  onDonate 
}) => {
  const handleDonateClick = () => {
    onDonate?.(campaign.id);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{campaign.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {campaign.description}
        </p>
        <Button onClick={handleDonateClick} className="w-full">
          Donar
        </Button>
      </CardContent>
    </Card>
  );
};
```

### Manejo de Estado

#### Zustand para Estado Global

```typescript
// lib/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

#### React Query para Estado del Servidor

```typescript
// hooks/useCampaigns.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignService } from '@/lib/services/campaignService';

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignService.getAll,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: campaignService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};
```

### Validación de Datos

#### Zod para Validación

```typescript
// lib/validations/campaign.ts
import { z } from 'zod';

export const createCampaignSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  goalAmount: z.number().min(1, 'La meta debe ser mayor a 0'),
  categoryId: z.string().uuid('ID de categoría inválido'),
  endDate: z.date().min(new Date(), 'La fecha debe ser futura'),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
```

### Servicios y APIs

#### Estructura de Servicios

```typescript
// lib/services/campaignService.ts
import { prisma } from '@/lib/db';
import { CreateCampaignInput } from '@/lib/validations/campaign';

export const campaignService = {
  async getAll() {
    return prisma.campaign.findMany({
      include: {
        category: true,
        user: {
          select: { id: true, name: true, avatar: true }
        },
        _count: {
          select: { donations: true }
        }
      }
    });
  },

  async getById(id: string) {
    return prisma.campaign.findUnique({
      where: { id },
      include: {
        category: true,
        user: true,
        donations: {
          include: {
            user: {
              select: { name: true, avatar: true }
            }
          }
        }
      }
    });
  },

  async create(data: CreateCampaignInput & { userId: string }) {
    return prisma.campaign.create({
      data,
      include: {
        category: true,
        user: true
      }
    });
  },

  async update(id: string, data: Partial<CreateCampaignInput>) {
    return prisma.campaign.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.campaign.delete({
      where: { id }
    });
  }
};
```

#### API Routes

```typescript
// app/api/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { campaignService } from '@/lib/services/campaignService';
import { createCampaignSchema } from '@/lib/validations/campaign';

export async function GET() {
  try {
    const campaigns = await campaignService.getAll();
    return NextResponse.json(campaigns);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener campañas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createCampaignSchema.parse(body);

    const campaign = await campaignService.create({
      ...validatedData,
      userId: session.user.id,
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear campaña' },
      { status: 500 }
    );
  }
}
```

## Testing

### Configuración de Testing

#### Jest y Testing Library

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

`jest.config.js`:

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
```

#### Tests Unitarios

```typescript
// tests/components/CampaignCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CampaignCard } from '@/components/features/CampaignCard';

const mockCampaign = {
  id: '1',
  title: 'Campaña de Prueba',
  description: 'Descripción de prueba',
  goalAmount: 1000,
  currentAmount: 500,
};

describe('CampaignCard', () => {
  it('renders campaign information correctly', () => {
    render(<CampaignCard campaign={mockCampaign} />);
    
    expect(screen.getByText('Campaña de Prueba')).toBeInTheDocument();
    expect(screen.getByText('Descripción de prueba')).toBeInTheDocument();
  });

  it('calls onDonate when donate button is clicked', () => {
    const mockOnDonate = jest.fn();
    render(<CampaignCard campaign={mockCampaign} onDonate={mockOnDonate} />);
    
    fireEvent.click(screen.getByText('Donar'));
    expect(mockOnDonate).toHaveBeenCalledWith('1');
  });
});
```

#### Tests de Integración

```typescript
// tests/api/campaigns.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/campaigns/route';

describe('/api/campaigns', () => {
  it('returns campaigns list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data)).toBe(true);
  });
});
```

### Tests End-to-End con Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

```typescript
// e2e/campaign-creation.spec.ts
import { test, expect } from '@playwright/test';

test('user can create a new campaign', async ({ page }) => {
  await page.goto('/login');
  
  // Login
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password123');
  await page.click('[data-testid=login-button]');

  // Navigate to create campaign
  await page.goto('/campaigns/create');
  
  // Fill form
  await page.fill('[data-testid=title]', 'Nueva Campaña');
  await page.fill('[data-testid=description]', 'Descripción de la campaña');
  await page.fill('[data-testid=goal-amount]', '1000');
  
  // Submit
  await page.click('[data-testid=submit-button]');
  
  // Verify success
  await expect(page.locator('[data-testid=success-message]')).toBeVisible();
});
```

## Workflow de Desarrollo

### Git Flow

#### Ramas Principales
- `main`: Código de producción
- `develop`: Código de desarrollo
- `feature/*`: Nuevas funcionalidades
- `bugfix/*`: Corrección de bugs
- `hotfix/*`: Correcciones urgentes de producción

#### Convenciones de Commits

```bash
# Formato: tipo(scope): descripción

feat(auth): add social login with Google
fix(campaigns): resolve donation amount calculation
docs(readme): update installation instructions
style(ui): improve button hover states
refactor(api): extract common validation logic
test(campaigns): add unit tests for campaign service
chore(deps): update dependencies to latest versions
```

### Proceso de Desarrollo

1. **Crear rama de feature**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nueva-funcionalidad
   ```

2. **Desarrollar y hacer commits**
   ```bash
   git add .
   git commit -m "feat(campaigns): add campaign filtering"
   ```

3. **Ejecutar tests**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Push y crear Pull Request**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

5. **Code Review y Merge**

### CI/CD con GitHub Actions

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Build application
        run: npm run build
```

## Debugging

### Configuración de Debug en VSCode

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Logging

```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

## Performance

### Optimizaciones de Next.js

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
```

### Lazy Loading y Code Splitting

```typescript
// Lazy loading de componentes
import dynamic from 'next/dynamic';

const CampaignChart = dynamic(
  () => import('@/components/features/CampaignChart'),
  { 
    loading: () => <p>Cargando gráfico...</p>,
    ssr: false 
  }
);

// Code splitting por rutas
const DashboardPage = dynamic(() => import('@/app/dashboard/page'));
```

### Optimización de Imágenes

```typescript
import Image from 'next/image';

export const CampaignImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      priority={false}
    />
  );
};
```

## Mejores Prácticas

### Seguridad

1. **Validación de entrada**: Siempre validar datos del cliente
2. **Sanitización**: Limpiar datos antes de almacenar
3. **Rate limiting**: Implementar límites de velocidad
4. **CORS**: Configurar correctamente
5. **Headers de seguridad**: CSP, HSTS, etc.

### Performance

1. **Memoización**: Usar React.memo, useMemo, useCallback
2. **Virtualización**: Para listas largas
3. **Paginación**: Para grandes conjuntos de datos
4. **Caching**: Implementar estrategias de cache
5. **Bundle analysis**: Analizar tamaño de bundles

### Accesibilidad

1. **Semantic HTML**: Usar elementos semánticos
2. **ARIA labels**: Para elementos interactivos
3. **Keyboard navigation**: Navegación por teclado
4. **Color contrast**: Cumplir estándares WCAG
5. **Screen readers**: Compatibilidad con lectores de pantalla

### Mantenibilidad

1. **Documentación**: Documentar código complejo
2. **Tests**: Mantener cobertura de tests alta
3. **Refactoring**: Refactorizar regularmente
4. **Dependencies**: Mantener dependencias actualizadas
5. **Code reviews**: Revisar todo el código