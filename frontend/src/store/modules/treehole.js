/**
 * 树洞模块 (treehole)
 * 管理用户在树洞的倾诉记录，通过后端 API 操作
 */

import { treeholeApi, aiApi } from '@/api'
import { generateId } from '@/utils/helpers'
import { getReply, getSong } from '@/utils/treeholeReplies'

const state = {
  messages: [],
  loading: false
}

const getters = {
  allMessages: state => {
    return [...state.messages].sort((a, b) =>
      new Date(b.created_at || b.createTime) - new Date(a.created_at || a.createTime)
    )
  },
  messageCount: state => state.messages.length
}

const mutations = {
  SET_MESSAGES(state, messages) {
    state.messages = messages
  },
  ADD_MESSAGE(state, message) {
    state.messages.push(message)
  },
  CLEAR_MESSAGES(state) {
    state.messages = []
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  }
}

const actions = {
  /**
   * 从后端获取我的树洞消息
   */
  async initData({ commit }) {
    commit('SET_LOADING', true)
    try {
      const messages = await treeholeApi.getMyMessages()
      // 转换后端格式为前端格式
      const formatted = (messages || []).map(m => ({
        id: m.id,
        type: m.type || 'user',
        content: m.content || '',
        emotion: m.emotion || '😌平静',
        reply: m.reply || null,
        song: m.song || null,
        createTime: m.created_at
      }))
      commit('SET_MESSAGES', formatted)
    } catch (err) {
      console.error('获取树洞消息失败:', err)
      commit('SET_MESSAGES', [])
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 保存倾诉消息（包含AI回复）
   */
  async saveMessage({ commit, state }, payload) {
    const { content, emotion } = payload
    const now = new Date().toISOString()
    const emotionText = (emotion || '平静').replace(/^[^\u4e00-\u9fa5]+/, '')

    // 1. 生成AI回复
    let reply = ''
    let song = null
    try {
      const res = await aiApi.generateTreeholeReply({ content, emotion: emotionText })
      if (res.data && res.data.data && res.data.data.reply) {
        reply = res.data.data.reply
      }
    } catch (err) {
      console.warn('树洞AI调用失败，降级到模板:', err.message)
    }
    if (!reply) {
      reply = getReply(emotionText)
      song = getSong(emotionText)
    }

    // 2. 发送到后端
    try {
      const result = await treeholeApi.submitMessage({
        content: content || '',
        emotion: emotion || '😌平静',
        reply: reply,
        song: song || ''
      })
      // 用户消息
      const userMsg = {
        id: 'th_u_' + (result && result.id ? result.id : Date.now()),
        type: 'user',
        content: content || '',
        emotion: emotion || '😌平静',
        reply: null,
        song: null,
        createTime: now
      }
      commit('ADD_MESSAGE', userMsg)
      // AI回复
      const aiMsg = {
        id: 'th_a_' + Date.now(),
        type: 'ai',
        content: reply,
        emotion: emotionText,
        reply: null,
        song: song,
        createTime: new Date().toISOString()
      }
      commit('ADD_MESSAGE', aiMsg)
      return aiMsg
    } catch (err) {
      console.error('保存树洞消息失败:', err)
      return null
    }
  },

  /**
   * 清空所有树洞消息
   */
  async clearMessages({ commit }) {
    try {
      await treeholeApi.clearMyMessages()
      commit('CLEAR_MESSAGES')
    } catch (err) {
      console.error('清空树洞失败:', err)
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