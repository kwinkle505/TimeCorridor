/**
 * 留言墙模块 (wall)
 * 管理用户在留言墙的留言及点赞，通过后端 API 操作
 */
import Vue from 'vue'
import { wallApi } from '@/api'

const state = {
  messages: [],
  total: 0,
  loading: false
}

const getters = {
  allMessages: state => {
    return [...state.messages].sort((a, b) =>
      new Date(b.created_at || b.createTime) - new Date(a.created_at || a.createTime)
    )
  },
  hotMessages: state => {
    return [...state.messages].sort((a, b) => b.likes - a.likes)
  },
  messageCount: state => state.messages.length,
  totalLikes: state => state.messages.reduce((sum, item) => sum + (item.likes || 0), 0)
}

const mutations = {
  SET_MESSAGES(state, { messages, total }) {
    state.messages = messages
    state.total = total || messages.length
  },
  ADD_MESSAGE(state, message) {
    state.messages.unshift(message)
  },
  UPDATE_MESSAGE(state, updatedMessage) {
    const index = state.messages.findIndex(item => item.id == updatedMessage.id)
    if (index !== -1) {
      Vue.set(state.messages, index, { ...state.messages[index], ...updatedMessage })
    }
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  }
}

const actions = {
  /**
   * 从后端获取留言列表
   */
  async initData({ commit }) {
    commit('SET_LOADING', true)
    try {
      const data = await wallApi.getMessages({ page: 1, size: 50 })
      const formatted = (data.list || []).map(m => ({
        id: m.id,
        content: m.content || '',
        author: m.author_name || '匿名访客',
        type: m.type || 'encourage',
        likes: m.likes || 0,
        isLiked: false,
        createTime: m.created_at,
        // 颜色从content hash生成
        color: getColorFromString(m.content || '')
      }))
      commit('SET_MESSAGES', { messages: formatted, total: data.total || 0 })
    } catch (err) {
      console.error('获取留言列表失败:', err)
      commit('SET_MESSAGES', { messages: [], total: 0 })
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 保存留言
   */
  async saveMessage({ commit }, payload) {
    try {
      const result = await wallApi.postMessage({
        content: payload.content || '',
        type: payload.type || 'encourage'
      })
      const colors = ['#FF9F9F', '#A0E7E5', '#B4F8C8', '#FBE7C6', '#E6E6FA', '#FFD93D', '#FFB6C1', '#87CEEB']
      const newMessage = {
        id: result.id,
        content: payload.content || '',
        author: payload.author || '匿名访客',
        type: payload.type || 'encourage',
        likes: 0,
        isLiked: false,
        createTime: new Date().toISOString(),
        color: colors[Math.floor(Math.random() * colors.length)]
      }
      commit('ADD_MESSAGE', newMessage)
      return newMessage
    } catch (err) {
      console.error('保存留言失败:', err)
      return null
    }
  },

  /**
   * 点赞 / 取消点赞
   */
  async likeMessage({ commit, state }, id) {
    try {
      const result = await wallApi.likeMessage(id)
      const message = state.messages.find(item => item.id == id)
      if (message) {
        const liked = result.liked
        const delta = liked ? 1 : -1
        const updated = {
          ...message,
          isLiked: liked,
          likes: Math.max(0, (message.likes || 0) + delta)
        }
        commit('UPDATE_MESSAGE', updated)
        return updated
      }
      return null
    } catch (err) {
      console.error('点赞失败:', err)
      return null
    }
  }
}

// 辅助函数：从字符串生成颜色
function getColorFromString(str) {
  const colors = ['#FF9F9F', '#A0E7E5', '#B4F8C8', '#FBE7C6', '#E6E6FA', '#FFD93D', '#FFB6C1', '#87CEEB']
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}