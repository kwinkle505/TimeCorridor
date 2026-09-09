/**
 * 信件模块 (letter)
 * 管理用户写给未来自己的信件，通过后端 API 操作
 */
import Vue from 'vue'
import { letterApi } from '@/api'

const state = {
  letters: [],
  publicLetters: [],
  currentLetter: null,
  loading: false
}

const getters = {
  allLetters: state => {
    return [...state.letters].sort((a, b) =>
      new Date(b.created_at || b.createTime) - new Date(a.created_at || a.createTime)
    )
  },
  openedLetters: (state, getters) => {
    return getters.allLetters.filter(item => item.isOpened)
  },
  unopenedLetters: (state, getters) => {
    return getters.allLetters.filter(item => !item.isOpened)
  },
  getLetterById: (state) => (id) => {
    return state.letters.find(item => item.id == id) || null
  }
}

const mutations = {
  SET_LETTERS(state, letters) {
    state.letters = letters
  },
  SET_PUBLIC_LETTERS(state, letters) {
    state.publicLetters = letters
  },
  SET_CURRENT_LETTER(state, letter) {
    state.currentLetter = letter
  },
  ADD_LETTER(state, letter) {
    state.letters.unshift(letter)
  },
  UPDATE_LETTER(state, updatedLetter) {
    const index = state.letters.findIndex(item => item.id == updatedLetter.id)
    if (index !== -1) {
      Vue.set(state.letters, index, { ...state.letters[index], ...updatedLetter })
    }
  },
  DELETE_LETTER(state, id) {
    state.letters = state.letters.filter(item => item.id != id)
    state.publicLetters = state.publicLetters.filter(item => item.id != id)
  },
  UPDATE_LETTER_LIKE(state, { id, liked }) {
    const idx = state.publicLetters.findIndex(item => item.id == id)
    if (idx !== -1) {
      const letter = state.publicLetters[idx]
      const delta = liked ? 1 : -1
      Vue.set(state.publicLetters, idx, {
        ...letter,
        likes: Math.max(0, (letter.likes || 0) + delta),
        _resonated: liked
      })
    }
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  }
}

const actions = {
  /**
   * 从后端获取我的信件列表
   */
  async initData({ commit }) {
    commit('SET_LOADING', true)
    try {
      const letters = await letterApi.getMyLetters()
      commit('SET_LETTERS', letters || [])
    } catch (err) {
      console.error('获取信件列表失败:', err)
      commit('SET_LETTERS', [])
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 获取公开信件（故事墙）
   */
  async fetchPublicLetters({ commit }) {
    try {
      const data = await letterApi.getPublicLetters({ page: 1, size: 100 })
      const formatted = (data.list || []).map(l => ({
        id: l.id,
        recipient: l.recipient || '',
        salutation: l.salutation || '',
        content: l.content || '',
        moods: l.moods ? (typeof l.moods === 'string' ? JSON.parse(l.moods) : l.moods) : [],
        types: l.types ? (typeof l.types === 'string' ? JSON.parse(l.types) : l.types) : [],
        reply: l.reply || '',
        isPublic: true,
        isOpened: l.is_opened || false,
        author: l.author_name || '匿名',
        writeDate: l.write_date || '',
        createTime: l.created_at,
        likes: l.likes || 0
      }))
      commit('SET_PUBLIC_LETTERS', formatted)
      return formatted
    } catch (err) {
      console.error('获取公开信件失败:', err)
      commit('SET_PUBLIC_LETTERS', [])
      return []
    }
  },

  /**
   * 保存信件（新增）- 通过后端 API
   */
  async saveLetter({ commit }, payload) {
    try {
      const result = await letterApi.createLetter({
        recipient: payload.recipient || '',
        salutation: payload.salutation || '',
        content: payload.content || '',
        moods: payload.moods || [],
        types: payload.types || [],
        reply: payload.reply || '',
        isPublic: payload.isPublic || false,
        writeDate: payload.writeDate || ''
      })
      // 构造本地信件对象
      const newLetter = {
        id: result.id,
        ...payload,
        created_at: new Date().toISOString(),
        isOpened: false
      }
      commit('ADD_LETTER', newLetter)
      return newLetter
    } catch (err) {
      console.error('保存信件失败:', err)
      return null
    }
  },

  /**
   * 获取我的信件列表
   */
  async fetchLetters({ dispatch }) {
    await dispatch('initData')
    return state.letters
  },

  /**
   * 删除信件
   */
  async deleteLetter({ commit }, id) {
    try {
      await letterApi.deleteLetter(id)
      commit('DELETE_LETTER', id)
      return { success: true }
    } catch (err) {
      console.error('删除信件失败:', err)
      return { success: false, message: err.message || '删除失败' }
    }
  },

  /**
   * 开启信件
   */
  openLetter({ commit, state }, id) {
    const letter = state.letters.find(item => item.id == id)
    if (letter && !letter.isOpened) {
      const updated = { ...letter, isOpened: true, openTime: new Date().toISOString() }
      commit('UPDATE_LETTER', updated)
    }
  },

  /**
   * 共鸣 / 取消共鸣
   */
  async toggleLike({ commit }, id) {
    try {
      const result = await letterApi.toggleLike(id)
      commit('UPDATE_LETTER_LIKE', { id, liked: result.liked })
      return { success: true, liked: result.liked }
    } catch (err) {
      return { success: false, message: err.message || '操作失败' }
    }
  },

  /**
   * 设置当前查看的信件
   */
  setCurrentLetter({ commit }, letter) {
    commit('SET_CURRENT_LETTER', letter)
  },

  /**
   * 同步到后端 / 更新信件公开状态
   */
  async syncStorage({ state }) {
    // 纯展示用，不需要同步
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}