const http = require('http');

// Configuración para la llamada al endpoint con cookies de sesión
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/admin/stats',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    // Simular cookies de sesión (estas serían las cookies reales del navegador)
    'Cookie': 'next-auth.session-token=test; next-auth.csrf-token=test'
  }
};

console.log('🔍 Probando endpoint /api/admin/stats con cookies de sesión...');
console.log(`📍 URL: http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  console.log(`\n📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`\n📄 Response Body:`);
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log(data);
    }
    
    console.log('\n💡 Nota: Para una prueba real, necesitas:');
    console.log('1. Iniciar sesión en el navegador en http://localhost:3001');
    console.log('2. Copiar las cookies de sesión reales');
    console.log('3. Usar esas cookies en este script');
  });
});

req.on('error', (e) => {
  console.error(`❌ Error en la petición: ${e.message}`);
});

req.end();