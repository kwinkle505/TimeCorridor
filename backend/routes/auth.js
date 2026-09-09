const Router = require('koa-router')
const bcrypt = require('bcryptjs')
const { run, get } = require('../db')
const { generateToken } = require('../middleware/auth')
const { validateString, handleValidationError } = require('../utils/validate')

const router = new Router({ prefix: '/api/auth' })

// 密码长度标准（全局统一）
const PASSWORD_MIN = 6
const PASSWORD_MAX = 30
const USERNAME_MIN = 2
const USERNAME_MAX = 20
const NICKNAME_MAX = 30

// 注册
router.post('/register', async (ctx) => {
  const { username, password, nickname } = ctx.request.body

  try {
    const validUsername = validateString(username, {
      required: true,
      min: USERNAME_MIN,
      max: USERNAME_MAX,
      field: '用户名'
    })
    const validPassword = validateString(password, {
      required: true,
      min: PASSWORD_MIN,
      max: PASSWORD_MAX,
      field: '密码'
    })
    const validNickname = validateString(nickname, {
      required: false,
      max: NICKNAME_MAX,
      field: '昵称'
    })

    const existing = await get('SELECT id FROM users WHERE username = ?', [validUsername])
    if (existing) {
      ctx.status = 400
      ctx.body = { code: 400, message: '用户名已被注册' }
      return
    }

    const safeNickname = validNickname || validUsername
    const hash = bcrypt.hashSync(validPassword, 10)
    const result = await run(`
      INSERT INTO users (username, password_hash, nickname)
      VALUES (?, ?, ?)
    `, [validUsername, hash, safeNickname])

    const user = await get('SELECT id, username, nickname, role, avatar FROM users WHERE id = ?', [result.lastID])
    const token = generateToken(user)

    ctx.body = {
      code: 200,
      message: '注册成功',
      data: { user, token }
    }
  } catch (err) {
    if (!handleValidationError(ctx, err)) throw err
  }
})

// 登录
router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body

  try {
    validateString(username, { required: true, field: '用户名' })
    validateString(password, { required: true, field: '密码' })
  } catch (err) {
    if (!handleValidationError(ctx, err)) throw err
    return
  }

  const user = await get('SELECT * FROM users WHERE username = ?', [username])
  if (!user) {
    ctx.status = 400
    ctx.body = { code: 400, message: '用户名或密码错误' }
    return
  }

  const valid = bcrypt.compareSync(password, user.password_hash)
  if (!valid) {
    ctx.status = 400
    ctx.body = { code: 400, message: '用户名或密码错误' }
    return
  }

  const token = generateToken(user)
  ctx.body = {
    code: 200,
    message: '登录成功',
    data: {
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
        avatar: user.avatar
      },
      token
    }
  }
})

module.exports = router
