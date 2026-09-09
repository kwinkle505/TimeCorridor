import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/styles/global.less'

Vue.use(ElementUI)
Vue.config.productionTip = false

// 初始化认证状态
store.dispatch('auth/initAuth')
// 初始化主题和设置
store.dispatch('settings/initTheme')

// 需要登录的路由白名单（哪些页面需要登录才能访问）
const requiresAuthRoutes = [
  '/write', '/capsule', '/treehole', '/wall',
  '/challenge', '/badges', '/profile'
]

router.beforeEach((to, from, next) => {
  const emojis = ['✉️','💌','📖','💭','🎲','📦','🏛️','💬','🌟','🏅','👤','🌌']
  const emoji = emojis[Math.floor(Math.random() * emojis.length)]
  document.title = to.meta.title ? `${emoji} ${to.meta.title} - 时空回廊` : '时空回廊 - Time Corridor'

  // 检查当前页面是否需要认证
  const isAuthenticated = store.getters['auth/isLoggedIn']
  const needsAuth = requiresAuthRoutes.includes(to.path)

  if (needsAuth && !isAuthenticated) {
    // 需要登录但未登录，跳转到登录页
    next({ path: '/login' })
  } else if (to.path === '/login' && isAuthenticated) {
    // 已经登录，访问登录页跳转到首页
    next({ path: '/' })
  } else {
    next()
  }
})

new Vue({ router, store, render: h => h(App) }).$mount('#app')
