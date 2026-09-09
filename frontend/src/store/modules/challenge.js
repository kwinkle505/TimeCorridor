/**
 * 挑战模块 (challenge)
 * 管理用户的打卡记录、连续打卡天数，通过后端 API 操作
 */

import { challengeApi } from '@/api'
import { isToday, formatDate } from '@/utils/helpers'

const state = {
  records: [],
  checkInDays: 0,
  maxStreak: 0,
  lastCheckInDate: null,
  loading: false
}

const getters = {
  allRecords: state => {
    return [...state.records].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    )
  },
  currentMonthRecords: (state) => {
    const now = new Date()
    const yearMonth = formatDate(now, 'YYYY-MM')
    return state.records.filter(r => r.date && r.date.startsWith(yearMonth))
  },
  isCheckedInToday: state => {
    if (!state.lastCheckInDate) return false
    return isToday(state.lastCheckInDate)
  },
  totalCheckIns: state => state.records.length
}

const mutations = {
  SET_RECORDS(state, records) {
    state.records = records
  },
  ADD_RECORD(state, record) {
    state.records.unshift(record)
  },
  SET_CHECK_IN_DAYS(state, days) {
    state.checkInDays = days
  },
  SET_MAX_STREAK(state, streak) {
    state.maxStreak = streak
  },
  SET_LAST_CHECK_IN_DATE(state, date) {
    state.lastCheckInDate = date
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  }
}

const actions = {
  /**
   * 从后端获取打卡记录
   */
  async initData({ commit }) {
    commit('SET_LOADING', true)
    try {
      const records = await challengeApi.getMyRecords()
      commit('SET_RECORDS', records || [])

      // 计算连续打卡天数
      if (records && records.length > 0) {
        const sorted = [...records].sort((a, b) => new Date(a.date) - new Date(b.date))
        const lastDate = sorted[sorted.length - 1].date
        commit('SET_LAST_CHECK_IN_DATE', lastDate)

        // 计算连续天数
        let streak = 0
        const today = new Date()
        for (let i = sorted.length - 1; i >= 0; i--) {
          const expectedDate = new Date(today)
          expectedDate.setDate(expectedDate.getDate() - (sorted.length - 1 - i))
          const expectedStr = formatDate(expectedDate, 'YYYY-MM-DD')
          if (sorted[i].date === expectedStr) {
            streak++
          } else {
            break
          }
        }
        commit('SET_CHECK_IN_DAYS', streak)
        commit('SET_MAX_STREAK', Math.max(state.maxStreak, streak))
      }
    } catch (err) {
      console.error('获取打卡记录失败:', err)
      commit('SET_RECORDS', [])
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 今日打卡
   */
  async checkIn({ commit, state }, payload = {}) {
    // 检查今天是否已打卡
    if (state.lastCheckInDate && isToday(state.lastCheckInDate)) {
      return { success: false, message: '今天已经打卡啦，明天再来吧！' }
    }

    const now = new Date()
    const todayStr = formatDate(now, 'YYYY-MM-DD')

    try {
      const result = await challengeApi.checkIn({
        note: payload.note || ''
      })

      const record = {
        id: result.id,
        date: result.date || todayStr,
        content: result.content || payload.note || '',
        timestamp: now.toISOString()
      }
      commit('ADD_RECORD', record)

      // 计算连续打卡天数
      let newStreak = 1
      if (state.lastCheckInDate) {
        const lastDate = new Date(state.lastCheckInDate)
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          newStreak = state.checkInDays + 1
        }
      }
      commit('SET_CHECK_IN_DAYS', newStreak)
      commit('SET_LAST_CHECK_IN_DATE', todayStr)
      const newMaxStreak = Math.max(state.maxStreak, newStreak)
      commit('SET_MAX_STREAK', newMaxStreak)

      return {
        success: true,
        message: `打卡成功！已连续打卡 ${newStreak} 天`,
        streak: newStreak
      }
    } catch (err) {
      return { success: false, message: err.message || '打卡失败' }
    }
  },

  /**
   * 获取打卡记录
   */
  fetchRecords({ state }) {
    return state.records
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}