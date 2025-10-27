import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createDatabase } from './db/index.js'
import createBikeRoutes from './api/bikes.js'
import createMaintenanceRoutes from './api/maintenance.js'
import createFuelRoutes from './api/fuel.js'
import createPartRoutes from './api/parts.js'
import createTourRoutes from './api/tours.js'

dotenv.config()

async function createServer () {
  const db = await createDatabase()

  const app = express()

  app.use(helmet())
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }))
  app.use(express.json())
  app.use(morgan('dev'))

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() })
  })

  app.use('/bikes', createBikeRoutes(db))
  app.use('/maintenance', createMaintenanceRoutes(db))
  app.use('/fuel', createFuelRoutes(db))
  app.use('/parts', createPartRoutes(db))
  app.use('/tours', createTourRoutes(db))

  const port = process.env.PORT ?? 4000

  app.listen(port, () => {
    console.log(`MotoDash API läuft auf Port ${port}`)
  })

  return { app, db }
}

createServer().catch((error) => {
  console.error('Server konnte nicht gestartet werden:', error)
  process.exit(1)
})

