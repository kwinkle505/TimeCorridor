const Router = require('koa-router')
const { run, get, all } = require('../db')
const { auth } = require('../middleware/auth')
const { validateId, validatePagination, validateString, validateArray, validateDate, toBoolean, getLocalDateString, handleValidationError } = require('../utils/validate')

const router = new Router({ prefix: '/api/capsules' })

// 创建胶囊
router.post('/', auth, async (ctx) => {
  const { name, items, openDate, isPublic } = ctx.request.body

  try {
    const validName = validateString(name, { required: true, min: 1, max: 100, field: '胶囊名称' })
    const validOpenDate = validateDate(openDate, true)

    const result = await run(`
      INSERT INTO capsules (user_id, name, items, open_date, is_public)
      VALUES (?, ?, ?, ?, ?)
    `, [ctx.state.user.id, validName, JSON.stringify(validateArray(items)), validOpenDate, toBoolean(isPublic) ? 1 : 0])

    ctx.body = { code: 200, message: '封存成功', data: { id: result.lastID } }
  } catch (err) {
    if (!handleValidationError(ctx, err)) throw err
  }
})

// 获取我的胶囊
router.get('/my', auth, async (ctx) => {
  const capsules = await all(`
    SELECT * FROM capsules WHERE user_id = ? ORDER BY created_at DESC
  `, [ctx.state.user.id])
  ctx.body = { code: 200, data: capsules }
})

// 获取公开胶囊（陈列馆）
// 规则：未开启的胶囊只显示基本信息（名称/作者/开启日期），不显示内容
router.get('/public', async (ctx) => {
  const { page, size, offset } = validatePagination(ctx, { page: 1, size: 12, maxSize: 50 })

  const capsules = await all(`
    SELECT c.id, c.name, c.items, c.open_date, c.is_public, c.opened, c.created_at,
           u.nickname as author_name
    FROM capsules c
    JOIN users u ON c.user_id = u.id
    WHERE c.is_public = 1
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `, [size, offset])

  const { total } = await get(
    'SELECT COUNT(*) as total FROM capsules WHERE is_public = 1'
  )

  // 处理未开启胶囊：隐藏内容，只保留外壳信息
  const today = getLocalDateString()
  const processed = capsules.map(c => {
    const isOpened = c.opened === 1 || c.opened === true || c.open_date <= today
    if (isOpened) {
      return { ...c, opened: 1 }
    } else {
      // 未开启：隐藏 items，只显示名称和倒计时
      return {
        id: c.id,
        name: c.name,
        open_date: c.open_date,
        is_public: c.is_public,
        opened: 0,
        created_at: c.created_at,
        author_name: c.author_name,
        items: null, // 内容隐藏
        locked: true
      }
    }
  })

  ctx.body = {
    code: 200,
    data: { list: processed, total, page, size }
  }
})

// 开启胶囊
router.post('/:id/open', auth, async (ctx) => {
  const id = validateId(ctx)
  if (!id) return

  const capsule = await get('SELECT * FROM capsules WHERE id = ?', [id])
  if (!capsule || capsule.user_id !== ctx.state.user.id) {
    ctx.status = 403
    ctx.body = { code: 403, message: '无权操作' }
    return
  }

  // 校验开启日期：未到开启日期不能开启
  const today = getLocalDateString()
  if (capsule.open_date && capsule.open_date > today) {
    ctx.status = 400
    ctx.body = { code: 400, message: `胶囊还未到开启日期（${capsule.open_date}），耐心等待吧` }
    return
  }

  // 已经开启过的不再重复开启
  if (capsule.opened === 1) {
    ctx.body = { code: 200, message: '胶囊已开启', data: capsule }
    return
  }

  await run('UPDATE capsules SET opened = 1 WHERE id = ?', [id])
  ctx.body = { code: 200, message: '开启成功', data: { ...capsule, opened: 1 } }
})

// 删除胶囊
router.delete('/:id', auth, async (ctx) => {
  const id = validateId(ctx)
  if (!id) return

  const capsule = await get('SELECT * FROM capsules WHERE id = ?', [id])
  if (!capsule || capsule.user_id !== ctx.state.user.id) {
    ctx.status = 403
    ctx.body = { code: 403, message: '无权删除' }
    return
  }
  await run('DELETE FROM capsules WHERE id = ?', [id])
  // 同时删除相关点赞记录
  await run('DELETE FROM capsule_likes WHERE capsule_id = ?', [id])
  ctx.body = { code: 200, message: '删除成功' }
})

// 点赞 / 取消点赞
router.post('/:id/like', auth, async (ctx) => {
  const capsuleId = validateId(ctx)
  if (!capsuleId) return
  const userId = ctx.state.user.id

  const capsule = await get('SELECT id, is_public FROM capsules WHERE id = ?', [capsuleId])
  if (!capsule) {
    ctx.status = 404
    ctx.body = { code: 404, message: '胶囊不存在' }
    return
  }

  // 只能对公开胶囊点赞
  if (!capsule.is_public) {
    ctx.status = 403
    ctx.body = { code: 403, message: '只能对公开胶囊点赞' }
    return
  }

  // 检查是否已点赞
  const existing = await get(
    'SELECT id FROM capsule_likes WHERE user_id = ? AND capsule_id = ?',
    [userId, capsuleId]
  )

  if (existing) {
    // 取消点赞
    await run('DELETE FROM capsule_likes WHERE user_id = ? AND capsule_id = ?', [userId, capsuleId])
    await run('UPDATE capsules SET likes = likes - 1 WHERE id = ?', [capsuleId])
    ctx.body = { code: 200, message: '已取消点赞', data: { liked: false } }
  } else {
    // 新增点赞
    try {
      await run(
        'INSERT INTO capsule_likes (user_id, capsule_id) VALUES (?, ?)',
        [userId, capsuleId]
      )
    } catch (e) {
      ctx.status = 400
      ctx.body = { code: 400, message: '已点赞过了' }
      return
    }
    await run('UPDATE capsules SET likes = likes + 1 WHERE id = ?', [capsuleId])
    ctx.body = { code: 200, message: '点赞成功', data: { liked: true } }
  }
})

module.exports = router
