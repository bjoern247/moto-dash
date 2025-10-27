const { Router } = require('express')
const crypto = require('node:crypto')
const { z } = require('zod')

const router = Router()

module.exports = function createBikeRoutes (db) {
  const bikeSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    year: z.coerce.number().int().min(1950).max(new Date().getFullYear()),
    mileage: z.coerce.number().int().nonnegative(),
    image: z.string().url().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal(''))
  })

  router.get('/', async (req, res, next) => {
    try {
      const bikes = await db.all('SELECT * FROM bikes ORDER BY created_at DESC')
      res.json(bikes)
    } catch (error) {
      next(error)
    }
  })

  router.get('/:id', async (req, res, next) => {
    try {
      const bike = await db.get('SELECT * FROM bikes WHERE id = ?', req.params.id)
      if (!bike) {
        return res.status(404).json({ message: 'Bike nicht gefunden' })
      }
      res.json(bike)
    } catch (error) {
      next(error)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
      const payload = bikeSchema.parse(req.body)
      const id = payload.id ?? crypto.randomUUID()
      const statement = `
        INSERT INTO bikes (id, name, year, mileage, image, notes)
        VALUES (@id, @name, @year, @mileage, @image, @notes)
      `
      await db.run(statement, { ...payload, id })
      const bike = await db.get('SELECT * FROM bikes WHERE id = ?', id)
      res.status(201).json(bike)
    } catch (error) {
      next(error)
    }
  })

  router.put('/:id', async (req, res, next) => {
    try {
      const payload = bikeSchema.partial().parse(req.body)
      const id = req.params.id

      const fields = Object.keys(payload)
      if (!fields.length) {
        return res.status(400).json({ message: 'Keine Änderungen angegeben' })
      }

      const setClause = fields.map((field) => `${field} = @${field}`).join(', ')
      const statement = `UPDATE bikes SET ${setClause}, updated_at = datetime('now') WHERE id = @id`
      await db.run(statement, { ...payload, id })

      const bike = await db.get('SELECT * FROM bikes WHERE id = ?', id)
      res.json(bike)
    } catch (error) {
      next(error)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      await db.run('DELETE FROM bikes WHERE id = ?', req.params.id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  })

  return router
}

