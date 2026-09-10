/**
 * 认证模块 (auth)
 * 管理用户登录状态、JWT token 和用户信息
 */

import { authApi, userApi, tokenStorage } from '@/api'
import storage, { setUserId, clearUserId } from '@/utils/storage'

const CURRENT_USER_KEY = 'current_user'

const state = {
  user: null,
  token: tokenStorage.getToken(),
  loading: false,
  profile: null
}

const getters = {
  isLoggedIn: state => !!state.token && !!state.user,
  currentUser: state => state.user,
  userProfile: state => state.profile,
  isAdmin: state => state.user && state.user.role === 'admin'
}

const mutations = {
  SET_USER(state, user) {
    state.user = user
  },
  SET_TOKEN(state, token) {
    state.token = token
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_PROFILE(state, profile) {
    state.profile = profile
  },
  CLEAR_AUTH(state) {
    state.user = null
    state.token = null
    state.profile = null
  }
}

const actions = {
  /**
   * 登录
   */
  async login({ commit }, { username, password }) {
    commit('SET_LOADING', true)
    try {
      const data = await authApi.login({ username, password })
      const { user, token } = data
      tokenStorage.setToken(token)
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
      // 设置用户级存储作用域
      setUserId(user.id)
      // 同步到 localStorage 供旧组件使用
      storage.set(CURRENT_USER_KEY, { id: user.id, username: user.username, nickname: user.nickname, role: user.role, gender: user.gender })
      return { success: true, message: '登录成功' }
    } catch (err) {
      return { success: false, message: err.message || '用户名或密码错误' }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 注册
   */
  async register({ commit }, { username, password, nickname, gender }) {
    commit('SET_LOADING', true)
    try {
      await authApi.register({ username, password, nickname, gender })
      return { success: true, message: '注册成功，请登录' }
    } catch (err) {
      return { success: false, message: err.message || '注册失败' }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 退出登录
   */
  logout({ commit }) {
    tokenStorage.removeToken()
    commit('CLEAR_AUTH')
    storage.remove(CURRENT_USER_KEY)
    // 清除用户级存储作用域
    clearUserId()
  },

  /**
   * 获取用户信息和统计数据
   */
  async fetchProfile({ commit }) {
    try {
      const data = await userApi.getProfile()
      commit('SET_PROFILE', data)
      return data
    } catch (err) {
      console.error('获取用户信息失败:', err)
      return null
    }
  },

  /**
   * 更新用户信息
   */
  async updateProfile({ dispatch }, payload) {
    try {
      await userApi.updateProfile(payload)
      return { success: true, message: '更新成功' }
    } catch (err) {
      return { success: false, message: err.message || '更新失败' }
    }
  },

  /**
   * 修改密码
   */
  async changePassword(_, payload) {
    try {
      await userApi.changePassword(payload)
      return { success: true, message: '密码修改成功' }
    } catch (err) {
      return { success: false, message: err.message || '修改失败' }
    }
  },

  /**
   * 初始化认证状态（从 localStorage 恢复）
   */
  initAuth({ commit }) {
    const token = tokenStorage.getToken()
    if (token) {
      commit('SET_TOKEN', token)
      const user = storage.get(CURRENT_USER_KEY, null)
      if (user) {
        commit('SET_USER', user)
        // 恢复用户级存储作用域
        if (user.id) {
          setUserId(user.id)
        }
      }
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