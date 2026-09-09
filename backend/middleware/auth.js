const jwt = require('jsonwebtoken')

// JWT 密钥：优先从环境变量读取，开发环境允许使用默认值（会有警告）
const JWT_SECRET = process.env.JWT_SECRET || 'time-corridor-dev-default-change-me'

// 验证用户登录
async function auth(ctx, next) {
  const token = ctx.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    ctx.status = 401
    ctx.body = { code: 401, message: '请先登录' }
    return
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    ctx.state.user = decoded
    await next()
  } catch (err) {
    ctx.status = 401
    ctx.body = { code: 401, message: '登录已过期，请重新登录' }
  }
}

// 验证管理员权限
async function admin(ctx, next) {
  await auth(ctx, async () => {
    if (ctx.state.user.role !== 'admin') {
      ctx.status = 403
      ctx.body = { code: 403, message: '无权访问' }
      return
    }
    await next()
  })
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

module.exports = { auth, admin, generateToken }
