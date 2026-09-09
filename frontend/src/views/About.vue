<template>
  <div class="about-page">
    <div class="container">
      <h1 class="page-title">🌌 关于时空回廊</h1>
      <p class="page-subtitle">用时间治愈时间</p>

      <section class="about-story card">
        <p class="story-line">2026年，我们想做一个能装下所有情绪的容器。</p>
        <p class="story-line">写给未来，不是逃避现在，而是相信时间的力量。</p>
        <p class="story-line">在这里，每一份情绪都会被认真对待。</p>
      </section>

      <section class="about-stats">
        <div class="stats-grid">
          <div class="stat-card card" v-for="item in statsData" :key="item.label">
            <div class="stat-number">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </div>
      </section>

      <section class="about-team">
        <h2 class="section-title">遇见我们</h2>
        <div class="team-grid">
          <div class="team-card card" v-for="m in team" :key="m.name">
            <div class="team-avatar" :style="{background: m.color}">{{ m.avatar }}</div>
            <h4 class="team-name">{{ m.name }}</h4>
            <p class="team-role">{{ m.role }}</p>
            <p class="team-bio">{{ m.bio }}</p>
          </div>
        </div>
      </section>

      <section class="about-feedback">
        <h2 class="section-title">想对我们说点什么？</h2>
        <div class="feedback-form card">
          <el-form ref="form" :model="form" :rules="rules" label-position="top">
            <el-form-item label="称呼" prop="name">
              <el-input v-model="form.name" placeholder="你的名字" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="your@email.com" />
            </el-form-item>
            <el-form-item label="留言" prop="message">
              <el-input v-model="form.message" type="textarea" :rows="4" placeholder="告诉我们你的想法..." />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitFeedback">📮 发送反馈</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      statsData: [
        { label: '已寄出信件', value: 128 },
        { label: '故事墙上墙', value: 86 },
        { label: '治愈句签', value: 55 },
        { label: '时光胶囊', value: 42 }
      ],
      team: [
        { avatar: '小', name: '小星', role: '产品设计师', bio: '相信好的设计能治愈人心', color: '#D4926A' },
        { avatar: '远', name: '阿远', role: '全栈开发者', bio: '代码也是诗', color: '#1A2A3A' },
        { avatar: '念', name: '念安', role: '内容策划', bio: '文字有温度', color: '#7EC8B8' }
      ],
      form: { name: '', email: '', message: '' },
      rules: {
        name: [{ required: true, message: '请输入名字', trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '格式不正确', trigger: 'blur' }],
        message: [{ required: true, message: '请输入留言', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.animateStats()
  },
  methods: {
    animateStats() {
      const targets = this.statsData.map(s => s.value)
      this.statsData.forEach((s, i) => {
        let current = 0
        const target = targets[i]
        const step = target / 60
        const timer = setInterval(() => {
          current += step
          if (current >= target) { current = target; clearInterval(timer) }
          this.$set(this.statsData, i, { ...s, value: Math.floor(current) })
        }, 25)
      })
    },
    submitFeedback() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$message.success('感谢你的反馈！')
          this.$refs.form.resetFields()
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.about-page { padding: 48px 0 80px; }
.about-story { max-width: 600px; margin: 0 auto 48px; text-align: center; padding: 40px; }
.story-line { font-size: 17px; line-height: 2; color: @text-color; margin: 0 0 12px; }
.about-stats { margin-bottom: 64px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; max-width: 800px; margin: 0 auto; }
.stat-card { text-align: center; padding: 32px 16px; }
.stat-number { font-size: 36px; font-weight: 700; font-family: @font-family-en; color: @accent-color; line-height: 1; margin-bottom: 8px; }
.stat-label { font-size: 14px; color: @text-secondary; }
.section-title { font-size: 22px; text-align: center; margin-bottom: 32px; color: @primary-color; }
.team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 800px; margin: 0 auto; }
.team-card { text-align: center; padding: 32px 20px; }
.team-avatar { width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; font-weight: 600; }
.team-name { font-size: 18px; font-weight: 600; color: @primary-color; margin-bottom: 4px; }
.team-role { font-size: 13px; color: @accent-color; margin-bottom: 12px; }
.team-bio { font-size: 13px; color: @text-secondary; line-height: 1.6; margin: 0; }
.about-feedback { max-width: 560px; margin: 0 auto; }
.feedback-form { padding: 32px; }
@media (max-width: @screen-md) { .stats-grid, .team-grid { grid-template-columns: 1fr; max-width: 360px; } }
</style>
