/**
 * 胶囊模块 (capsule)
 * 管理用户的时间胶囊，通过后端 API 操作
 */
import Vue from 'vue'
import { capsuleApi } from '@/api'

const CAPSULE_COLORS = ['#FFD93D', '#6BCB77', '#4D96FF', '#FF9F9F', '#A0E7E5', '#E6E6FA', '#FBE7C6', '#B4F8C8']

const state = {
  capsules: [],
  publicCapsules: [],
  publicTotal: 0,
  loading: false,
  publicLoading: false
}

const getters = {
  allCapsules: state => {
    return [...state.capsules].sort((a, b) =>
      new Date(b.created_at || b.createTime) - new Date(a.created_at || a.createTime)
    )
  },
  openedCapsules: (state, getters) => {
    return getters.allCapsules.filter(item => item.opened || item.isOpened)
  },
  unopenedCapsules: (state, getters) => {
    return getters.allCapsules.filter(item => !item.opened && !item.isOpened)
  },
  getCapsuleById: (state) => (id) => {
    return state.capsules.find(item => item.id == id) || null
  }
}

const mutations = {
  SET_CAPSULES(state, capsules) {
    state.capsules = capsules
  },
  SET_PUBLIC_CAPSULES(state, { list, total }) {
    state.publicCapsules = list
    state.publicTotal = total || 0
  },
  ADD_CAPSULE(state, capsule) {
    state.capsules.unshift(capsule)
  },
  UPDATE_CAPSULE(state, updatedCapsule) {
    const index = state.capsules.findIndex(item => item.id == updatedCapsule.id)
    if (index !== -1) {
      Vue.set(state.capsules, index, { ...state.capsules[index], ...updatedCapsule })
    }
  },
  DELETE_CAPSULE(state, id) {
    state.capsules = state.capsules.filter(item => item.id != id)
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_PUBLIC_LOADING(state, loading) {
    state.publicLoading = loading
  }
}

const actions = {
  /**
   * 从后端获取我的胶囊列表
   */
  async initData({ commit }) {
    commit('SET_LOADING', true)
    try {
      const capsules = await capsuleApi.getMyCapsules()
      // 转换后端格式
      const formatted = (capsules || []).map(c => ({
        id: c.id,
        name: c.name || '无标题胶囊',
        items: typeof c.items === 'string' ? JSON.parse(c.items) : (c.items || []),
        sealDate: c.created_at,
        openDate: c.open_date || null,
        isPublic: !!c.is_public,
        isOpened: !!c.opened,
        opened: !!c.opened,
        color: CAPSULE_COLORS[Math.floor(Math.random() * CAPSULE_COLORS.length)],
        likes: c.likes || 0,
        createTime: c.created_at
      }))
      commit('SET_CAPSULES', formatted)
    } catch (err) {
      console.error('获取胶囊列表失败:', err)
      commit('SET_CAPSULES', [])
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 获取公开胶囊列表（陈列馆）
   */
  async loadPublicCapsules({ commit }, params = {}) {
    commit('SET_PUBLIC_LOADING', true)
    try {
      const res = await capsuleApi.getPublicCapsules(params)
      const data = res.data || {}
      const list = (data.list || []).map(c => ({
        id: c.id,
        name: c.name || '无标题胶囊',
        items: c.items ? (typeof c.items === 'string' ? JSON.parse(c.items) : c.items) : [],
        sealDate: c.created_at,
        openDate: c.open_date || null,
        isPublic: !!c.is_public,
        isOpened: !!c.opened,
        opened: !!c.opened,
        locked: !!c.locked,
        authorName: c.author_name || '匿名',
        color: CAPSULE_COLORS[Math.floor(Math.random() * CAPSULE_COLORS.length)],
        likes: c.likes || 0,
        createTime: c.created_at
      }))
      commit('SET_PUBLIC_CAPSULES', { list, total: data.total || 0 })
      return list
    } catch (err) {
      console.error('获取公开胶囊失败:', err)
      commit('SET_PUBLIC_CAPSULES', { list: [], total: 0 })
      return []
    } finally {
      commit('SET_PUBLIC_LOADING', false)
    }
  },

  /**
   * 保存胶囊（新增）
   */
  async saveCapsule({ commit }, payload) {
    const rawDate = payload.openDate
    let openDateStr = null
    if (rawDate) {
      const d = new Date(rawDate)
      if (isNaN(d.getTime())) throw new Error('开启日期无效')
      openDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }

    const result = await capsuleApi.createCapsule({
      name: payload.name || '无标题胶囊',
      items: payload.items || [],
      openDate: openDateStr,
      isPublic: payload.isPublic || false
    })
    const color = CAPSULE_COLORS[Math.floor(Math.random() * CAPSULE_COLORS.length)]
    const newCapsule = {
      id: result.id,
      name: payload.name || '无标题胶囊',
      items: payload.items || [],
      sealDate: new Date().toISOString(),
      openDate: openDateStr,
      isPublic: payload.isPublic || false,
      isOpened: false,
      opened: false,
      color,
      likes: 0,
      createTime: new Date().toISOString()
    }
    commit('ADD_CAPSULE', newCapsule)
    return newCapsule
  },

  /**
   * 点赞胶囊
   */
  async likeCapsule({ commit, state }, id) {
    try {
      const result = await capsuleApi.toggleLike(id)
      const capsule = state.capsules.find(item => item.id == id)
      if (capsule) {
        const delta = result.liked ? 1 : -1
        const updated = { ...capsule, likes: Math.max(0, (capsule.likes || 0) + delta), _liked: result.liked }
        commit('UPDATE_CAPSULE', updated)
      }
      // 同步更新 publicCapsules
      const pubIdx = state.publicCapsules.findIndex(item => item.id == id)
      if (pubIdx !== -1) {
        const pub = state.publicCapsules[pubIdx]
        const delta = result.liked ? 1 : -1
        const updated = { ...pub, likes: Math.max(0, (pub.likes || 0) + delta), _liked: result.liked }
        const newList = [...state.publicCapsules]
        newList[pubIdx] = updated
        commit('SET_PUBLIC_CAPSULES', newList)
      }
      return { success: true, liked: result.liked }
    } catch (err) {
      return { success: false, message: err.message || '操作失败' }
    }
  },

  /**
   * 删除胶囊
   */
  async deleteCapsule({ commit }, id) {
    try {
      await capsuleApi.deleteCapsule(id)
      commit('DELETE_CAPSULE', id)
    } catch (err) {
      console.error('删除胶囊失败:', err)
    }
  },

  /**
   * 开启胶囊
   */
  async openCapsule({ commit, state }, id) {
    try {
      const result = await capsuleApi.openCapsule(id)
      const capsule = state.capsules.find(item => item.id == id)
      if (capsule) {
        const updated = {
          ...capsule,
          isOpened: true,
          opened: true,
          openTime: new Date().toISOString()
        }
        commit('UPDATE_CAPSULE', updated)
        return updated
      }
    } catch (err) {
      console.error('开启胶囊失败:', err)
      return null
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}