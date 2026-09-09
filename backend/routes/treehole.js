const Router = require('koa-router')
const { run, all } = require('../db')
const { auth } = require('../middleware/auth')
const { validateString, handleValidationError } = require('../utils/validate')

const router = new Router({ prefix: '/api/treehole' })

// 发送树洞消息
router.post('/', auth, async (ctx) => {
  const { content, emotion, reply, song } = ctx.request.body

  try {
    const validContent = validateString(content, { required: true, min: 1, max: 2000, field: '树洞内容' })
    const validEmotion = validateString(emotion, { required: false, max: 50, field: '情绪标签' })
    const validReply = validateString(reply, { required: false, max: 2000, field: 'AI回复' })
    const validSong = validateString(song, { required: false, max: 200, field: '歌曲名' })

    const result = await run(`
      INSERT INTO treehole_messages (user_id, content, emotion, reply, song)
      VALUES (?, ?, ?, ?, ?)
    `, [ctx.state.user.id, validContent, validEmotion || '', validReply || '', validSong || ''])

    ctx.body = { code: 200, message: '发送成功', data: { id: result.lastID } }
  } catch (err) {
    if (!handleValidationError(ctx, err)) throw err
  }
})

// 获取我的树洞消息
router.get('/my', auth, async (ctx) => {
  const messages = await all(`
    SELECT * FROM treehole_messages WHERE user_id = ? ORDER BY created_at DESC
  `, [ctx.state.user.id])
  ctx.body = { code: 200, data: messages }
})

// 清空我的树洞
router.delete('/my', auth, async (ctx) => {
  await run('DELETE FROM treehole_messages WHERE user_id = ?', [ctx.state.user.id])
  ctx.body = { code: 200, message: '清空成功' }
})

module.exports = router
