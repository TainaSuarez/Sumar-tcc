import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { UserRole, UserType } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Proveedor de credenciales (email/password)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        // Buscar usuario en la base de datos
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          throw new Error('Credenciales inválidas');
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Credenciales inválidas');
        }

        // Verificar si el usuario está activo
        if (!user.isActive) {
          throw new Error('Cuenta desactivada. Contacta al soporte.');
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`,
          image: user.avatar,
          role: user.role,
          userType: user.userType,
          isVerified: user.isVerified,
        };
      }
    }),

    // Proveedor de Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Persistir información adicional en el token
      if (user) {
        token.role = user.role;
        token.userType = user.userType;
        token.isVerified = user.isVerified;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.organizationName = user.organizationName;
        token.avatar = user.avatar;
        token.bio = user.bio;
      }

      // Si es login con Google, crear o actualizar usuario
      if (account?.provider === 'google' && user) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            // Crear nuevo usuario con Google
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                firstName: user.name!,
                avatar: user.image,
                isVerified: true, // Los usuarios de Google se consideran verificados
                isActive: true,
                role: UserRole.USER,
                userType: UserType.INDIVIDUAL, // Por defecto, los nuevos usuarios son individuales
              }
            });

            token.role = newUser.role;
            token.userType = newUser.userType;
            token.isVerified = newUser.isVerified;
            token.firstName = newUser.firstName;
            token.lastName = newUser.lastName;
            token.organizationName = newUser.organizationName;
            token.avatar = newUser.avatar;
            token.bio = newUser.bio;
          } else {
            // Actualizar información del usuario existente
            const updatedUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                firstName: user.name!,
                avatar: user.image,
                lastLoginAt: new Date(),
              }
            });

            token.role = updatedUser.role;
            token.userType = updatedUser.userType;
            token.isVerified = updatedUser.isVerified;
            token.firstName = updatedUser.firstName;
            token.lastName = updatedUser.lastName;
            token.organizationName = updatedUser.organizationName;
            token.avatar = updatedUser.avatar;
            token.bio = updatedUser.bio;
          }
        } catch (error) {
          console.error('Error al procesar login con Google:', error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Enviar propiedades al cliente
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.userType = token.userType as UserType;
        session.user.isVerified = token.isVerified as boolean;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.organizationName = token.organizationName as string;
        session.user.avatar = token.avatar as string;
        session.user.bio = token.bio as string;
      }

      return session;
    },

    async signIn({ user, account, profile }) {
      // Permitir login con credenciales
      if (account?.provider === 'credentials') {
        return true;
      }

      // Permitir login con Google
      if (account?.provider === 'google') {
        return true;
      }

      return false;
    },
  },

  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      // Actualizar última fecha de login
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });
      }

      console.log(`Usuario ${user.email} inició sesión con ${account?.provider}`);
    },

    async signOut({ token }) {
      console.log(`Usuario ${token.email} cerró sesión`);
    }
  },

  debug: process.env.NODE_ENV === 'development',
};