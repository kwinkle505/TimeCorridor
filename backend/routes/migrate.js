const Router = require('koa-router')
const { run, get, all } = require('../db')
const { auth } = require('../middleware/auth')
const { validateArray, validateString } = require('../utils/validate')

const router = new Router({ prefix: '/api/migrate' })

// 每类数据最大导入条数
const MAX_IMPORT_PER_TYPE = 200

// 单条记录字段长度限制
const FIELD_LIMITS = {
  letterContent: 10000,
  recipient: 100,
  salutation: 50,
  reply: 5000,
  writeDate: 50,
  treeholeContent: 2000,
  emotion: 50,
  song: 200,
  capsuleName: 100,
  openDate: 50,
  wallContent: 500,
  wallType: 20
}

// 一键导入旧 localStorage 数据到数据库
router.post('/import', auth, async (ctx) => {
  const { letters, treehole, capsules, wall } = ctx.request.body
  const userId = ctx.state.user.id
  let imported = { letters: 0, treehole: 0, capsules: 0, wall: 0 }

  // 导入信件
  if (Array.isArray(letters)) {
    const safeLetters = letters.slice(0, MAX_IMPORT_PER_TYPE)
    for (const l of safeLetters) {
      try {
        const content = validateString(l.content, { required: false, max: FIELD_LIMITS.letterContent })
        if (!content) continue
        const recipient = validateString(l.recipient, { required: false, max: FIELD_LIMITS.recipient }) || '自己'
        const salutation = validateString(l.salutation, { required: false, max: FIELD_LIMITS.salutation }) || ''
        const reply = validateString(l.reply, { required: false, max: FIELD_LIMITS.reply }) || ''
        const writeDate = validateString(l.writeDate, { required: false, max: FIELD_LIMITS.writeDate }) || ''
        const moods = validateArray(l.moods).slice(0, 10)
        const types = validateArray(l.types).slice(0, 10)
        const createTime = validateString(l.createTime || l.created_at, { required: false, max: 50 }) || new Date().toISOString()

        await run(`
          INSERT INTO letters (user_id, recipient, salutation, content, moods, types, reply, is_public, write_date, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          userId,
          recipient,
          salutation,
          content,
          JSON.stringify(moods),
          JSON.stringify(types),
          reply,
          l.isPublic ? 1 : 0,
          writeDate,
          createTime
        ])
        imported.letters++
      } catch (err) {
        console.log('导入信件失败:', err.message)
      }
    }
  }

  // 导入树洞消息（只导入用户消息，跳过AI回复行）
  if (Array.isArray(treehole)) {
    const safeTreehole = treehole.slice(0, MAX_IMPORT_PER_TYPE)
    for (const m of safeTreehole) {
      try {
        const content = validateString(m.content, { required: false, max: FIELD_LIMITS.treeholeContent })
        if (!content) continue
        if (m.type === 'ai') continue
        const emotion = validateString(m.emotion, { required: false, max: FIELD_LIMITS.emotion }) || '😌平静'
        const reply = validateString(m.reply, { required: false, max: FIELD_LIMITS.reply }) || ''
        const song = validateString(m.song, { required: false, max: FIELD_LIMITS.song }) || ''
        const createTime = validateString(m.createTime, { required: false, max: 50 }) || new Date().toISOString()

        await run(`
          INSERT INTO treehole_messages (user_id, content, emotion, reply, song, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, content, emotion, reply, song, createTime])
        imported.treehole++
      } catch (err) {
        console.log('导入树洞消息失败:', err.message)
      }
    }
  }

  // 导入时光胶囊
  if (Array.isArray(capsules)) {
    const safeCapsules = capsules.slice(0, MAX_IMPORT_PER_TYPE)
    for (const c of safeCapsules) {
      try {
        const name = validateString(c.name, { required: false, max: FIELD_LIMITS.capsuleName }) || '时光胶囊'
        const items = validateArray(c.items).slice(0, 50)
        const openDate = validateString(c.openDate, { required: false, max: FIELD_LIMITS.openDate }) || ''
        const sealDate = validateString(c.sealDate || c.createTime, { required: false, max: 50 }) || new Date().toISOString()

        // 名称和内容都为空则跳过
        if (!name && items.length === 0) continue

        await run(`
          INSERT INTO capsules (user_id, name, items, open_date, is_public, opened, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          userId,
          name,
          JSON.stringify(items),
          openDate,
          c.isPublic ? 1 : 0,
          c.isOpened || c.opened ? 1 : 0,
          sealDate
        ])
        imported.capsules++
      } catch (err) {
        console.log('导入胶囊失败:', err.message)
      }
    }
  }

  // 导入留言墙
  if (Array.isArray(wall)) {
    const safeWall = wall.slice(0, MAX_IMPORT_PER_TYPE)
    for (const w of safeWall) {
      try {
        const content = validateString(w.content, { required: false, max: FIELD_LIMITS.wallContent })
        if (!content) continue
        const type = validateString(w.type, { required: false, max: FIELD_LIMITS.wallType }) || 'encourage'
        const likes = Math.min(9999, Math.max(0, parseInt(w.likes) || 0))
        const createTime = validateString(w.createTime, { required: false, max: 50 }) || new Date().toISOString()

        await run(`
          INSERT INTO wall_messages (user_id, content, type, likes, created_at)
          VALUES (?, ?, ?, ?, ?)
        `, [userId, content, type, likes, createTime])
        imported.wall++
      } catch (err) {
        console.log('导入留言失败:', err.message)
      }
    }
  }

  ctx.body = {
    code: 200,
    message: '数据导入完成',
    data: imported
  }
})

module.exports = router
