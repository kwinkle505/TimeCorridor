/**
 * AI 回复路由
 * 前端 → /api/ai/... → services/ai.js → DeepSeek / SiliconFlow
 */

const Router = require('koa-router')
const { auth } = require('../middleware/auth')
const { rateLimit } = require('../middleware/rateLimit')
const { get } = require('../db')
const { generateLetterReply, generateTreeholeReply } = require('../services/ai')
const { validateString, validateArray, handleValidationError } = require('../utils/validate')

const router = new Router({ prefix: '/api/ai' })

const aiLimit = rateLimit({ windowMs: 60000, max: 10, keyFn: (ctx) => 'ai_' + ctx.state.user.id })

/**
 * 生成信件 AI 回信
 * POST /api/ai/reply
 * Body: { content, recipient, moods, types }
 */
router.post('/reply', auth, aiLimit, async (ctx) => {
  try {
    const { content, recipient, moods, types } = ctx.request.body

    const validContent = validateString(content, {
      required: true,
      min: 1,
      max: 5000,
      field: '来信内容'
    })
    const validRecipient = validateString(recipient, {
      required: false,
      max: 100,
      field: '收件人'
    })
    const validMoods = validateArray(moods).slice(0, 5)

    const user = await get('SELECT gender FROM users WHERE id = ?', [ctx.state.user.id])

    const reply = await generateLetterReply({
      content: validContent,
      recipient: validRecipient || '自己',
      moods: validMoods,
      types: types || 'comfort',
      gender: user ? user.gender : 'secret'
    })

    ctx.body = {
      code: 200,
      message: '生成成功',
      data: { reply }
    }
  } catch (err) {
    if (handleValidationError(ctx, err)) return
    console.error('[AI] 生成回信失败:', err)
    ctx.status = 500
    ctx.body = { code: 500, message: '生成失败，请稍后重试' }
  }
})

/**
 * 生成树洞 AI 回复
 * POST /api/ai/treehole
 * Body: { content, emotion }
 */
router.post('/treehole', auth, aiLimit, async (ctx) => {
  try {
    const { content, emotion } = ctx.request.body

    const validContent = validateString(content, {
      required: true,
      min: 1,
      max: 2000,
      field: '内容'
    })
    const validEmotion = validateString(emotion, {
      required: false,
      max: 50,
      field: '情绪'
    })

    const user = await get('SELECT gender FROM users WHERE id = ?', [ctx.state.user.id])

    const reply = await generateTreeholeReply({
      content: validContent,
      emotion: validEmotion || '平静',
      gender: user ? user.gender : 'secret'
    })

    ctx.body = {
      code: 200,
      message: '生成成功',
      data: { reply }
    }
  } catch (err) {
    if (handleValidationError(ctx, err)) return
    console.error('[AI] 生成树洞回复失败:', err)
    ctx.status = 500
    ctx.body = { code: 500, message: '生成失败，请稍后重试' }
  }
})

module.exports = router
