const Router = require('koa-router')
const { run, get } = require('../db')
const { auth } = require('../middleware/auth')
const { validateString, handleValidationError } = require('../utils/validate')

const router = new Router({ prefix: '/api/user' })

// 获取当前用户信息
router.get('/profile', auth, async (ctx) => {
  const user = await get(`
    SELECT id, username, nickname, role, avatar, created_at
    FROM users WHERE id = ?
  `, [ctx.state.user.id])

  // 统计用户数据
  const { count: letterCount } = await get('SELECT COUNT(*) as count FROM letters WHERE user_id = ?', [user.id])
  const { count: capsuleCount } = await get('SELECT COUNT(*) as count FROM capsules WHERE user_id = ?', [user.id])
  const { count: wallCount } = await get('SELECT COUNT(*) as count FROM wall_messages WHERE user_id = ?', [user.id])
  const { count: challengeCount } = await get('SELECT COUNT(*) as count FROM challenge_records WHERE user_id = ?', [user.id])

  ctx.body = {
    code: 200,
    data: {
      ...user,
      stats: { letterCount, capsuleCount, wallCount, challengeCount }
    }
  }
})

// 更新用户信息
router.put('/profile', auth, async (ctx) => {
  const { nickname, avatar } = ctx.request.body

  try {
    const validNickname = validateString(nickname, { required: false, max: 30, field: '昵称' })
    const validAvatar = validateString(avatar, { required: false, max: 500, field: '头像' })

    await run('UPDATE users SET nickname = ?, avatar = ? WHERE id = ?',
      [validNickname || null, validAvatar || null, ctx.state.user.id])
    ctx.body = { code: 200, message: '更新成功' }
  } catch (err) {
    if (!handleValidationError(ctx, err)) throw err
  }
})

// 修改密码
router.put('/password', auth, async (ctx) => {
  const { oldPassword, newPassword } = ctx.request.body

  try {
    validateString(oldPassword, { required: true, field: '原密码' })
    validateString(newPassword, { required: true, min: 4, max: 30, field: '新密码' })
  } catch (err) {
    if (!handleValidationError(ctx, err)) throw err
    return
  }

  const bcrypt = require('bcryptjs')

  const user = await get('SELECT * FROM users WHERE id = ?', [ctx.state.user.id])
  const valid = bcrypt.compareSync(oldPassword, user.password_hash)
  if (!valid) {
    ctx.status = 400
    ctx.body = { code: 400, message: '原密码错误' }
    return
  }

  const hash = bcrypt.hashSync(newPassword, 10)
  await run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, ctx.state.user.id])
  ctx.body = { code: 200, message: '密码修改成功' }
})

module.exports = router
