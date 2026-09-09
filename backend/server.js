const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')
const path = require('path')
const fs = require('fs')

// 加载 .env 配置（轻量实现，不依赖 dotenv 包）
function loadEnv() {
  const envPath = path.join(__dirname, '.env')
  if (!fs.existsSync(envPath)) {
    console.log('[配置] 未找到 .env 文件，使用环境变量或默认值')
    return
  }
  try {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.substring(0, eqIdx).trim()
      const value = trimmed.substring(eqIdx + 1).trim()
      if (key && !(key in process.env)) {
        process.env[key] = value
      }
    }
    console.log('[配置] 已加载 .env 文件')
  } catch (err) {
    console.warn('[配置] 加载 .env 失败:', err.message)
  }
}
loadEnv()

// 启动前关键配置检查
if (!process.env.JWT_SECRET) {
  console.warn('[警告] JWT_SECRET 未配置，将使用不安全的默认值！请在 .env 中设置 JWT_SECRET')
}

const app = new Koa()
const router = new Router()

// CORS 配置：从环境变量读取允许的源，开发环境默认允许 localhost
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:8080,http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin) => {
    if (!origin || allowedOrigins.includes(origin)) return origin
    return null
  },
  exposeHeaders: ['Content-Length'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.use(bodyParser({
  jsonLimit: '2mb',
  formLimit: '56kb',
  textLimit: '2mb'
}))

// 健康检查
router.get('/api/health', async (ctx) => {
  ctx.body = { code: 200, message: '服务正常运行', time: new Date().toISOString() }
})

// 路由
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const letterRoutes = require('./routes/letter')
const treeholeRoutes = require('./routes/treehole')
const capsuleRoutes = require('./routes/capsule')
const wallRoutes = require('./routes/wall')
const quoteRoutes = require('./routes/quote')
const challengeRoutes = require('./routes/challenge')
const adminRoutes = require('./routes/admin')
const migrateRoutes = require('./routes/migrate')
const aiRoutes = require('./routes/ai')
const statsRoutes = require('./routes/stats')

app.use(authRoutes.routes()).use(authRoutes.allowedMethods())
app.use(userRoutes.routes()).use(userRoutes.allowedMethods())
app.use(letterRoutes.routes()).use(letterRoutes.allowedMethods())
app.use(treeholeRoutes.routes()).use(treeholeRoutes.allowedMethods())
app.use(capsuleRoutes.routes()).use(capsuleRoutes.allowedMethods())
app.use(wallRoutes.routes()).use(wallRoutes.allowedMethods())
app.use(quoteRoutes.routes()).use(quoteRoutes.allowedMethods())
app.use(challengeRoutes.routes()).use(challengeRoutes.allowedMethods())
app.use(adminRoutes.routes()).use(adminRoutes.allowedMethods())
app.use(migrateRoutes.routes()).use(migrateRoutes.allowedMethods())
app.use(aiRoutes.routes()).use(aiRoutes.allowedMethods())
app.use(statsRoutes.routes()).use(statsRoutes.allowedMethods())
app.use(router.routes()).use(router.allowedMethods())

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`后端服务已启动: http://localhost:${PORT}`)
  console.log('API 文档:')
  console.log('  POST   /api/auth/register       注册')
  console.log('  POST   /api/auth/login          登录')
  console.log('  GET    /api/user/profile        获取个人信息')
  console.log('  PUT    /api/user/profile        更新个人信息')
  console.log('  PUT    /api/user/password       修改密码')
  console.log('  POST   /api/letters             创建信件')
  console.log('  GET    /api/letters/my          我的信件')
  console.log('  GET    /api/letters/public      公开信件（故事墙）')
  console.log('  DELETE /api/letters/:id         删除信件')
  console.log('  POST   /api/treehole            发送树洞')
  console.log('  GET    /api/treehole/my         我的树洞')
  console.log('  POST   /api/capsules            创建胶囊')
  console.log('  GET    /api/capsules/my         我的胶囊')
  console.log('  POST   /api/wall                发布留言')
  console.log('  GET    /api/wall                留言列表')
  console.log('  POST   /api/challenges          打卡')
  console.log('  GET    /api/admin/users         用户列表（管理员）')
  console.log('  GET    /api/admin/stats         统计数据（管理员）')
  console.log('  GET    /api/admin/letters       所有信件（管理员）')
  console.log('  POST   /api/ai/reply            AI 生成回信')
  console.log('  POST   /api/ai/treehole         AI 树洞回复')
})
