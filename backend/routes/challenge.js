const Router = require('koa-router')
const { run, get, all } = require('../db')
const { auth } = require('../middleware/auth')
const { getLocalDateString } = require('../utils/validate')

const router = new Router({ prefix: '/api/challenges' })

// 打卡
// 日期由服务器决定，防止客户端伪造日期
router.post('/', auth, async (ctx) => {
  const { note, content } = ctx.request.body
  const today = getLocalDateString()
  const recordContent = note || content || ''

  if (!recordContent.trim()) {
    ctx.status = 400
    ctx.body = { code: 400, message: '打卡内容不能为空' }
    return
  }

  if (recordContent.length > 500) {
    ctx.status = 400
    ctx.body = { code: 400, message: '打卡内容最多500字' }
    return
  }

  // 检查今天是否已打卡
  const existing = await get(`
    SELECT id FROM challenge_records WHERE user_id = ? AND date = ?
  `, [ctx.state.user.id, today])

  if (existing) {
    ctx.status = 400
    ctx.body = { code: 400, message: '今日已打卡' }
    return
  }

  const result = await run(`
    INSERT INTO challenge_records (user_id, date, content)
    VALUES (?, ?, ?)
  `, [ctx.state.user.id, today, recordContent])

  ctx.body = { code: 200, message: '打卡成功', data: { id: result.lastID, date: today, content: recordContent } }
})

// 获取我的打卡记录
router.get('/my', auth, async (ctx) => {
  const { month } = ctx.query
  let sql = 'SELECT * FROM challenge_records WHERE user_id = ?'
  const params = [ctx.state.user.id]

  if (month) {
    sql += ' AND date LIKE ?'
    params.push(`${month}%`)
  }
  sql += ' ORDER BY date DESC'

  const records = await all(sql, params)
  ctx.body = { code: 200, data: records }
})

module.exports = router
