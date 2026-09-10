const Router = require('koa-router')
const { run, get, all } = require('../db')
const { auth } = require('../middleware/auth')
const { validateId, validateString, validatePagination, handleValidationError } = require('../utils/validate')

const router = new Router({ prefix: '/api/quotes' })

// 收藏句签
router.post('/favorite', auth, async (ctx) => {
  const { quoteText, quoteSource } = ctx.request.body

  try {
    const validText = validateString(quoteText, { required: true, min: 1, max: 500, field: '句签内容' })
    const validSource = validateString(quoteSource, { required: false, max: 200, field: '句签来源' })

    const result = await run(`
      INSERT INTO quote_favorites (user_id, quote_text, quote_source)
      VALUES (?, ?, ?)
    `, [ctx.state.user.id, validText, validSource || ''])

    ctx.body = { code: 200, message: '收藏成功', data: { id: result.lastID } }
  } catch (err) {
    if (!handleValidationError(ctx, err)) throw err
  }
})

// 获取我的收藏
router.get('/favorites', auth, async (ctx) => {
  const { page, size, offset } = validatePagination(ctx, { page: 1, size: 100, maxSize: 200 })
  const favorites = await all(`
    SELECT * FROM quote_favorites WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
  `, [ctx.state.user.id, size, offset])
  const { total } = await get('SELECT COUNT(*) as total FROM quote_favorites WHERE user_id = ?', [ctx.state.user.id])
  ctx.body = { code: 200, data: { list: favorites, total, page, size } }
})

// 取消收藏
router.delete('/favorites/:id', auth, async (ctx) => {
  const id = validateId(ctx)
  if (!id) return

  await run('DELETE FROM quote_favorites WHERE id = ? AND user_id = ?',
    [id, ctx.state.user.id])
  ctx.body = { code: 200, message: '取消收藏成功' }
})

module.exports = router
