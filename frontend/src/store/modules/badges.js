/**
 * 徽章模块 (badges)
 * 管理用户的徽章获取状态
 */

import storage from '@/utils/storage'
import { badgeList, checkBadgeProgress } from '@/utils/badges'

const STORAGE_KEY = 'earned_badges'

// 用户级徽章数据：使用 storage.user 按用户 ID 隔离
function loadBadges() {
  return storage.user.get(STORAGE_KEY, [])
}
function saveBadges(badges) {
  storage.user.set(STORAGE_KEY, badges)
}

const state = {
  // 已获取的徽章 ID 列表
  badges: []
}

const getters = {
  // 获取所有已解锁徽章的详情
  earnedBadges: state => {
    return badgeList.filter(b => state.badges.includes(b.id))
  },
  // 获取未解锁徽章的详情
  unearnedBadges: state => {
    return badgeList.filter(b => !state.badges.includes(b.id))
  },
  // 判断某个徽章是否已解锁
  hasBadge: state => (badgeId) => {
    return state.badges.includes(badgeId)
  },
  // 已解锁数量
  earnedCount: state => state.badges.length,
  // 总徽章数量
  totalCount: () => badgeList.length
}

const mutations = {
  /**
   * 设置已解锁徽章列表
   */
  SET_BADGES(state, badges) {
    state.badges = badges
  },

  /**
   * 添加徽章
   */
  ADD_BADGE(state, badgeId) {
    if (!state.badges.includes(badgeId)) {
      state.badges.push(badgeId)
    }
  }
}

const actions = {
  /**
   * 初始化数据：从 localStorage 读取已解锁徽章
   */
  initData({ commit }) {
    const data = loadBadges()
    commit('SET_BADGES', data)
  },

  /**
   * 检查并颁发徽章
   * 传入当前业务数据，自动检查是否有新徽章满足解锁条件
   * @param {Object} payload - 各模块的业务统计数据
   * @returns {Array} 本次新解锁的徽章 ID 列表
   */
  checkAndAward({ commit, state }, payload) {
    const data = {
      earnedBadges: state.badges,
      ...payload
    }

    const newBadges = checkBadgeProgress('all', data)

    if (newBadges.length > 0) {
      newBadges.forEach(badgeId => {
        commit('ADD_BADGE', badgeId)
      })
      saveBadges(state.badges)
    }

    return newBadges
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
