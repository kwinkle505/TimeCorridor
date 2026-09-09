<template>
  <div class="treehole-page">
    <h1 class="page-title">💭 情绪树洞 · 一句话就够了</h1>
    <p class="page-subtitle">说出你此刻的心情，收到一句温柔的回应</p>

    <div v-if="currentUser" class="input-area card">
      <el-input v-model="form.content" :placeholder="placeholder" maxlength="50" show-word-limit @keyup.enter.native="handleSubmit" />
      <div class="emotion-bar">
        <span v-for="e in emotions" :key="e.label"
          class="emotion-btn" :class="{ active: form.emotion === e.label }"
          @click="form.emotion = e.label">
          {{ e.label }}
        </span>
      </div>
      <div style="text-align:center;margin:8px 0">
        <el-button type="text" size="small" @click="pickHint">💡 不知道说什么？</el-button>
      </div>
      <el-button type="primary" :disabled="!canSubmit" @click="handleSubmit" style="width:100%;border-radius:24px;padding:12px 0">🌿 丢进树洞</el-button>
    </div>
    <div v-else class="auth-tip-small">
      <i class="el-icon-lock" />
      <span>登录后可以倾诉你的心事</span>
      <el-button type="text" @click="$router.push('/login')">去登录</el-button>
    </div>

    <!-- 对话区 -->
    <div ref="chatBox" class="chat-area" v-if="messages.length > 0">
      <div v-for="msg in messages" :key="msg.id" class="chat-msg" :class="msg.type">
        <!-- 用户消息 -->
        <template v-if="msg.type === 'user'">
          <div class="bubble user-bubble">
            <span v-if="msg.emotion" class="msg-emotion">{{ msg.emotion }}</span>
            <p>{{ msg.content }}</p>
          </div>
        </template>
        <!-- AI 消息 -->
        <template v-else>
          <div class="ai-avatar">🤖</div>
          <div class="bubble ai-bubble">
            <p>{{ msg.content }}</p>
            <div v-if="msg.song" class="song-tip">🎵 {{ msg.song.name }} - {{ msg.song.artist }}：{{ msg.song.reason }}</div>
          </div>
        </template>
      </div>
    </div>

    <div class="treehole-footer">
      <span>树洞里已有 <strong>{{ userCount }}</strong> 个秘密</span>
      <el-button v-if="currentUser" type="text" size="small" @click="clearHistory">清空历史</el-button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

var emotions = [
  { label: '😊开心' }, { label: '😢难过' }, { label: '😤生气' },
  { label: '😨害怕' }, { label: '😌平静' }, { label: '🤔迷茫' }
]

var hints = [
  '今天有什么让你心跳加速的事？', '如果今天能重来，你想改变哪个瞬间？',
  '此时此刻，你最想念谁？', '最近有什么让你感到骄傲的小事吗？',
  '你最近一次发自内心地笑是什么时候？', '此刻最让你感到温暖的是什么？',
  '你有没有一直想尝试却不敢做的事？', '如果可以对一个人说对不起，你会对谁说？',
  '最近有什么让你感到压力的事情吗？', '你最想对未来的自己说什么？',
  '有没有一首歌，每次听到都会想起某个人？', '如果可以许一个愿望，你现在最想许什么？'
]

export default {
  name: 'TreeholePage',
  data: function() {
    return {
      emotions: emotions,
      form: { content: '', emotion: '' },
      placeholder: '今天发生了什么？一句话告诉我...'
    }
  },
  mounted() {
    this.$store.dispatch('treehole/initData')
  },
  computed: {
     ...mapGetters('auth', ['isLoggedIn']),
     ...mapState('treehole', ['messages']),
     currentUser() { return this.isLoggedIn ? this.$store.state.auth.user : null },
     canSubmit: function() { return this.form.content.trim() && this.form.emotion },
    userCount: function() { return this.messages.filter(function(m) { return m.type === 'user' }).length }
  },
  watch: {
    messages: function() {
      this.$nextTick(this.scrollBottom)
    }
  },
  methods: {
    handleSubmit: function() {
      if (!this.canSubmit) return
      var content = this.form.content.trim()
      var emotion = this.form.emotion.replace(/^[^\u4e00-\u9fa5]+/, '')
      this.$store.dispatch('treehole/saveMessage', { content: content, emotion: emotion })
      this.form.content = ''
      this.form.emotion = ''
      this.placeholder = '今天发生了什么？一句话告诉我...'
    },
    pickHint: function() {
      this.placeholder = hints[Math.floor(Math.random() * hints.length)]
    },
    clearHistory: function() {
      this.$confirm('确定要清空所有对话记录吗？此操作不可恢复。', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(function() {
        this.$store.dispatch('treehole/clearMessages')
      }.bind(this)).catch(function() {})
    },
    scrollBottom: function() {
      var box = this.$refs.chatBox
      if (box) box.scrollTop = box.scrollHeight
    }
  }
}
</script>

<style lang="less" scoped>
.treehole-page { padding: 48px 0 80px; }
.input-area { max-width: 600px; margin: 0 auto 24px; padding: 24px; }
.emotion-bar { display: flex; justify-content: center; gap: 12px; margin: 12px 0; flex-wrap: wrap; }
.emotion-btn { padding: 6px 14px; border-radius: 20px; font-size: 14px; cursor: pointer; border: 1px solid @border-color; transition: all 0.3s; }
.emotion-btn:hover { border-color: @accent-color; }
.emotion-btn.active { background: rgba(232,141,94,0.1); border-color: @accent-color; color: @accent-color; }
.chat-area { max-width: 600px; margin: 0 auto 16px; max-height: 480px; overflow-y: auto; padding: 16px; scroll-behavior: smooth; }
.chat-msg { display: flex; margin-bottom: 16px; gap: 10px; animation: fadeIn 0.3s ease-out; }
.chat-msg.user { justify-content: flex-end; }
.bubble { max-width: 75%; padding: 12px 16px; border-radius: @border-radius-md; font-size: 14px; line-height: 1.6; }
.user-bubble { background: @accent-color; color: #fff; border-bottom-right-radius: 4px; }
.ai-bubble { background: @card-bg; color: @text-color; border-bottom-left-radius: 4px; box-shadow: @shadow-card; }
.ai-avatar { width: 36px; height: 36px; border-radius: 50%; background: @bg-color; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.msg-emotion { display: block; font-size: 12px; margin-bottom: 4px; opacity: 0.8; }
.song-tip { margin-top: 8px; font-size: 12px; color: @text-secondary; padding-top: 8px; border-top: 1px dashed @border-color; }
.treehole-footer { text-align: center; color: @text-secondary; font-size: 14px; padding: 16px 0; display: flex; justify-content: center; align-items: center; gap: 16px; strong { color: @accent-color; font-size: 18px; font-family: @font-family-en; } }
</style>