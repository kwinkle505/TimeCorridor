<template>
  <div class="profile-page">
    <div class="container">
      <h1 class="page-title">👤 我的时空足迹</h1>
      <p class="page-subtitle">记录你在时空回廊的每一步</p>

      <!-- 用户信息 -->
      <div class="user-info-section card" v-if="currentUser">
        <div class="user-info-row">
          <span class="info-label">昵称</span>
          <span class="info-value">{{ currentUser.nickname }}</span>
        </div>
        <div class="user-info-row">
          <span class="info-label">性别</span>
          <el-radio-group v-model="editGender" size="mini" @change="updateGender">
            <el-radio-button label="male">男</el-radio-button>
            <el-radio-button label="female">女</el-radio-button>
            <el-radio-button label="secret">保密</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card card" v-for="s in statCards" :key="s.label">
          <div class="stat-icon">{{ s.icon }}</div>
          <div class="stat-value">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>

      <!-- 时间线 -->
      <div class="timeline-section" v-if="timeline.length">
        <h3 class="section-title">📜 最近动态</h3>
        <div class="timeline">
          <div v-for="item in timeline.slice(0, 20)" :key="item.id" class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-date">{{ item.date }}</span>
              <span class="timeline-text">{{ item.text }}</span>
              <router-link v-if="item.link" :to="item.link" class="timeline-link">→ 查看</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 我的收藏 -->
      <div class="favorites-section" v-if="favorites.length">
        <h3 class="section-title">⭐ 我的收藏</h3>
        <el-collapse>
          <el-collapse-item title="收藏的句签">
            <div v-for="(fav, idx) in favorites" :key="idx" class="fav-item">
              <p class="fav-text">{{ fav.text }}</p>
              <el-button type="text" size="mini" @click="removeFav(fav)">取消收藏</el-button>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 数据管理 -->
      <div class="data-section card">
        <h3 class="section-title">⚙️ 数据管理</h3>
        <div class="data-actions">
          <el-button type="warning" plain @click="migrateOldData" :loading="migrating">📥 导入旧数据（localStorage）</el-button>
          <el-button type="primary" plain @click="exportData">📤 导出我的所有数据</el-button>
          <el-button type="danger" plain @click="confirmClear">🗑️ 清空所有数据</el-button>
        </div>
        <p v-if="migrateResult" class="migrate-result">{{ migrateResult }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import storage from '@/utils/storage'
import { migrateApi, userApi } from '@/api'

export default {
  name: 'Profile',
  data() {
    return {
      migrating: false,
      migrateResult: '',
      editGender: 'secret'
    }
  },
  computed: {
    ...mapGetters('auth', ['isLoggedIn']),
    ...mapState('letter', ['letters']),
    ...mapState('capsule', ['capsules']),
    ...mapState('treehole', ['messages']),
    ...mapState('wall', { wallMessages: 'messages' }),
    ...mapState('settings', ['collectedQuotes']),
    ...mapState('stats', ['stats']),
    currentUser() { return this.isLoggedIn ? this.$store.state.auth.user : null },
    statCards() {
      return [
        { icon: '✉️', label: '写了', value: this.letters.length + ' 封信' },
        { icon: '📨', label: '收到', value: this.letters.length + ' 封回信' },
        { icon: '📦', label: '封存', value: this.capsules.length + ' 个胶囊' },
        { icon: '💭', label: '树洞', value: (this.messages || []).length + ' 次倾诉' },
        { icon: '🎲', label: '句签', value: (this.collectedQuotes || []).length + ' 张' },
        { icon: '💬', label: '留言', value: (this.wallMessages || []).length + ' 条' }
      ]
    },
    timeline() {
      const items = []
      this.letters.forEach(l => {
        items.push({ id: 'l-' + l.id, date: this.formatDate(l.createTime), text: `你写了一封给${l.recipient}的信`, link: '/stories' })
      })
      this.capsules.forEach(c => {
        items.push({ id: 'c-' + c.id, date: this.formatDate(c.sealDate), text: `你封存了胶囊『${c.name}』`, link: '/capsule' })
      })
      return items.sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    favorites() {
      return (this.collectedQuotes || []).map(q => {
        return q || { text: '句签' }
      })
    }
  },
  mounted() {
    if (this.currentUser && this.currentUser.gender) {
      this.editGender = this.currentUser.gender
    }
    this.$store.dispatch('letter/initData')
    this.$store.dispatch('capsule/initData')
    this.$store.dispatch('treehole/initData')
    this.$store.dispatch('wall/initData')
    this.$store.dispatch('settings/syncCollectedQuotes')
  },
  watch: {
    currentUser: {
      handler(user) {
        if (user && user.gender) {
          this.editGender = user.gender
        }
      },
      immediate: true
    }
  },
  methods: {
    formatDate(d) {
      if (!d) return ''
      const date = new Date(d)
      return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
    },
    exportData() {
      const data = storage.getAllKeys().reduce((acc, key) => {
        acc[key] = storage.get(key)
        return acc
      }, {})
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `时空回廊数据_${new Date().toISOString().slice(0,10)}.json`
      link.click()
      this.$message.success('数据已导出')
    },
    confirmClear() {
      this.$confirm('确定要清空所有数据吗？此操作不可恢复。', '警告', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
        storage.clearAll()
        window.location.reload()
      }).catch(() => {})
    },
    removeFav(fav) {
      this.$store.dispatch('settings/toggleQuoteFavorite', fav)
    },
    async updateGender() {
      try {
        await userApi.updateProfile({ gender: this.editGender })
        this.$store.commit('auth/SET_USER', { ...this.currentUser, gender: this.editGender })
        storage.set('current_user', { ...this.currentUser, gender: this.editGender })
        this.$message.success('性别已更新')
      } catch (err) {
        this.$message.error('更新失败')
      }
    },
    async migrateOldData() {
      // 从 localStorage 读取旧数据
      const oldLetters = storage.get('letters', [])
      const oldTreehole = storage.get('treehole_messages', [])
      const oldCapsules = storage.get('capsules', [])
      const oldWall = storage.get('wall_messages', [])

      const hasData = oldLetters.length || oldTreehole.length || oldCapsules.length || oldWall.length
      if (!hasData) {
        this.migrateResult = 'localStorage 中没有找到旧数据'
        return
      }

      this.$confirm(
        `检测到旧数据：${oldLetters.length}封信、${oldTreehole.length}条树洞、${oldCapsules.length}个胶囊、${oldWall.length}条留言。确认导入？`,
        '导入旧数据',
        { confirmButtonText: '确认导入', cancelButtonText: '取消', type: 'info' }
      ).then(async () => {
        this.migrating = true
        this.migrateResult = ''
        try {
          const result = await migrateApi.importData({
            letters: oldLetters,
            treehole: oldTreehole,
            capsules: oldCapsules,
            wall: oldWall
          })
          const r = result || {}
          this.migrateResult = `导入成功！信件${r.letters || 0}封、树洞${r.treehole || 0}条、胶囊${r.capsules || 0}个、留言${r.wall || 0}条`
          this.$message.success('数据导入成功')
          // 刷新数据
          this.$store.dispatch('letter/initData')
          this.$store.dispatch('capsule/initData')
          this.$store.dispatch('treehole/initData')
          this.$store.dispatch('wall/initData')
        } catch (err) {
          this.migrateResult = '导入失败: ' + (err.message || '未知错误')
          this.$message.error('导入失败')
        } finally {
          this.migrating = false
        }
      }).catch(() => {})
    }
  }
}
</script>

<style lang="less" scoped>
.profile-page { padding: 48px 0 80px; }
.user-info-section { padding: 24px; margin-bottom: 32px; }
.user-info-row { display: flex; align-items: center; gap: 16px; padding: 8px 0; }
.info-label { font-size: 14px; color: @text-secondary; min-width: 60px; }
.info-value { font-size: 15px; color: @text-color; font-weight: 500; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 48px; }
.stat-card { text-align: center; padding: 24px 16px; }
.stat-icon { font-size: 32px; margin-bottom: 8px; }
.stat-value { font-size: 16px; font-weight: 600; color: @primary-color; margin-bottom: 4px; }
.stat-label { font-size: 13px; color: @text-secondary; }
.timeline-section { margin-bottom: 48px; }
.timeline { border-left: 2px solid @border-color; margin-left: 12px; padding-left: 20px; }
.timeline-item { position: relative; margin-bottom: 20px; }
.timeline-dot { position: absolute; left: -25px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: @accent-color; }
.timeline-content { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.timeline-date { font-size: 12px; color: @text-secondary; }
.timeline-text { font-size: 14px; color: @text-color; }
.timeline-link { font-size: 12px; color: @accent-color; }
.section-title { font-size: 18px; margin-bottom: 20px; color: @primary-color; }
.favorites-section { margin-bottom: 48px; }
.fav-item { padding: 8px 0; border-bottom: 1px solid @border-color; display: flex; justify-content: space-between; align-items: center; }
.fav-text { font-size: 14px; color: @text-color; margin: 0; }
.data-section { padding: 24px; }
.data-actions { display: flex; gap: 16px; flex-wrap: wrap; }
.migrate-result { margin-top: 12px; font-size: 14px; color: @accent-color; }
@media (max-width: @screen-sm) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
