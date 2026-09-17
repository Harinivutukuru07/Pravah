import app from './app.js';
import { env } from './config/index.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║          PRAVAH API Server                ║
  ║  Industrial ERP Backend                   ║
  ╠═══════════════════════════════════════════╣
  ║  Port:     ${String(PORT).padEnd(30)}║
  ║  Mode:     ${env.NODE_ENV.padEnd(30)}║
  ║  API:      http://localhost:${PORT}/api     ║
  ╚═══════════════════════════════════════════╝
  `);
});
