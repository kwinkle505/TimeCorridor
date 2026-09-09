/**
 * 通用工具函数模块
 * 提供项目中常用的辅助函数
 */

/**
 * 格式化日期
 * 支持多种输出格式
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @param {string} format - 输出格式模板，默认 'YYYY-MM-DD HH:mm'
 *   YYYY: 四位年份, MM: 两位月份, DD: 两位日期
 *   HH: 两位小时(24小时制), mm: 两位分钟, ss: 两位秒
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm') {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) {
    return ''
  }

  const pad = (n) => String(n).padStart(2, '0')

  const replacements = {
    'YYYY': d.getFullYear(),
    'MM': pad(d.getMonth() + 1),
    'DD': pad(d.getDate()),
    'HH': pad(d.getHours()),
    'mm': pad(d.getMinutes()),
    'ss': pad(d.getSeconds())
  }

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => replacements[match])
}

/**
 * 生成唯一 ID
 * 基于时间戳 + 随机数，保证基本唯一性
 * @param {string} prefix - ID 前缀，可选
 * @returns {string} 唯一标识符
 */
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 6)
  return prefix + timestamp + random
}

/**
 * 滚动到页面顶部
 * 支持平滑滚动
 * @param {boolean} smooth - 是否使用平滑滚动，默认 true
 * @param {HTMLElement} container - 滚动容器，默认为 window
 */
export function scrollToTop(smooth = true, container = null) {
  if (container) {
    container.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    })
  } else {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }
}

/**
 * 防抖函数
 * 指定时间内多次触发只执行最后一次
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒），默认 300
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    const context = this
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(context, args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数
 * 指定时间内最多执行一次
 * @param {Function} fn - 要执行的函数
 * @param {number} interval - 间隔时间（毫秒），默认 300
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, interval = 300) {
  let lastTime = 0
  let timer = null
  return function (...args) {
    const context = this
    const now = Date.now()

    if (now - lastTime >= interval) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      lastTime = now
      fn.apply(context, args)
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now()
        timer = null
        fn.apply(context, args)
      }, interval - (now - lastTime))
    }
  }
}

/**
 * 复制文本到剪贴板
 * 优先使用现代 Clipboard API，降级使用传统方案
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 是否复制成功
 */
export async function copyToClipboard(text) {
  if (!text) {
    return false
  }

  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (e) {
    console.warn('[helpers] Clipboard API 复制失败，尝试降级方案', e)
  }

  // 降级方案：创建临时 textarea
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;'
    document.body.appendChild(textarea)
    textarea.select()
    textarea.setSelectionRange(0, text.length)
    const result = document.execCommand('copy')
    document.body.removeChild(textarea)
    return result
  } catch (e) {
    console.warn('[helpers] 降级复制方案也失败了', e)
    return false
  }
}

/**
 * 判断日期是否为今天
 * @param {Date|string} date - 日期
 * @returns {boolean}
 */
export function isToday(date) {
  const d = new Date(date)
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

/**
 * 获取相对时间描述
 * @param {Date|string} date - 日期
 * @returns {string} 如 "刚刚"、"5 分钟前"、"昨天"、"3 天前" 等
 */
export function getRelativeTime(date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + ' 分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + ' 小时前'
  } else if (diff < 2 * day) {
    return '昨天'
  } else if (diff < 7 * day) {
    return Math.floor(diff / day) + ' 天前'
  } else {
    return formatDate(d, 'YYYY-MM-DD')
  }
}

/**
 * 深拷贝对象/数组
 * @param {*} obj - 要拷贝的数据
 * @returns {*} 深拷贝后的数据
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch (e) {
    console.warn('[helpers] 深拷贝失败', e)
    return obj
  }
}

/**
 * 随机打乱数组（Fisher-Yates 算法）
 * @param {Array} arr - 原数组
 * @returns {Array} 打乱后的新数组
 */
export function shuffleArray(arr) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export default {
  formatDate,
  generateId,
  scrollToTop,
  debounce,
  throttle,
  copyToClipboard,
  isToday,
  getRelativeTime,
  deepClone,
  shuffleArray
}
