/**
 * 统计模块 (stats)
 * 管理用户的全局统计数据，用于展示成就面板和徽章判定
 */
import Vue from 'vue'

import storage from '@/utils/storage'
import { initialStats } from '@/utils/mockData'
import { isToday, formatDate } from '@/utils/helpers'

const STORAGE_KEY = 'user_stats'

// 用户级统计数据：使用 storage.user 按用户 ID 隔离
function loadStats() {
  return storage.user.get(STORAGE_KEY)
}
function saveStats(stats) {
  storage.user.set(STORAGE_KEY, stats)
}

const state = {
  // 统计数据对象
  stats: {
    // 信件相关
    letterCount: 0,
    letterRepliedCount: 0,
    // 树洞相关
    treeholeMessageCount: 0,
    // 胶囊相关
    capsuleCount: 0,
    capsuleOpenedCount: 0,
    // 留言墙相关
    wallMessageCount: 0,
    wallLikeGivenCount: 0,
    // 挑战相关
    challengeCheckInCount: 0,
    challengeCurrentStreak: 0,
    challengeMaxStreak: 0,
    // 徽章相关
    badgeEarnedCount: 0,
    // 句签相关
    quoteCollectedCount: 0,
    // 通用
    firstVisitDate: null,
    lastVisitDate: null,
    totalVisitDays: 0
  }
}

const getters = {
  // 获取完整统计对象
  allStats: state => state.stats,

  // 获取今日访问状态
  isVisitedToday: state => {
    if (!state.stats.lastVisitDate) return false
    return isToday(state.stats.lastVisitDate)
  },

  // 计算用户活跃等级（简单分级）
  activityLevel: state => {
    const days = state.stats.totalVisitDays || 0
    if (days >= 30) return { level: 5, name: '时光主宰', color: '#FFD700' }
    if (days >= 14) return { level: 4, name: '时光旅人', color: '#C0C0C0' }
    if (days >= 7) return { level: 3, name: '时光行者', color: '#CD7F32' }
    if (days >= 3) return { level: 2, name: '时光访客', color: '#4D96FF' }
    return { level: 1, name: '时光新人', color: '#6BCB77' }
  }
}

const mutations = {
  /**
   * 设置完整统计对象
   */
  SET_STATS(state, stats) {
    state.stats = { ...state.stats, ...stats }
  },

  /**
   * 更新单个统计项
   */
  UPDATE_STAT(state, { key, value }) {
    if (Object.prototype.hasOwnProperty.call(state.stats, key)) {
      Vue.set(state.stats, key, value)
    }
  },

  /**
   * 递增某个统计项
   */
  INCREMENT_STAT(state, key) {
    if (Object.prototype.hasOwnProperty.call(state.stats, key)) {
      Vue.set(state.stats, key, (state.stats[key] || 0) + 1)
    }
  },

  /**
   * 记录今日访问
   */
  RECORD_VISIT(state) {
    const today = formatDate(new Date(), 'YYYY-MM-DD')
    const lastVisit = state.stats.lastVisitDate

    // 更新最后访问日期
    state.stats.lastVisitDate = today

    // 首次访问
    if (!state.stats.firstVisitDate) {
      state.stats.firstVisitDate = today
    }

    // 如果不是今天已经访问过，则增加访问天数
    if (!lastVisit || !isToday(lastVisit)) {
      state.stats.totalVisitDays = (state.stats.totalVisitDays || 0) + 1
    }
  }
}

const actions = {
  /**
   * 初始化统计数据
   * 从 localStorage 读取，若为空则使用示例数据
   */
  initStats({ commit }) {
    const data = loadStats()
    if (data && typeof data === 'object') {
      commit('SET_STATS', data)
    } else {
      commit('SET_STATS', initialStats)
      saveStats(initialStats)
    }
  },

  /**
   * 更新统计对象（可批量更新）
   * @param {Object} payload - 要更新的统计键值对
   */
  updateStats({ commit, state }, payload) {
    commit('SET_STATS', payload)
    saveStats(state.stats)
  },

  /**
   * 递增指定统计项
   * @param {string} key - 统计项键名
   */
  incrementStat({ commit, state }, key) {
    commit('INCREMENT_STAT', key)
    saveStats(state.stats)
  },

  /**
   * 记录今日访问并更新访问天数
   */
  recordTodayVisit({ commit, state }) {
    commit('RECORD_VISIT')
    saveStats(state.stats)
  },

  /**
   * 从各模块同步最新统计数据
   * 在业务操作后调用，确保 stats 数据与各模块一致
   * @param {Object} payload - 各模块数据快照
   */
  syncStats({ commit, state }, payload) {
    const updates = {
      ...payload
    }
    commit('SET_STATS', { ...state.stats, ...updates })
    saveStats(state.stats)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
