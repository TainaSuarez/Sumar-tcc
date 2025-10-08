const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyAdminUser() {
  try {
    console.log('🔄 Verificando usuario chicobento@gmail.com...');
    
    const updatedUser = await prisma.user.update({
      where: {
        email: 'chicobento@gmail.com'
      },
      data: {
        isVerified: true,
        isActive: true
      }
    });

    console.log('✅ Usuario verificado exitosamente:');
    console.log(`   📧 Email: ${updatedUser.email}`);
    console.log(`   🎭 Rol: ${updatedUser.role}`);
    console.log(`   ✅ Activo: ${updatedUser.isActive}`);
    console.log(`   🔒 Verificado: ${updatedUser.isVerified}`);
    console.log('');
    console.log('🎉 El usuario chicobento@gmail.com ahora debería poder acceder al panel de administración sin problemas');

  } catch (error) {
    console.error('❌ Error al verificar usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdminUser();