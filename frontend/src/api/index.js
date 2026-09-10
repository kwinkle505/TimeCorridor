import axios from 'axios'
import storage from '@/utils/storage'

const TOKEN_KEY = 'tc_token'

// 创建 axios 实例
// baseURL: 动态使用当前浏览器访问的 host，替换端口为后端端口
// 这样无论从 localhost 还是局域网 IP 访问都能正确连接后端
function getBaseUrl() {
  if (process.env.VUE_APP_API_URL) return process.env.VUE_APP_API_URL
  // 开发环境：使用相对路径走 devServer 代理，避免跨域和端口不一致问题
  return ''
}

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器：添加 JWT token
api.interceptors.request.use(config => {
  const token = storage.get(TOKEN_KEY, null)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => Promise.reject(error))

// 响应拦截器：统一处理响应数据
api.interceptors.response.use(response => {
  // 后端返回格式：{ code, message, data }
  const res = response.data
  if (res.code === 200) {
    return res.data
  } else {
    console.error('[API Error]', res.message)
    return Promise.reject(res)
  }
}, error => {
  console.error('[API Request Error]', error)
  // 401 未授权，清除 token 跳转到登录
  if (error.response && error.response.status === 401) {
    storage.remove(TOKEN_KEY)
    storage.remove('current_user')
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }
  return Promise.reject(error)
})

// 认证相关 API
export const authApi = {
  // 用户注册
  register: (data) => api.post('/api/auth/register', data),
  // 用户登录
  login: (data) => api.post('/api/auth/login', data)
}

// 用户相关 API
export const userApi = {
  // 获取用户信息和统计数据
  getProfile: () => api.get('/api/user/profile'),
  // 更新用户信息
  updateProfile: (data) => api.put('/api/user/profile', data),
  // 修改密码
  changePassword: (data) => api.put('/api/user/password', data)
}

// 信件相关 API
export const letterApi = {
  // 创建信件
  createLetter: (data) => api.post('/api/letters', data),
  // 获取我的信件列表
  getMyLetters: () => api.get('/api/letters/my'),
  // 获取公开信件（故事墙）
  getPublicLetters: (params) => api.get('/api/letters/public', { params }),
  // 获取单封信件详情
  getLetter: (id) => api.get(`/api/letters/${id}`),
  // 删除信件
  deleteLetter: (id) => api.delete(`/api/letters/${id}`),
  // 更新信件公开状态
  updatePublic: (id) => api.put(`/api/letters/${id}/public`),
  // 共鸣 / 取消共鸣
  toggleLike: (id) => api.post(`/api/letters/${id}/like`),
  // 批量获取共鸣状态
  getLikedBatch: (ids) => api.get('/api/letters/likes/batch', { params: { ids: ids.join(',') } })
}

// 树洞相关 API
export const treeholeApi = {
  // 发送树洞消息
  submitMessage: (data) => api.post('/api/treehole', data),
  // 获取我的树洞消息
  getMyMessages: () => api.get('/api/treehole/my'),
  // 清空我的树洞
  clearMyMessages: () => api.delete('/api/treehole/my')
}

// 时间胶囊 API
export const capsuleApi = {
  // 创建胶囊
  createCapsule: (data) => api.post('/api/capsules', data),
  // 获取我的胶囊
  getMyCapsules: () => api.get('/api/capsules/my'),
  // 获取公开胶囊（陈列馆）
  getPublicCapsules: (params) => api.get('/api/capsules/public', { params }),
  // 开启胶囊
  openCapsule: (id) => api.post(`/api/capsules/${id}/open`),
  // 删除胶囊
  deleteCapsule: (id) => api.delete(`/api/capsules/${id}`),
  // 点赞 / 取消点赞
  toggleLike: (id) => api.post(`/api/capsules/${id}/like`)
}

// 留言墙 API
export const wallApi = {
  // 发布留言
  postMessage: (data) => api.post('/api/wall', data),
  // 获取留言列表
  getMessages: (params) => api.get('/api/wall', { params }),
  // 点赞留言
  likeMessage: (id) => api.post(`/api/wall/${id}/like`)
}

// 句签收藏 API
export const quoteApi = {
  // 收藏句签
  addFavorite: (data) => api.post('/api/quotes/favorite', data),
  // 获取我的收藏
  getFavorites: () => api.get('/api/quotes/favorites'),
  // 取消收藏
  removeFavorite: (id) => api.delete(`/api/quotes/favorites/${id}`)
}

// 挑战打卡 API
export const challengeApi = {
  // 打卡
  checkIn: (data) => api.post('/api/challenges', data),
  // 获取我的打卡记录
  getMyRecords: (month) => api.get('/api/challenges/my', { params: { month } })
}

// 管理员 API
export const adminApi = {
  // 获取用户列表
  getUsers: (params) => api.get('/api/admin/users', { params }),
  // 修改用户角色
  changeUserRole: (id, data) => api.put(`/api/admin/users/${id}/role`, data),
  // 删除用户
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  // 获取统计数据
  getStats: () => api.get('/api/admin/stats'),
  // 获取所有信件
  getAllLetters: (params) => api.get('/api/admin/letters', { params }),
  // 删除信件
  deleteLetter: (id) => api.delete(`/api/admin/letters/${id}`)
}

// 数据迁移 API
export const migrateApi = {
  importData: (data) => api.post('/api/migrate/import', data)
}

// 公开统计 API
export const statsApi = {
  // 获取全站公开统计数据
  getPublicStats: () => api.get('/api/stats')
}

// AI 回复 API
export const aiApi = {
  // 生成信件 AI 回信
  generateReply: (data) => api.post('/api/ai/reply', data),
  // 生成树洞 AI 回复
  generateTreeholeReply: (data) => api.post('/api/ai/treehole', data)
}

// 导出 token 存取方法供其他模块使用
export const tokenStorage = {
  getToken: () => storage.get(TOKEN_KEY, null),
  setToken: (token) => storage.set(TOKEN_KEY, token),
  removeToken: () => storage.remove(TOKEN_KEY)
}

export default api
