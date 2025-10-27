const { Router } = require('express')
const crypto = require('node:crypto')
const { z } = require('zod')

const router = Router()

module.exports = function createTourRoutes (db) {
  const schema = z.object({
    bikeId: z.string().min(1),
    name: z.string().min(1),
    start: z.string().optional().or(z.literal('')),
    end: z.string().optional().or(z.literal('')),
    distance: z.coerce.number().nonnegative(),
    gpx: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
    createdAt: z.string().optional().or(z.literal(''))
  })

  router.get('/', async (req, res, next) => {
    try {
      const list = await db.all(
        'SELECT * FROM tours ORDER BY created_at DESC'
      )
      res.json(list)
    } catch (error) {
      next(error)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
      const payload = schema.parse(req.body)
      const id = crypto.randomUUID()
      const statement = `
        INSERT INTO tours (id, bike_id, name, start, "end", distance, gpx, notes, created_at)
        VALUES (@id, @bikeId, @name, @start, @end, @distance, @gpx, @notes, COALESCE(NULLIF(@createdAt, ''), datetime('now')))
      `
      await db.run(statement, { ...payload, id })
      const entry = await db.get('SELECT * FROM tours WHERE id = ?', id)
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

      const mapField = (field) => {
        if (field === 'bikeId') return 'bike_id'
        if (field === 'createdAt') return 'created_at'
        return field
      }

      const setClause = fields
        .map((field) => `${mapField(field)} = @${field}`)
        .join(', ')

      const statement = `
        UPDATE tours
        SET ${setClause}, updated_at = datetime('now')
        WHERE id = @id
      `
      await db.run(statement, { ...payload, id: req.params.id })
      const entry = await db.get('SELECT * FROM tours WHERE id = ?', req.params.id)
      res.json(entry)
    } catch (error) {
      next(error)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      await db.run('DELETE FROM tours WHERE id = ?', req.params.id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  })

  return router
}

