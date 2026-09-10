import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import { tokenStorage } from '@/api'

Vue.use(VueRouter)

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue'), meta: { title: '登录', hideHeader: true, guestOnly: true } },
  { path: '/', name: 'Home', component: () => import('@/views/Home.vue'), meta: { title: '首页' } },
  { path: '/write', name: 'Write', component: () => import('@/views/Write.vue'), meta: { title: '写一封信', requiresAuth: true } },
  { path: '/stories', name: 'Stories', component: () => import('@/views/Stories.vue'), meta: { title: '故事墙' } },
  { path: '/treehole', name: 'Treehole', component: () => import('@/views/Treehole.vue'), meta: { title: '情绪树洞', requiresAuth: true } },
  { path: '/quote', name: 'Quote', component: () => import('@/views/Quote.vue'), meta: { title: '今日句签' } },
  { path: '/capsule', name: 'Capsule', component: () => import('@/views/Capsule.vue'), meta: { title: '时光胶囊', requiresAuth: true } },
  { path: '/gallery', name: 'Gallery', component: () => import('@/views/Gallery.vue'), meta: { title: '胶囊陈列馆' } },
  { path: '/wall', name: 'Wall', component: () => import('@/views/Wall.vue'), meta: { title: '留言墙' } },
  { path: '/challenge', name: 'Challenge', component: () => import('@/views/Challenge.vue'), meta: { title: '每日挑战', requiresAuth: true } },
  { path: '/badges', name: 'Badges', component: () => import('@/views/Badges.vue'), meta: { title: '星光收集册', requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: () => import('@/views/Profile.vue'), meta: { title: '我的足迹', requiresAuth: true } },
  { path: '/admin', name: 'Admin', component: () => import('@/views/Admin.vue'), meta: { title: '后台管理', requiresAuth: true, requiresAdmin: true } },
  { path: '/about', name: 'About', component: () => import('@/views/About.vue'), meta: { title: '关于我们' } },
  { path: '*', name: 'NotFound', component: () => import('@/views/NotFound.vue') }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior() { return { x: 0, y: 0 } }
})

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} · 时空回廊` : '时空回廊'

  const token = tokenStorage.getToken()

  // 页面刷新后 Vuex 状态丢失，从 localStorage 恢复
  if (token && !store.state.auth.user) {
    store.dispatch('auth/initAuth')
  }

  const user = store.state.auth.user
  const isLoggedIn = !!token && !!user

  // 已登录用户访问登录页 → 跳转首页
  if (to.meta.guestOnly && isLoggedIn) {
    return next('/')
  }

  // 需要登录但未登录 → 跳转登录页
  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // 需要管理员权限但不是管理员 → 跳转首页
  if (to.meta.requiresAdmin && user.role !== 'admin') {
    return next('/')
  }

  next()
})

export default router
