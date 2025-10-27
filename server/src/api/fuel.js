const { Router } = require('express')
const crypto = require('node:crypto')
const { z } = require('zod')

const router = Router()

module.exports = function createFuelRoutes (db) {
  const schema = z.object({
    bikeId: z.string().min(1),
    date: z.string().min(1),
    liters: z.coerce.number().nonnegative(),
    cost: z.coerce.number().nonnegative(),
    distance: z.coerce.number().nonnegative(),
    notes: z.string().optional().or(z.literal(''))
  })

  router.get('/', async (req, res, next) => {
    try {
      const entries = await db.all(
        'SELECT * FROM fuel ORDER BY date DESC, created_at DESC'
      )
      res.json(entries)
    } catch (error) {
      next(error)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
      const payload = schema.parse(req.body)
      const id = crypto.randomUUID()
      const statement = `
        INSERT INTO fuel (id, bike_id, date, liters, cost, distance, notes)
        VALUES (@id, @bikeId, @date, @liters, @cost, @distance, @notes)
      `
      await db.run(statement, { ...payload, id })
      const entry = await db.get('SELECT * FROM fuel WHERE id = ?', id)
      res.status(201).json(entry)
    } catch (error) {
      next(error)
    }
  })

  router.put('/:id', async (req, res, next) => {
    try {
      const payload = schema.partial().parse(req.body)
      const fields = Object.keys(payload)
      if (!fields.length) {
        return res.status(400).json({ message: 'Keine Änderungen angegeben' })
      }

      const setClause = fields
        .map((field) => `${field === 'bikeId' ? 'bike_id' : field} = @${field}`)
        .join(', ')

      const statement = `
        UPDATE fuel
        SET ${setClause}, updated_at = datetime('now')
        WHERE id = @id
      `
      await db.run(statement, { ...payload, id: req.params.id })
      const entry = await db.get('SELECT * FROM fuel WHERE id = ?', req.params.id)
      res.json(entry)
    } catch (error) {
      next(error)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      await db.run('DELETE FROM fuel WHERE id = ?', req.params.id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  })

  return router
}

