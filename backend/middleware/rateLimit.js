/**
 * 简易内存限流中间件
 * 适用于单实例部署，生产环境大规模应换 Redis
 */

function rateLimit({ windowMs = 60000, max = 10, keyFn = null }) {
  const requests = new Map()

  setInterval(() => {
    const now = Date.now()
    for (const [key, timestamps] of requests.entries()) {
      const valid = timestamps.filter(t => t > now - windowMs)
      if (valid.length === 0) {
        requests.delete(key)
      } else {
        requests.set(key, valid)
      }
    }
  }, windowMs).unref()

  return async (ctx, next) => {
    const key = keyFn ? keyFn(ctx) : (ctx.ip || 'unknown')
    const now = Date.now()
    const existing = requests.get(key) || []
    const valid = existing.filter(t => t > now - windowMs)

    if (valid.length >= max) {
      ctx.status = 429
      ctx.body = { code: 429, message: '请求过于频繁，请稍后再试' }
      return
    }

    valid.push(now)
    requests.set(key, valid)
    await next()
  }
}

module.exports = { rateLimit }
