const jwt = require('jsonwebtoken')

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET 未配置，请在 .env 文件中设置')
  process.exit(1)
}

const JWT_SECRET = process.env.JWT_SECRET

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

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

module.exports = { auth, admin, generateToken, verifyToken }
