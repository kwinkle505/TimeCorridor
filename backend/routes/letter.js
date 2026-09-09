const Router = require('koa-router')
const { run, get, all } = require('../db')
const { auth } = require('../middleware/auth')
const { validateId, validatePagination, validateString, validateArray, toBoolean, handleValidationError } = require('../utils/validate')

const router = new Router({ prefix: '/api/letters' })

// 创建信件
router.post('/', auth, async (ctx) => {
  const { recipient, salutation, content, moods, types, reply, isPublic, writeDate } = ctx.request.body
  const userId = ctx.state.user.id

  try {
    const validContent = validateString(content, { required: true, min: 1, max: 10000, field: '信件内容' })
    const validRecipient = validateString(recipient, { required: false, max: 100, field: '收件人' })
    const validSalutation = validateString(salutation, { required: false, max: 50, field: '称呼' })
    const validReply = validateString(reply, { required: false, max: 5000, field: 'AI回信' })

    const result = await run(`
      INSERT INTO letters (user_id, recipient, salutation, content, moods, types, reply, is_public, write_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, validRecipient || '', validSalutation || '', validContent, JSON.stringify(validateArray(moods)), JSON.stringify(validateArray(types)), validReply || '', toBoolean(isPublic) ? 1 : 0, writeDate || ''])

    ctx.body = { code: 200, message: '保存成功', data: { id: result.lastID } }
  } catch (err) {
    if (!handleValidationError(ctx, err)) throw err
  }
})

// 获取我的信件
router.get('/my', auth, async (ctx) => {
  const letters = await all(`
    SELECT * FROM letters WHERE user_id = ? ORDER BY created_at DESC
  `, [ctx.state.user.id])
  ctx.body = { code: 200, data: letters }
})

// 获取公开信件（故事墙）
router.get('/public', async (ctx) => {
  const { page, size, offset } = validatePagination(ctx, { page: 1, size: 12, maxSize: 50 })
  const mood = String(ctx.query.mood || '').trim().slice(0, 50)
  const allowedSorts = ['newest', 'hot']
  const sort = allowedSorts.includes(ctx.query.sort) ? ctx.query.sort : 'newest'

  let sql = `
    SELECT l.*, u.nickname as author_name
    FROM letters l
    JOIN users u ON l.user_id = u.id
    WHERE l.is_public = 1
  `
  let countSql = 'SELECT COUNT(*) as total FROM letters WHERE is_public = 1'
  const params = []

  if (mood) {
    sql += ' AND l.moods LIKE ?'
    countSql += ' AND moods LIKE ?'
    params.push(`%${mood}%`)
  }

  sql += sort === 'hot' ? ' ORDER BY l.id DESC' : ' ORDER BY l.created_at DESC'
  sql += ' LIMIT ? OFFSET ?'

  const letters = await all(sql, [...params, size, offset])
  const { total } = await get(countSql, params)

  ctx.body = {
    code: 200,
    data: { list: letters, total, page, size }
  }
})

// 获取单封信件详情
// 规则：公开信所有人可见；私密信仅作者本人和管理员可见
router.get('/:id', async (ctx) => {
  const id = validateId(ctx)
  if (!id) return

  const letter = await get(`
    SELECT l.*, u.nickname as author_name
    FROM letters l
    JOIN users u ON l.user_id = u.id
    WHERE l.id = ?
  `, [id])

  if (!letter) {
    ctx.status = 404
    ctx.body = { code: 404, message: '信件不存在' }
    return
  }

  // 公开信：所有人可见
  if (letter.is_public === 1 || letter.is_public === true) {
    ctx.body = { code: 200, data: letter }
    return
  }

  // 私密信：需要登录
  const token = ctx.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    ctx.status = 404
    ctx.body = { code: 404, message: '信件不存在' }
    return
  }

  // 验证 token
  const jwt = require('jsonwebtoken')
  const JWT_SECRET = process.env.JWT_SECRET || 'time-corridor-dev-default-change-me'
  let user = null
  try {
    user = jwt.verify(token, JWT_SECRET)
  } catch (err) {
    ctx.status = 404
    ctx.body = { code: 404, message: '信件不存在' }
    return
  }

  // 作者本人或管理员可见
  if (letter.user_id !== user.id && user.role !== 'admin') {
    ctx.status = 404
    ctx.body = { code: 404, message: '信件不存在' }
    return
  }

  ctx.body = { code: 200, data: letter }
})

// 更新信件公开状态
router.put('/:id/public', auth, async (ctx) => {
  const id = validateId(ctx)
  if (!id) return

  const letter = await get('SELECT * FROM letters WHERE id = ?', [id])
  if (!letter || letter.user_id !== ctx.state.user.id) {
    ctx.status = 403
    ctx.body = { code: 403, message: '无权操作' }
    return
  }
  await run('UPDATE letters SET is_public = 1 WHERE id = ?', [id])
  ctx.body = { code: 200, message: '已公开' }
})

// 删除信件
router.delete('/:id', auth, async (ctx) => {
  const id = validateId(ctx)
  if (!id) return

  const letter = await get('SELECT * FROM letters WHERE id = ?', [id])
  if (!letter) {
    ctx.status = 404
    ctx.body = { code: 404, message: '信件不存在' }
    return
  }
  if (letter.user_id !== ctx.state.user.id && ctx.state.user.role !== 'admin') {
    ctx.status = 403
    ctx.body = { code: 403, message: '无权删除' }
    return
  }
  await run('DELETE FROM letters WHERE id = ?', [id])
  // 同时删除相关共鸣记录
  await run('DELETE FROM letter_likes WHERE letter_id = ?', [id])
  ctx.body = { code: 200, message: '删除成功' }
})

// 共鸣 / 取消共鸣
router.post('/:id/like', auth, async (ctx) => {
  const letterId = validateId(ctx)
  if (!letterId) return
  const userId = ctx.state.user.id

  const letter = await get('SELECT id, is_public FROM letters WHERE id = ?', [letterId])
  if (!letter) {
    ctx.status = 404
    ctx.body = { code: 404, message: '信件不存在' }
    return
  }

  // 只能对公开信共鸣
  if (!letter.is_public) {
    ctx.status = 403
    ctx.body = { code: 403, message: '只能对公开信件共鸣' }
    return
  }

  // 检查是否已共鸣
  const existing = await get(
    'SELECT id FROM letter_likes WHERE user_id = ? AND letter_id = ?',
    [userId, letterId]
  )

  if (existing) {
    // 取消共鸣
    await run('DELETE FROM letter_likes WHERE user_id = ? AND letter_id = ?', [userId, letterId])
    await run('UPDATE letters SET likes = likes - 1 WHERE id = ?', [letterId])
    ctx.body = { code: 200, message: '已取消共鸣', data: { liked: false } }
  } else {
    // 新增共鸣
    try {
      await run(
        'INSERT INTO letter_likes (user_id, letter_id) VALUES (?, ?)',
        [userId, letterId]
      )
    } catch (e) {
      // 唯一约束冲突
      ctx.status = 400
      ctx.body = { code: 400, message: '已共鸣过了' }
      return
    }
    await run('UPDATE letters SET likes = likes + 1 WHERE id = ?', [letterId])
    ctx.body = { code: 200, message: '共鸣成功', data: { liked: true } }
  }
})

// 批量获取当前用户对指定信件的共鸣状态
router.get('/likes/batch', auth, async (ctx) => {
  const { ids } = ctx.query
  if (!ids) {
    ctx.body = { code: 200, data: [] }
    return
  }
  const letterIds = ids.split(',').map(Number).filter(n => !isNaN(n))
  if (letterIds.length === 0) {
    ctx.body = { code: 200, data: [] }
    return
  }
  const placeholders = letterIds.map(() => '?').join(',')
  const rows = await all(
    `SELECT letter_id FROM letter_likes WHERE user_id = ? AND letter_id IN (${placeholders})`,
    [ctx.state.user.id, ...letterIds]
  )
  ctx.body = { code: 200, data: rows.map(r => r.letter_id) }
})

module.exports = router
