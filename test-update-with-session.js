const { PrismaClient } = require('@prisma/client');
const FormData = require('form-data');
const { default: fetch } = require('node-fetch');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function testUpdateWithAuth() {
  try {
    console.log('🧪 Probando creación de actualización con autenticación simulada\n');

    // 1. Verificar que la campaña y usuario existen
    const campaignId = 'cmg5im1pq0003u8ygxxaq2ij1';
    const userEmail = 'test@example.com';

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { creator: true }
    });

    if (!campaign) {
      console.log('❌ Campaña no encontrada');
      return;
    }

    console.log('✅ Campaña encontrada:', campaign.title);
    console.log('✅ Creador:', campaign.creator.firstName, campaign.creator.email);

    // 2. Crear FormData como lo haría el frontend
    const form = new FormData();
    form.append('title', 'Actualización de prueba desde script');
    form.append('content', 'Esta es una prueba para verificar el funcionamiento del endpoint de actualizaciones. Estamos progresando muy bien con la campaña.');
    form.append('type', 'PROGRESS');
    form.append('isPublic', 'true');

    // 3. Crear una imagen de prueba simple (SVG)
    const testImageSvg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#4F46E5"/>
      <text x="50" y="50" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="12">TEST</text>
    </svg>`;
    
    const testImagePath = path.join(__dirname, 'test-image-temp.svg');
    fs.writeFileSync(testImagePath, testImageSvg);
    
    form.append('images', fs.createReadStream(testImagePath), {
      filename: 'test-update.svg',
      contentType: 'image/svg+xml'
    });

    console.log('📝 FormData preparado:');
    console.log('   - title: Actualización de prueba desde script');
    console.log('   - content: [contenido de prueba]');
    console.log('   - type: PROGRESS');
    console.log('   - isPublic: true');
    console.log('   - images: test-update.svg\n');

    // 4. Hacer la petición al endpoint
    console.log('🚀 Enviando petición al endpoint...');
    
    const response = await fetch(`http://localhost:3000/api/campaigns/${campaignId}/updates`, {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders(),
        // Nota: En una aplicación real, aquí iría la cookie de sesión
        // 'Cookie': 'next-auth.session-token=...'
      }
    });

    const responseText = await response.text();
    
    console.log('📊 Respuesta del servidor:');
    console.log('   - Status:', response.status);
    console.log('   - Headers:', Object.fromEntries(response.headers.entries()));
    console.log('   - Body:', responseText);

    // 5. Limpiar archivo temporal
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }

    // 6. Analizar la respuesta
    if (response.status === 401) {
      console.log('\n❌ Error de autenticación (esperado sin cookie de sesión)');
      console.log('   El usuario necesita estar logueado en el navegador');
    } else if (response.status === 400) {
      console.log('\n❌ Error de validación o datos');
      try {
        const errorData = JSON.parse(responseText);
        console.log('   Error details:', errorData);
      } catch (e) {
        console.log('   Raw error:', responseText);
      }
    } else if (response.status === 200 || response.status === 201) {
      console.log('\n✅ Actualización creada exitosamente');
    } else {
      console.log('\n⚠️ Respuesta inesperada');
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testUpdateWithAuth();