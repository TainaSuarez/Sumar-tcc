const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creando usuario administrador...');

    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('✅ Ya existe un usuario administrador:', existingAdmin.email);
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Crear usuario administrador
    const admin = await prisma.user.create({
      data: {
        email: 'admin@sumar.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Sistema',
        role: 'ADMIN',
        userType: 'INDIVIDUAL',
        isVerified: true,
        isActive: true,
        emailVerifiedAt: new Date(),
      }
    });

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Contraseña: admin123');
    console.log('🏷️ Rol:', admin.role);
    console.log('');
    console.log('🚀 Ahora puedes acceder al panel de administración en:');
    console.log('🌐 http://localhost:3001/admin');
    console.log('');
    console.log('⚠️  Asegúrate de cambiar la contraseña después del primer login.');

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
