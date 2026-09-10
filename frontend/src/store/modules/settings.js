/**
 * 设置模块 (settings)
 * 管理用户偏好设置：暗黑模式、收藏句签等（通过后端 API 保存收藏）
 */

import storage from '@/utils/storage'
import { mockCollectedQuotes } from '@/utils/mockData'
import { quotes as allQuotes } from '@/utils/quotes'
import { quoteApi, tokenStorage } from '@/api'

const STORAGE_KEY_THEME = 'settings_theme'
const STORAGE_KEY_QUOTES = 'settings_collected_quotes'

// 收藏句签：用户级数据，按用户 ID 隔离
function loadCollectedQuotes() {
  return storage.user.get(STORAGE_KEY_QUOTES, [])
}
function saveCollectedQuotes(quotes) {
  storage.user.set(STORAGE_KEY_QUOTES, quotes)
}

const state = {
  darkMode: false,
  collectedQuotes: []
}

const getters = {
  isDarkMode: state => state.darkMode,
  collectedQuotes: state => state.collectedQuotes,
  collectedCount: state => state.collectedQuotes.length,
  isQuoteCollected: state => (quoteIndex) => {
    return state.collectedQuotes.some(q => q.index === quoteIndex)
  }
}

const mutations = {
  SET_DARK_MODE(state, isDark) {
    state.darkMode = isDark
  },
  SET_COLLECTED_QUOTES(state, quotes) {
    state.collectedQuotes = quotes
  },
  ADD_COLLECTED_QUOTE(state, quote) {
    const exists = state.collectedQuotes.some(q => q.index === quote.index)
    if (!exists) {
      state.collectedQuotes.unshift(quote)
    }
  },
  REMOVE_COLLECTED_QUOTE(state, quoteIndex) {
    state.collectedQuotes = state.collectedQuotes.filter(q => q.index !== quoteIndex)
  }
}

const actions = {
  /**
   * 初始化主题和收藏数据
   */
  async initTheme({ commit, dispatch }) {
    // 读取主题设置
    const darkMode = storage.get(STORAGE_KEY_THEME, false)
    commit('SET_DARK_MODE', darkMode)

    // 从后端同步收藏数据
    await dispatch('syncCollectedQuotes')

    // 若开启暗黑模式，同步到 html 标签和 body 标签
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark-mode')
    }
  },

  /**
   * 从后端同步收藏的句签
   */
  async syncCollectedQuotes({ commit }) {
    // 未登录时不请求后端，直接使用本地数据（避免 401 跳转登录页）
    const hasToken = !!tokenStorage.getToken()
    if (hasToken) {
      try {
        const data = await quoteApi.getFavorites()
        const favorites = (data && data.list) || []
        if (favorites.length > 0) {
          const formatted = favorites.map((f, idx) => ({
            text: f.quote_text,
            source: f.quote_source || '',
            index: 'api_' + f.id,
            apiId: f.id
          }))
          commit('SET_COLLECTED_QUOTES', formatted)
          saveCollectedQuotes(formatted)
          return
        }
      } catch (err) {
        console.warn('从后端同步收藏失败，使用本地缓存:', err)
      }
    }

    // 降级：使用本地缓存
    const quotes = loadCollectedQuotes()
    if (quotes && quotes.length > 0) {
      commit('SET_COLLECTED_QUOTES', quotes)
    } else {
      var initial = mockCollectedQuotes.map(function(idx) {
        var q = allQuotes[idx]
        return q ? { text: q.text, source: q.source, index: idx } : null
      }).filter(Boolean)
      commit('SET_COLLECTED_QUOTES', initial)
      saveCollectedQuotes(initial)
    }
  },

  /**
   * 切换暗黑模式
   */
  toggleTheme({ commit, state }) {
    const newMode = !state.darkMode
    commit('SET_DARK_MODE', newMode)
    storage.set(STORAGE_KEY_THEME, newMode)

    if (newMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark-mode')
    }

    return newMode
  },

  /**
   * 切换句签收藏状态（收藏/取消收藏）
   */
  async toggleQuoteFavorite({ commit, state }, quote) {
    const isCollected = state.collectedQuotes.some(q => q.index === quote.index)

    if (isCollected) {
      // 取消收藏
      const collected = state.collectedQuotes.find(q => q.index === quote.index)
      if (collected && collected.apiId) {
        try {
          await quoteApi.removeFavorite(collected.apiId)
        } catch (err) {
          console.warn('取消收藏API失败:', err)
        }
      }
      commit('REMOVE_COLLECTED_QUOTE', quote.index)
    } else {
      // 收藏
      try {
        const result = await quoteApi.addFavorite({
          quoteText: quote.text,
          quoteSource: quote.source || ''
        })
        const newQuote = {
          ...quote,
          index: 'api_' + (result && result.id ? result.id : Date.now()),
          apiId: result && result.id ? result.id : null
        }
        commit('ADD_COLLECTED_QUOTE', newQuote)
      } catch (err) {
        console.warn('收藏API失败:', err)
        commit('ADD_COLLECTED_QUOTE', quote)
      }
    }

    saveCollectedQuotes(state.collectedQuotes)
    return !isCollected
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}