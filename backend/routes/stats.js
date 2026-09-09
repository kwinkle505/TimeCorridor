const Router = require('koa-router')
const { get } = require('../db')

const router = new Router({ prefix: '/api/stats' })

// 全站公开统计（用于首页展示）
router.get('/', async (ctx) => {
  try {
    const [
      { count: letterCount },
      { count: wallCount },
      { count: treeholeCount },
      { count: capsuleCount },
      { count: userCount }
    ] = await Promise.all([
      get('SELECT COUNT(*) as count FROM letters WHERE is_public = 1'),
      get('SELECT COUNT(*) as count FROM wall_messages'),
      get('SELECT COUNT(*) as count FROM treehole_messages'),
      get('SELECT COUNT(*) as count FROM capsules WHERE is_public = 1'),
      get('SELECT COUNT(*) as count FROM users')
    ])

    ctx.body = {
      code: 200,
      data: {
        letterCount,
        wallMessageCount: wallCount,
        treeholeCount,
        capsulesCount: capsuleCount,
        userCount
      }
    }
  } catch (err) {
    console.error('获取统计数据失败:', err)
    ctx.body = {
      code: 200,
      data: {
        letterCount: 0,
        wallMessageCount: 0,
        treeholeCount: 0,
        capsulesCount: 0,
        userCount: 0
      }
    }
  }
})

module.exports = router
