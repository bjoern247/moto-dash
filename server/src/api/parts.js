const { Router } = require('express')
const crypto = require('node:crypto')
const { z } = require('zod')

const router = Router()

module.exports = function createPartRoutes (db) {
  const schema = z.object({
    bikeId: z.string().min(1),
    name: z.string().min(1),
    manufacturer: z.string().optional().or(z.literal('')),
    installedAt: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal(''))
  })

  router.get('/', async (req, res, next) => {
    try {
      const list = await db.all('SELECT * FROM parts ORDER BY created_at DESC')
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
        INSERT INTO parts (id, bike_id, name, manufacturer, installed_at, notes)
        VALUES (@id, @bikeId, @name, @manufacturer, @installedAt, @notes)
      `
      await db.run(statement, { ...payload, id })
      const entry = await db.get('SELECT * FROM parts WHERE id = ?', id)
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
        .map((field) => `${field === 'bikeId' ? 'bike_id' : field === 'installedAt' ? 'installed_at' : field} = @${field}`)
        .join(', ')

      const statement = `
        UPDATE parts
        SET ${setClause}, updated_at = datetime('now')
        WHERE id = @id
      `
      await db.run(statement, { ...payload, id: req.params.id })
      const entry = await db.get('SELECT * FROM parts WHERE id = ?', req.params.id)
      res.json(entry)
    } catch (error) {
      next(error)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      await db.run('DELETE FROM parts WHERE id = ?', req.params.id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  })

  return router
}

