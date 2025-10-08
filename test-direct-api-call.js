const http = require('http');

// Configuración para la llamada al endpoint
const options = {
  hostname: 'localhost',
  port: 3001, // Actualizado al puerto correcto
  path: '/api/admin/stats',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Node.js Test Script'
  }
};

console.log('🔍 Probando endpoint /api/admin/stats...');
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
  });
});

req.on('error', (e) => {
  console.error(`❌ Error en la petición: ${e.message}`);
});

req.end();