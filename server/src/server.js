const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

const { createDatabase } = require('./db/index');
const createBikeRoutes = require('./api/bikes');
const createMaintenanceRoutes = require('./api/maintenance');
const createFuelRoutes = require('./api/fuel');
const createPartRoutes = require('./api/parts');
const createTourRoutes = require('./api/tours');

dotenv.config();

async function createServer() {
  const db = await createDatabase();

  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/bikes', createBikeRoutes(db));
  app.use('/maintenance', createMaintenanceRoutes(db));
  app.use('/fuel', createFuelRoutes(db));
  app.use('/parts', createPartRoutes(db));
  app.use('/tours', createTourRoutes(db));

  const port = process.env.PORT ?? 4000;

  app.listen(port, () => {
    console.log(`MotoDash API läuft auf Port ${port}`);
  });

  return { app, db };
}

createServer().catch((error) => {
  console.error('Server konnte nicht gestartet werden:', error);
  process.exit(1);
});
