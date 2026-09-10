<template>
  <div class="write-page">
    <h1 class="page-title">✉️ 写一封信</h1>
    <p class="page-subtitle">把此刻的心情寄给十年后</p>

    <div v-if="!currentUser" class="auth-tip">
      <i class="el-icon-lock" style="font-size:48px;color:#D4926A" />
      <h2>需要登录</h2>
      <p>登录后可以写一封信寄给未来的自己</p>
      <el-button type="primary" @click="$router.push('/login')">去登录</el-button>
    </div>

    <template v-else>
      <LetterForm
        v-if="!showLoading && !showReply"
        ref="letterForm"
        @submit="handleSubmit"
      />

      <div v-if="showLoading" class="loading-section">
        <div class="loading-box">
          <p class="loading-text">{{ loadingText }}</p>
          <el-progress :percentage="loadingProgress" :stroke-width="8" color="#D4926A" style="max-width:400px;margin:24px auto" :show-text="false" />
          <div class="loading-dots"><span></span><span></span><span></span></div>
        </div>
      </div>

      <LetterReply
        v-if="showReply && replyText"
        :replyText="replyText"
        @share="handleShare"
        @reset="handleReset"
      />
    </template>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { generateReply as generateTemplateReply, getGreeting, getSigner } from '@/utils/replyTemplates'
import { letterApi, aiApi } from '@/api'
import LetterForm from '@/components/letter/LetterForm.vue'
import LetterReply from '@/components/letter/LetterReply.vue'

const loadingTexts = [
  '时光正在折叠...', '未来的你正在提笔...', '信号穿越了十年...',
  '时空隧道已连接...', '时光邮差正在赶来...', '星辰正在见证这份约定...'
]

async function generateAIReply(content, recipient, moods, types) {
  console.log('[AI] ========== 开始生成回信（后端API）==========')
  const greeting = getGreeting(recipient)
  const signer = getSigner(recipient)
  console.log('[AI] 收信人:', recipient, '| 情绪:', moods, '| 类型:', types)
  let body = ''
  try {
    const res = await aiApi.generateReply({ content, recipient, moods, types })
    if (res && res.reply) {
      body = res.reply
      console.log('[AI] 后端 API 调用成功，返回长度:', body.length)
    }
  } catch (err) {
    console.error('[AI] 后端 API 调用失败，将降级到模板引擎:', err.message)
  }
  if (!body) {
    console.log('[AI] 走模板引擎降级路线')
    body = generateTemplateReply(content, recipient, moods, types)
    console.log('[AI] 模板引擎返回，直接输出')
    return body
  }
  console.log('[AI] 走 AI 路线，清理称呼落款后输出')
  const lines = body.split('\n')
  while (lines.length > 0) {
    const first = lines[0].trim()
    if (first === '' || /^[嘿喂亲爱的宝贝老朋友兄弟姐妹致].*[：:]$/.test(first) || /^(展信安|你好|hi|hello)/i.test(first)) {
      lines.shift()
    } else {
      break
    }
  }
  while (lines.length > 0) {
    const last = lines[lines.length - 1].trim()
    if (last === '' || /^[—–-]+.*(年|月|日|你|我|爸妈|朋友|爱人)/.test(last) || /2036/.test(last)) {
      lines.pop()
    } else {
      break
    }
  }
  const cleanBody = lines.join('\n').trim()
  return greeting + '\n\n' + cleanBody + '\n\n—— ' + signer + '，于2036年7月10日'
}

export default {
  name: 'Write',
  components: { LetterForm, LetterReply },
  data() {
    return {
      showLoading: false,
      showReply: false,
      loadingProgress: 0,
      loadingText: '',
      replyText: '',
      currentFormData: null,
      timers: []
    }
  },
  computed: {
    ...mapGetters('auth', ['isLoggedIn']),
    currentUser() { return this.isLoggedIn ? this.$store.state.auth.user : null }
  },
  beforeDestroy() { this.timers.forEach(t => clearInterval(t)) },
  methods: {
    ...mapActions('letter', ['saveLetter']),

    async handleSubmit(formData) {
      this.currentFormData = formData
      this.showLoading = true
      this.loadingProgress = 0
      this.loadingText = loadingTexts[Math.floor(Math.random() * loadingTexts.length)]

      const duration = 3000 + Math.random() * 2000
      const step = 100 / (duration / 50)
      const progressTimer = setInterval(() => {
        this.loadingProgress = Math.min(99, this.loadingProgress + step)
      }, 50)
      this.timers.push(progressTimer)

      const textTimer = setInterval(() => {
        this.loadingText = loadingTexts[Math.floor(Math.random() * loadingTexts.length)]
      }, 800)
      this.timers.push(textTimer)

      await new Promise(resolve => setTimeout(resolve, duration))
      clearInterval(progressTimer)
      this.loadingProgress = 100

      const reply = await generateAIReply(formData.content, formData.recipient, formData.moods, formData.types)
      this.replyText = reply

      var user = this.$store.state.auth.user
      var authorName = user ? (user.nickname || user.username) : '匿名'
      var saved = await this.saveLetter({
        recipient: formData.recipient,
        salutation: formData.salutation,
        content: formData.content,
        moods: formData.moods,
        types: formData.types,
        writeDate: formData.writeDate,
        reply,
        author: authorName,
        isPublic: formData.isPublic || false,
        createTime: new Date().toISOString()
      })
      if (saved && saved.id) {
        formData._savedId = saved.id
      }

      this.timers.forEach(t => clearInterval(t))
      this.timers = []
      await new Promise(resolve => setTimeout(resolve, 300))
      this.showLoading = false
      this.showReply = true
    },

    async handleShare() {
      if (!this.currentFormData) return
      var letterId = this.currentFormData._savedId
      if (letterId) {
        try {
          await letterApi.updatePublic(letterId)
        } catch (e) {
          console.error('公开信件失败:', e)
        }
      }
      this.$message.success('已分享到故事墙，谢谢你愿意分享温暖')
    },

    handleReset() {
      this.showReply = false
      this.showLoading = false
      this.replyText = ''
      this.currentFormData = null
      this.loadingProgress = 0
      if (this.$refs.letterForm && this.$refs.letterForm.resetForm) {
        this.$refs.letterForm.resetForm()
      }
    },
  }
}
</script>

<style lang="less" scoped>
.write-page { padding: 48px 0 80px; }
.loading-section { max-width: 500px; margin: 80px auto; }
.loading-box { text-align: center; padding: 60px 40px; }
.loading-text { font-size: 18px; color: @secondary-color; margin-bottom: 8px; }
.loading-dots { display: flex; justify-content: center; gap: 8px; margin-top: 24px;
  span { width: 8px; height: 8px; border-radius: 50%; background: @secondary-color; animation: dotBounce 1.4s ease-in-out infinite;
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}
@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
</style>