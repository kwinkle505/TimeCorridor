<template>
  <div class="wall-page">
    <div class="container">
      <h1 class="page-title">💬 留言墙 · 给陌生的你一句温暖</h1>
      <p class="page-subtitle">陌生人之间的匿名鼓励</p>

      <div class="wall-layout">
        <!-- 左栏：随机展示他人留言 -->
        <div class="wall-left card">
          <h3 class="wall-section-title">🎴 随机一条温暖</h3>
          <div class="random-card" v-if="randomMessage">
            <div class="random-content">{{ randomMessage.content }}</div>
            <div class="random-type">{{ typeLabels[randomMessage.type] || randomMessage.type }}</div>
            <div class="random-actions">
              <el-button type="text" @click="handleLike(randomMessage.id)">👍 {{ randomMessage.likes || 0 }}</el-button>
              <el-button type="text" @click="refreshRandom">🔄 换一条</el-button>
            </div>
          </div>
        </div>

        <!-- 右栏：发布留言 -->
        <div class="wall-right card">
          <h3 class="wall-section-title">✍️ 留下你的温暖</h3>
          <div v-if="currentUser">
            <el-input v-model="newMessage" placeholder="给陌生人一句温暖的话..." maxlength="30" show-word-limit type="textarea" :rows="3" />
            <div class="type-selector">
              <el-tag v-for="t in messageTypes" :key="t.value" :type="selectedType === t.value ? 'primary' : 'info'" @click="selectedType = t.value" class="type-tag">{{ t.label }}</el-tag>
            </div>
            <p class="limit-hint">今日还可发布 {{ remaining }} 条</p>
            <el-button type="primary" @click="publishMessage" :disabled="!newMessage.trim() || remaining <= 0">发布留言</el-button>
          </div>
          <div v-else class="auth-tip-small">
            <i class="el-icon-lock" />
            <span>登录后可以发布留言</span>
            <el-button type="text" @click="$router.push('/login')">去登录</el-button>
          </div>
        </div>
      </div>

      <!-- 热门留言 TOP5 -->
      <div class="hot-messages" v-if="hotMessages.length">
        <h3 class="section-title">🔥 热门留言 TOP5</h3>
        <div class="hot-list">
          <div v-for="(msg, idx) in hotMessages" :key="msg.id" class="hot-item card">
            <span class="hot-rank">{{ idx + 1 }}</span>
            <span class="hot-content">{{ msg.content }}</span>
            <span class="hot-likes">❤️ {{ msg.likes || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'Wall',
  data() {
    return {
      newMessage: '',
      selectedType: 'encourage',
      typeLabels: {
        encourage: '鼓励',
        remind: '提醒',
        share: '分享',
        question: '提问',
        mood: '心情'
      },
      messageTypes: [
        { label: '💪 鼓励', value: 'encourage' },
        { label: '💡 提醒', value: 'remind' },
        { label: '📖 分享', value: 'share' },
        { label: '❓ 提问', value: 'question' }
      ],
      randomMessage: null,
      todayCount: 0
    }
  },
  mounted() {
    this.$store.dispatch('wall/initData')
    this.refreshRandom()
  },
  computed: {
    ...mapGetters('auth', ['isLoggedIn']),
    ...mapState('wall', ['messages']),
    currentUser() { return this.isLoggedIn ? this.$store.state.auth.user : null },
    remaining() { return Math.max(0, 3 - this.todayCount) },
    hotMessages() {
      return [...this.messages].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5)
    }
  },
  methods: {
    ...mapActions('wall', ['saveMessage', 'likeMessage']),
    refreshRandom() {
      if (this.messages.length) {
        const idx = Math.floor(Math.random() * this.messages.length)
        this.randomMessage = this.messages[idx]
      }
    },
    async handleLike(id) {
      if (!this.isLoggedIn) {
        this.$message.info('登录后才能点赞哦')
        return
      }
      var result = await this.likeMessage(id)
      if (result) {
        this.randomMessage = result
      }
    },
    async publishMessage() {
      if (!this.newMessage.trim() || this.remaining <= 0) return
      await this.saveMessage({ content: this.newMessage.trim(), type: this.selectedType })
      this.newMessage = ''
      this.todayCount++
      this.$message.success('留言已发布')
      this.refreshRandom()
    }
  }
}
</script>

<style lang="less" scoped>
.wall-page { padding: 48px 0 80px; }
.wall-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 48px; }
.wall-section-title { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: @primary-color; }
.random-card { text-align: center; padding: 32px 16px; }
.random-content { font-size: 18px; line-height: 1.8; color: @text-color; margin-bottom: 12px; }
.random-type { font-size: 13px; color: @accent-color; margin-bottom: 16px; }
.random-actions { display: flex; justify-content: center; gap: 16px; }
.type-selector { display: flex; gap: 8px; margin: 12px 0; flex-wrap: wrap; }
.type-tag { cursor: pointer; }
.limit-hint { font-size: 12px; color: @text-secondary; margin-bottom: 8px; }
.hot-messages { margin-top: 48px; }
.hot-list { display: flex; flex-direction: column; gap: 12px; }
.hot-item { display: flex; align-items: center; gap: 12px; padding: 14px 20px; }
.hot-rank { font-size: 20px; font-weight: 700; color: @accent-color; min-width: 28px; }
.hot-content { flex: 1; font-size: 14px; color: @text-color; }
.hot-likes { font-size: 13px; color: #F56C6C; min-width: 48px; text-align: right; }
@media (max-width: @screen-md) { .wall-layout { grid-template-columns: 1fr; } }
</style>
