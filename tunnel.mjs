import localtunnel from 'localtunnel';

async function start() {
  try {
    const tunnel = await localtunnel({ port: 4000 });
    console.log(`\n========================================`);
    console.log(`TUNNEL ACTIVE: ${tunnel.url}`);
    console.log(`WEBHOOK URL: ${tunnel.url}/webhooks/facebook`);
    console.log(`========================================\n`);

    tunnel.on('close', () => {
      console.log('Tunnel closed. Restarting in 3s...');
      setTimeout(start, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
      setTimeout(start, 3000);
    });
  } catch (err) {
    console.error('Failed to open tunnel:', err);
    setTimeout(start, 3000);
  }
}

start();
