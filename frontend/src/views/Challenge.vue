<template>
  <div class="challenge-page">
    <div class="container">
      <h1 class="page-title">🌟 今日挑战 · 用一分钟治愈自己</h1>
      <p class="page-subtitle">每天一个小任务，让生活更有仪式感</p>

      <div class="challenge-header">
        <div class="today-info">{{ todayDate }}</div>
        <div class="streak-info">🔥 连续打卡 <strong>{{ checkInDays }}</strong> 天</div>
      </div>

      <div class="challenge-card card">
        <div class="challenge-icon">{{ todayTask.icon }}</div>
        <h3 class="challenge-title">{{ todayTask.title }}</h3>
        <p class="challenge-desc">{{ todayTask.desc }}</p>
        <div v-if="currentUser">
          <el-input
            v-if="!isCheckedIn"
            v-model="noteText"
            type="textarea"
            :rows="3"
            :placeholder="notePlaceholder"
            class="note-input"
            maxlength="500"
            show-word-limit
          />
          <div v-if="isCheckedIn && todayNote" class="today-note">
            <p class="note-label">今日打卡内容：</p>
            <p class="note-content">{{ todayNote }}</p>
          </div>
          <el-button
            :type="isCheckedIn ? 'success' : 'primary'"
            size="large"
            :disabled="isCheckedIn || !canCheckIn"
            @click="handleCheckIn"
            class="checkin-btn"
          >
            {{ isCheckedIn ? '🎉 已完成' : (canCheckIn ? '✅ 完成挑战' : '写点什么再打卡吧 (至少5个字)') }}
          </el-button>
        </div>
        <div v-else class="auth-tip-small">
          <i class="el-icon-lock" />
          <span>登录后可以完成今日挑战并打卡</span>
          <el-button type="text" @click="$router.push('/login')">去登录</el-button>
        </div>
      </div>

      <div class="calendar-section">
        <h3 class="section-title">📅 本月打卡日历</h3>
        <div class="calendar-grid">
          <div v-for="day in calendarDays" :key="day.date" class="calendar-day" :class="{ checked: day.checked, today: day.isToday }">
            <span class="day-number">{{ day.day }}</span>
            <span v-if="day.checked" class="day-check">✓</span>
          </div>
        </div>
      </div>

      <div class="badges-entry">
        <el-button type="warning" plain @click="$router.push('/badges')">
          🏅 查看我的星光收集册
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'Challenge',
  data() {
    return {
      noteText: '',
      weekTasks: [
        { day: 1, icon: '💌', title: '写一句感谢自己的话', desc: '今天你最想感谢自己的一件事是什么？把它写下来。' },
        { day: 2, icon: '😊', title: '回忆一件今天让你笑的事', desc: '哪怕只是一个微笑的瞬间，也值得被记住。' },
        { day: 3, icon: '💬', title: '给一个陌生人留一句鼓励', desc: '去留言墙，给素未谋面的陌生人一句温暖。' },
        { day: 4, icon: '📝', title: '写下明天想做的一件小事', desc: '小到「喝一杯喜欢的奶茶」也可以。' },
        { day: 5, icon: '📖', title: '翻一条旧留言，重新感受它', desc: '去故事墙或留言墙，找一条旧内容再看一遍。' },
        { day: 6, icon: '✉️', title: '给未来的自己写一句叮咛', desc: '一句话就好，寄给十年后的你。' },
        { day: 0, icon: '🌟', title: '总结本周最温暖的瞬间', desc: '回顾这一周，哪一刻让你觉得「活着真好」？' }
      ]
    }
  },
  mounted() {
    this.$store.dispatch('challenge/initData')
  },
  computed: {
    ...mapGetters('auth', ['isLoggedIn']),
    ...mapState('challenge', ['records', 'checkInDays', 'lastCheckInDate']),
    currentUser() { return this.isLoggedIn ? this.$store.state.auth.user : null },
    todayDate() {
      const now = new Date()
      return `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`
    },
    todayTask() {
      const day = new Date().getDay()
      return this.weekTasks.find(t => t.day === day) || this.weekTasks[0]
    },
    notePlaceholder() {
      return '写下你的' + this.todayTask.title.replace('写', '').replace('回忆', '回忆') + '...'
    },
    canCheckIn() {
      return this.noteText.trim().length >= 5
    },
    isCheckedIn() {
      if (!this.lastCheckInDate) return false
      const last = new Date(this.lastCheckInDate)
      const today = new Date()
      return last.getFullYear() === today.getFullYear() && last.getMonth() === today.getMonth() && last.getDate() === today.getDate()
    },
    todayNote() {
      if (!this.records || !this.records.length) return ''
      const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`
      const todayRecord = this.records.find(r => r.date === todayStr)
      return todayRecord ? todayRecord.content : ''
    },
    calendarDays() {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const firstDay = new Date(year, month, 1).getDay()
      const days = []
      for (let i = 0; i < firstDay; i++) days.push({ date: '', day: '', checked: false, isToday: false })
      for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`
        const checked = this.records.some(r => r.date === dateStr)
        const isToday = i === now.getDate()
        days.push({ date: dateStr, day: i, checked, isToday })
      }
      return days
    }
  },
  methods: {
    ...mapActions('challenge', ['checkIn']),
    async handleCheckIn() {
      await this.checkIn({ task: this.todayTask.title, note: this.noteText })
      this.$message.success('打卡成功！继续保持')
    }
  }
}
</script>

<style lang="less" scoped>
.challenge-page { padding: 48px 0 80px; }
.challenge-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 8px; }
.today-info { font-size: 16px; color: @text-secondary; }
.streak-info { font-size: 16px; color: @accent-color; strong { font-size: 24px; font-family: @font-family-en; } }
.challenge-card { max-width: 500px; margin: 0 auto 48px; text-align: center; padding: 48px 32px; }
.challenge-icon { font-size: 56px; margin-bottom: 16px; }
.challenge-title { font-size: 22px; font-weight: 600; margin-bottom: 12px; color: @primary-color; }
.challenge-desc { font-size: 15px; color: @text-secondary; margin-bottom: 28px; line-height: 1.8; }
.note-input { margin-bottom: 20px; text-align: left; }
.today-note { text-align: left; margin-bottom: 20px; padding: 16px; background: rgba(232, 141, 94, 0.08); border-radius: 8px; }
.note-label { font-size: 13px; color: @text-secondary; margin-bottom: 6px; }
.note-content { font-size: 15px; color: @text-color; line-height: 1.8; }
.checkin-btn { padding: 14px 48px; font-size: 16px; border-radius: 28px; }
.calendar-section { max-width: 600px; margin: 0 auto 48px; }
.section-title { font-size: 18px; text-align: center; margin-bottom: 20px; color: @primary-color; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
.calendar-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: @border-radius-sm; background: @card-bg; position: relative; font-size: 14px; color: @text-color; }
.calendar-day.checked { background: @success-color; color: #fff; }
.calendar-day.today { border: 2px solid @accent-color; }
.day-check { position: absolute; bottom: 2px; right: 2px; font-size: 10px; }
.badges-entry { text-align: center; }
@media (max-width: @screen-sm) { .challenge-header { flex-direction: column; text-align: center; } }
</style>