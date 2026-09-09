const Router = require('koa-router')
const { db, run, get, all } = require('../db')
const { admin } = require('../middleware/auth')
const { validateId, validatePagination } = require('../utils/validate')

const router = new Router({ prefix: '/api/admin' })

// 获取所有用户（管理员）
router.get('/users', admin, async (ctx) => {
  const { page, size, offset } = validatePagination(ctx, { page: 1, size: 20, maxSize: 100 })
  const keyword = String(ctx.query.keyword || '').trim().slice(0, 50)

  let sql = 'SELECT id, username, nickname, role, avatar, created_at FROM users WHERE 1=1'
  let countSql = 'SELECT COUNT(*) as total FROM users WHERE 1=1'
  const params = []

  if (keyword) {
    sql += ' AND (username LIKE ? OR nickname LIKE ?)'
    countSql += ' AND (username LIKE ? OR nickname LIKE ?)'
    params.push(`%${keyword}%`, `%${keyword}%`)
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'

  const users = await all(sql, [...params, size, offset])
  const { total } = await get(countSql, params)

  ctx.body = {
    code: 200,
    data: { list: users, total, page, size }
  }
})

// 修改用户角色（管理员）
router.put('/users/:id/role', admin, async (ctx) => {
  const id = validateId(ctx)
  if (!id) return
  const { role } = ctx.request.body

  if (!['user', 'admin'].includes(role)) {
    ctx.status = 400
    ctx.body = { code: 400, message: '角色类型无效' }
    return
  }

  await run('UPDATE users SET role = ? WHERE id = ?', [role, id])
  ctx.body = { code: 200, message: '修改成功' }
})

// 删除用户（管理员）
// 使用事务级联删除所有关联数据，确保数据完整性
router.delete('/users/:id', admin, async (ctx) => {
  const userId = validateId(ctx)
  if (!userId) return
  if (userId === ctx.state.user.id) {
    ctx.status = 400
    ctx.body = { code: 400, message: '不能删除自己' }
    return
  }

  // 检查用户是否存在
  const user = await get('SELECT id, username FROM users WHERE id = ?', [userId])
  if (!user) {
    ctx.status = 404
    ctx.body = { code: 404, message: '用户不存在' }
    return
  }

  try {
    // 开启事务
    await new Promise((resolve, reject) => {
      db.run('BEGIN', (err) => err ? reject(err) : resolve())
    })

    // ========== 第一步：删除点赞/共鸣关联记录 ==========
    // 1. 信件共鸣：用户点的 + 用户信件收到的
    await run(`
      DELETE FROM letter_likes
      WHERE user_id = ?
         OR letter_id IN (SELECT id FROM letters WHERE user_id = ?)
    `, [userId, userId])

    // 2. 胶囊点赞：用户点的 + 用户胶囊收到的
    await run(`
      DELETE FROM capsule_likes
      WHERE user_id = ?
         OR capsule_id IN (SELECT id FROM capsules WHERE user_id = ?)
    `, [userId, userId])

    // 3. 留言墙点赞：用户点的 + 用户留言收到的
    await run(`
      DELETE FROM wall_likes
      WHERE user_id = ?
         OR message_id IN (SELECT id FROM wall_messages WHERE user_id = ?)
    `, [userId, userId])

    // ========== 第二步：删除用户内容 ==========
    // 4. 用户的信件
    await run('DELETE FROM letters WHERE user_id = ?', [userId])

    // 5. 用户的胶囊
    await run('DELETE FROM capsules WHERE user_id = ?', [userId])

    // 6. 用户的留言
    await run('DELETE FROM wall_messages WHERE user_id = ?', [userId])

    // 7. 用户的树洞消息
    await run('DELETE FROM treehole_messages WHERE user_id = ?', [userId])

    // 8. 用户的打卡记录
    await run('DELETE FROM challenge_records WHERE user_id = ?', [userId])

    // 9. 用户的句签收藏
    await run('DELETE FROM quote_favorites WHERE user_id = ?', [userId])

    // ========== 第三步：删除用户本身 ==========
    await run('DELETE FROM users WHERE id = ?', [userId])

    // 提交事务
    await new Promise((resolve, reject) => {
      db.run('COMMIT', (err) => err ? reject(err) : resolve())
    })

    ctx.body = { code: 200, message: '删除成功' }
  } catch (err) {
    // 出错回滚
    console.error('删除用户失败，事务回滚:', err)
    try {
      await new Promise((resolve) => {
        db.run('ROLLBACK', () => resolve())
      })
    } catch (rollbackErr) {
      console.error('事务回滚失败:', rollbackErr)
    }
    ctx.status = 500
    ctx.body = { code: 500, message: '删除失败，请稍后重试' }
  }
})

// 获取统计数据（管理员）
router.get('/stats', admin, async (ctx) => {
  const { count: userCount } = await get('SELECT COUNT(*) as count FROM users')
  const { count: letterCount } = await get('SELECT COUNT(*) as count FROM letters')
  const { count: publicLetterCount } = await get('SELECT COUNT(*) as count FROM letters WHERE is_public = 1')
  const { count: treeholeCount } = await get('SELECT COUNT(*) as count FROM treehole_messages')
  const { count: capsuleCount } = await get('SELECT COUNT(*) as count FROM capsules')
  const { count: wallCount } = await get('SELECT COUNT(*) as count FROM wall_messages')
  const { count: challengeCount } = await get('SELECT COUNT(*) as count FROM challenge_records')

  // 最近7天注册趋势
  const trend = await all(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM users
    WHERE created_at >= DATE('now', '-7 days')
    GROUP BY DATE(created_at)
    ORDER BY date
  `)

  ctx.body = {
    code: 200,
    data: {
      userCount,
      letterCount,
      publicLetterCount,
      treeholeCount,
      capsuleCount,
      wallCount,
      challengeCount,
      trend
    }
  }
})

// 获取所有信件（管理员）
router.get('/letters', admin, async (ctx) => {
  const { page, size, offset } = validatePagination(ctx, { page: 1, size: 20, maxSize: 100 })

  const letters = await all(`
    SELECT l.*, u.username, u.nickname
    FROM letters l
    JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `, [size, offset])

  const { total } = await get('SELECT COUNT(*) as total FROM letters')

  ctx.body = {
    code: 200,
    data: { list: letters, total, page, size }
  }
})

// 删除信件（管理员）
router.delete('/letters/:id', admin, async (ctx) => {
  const id = validateId(ctx)
  if (!id) return

  await run('DELETE FROM letters WHERE id = ?', [id])
  ctx.body = { code: 200, message: '删除成功' }
})

module.exports = router
