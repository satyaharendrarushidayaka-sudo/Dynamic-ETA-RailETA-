const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
  try {
    console.log("Starting backend tunnel...");
    const backendTunnel = await localtunnel({ port: 8000 });
    console.log(`[SUCCESS] Backend Tunnel URL: ${backendTunnel.url}`);
    
    // Write backend url to api.js
    const apiPath = './frontend/src/services/api.js';
    let apiCode = fs.readFileSync(apiPath, 'utf8');
    apiCode = apiCode.replace(/const API_BASE_URL = ".*?";/, `const API_BASE_URL = "${backendTunnel.url}/api";`);
    fs.writeFileSync(apiPath, apiCode);
    console.log('[SUCCESS] Updated API_BASE_URL in frontend.');

    console.log("Starting frontend tunnel...");
    const frontendTunnel = await localtunnel({ port: 5173 });
    console.log(`[SUCCESS] Frontend Tunnel URL: ${frontendTunnel.url}`);
    
    fs.writeFileSync('tunnel_urls.txt', `Frontend: ${frontendTunnel.url}\nBackend: ${backendTunnel.url}`);

    backendTunnel.on('close', () => console.log('Backend tunnel closed'));
    frontendTunnel.on('close', () => console.log('Frontend tunnel closed'));
    
    console.log('Tunnels are active and running in the background!');
  } catch (err) {
    console.error('Error starting tunnels:', err);
  }
})();
