const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndUpdateAdminUser() {
  try {
    console.log('🔍 Verificando usuario chicobento@gmail.com...');
    
    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: {
        email: 'chicobento@gmail.com'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        userType: true,
        isActive: true,
        isVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      console.log('❌ Usuario chicobento@gmail.com no encontrado en la base de datos');
      console.log('💡 Necesitas crear este usuario primero o verificar que el email sea correcto');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   👤 Nombre: ${user.firstName} ${user.lastName || ''}`);
    console.log(`   🎭 Rol actual: ${user.role}`);
    console.log(`   👥 Tipo: ${user.userType}`);
    console.log(`   ✅ Activo: ${user.isActive}`);
    console.log(`   🔒 Verificado: ${user.isVerified}`);
    console.log(`   📅 Creado: ${user.createdAt}`);

    if (user.role === 'ADMIN') {
      console.log('✅ El usuario ya tiene rol de ADMIN');
      return;
    }

    console.log('🔄 Actualizando rol a ADMIN...');
    
    const updatedUser = await prisma.user.update({
      where: {
        email: 'chicobento@gmail.com'
      },
      data: {
        role: 'ADMIN',
        isActive: true,
        isVerified: true
      }
    });

    console.log('✅ Usuario actualizado exitosamente:');
    console.log(`   🎭 Nuevo rol: ${updatedUser.role}`);
    console.log(`   ✅ Activo: ${updatedUser.isActive}`);
    console.log(`   🔒 Verificado: ${updatedUser.isVerified}`);
    console.log('');
    console.log('🎉 El usuario chicobento@gmail.com ahora puede acceder al panel de administración');

  } catch (error) {
    console.error('❌ Error al verificar/actualizar usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndUpdateAdminUser();