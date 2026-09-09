/**
 * 统一输入校验工具
 * 提供常用校验函数，所有路由共享同一套校验标准
 */

class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
    this.statusCode = 400
  }
}

/**
 * 校验 URL 中的 :id 参数为正整数
 * 返回 null 表示校验失败（已自动设置 ctx 响应）
 */
function validateId(ctx, param = 'id') {
  const id = parseInt(ctx.params[param])
  if (!Number.isInteger(id) || id <= 0) {
    ctx.status = 400
    ctx.body = { code: 400, message: '无效的ID参数' }
    return null
  }
  return id
}

/**
 * 校验并规范化分页参数
 * page 最小 1，size 范围 1~maxSize
 */
function validatePagination(ctx, defaults = {}) {
  const { page: defPage = 1, size: defSize = 12, maxSize = 100 } = defaults
  const page = Math.max(1, parseInt(ctx.query.page) || defPage)
  const size = Math.min(maxSize, Math.max(1, parseInt(ctx.query.size) || defSize))
  const offset = (page - 1) * size
  return { page, size, offset }
}

/**
 * 校验字符串：必填/可选、长度范围、自动 trim
 * 校验失败抛出 ValidationError
 */
function validateString(value, options = {}) {
  const { required = false, min = 0, max = 65535, field = '字段' } = options

  if (value == null || value === undefined) {
    if (required) throw new ValidationError(`${field}不能为空`)
    return null
  }

  const str = String(value).trim()

  if (required && !str) throw new ValidationError(`${field}不能为空`)
  if (str.length < min) throw new ValidationError(`${field}长度不能少于${min}个字符`)
  if (str.length > max) throw new ValidationError(`${field}长度不能超过${max}个字符`)

  return str
}

/**
 * 校验数组类型，非数组返回空数组
 */
function validateArray(value) {
  return Array.isArray(value) ? value : []
}

/**
 * 校验日期格式 YYYY-MM-DD
 */
function validateDate(value, required = false) {
  if (!value) {
    if (required) throw new ValidationError('日期不能为空')
    return null
  }
  const str = String(value).trim()
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(str)) throw new ValidationError('日期格式无效，应为 YYYY-MM-DD')
  const date = new Date(str)
  if (isNaN(date.getTime())) throw new ValidationError('日期无效')
  return str
}

/**
 * 安全转换为布尔值
 */
function toBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true'
}

/**
 * 校验枚举值
 */
function validateEnum(value, allowedValues, field = '类型') {
  if (value == null || value === undefined) return null
  const str = String(value).trim()
  if (!allowedValues.includes(str)) {
    throw new ValidationError(`${field}无效，允许值：${allowedValues.join(', ')}`)
  }
  return str
}

/**
 * 捕获 ValidationError 并设置响应
 * 返回 true 表示已处理错误
 */
function handleValidationError(ctx, err) {
  if (err instanceof ValidationError) {
    ctx.status = err.statusCode
    ctx.body = { code: err.statusCode, message: err.message }
    return true
  }
  return false
}

/**
 * 获取本地日期字符串 YYYY-MM-DD（非 UTC）
 * 用于打卡、留言限制等依赖本地日期的业务逻辑
 */
function getLocalDateString(date = new Date()) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

module.exports = {
  ValidationError,
  validateId,
  validatePagination,
  validateString,
  validateArray,
  validateDate,
  toBoolean,
  validateEnum,
  handleValidationError,
  getLocalDateString
}
