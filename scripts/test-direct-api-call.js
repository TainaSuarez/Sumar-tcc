const http = require('http');

async function testDirectApiCall() {
  console.log('🔍 Probando llamada directa al endpoint /api/admin/stats...\n');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Node.js Test Script'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`📡 Status Code: ${res.statusCode}`);
      console.log(`📡 Status Message: ${res.statusMessage}`);
      console.log(`📡 Headers:`, res.headers);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n📄 Response Body:');
        try {
          const jsonData = JSON.parse(data);
          console.log(JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log('Raw response:', data);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error);
      reject(error);
    });

    req.setTimeout(10000, () => {
      console.error('❌ Request Timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

testDirectApiCall().catch(console.error);