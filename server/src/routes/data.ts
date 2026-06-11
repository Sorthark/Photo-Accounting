import { Router } from 'express'
import { randomUUID } from 'crypto'
import { db, reindexRecords, type DbProject, type DbRecord } from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

function mapProject(row: DbProject) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    type: row.type,
    defaultPrice: row.default_price,
    defaultPostProcessingQty: row.default_post_processing_qty,
  }
}

function mapRecord(row: DbRecord) {
  return {
    id: row.id,
    serialNo: row.serial_no,
    date: row.date,
    time: row.time,
    client: row.client,
    cn: row.cn,
    projectId: row.project_id,
    price: row.price,
    location: row.location,
    postProcessingQty: row.post_processing_qty,
    remarks: row.remarks,
  }
}

function runBatch(fn: () => void) {
  db.exec('BEGIN')
  try {
    fn()
    db.exec('COMMIT')
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
}

router.get('/bootstrap', (req, res) => {
  const userId = req.auth!.userId
  const projects = db
    .prepare(`SELECT * FROM projects WHERE user_id = ? ORDER BY name ASC`)
    .all(userId) as DbProject[]
  reindexRecords(userId)
  const records = db
    .prepare(`SELECT * FROM records WHERE user_id = ? ORDER BY date ASC, time ASC`)
    .all(userId) as DbRecord[]

  res.json({
    projects: projects.map(mapProject),
    records: records.map(mapRecord),
  })
})

router.get('/projects', (req, res) => {
  const rows = db
    .prepare(`SELECT * FROM projects WHERE user_id = ? ORDER BY name ASC`)
    .all(req.auth!.userId) as DbProject[]
  res.json(rows.map(mapProject))
})

router.post('/projects', (req, res) => {
  const userId = req.auth!.userId
  const { name, color, type, defaultPrice, defaultPostProcessingQty } = req.body
  if (!name?.trim()) {
    res.status(400).json({ message: '项目名称不能为空' })
    return
  }
  const id = randomUUID()
  db.prepare(
    `INSERT INTO projects (id, user_id, name, color, type, default_price, default_post_processing_qty)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    userId,
    name.trim(),
    color || '#4A7CF7',
    type === 'expense' ? 'expense' : 'income',
    Math.abs(Number(defaultPrice) || 0),
    Math.max(0, Number(defaultPostProcessingQty) || 0),
  )
  const row = db.prepare(`SELECT * FROM projects WHERE id = ?`).get(id) as DbProject
  res.status(201).json(mapProject(row))
})

router.put('/projects/:id', (req, res) => {
  const userId = req.auth!.userId
  const { id } = req.params
  const existing = db
    .prepare(`SELECT * FROM projects WHERE id = ? AND user_id = ?`)
    .get(id, userId) as DbProject | undefined
  if (!existing) {
    res.status(404).json({ message: '项目不存在' })
    return
  }
  const { name, color, type, defaultPrice, defaultPostProcessingQty } = req.body
  db.prepare(
    `UPDATE projects SET name=?, color=?, type=?, default_price=?, default_post_processing_qty=? WHERE id=? AND user_id=?`,
  ).run(
    name?.trim() || existing.name,
    color || existing.color,
    type === 'expense' ? 'expense' : type === 'income' ? 'income' : existing.type,
    defaultPrice !== undefined ? Math.abs(Number(defaultPrice)) : existing.default_price,
    defaultPostProcessingQty !== undefined
      ? Math.max(0, Number(defaultPostProcessingQty))
      : existing.default_post_processing_qty,
    id,
    userId,
  )
  const row = db.prepare(`SELECT * FROM projects WHERE id = ?`).get(id) as DbProject
  res.json(mapProject(row))
})

router.delete('/projects/:id', (req, res) => {
  const userId = req.auth!.userId
  const { id } = req.params
  const inUse = db
    .prepare(`SELECT id FROM records WHERE project_id = ? AND user_id = ? LIMIT 1`)
    .get(id, userId)
  if (inUse) {
    res.status(400).json({ message: '该项目下仍有事项，无法删除' })
    return
  }
  const result = db.prepare(`DELETE FROM projects WHERE id = ? AND user_id = ?`).run(id, userId)
  if (result.changes === 0) {
    res.status(404).json({ message: '项目不存在' })
    return
  }
  res.status(204).send()
})

router.post('/records', (req, res) => {
  const userId = req.auth!.userId
  const { date, time, client, cn, projectId, price, location, postProcessingQty, remarks } =
    req.body
  if (!date || !projectId) {
    res.status(400).json({ message: '日期和项目不能为空' })
    return
  }
  const id = randomUUID()
  db.prepare(
    `INSERT INTO records (id, user_id, serial_no, date, time, client, cn, project_id, price, location, post_processing_qty, remarks)
     VALUES (?, ?, '000', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    userId,
    date,
    time || '',
    client?.trim() || '',
    cn?.trim() || '',
    projectId,
    Math.abs(Number(price) || 0),
    location?.trim() || '',
    Math.max(0, Number(postProcessingQty) || 0),
    remarks?.trim() || '',
  )
  reindexRecords(userId)
  const row = db.prepare(`SELECT * FROM records WHERE id = ?`).get(id) as DbRecord
  res.status(201).json(mapRecord(row))
})

router.put('/records/:id', (req, res) => {
  const userId = req.auth!.userId
  const { id } = req.params
  const existing = db
    .prepare(`SELECT * FROM records WHERE id = ? AND user_id = ?`)
    .get(id, userId) as DbRecord | undefined
  if (!existing) {
    res.status(404).json({ message: '事项不存在' })
    return
  }
  const { date, time, client, cn, projectId, price, location, postProcessingQty, remarks } =
    req.body
  db.prepare(
    `UPDATE records SET date=?, time=?, client=?, cn=?, project_id=?, price=?, location=?, post_processing_qty=?, remarks=? WHERE id=? AND user_id=?`,
  ).run(
    date || existing.date,
    time ?? existing.time,
    client?.trim() ?? existing.client,
    cn?.trim() ?? existing.cn,
    projectId || existing.project_id,
    price !== undefined ? Math.abs(Number(price)) : existing.price,
    location?.trim() ?? existing.location,
    postProcessingQty !== undefined
      ? Math.max(0, Number(postProcessingQty))
      : existing.post_processing_qty,
    remarks?.trim() ?? existing.remarks,
    id,
    userId,
  )
  reindexRecords(userId)
  const row = db.prepare(`SELECT * FROM records WHERE id = ?`).get(id) as DbRecord
  res.json(mapRecord(row))
})

router.delete('/records/:id', (req, res) => {
  const userId = req.auth!.userId
  const result = db
    .prepare(`DELETE FROM records WHERE id = ? AND user_id = ?`)
    .run(req.params.id, userId)
  if (result.changes === 0) {
    res.status(404).json({ message: '事项不存在' })
    return
  }
  reindexRecords(userId)
  res.status(204).send()
})

router.post('/records/batch-delete', (req, res) => {
  const userId = req.auth!.userId
  const { ids } = req.body as { ids?: string[] }
  if (!ids?.length) {
    res.status(400).json({ message: '请选择要删除的事项' })
    return
  }
  const del = db.prepare(`DELETE FROM records WHERE id = ? AND user_id = ?`)
  runBatch(() => {
    for (const id of ids) del.run(id, userId)
  })
  reindexRecords(userId)
  res.status(204).send()
})

export default router
