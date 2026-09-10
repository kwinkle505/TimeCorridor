const Router = require('koa-router')
const { run, all, get } = require('../db')
const { auth } = require('../middleware/auth')
const { generateTreeholeReply } = require('../services/ai')
const { validateString, validatePagination, handleValidationError } = require('../utils/validate')

const router = new Router({ prefix: '/api/treehole' })

// 发送树洞消息
router.post('/', auth, async (ctx) => {
  const { content, emotion, song } = ctx.request.body

  try {
    const validContent = validateString(content, { required: true, min: 1, max: 2000, field: '树洞内容' })
    const validEmotion = validateString(emotion, { required: false, max: 50, field: '情绪标签' })
    const validSong = validateString(song, { required: false, max: 200, field: '歌曲名' })

    // AI 回复由服务端生成，不接受用户传入
    const user = await get('SELECT gender FROM users WHERE id = ?', [ctx.state.user.id])
    const reply = await generateTreeholeReply({
      content: validContent,
      emotion: validEmotion || '平静',
      gender: user ? user.gender : 'secret'
    })

    const result = await run(`
      INSERT INTO treehole_messages (user_id, content, emotion, reply, song)
      VALUES (?, ?, ?, ?, ?)
    `, [ctx.state.user.id, validContent, validEmotion || '', reply, validSong || ''])

    ctx.body = { code: 200, message: '发送成功', data: { id: result.lastID, reply } }
  } catch (err) {
    if (!handleValidationError(ctx, err)) throw err
  }
})

// 获取我的树洞消息
router.get('/my', auth, async (ctx) => {
  const { page, size, offset } = validatePagination(ctx, { page: 1, size: 100, maxSize: 200 })
  const messages = await all(`
    SELECT * FROM treehole_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
  `, [ctx.state.user.id, size, offset])
  const { total } = await get('SELECT COUNT(*) as total FROM treehole_messages WHERE user_id = ?', [ctx.state.user.id])
  ctx.body = { code: 200, data: { list: messages, total, page, size } }
})

// 清空我的树洞
router.delete('/my', auth, async (ctx) => {
  await run('DELETE FROM treehole_messages WHERE user_id = ?', [ctx.state.user.id])
  ctx.body = { code: 200, message: '清空成功' }
})

module.exports = router
