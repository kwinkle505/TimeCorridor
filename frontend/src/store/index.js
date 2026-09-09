/**
 * Vuex Store 入口
 * 引入并注册 9 个业务模块
 */

import Vue from 'vue'
import Vuex from 'vuex'

// 导入各业务模块
import auth from './modules/auth'
import letter from './modules/letter'
import treehole from './modules/treehole'
import capsule from './modules/capsule'
import wall from './modules/wall'
import challenge from './modules/challenge'
import badges from './modules/badges'
import settings from './modules/settings'
import stats from './modules/stats'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    auth,        // 认证模块（新增）
    letter,      // 信件模块
    treehole,    // 树洞模块
    capsule,     // 胶囊模块
    wall,        // 留言墙模块
    challenge,   // 挑战模块
    badges,      // 徽章模块
    settings,    // 设置模块
    stats        // 统计模块
  }
})