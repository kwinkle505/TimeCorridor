import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue'), meta: { title: '登录', hideHeader: true } },
  { path: '/', name: 'Home', component: () => import('@/views/Home.vue'), meta: { title: '首页' } },
  { path: '/write', name: 'Write', component: () => import('@/views/Write.vue'), meta: { title: '写一封信' } },
  { path: '/stories', name: 'Stories', component: () => import('@/views/Stories.vue'), meta: { title: '故事墙' } },
  { path: '/treehole', name: 'Treehole', component: () => import('@/views/Treehole.vue'), meta: { title: '情绪树洞' } },
  { path: '/quote', name: 'Quote', component: () => import('@/views/Quote.vue'), meta: { title: '今日句签' } },
  { path: '/capsule', name: 'Capsule', component: () => import('@/views/Capsule.vue'), meta: { title: '时光胶囊' } },
  { path: '/gallery', name: 'Gallery', component: () => import('@/views/Gallery.vue'), meta: { title: '胶囊陈列馆' } },
  { path: '/wall', name: 'Wall', component: () => import('@/views/Wall.vue'), meta: { title: '留言墙' } },
  { path: '/challenge', name: 'Challenge', component: () => import('@/views/Challenge.vue'), meta: { title: '每日挑战' } },
  { path: '/badges', name: 'Badges', component: () => import('@/views/Badges.vue'), meta: { title: '星光收集册' } },
  { path: '/profile', name: 'Profile', component: () => import('@/views/Profile.vue'), meta: { title: '我的足迹' } },
  { path: '/admin', name: 'Admin', component: () => import('@/views/Admin.vue'), meta: { title: '后台管理' } },
  { path: '/about', name: 'About', component: () => import('@/views/About.vue'), meta: { title: '关于我们' } },
  { path: '*', name: 'NotFound', component: () => import('@/views/NotFound.vue') }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior() { return { x: 0, y: 0 } }
})

export default router
