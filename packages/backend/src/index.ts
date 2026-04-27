import './instrument.js';

/**
 * Server Entry Point
 */

import 'dotenv/config';
import { app } from './app.js';
import { loadEnv } from './config/env.js';

const env = loadEnv();
const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`CMMS Backend running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Auth endpoints: http://localhost:${PORT}/api/auth/*`);
});

