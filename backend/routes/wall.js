const Router = require('koa-router')
const { run, get, all, transaction } = require('../db')
const { auth } = require('../middleware/auth')
const { validateId, validatePagination, validateString, validateEnum, getLocalDateString, handleValidationError } = require('../utils/validate')

const router = new Router({ prefix: '/api/wall' })

// 发布留言
router.post('/', auth, async (ctx) => {
  const { content, type } = ctx.request.body

  try {
    const validContent = validateString(content, { required: true, min: 1, max: 500, field: '留言内容' })
    const allowedTypes = ['encourage', 'reflect', 'thanks', 'memory']
    const validType = validateEnum(type, allowedTypes, '留言类型') || 'encourage'

    // 每日限制3条
    const today = getLocalDateString()
    const { count } = await get(`
      SELECT COUNT(*) as count FROM wall_messages
      WHERE user_id = ? AND DATE(created_at) = ?
    `, [ctx.state.user.id, today])

    if (count >= 3) {
      ctx.status = 400
      ctx.body = { code: 400, message: '今日留言已达上限' }
      return
    }

    const result = await run(`
      INSERT INTO wall_messages (user_id, content, type)
      VALUES (?, ?, ?)
    `, [ctx.state.user.id, validContent, validType])

    ctx.body = { code: 200, message: '发布成功', data: { id: result.lastID } }
  } catch (err) {
    if (!handleValidationError(ctx, err)) throw err
  }
})

// 获取留言列表
router.get('/', async (ctx) => {
  const { page, size, offset } = validatePagination(ctx, { page: 1, size: 20, maxSize: 100 })

  const messages = await all(`
    SELECT w.*, u.nickname as author_name
    FROM wall_messages w
    JOIN users u ON w.user_id = u.id
    ORDER BY w.created_at DESC
    LIMIT ? OFFSET ?
  `, [size, offset])

  const { total } = await get('SELECT COUNT(*) as total FROM wall_messages')

  ctx.body = {
    code: 200,
    data: { list: messages, total, page, size }
  }
})

// 点赞留言 / 取消点赞
router.post('/:id/like', auth, async (ctx) => {
  const messageId = validateId(ctx)
  if (!messageId) return
  const userId = ctx.state.user.id

  const message = await get('SELECT id FROM wall_messages WHERE id = ?', [messageId])
  if (!message) {
    ctx.status = 404
    ctx.body = { code: 404, message: '留言不存在' }
    return
  }

  try {
    const result = await transaction(async () => {
      const existing = await get(
        'SELECT id FROM wall_likes WHERE user_id = ? AND message_id = ?',
        [userId, messageId]
      )

      if (existing) {
        await run('DELETE FROM wall_likes WHERE user_id = ? AND message_id = ?', [userId, messageId])
        await run('UPDATE wall_messages SET likes = likes - 1 WHERE id = ?', [messageId])
        return { liked: false }
      } else {
        await run(
          'INSERT INTO wall_likes (user_id, message_id) VALUES (?, ?)',
          [userId, messageId]
        )
        await run('UPDATE wall_messages SET likes = likes + 1 WHERE id = ?', [messageId])
        return { liked: true }
      }
    })
    ctx.body = { code: 200, message: result.liked ? '点赞成功' : '已取消点赞', data: result }
  } catch (e) {
    ctx.status = 400
    ctx.body = { code: 400, message: '操作失败，请稍后重试' }
  }
})

module.exports = router
