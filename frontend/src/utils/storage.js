/**
 * 本地存储封装模块
 * 统一前缀 'tc_'（时空回廊缩写），避免与其他应用冲突
 *
 * 支持两种作用域：
 * 1. 全局作用域 — storage.get / storage.set
 *    用于主题设置、BGM 状态、token 等设备级数据
 *
 * 2. 用户作用域 — storage.user.get / storage.user.set
 *    用于用户统计、徽章、收藏等用户专属数据
 *    key 格式：tc_user_{userId}_{key}
 */

const PREFIX = 'tc_'
const USER_PREFIX = 'user_'

// 当前登录用户 ID，未登录时为 null
let currentUserId = null

/**
 * 拼接全局作用域键名
 */
function getGlobalKey(key) {
  return PREFIX + key
}

/**
 * 拼接用户作用域键名
 * 如果未登录，返回 null（调用方应处理）
 */
function getUserKey(key) {
  if (!currentUserId) {
    return null
  }
  return PREFIX + USER_PREFIX + currentUserId + '_' + key
}

/**
 * 安全解析 JSON
 */
function safeParse(str, defaultValue) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return defaultValue
  }
}

// =========================
// 全局作用域方法
// =========================

/**
 * 获取全局 localStorage 数据
 */
export function get(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(getGlobalKey(key))
    if (item === null) return defaultValue
    return safeParse(item, defaultValue)
  } catch (e) {
    console.warn('[storage] 读取失败:', key, e)
    return defaultValue
  }
}

/**
 * 写入全局 localStorage 数据
 */
export function set(key, value) {
  try {
    localStorage.setItem(getGlobalKey(key), JSON.stringify(value))
  } catch (e) {
    console.warn('[storage] 写入失败:', key, e)
  }
}

/**
 * 移除全局 localStorage 数据
 */
export function remove(key) {
  try {
    localStorage.removeItem(getGlobalKey(key))
  } catch (e) {
    console.warn('[storage] 删除失败:', key, e)
  }
}

// =========================
// 用户作用域方法
// =========================

export const user = {
  /**
   * 获取当前用户的 localStorage 数据
   * 未登录时返回 defaultValue
   */
  get(key, defaultValue = null) {
    const fullKey = getUserKey(key)
    if (!fullKey) return defaultValue
    try {
      const item = localStorage.getItem(fullKey)
      if (item === null) return defaultValue
      return safeParse(item, defaultValue)
    } catch (e) {
      console.warn('[storage:user] 读取失败:', key, e)
      return defaultValue
    }
  },

  /**
   * 写入当前用户的 localStorage 数据
   * 未登录时不写入
   */
  set(key, value) {
    const fullKey = getUserKey(key)
    if (!fullKey) {
      console.warn('[storage:user] 未登录，写入被忽略:', key)
      return
    }
    try {
      localStorage.setItem(fullKey, JSON.stringify(value))
    } catch (e) {
      console.warn('[storage:user] 写入失败:', key, e)
    }
  },

  /**
   * 移除当前用户的 localStorage 数据
   */
  remove(key) {
    const fullKey = getUserKey(key)
    if (!fullKey) return
    try {
      localStorage.removeItem(fullKey)
    } catch (e) {
      console.warn('[storage:user] 删除失败:', key, e)
    }
  },

  /**
   * 清空当前用户的所有 localStorage 数据
   */
  clearAll() {
    if (!currentUserId) return
    const userPrefix = PREFIX + USER_PREFIX + currentUserId + '_'
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(userPrefix)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch (e) {
      console.warn('[storage:user] 清空失败:', e)
    }
  }
}

// =========================
// 用户切换
// =========================

/**
 * 设置当前用户 ID（登录后调用）
 * @param {string|number} userId - 用户 ID
 */
export function setUserId(userId) {
  currentUserId = userId ? String(userId) : null
}

/**
 * 清除当前用户 ID（登出时调用）
 * 注意：不会自动清除用户数据，如需清除请手动调用 user.clearAll()
 */
export function clearUserId() {
  currentUserId = null
}

/**
 * 获取当前用户 ID（调试用）
 */
export function getCurrentUserId() {
  return currentUserId
}

// =========================
// 全局方法
// =========================

/**
 * 清空所有以 'tc_' 前缀开头的数据（全局 + 所有用户）
 */
export function clearAll() {
  try {
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (e) {
    console.warn('[storage] 清空失败:', e)
  }
}

/**
 * 获取所有以 'tc_' 前缀开头的键名列表（不含前缀）
 */
export function getAllKeys() {
  const keys = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(PREFIX)) {
        keys.push(key.slice(PREFIX.length))
      }
    }
  } catch (e) {
    console.warn('[storage] 获取键名失败:', e)
  }
  return keys
}

export default {
  get,
  set,
  remove,
  clearAll,
  getAllKeys,
  setUserId,
  clearUserId,
  getCurrentUserId,
  user
}
