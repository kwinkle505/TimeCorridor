<template>
  <div class="badges-page">
    <div class="container">
      <h1 class="page-title">🏅 星光收集册</h1>
      <p class="page-subtitle">每一枚徽章都是一段珍贵的回忆</p>

      <template v-if="isLoggedIn">
        <div class="badges-progress">
          <div class="progress-text">已获得 <strong>{{ earnedCount }}</strong> / {{ badgeList.length }} 枚徽章</div>
          <el-progress :percentage="progressPercent" :stroke-width="12" color="#D4926A" />
        </div>

        <div class="badges-grid">
          <div
            v-for="badge in badgeList"
            :key="badge.id"
            class="badge-card card"
            :class="{ earned: isEarned(badge.id), unearned: !isEarned(badge.id) }"
          >
            <div class="badge-icon">{{ badge.icon }}</div>
            <h4 class="badge-name">{{ badge.name }}</h4>
            <p class="badge-condition">{{ getProgressText(badge.id) }}</p>
            <p class="badge-desc">{{ badge.description }}</p>
            <div v-if="!isEarned(badge.id)" class="badge-progress">
              <el-progress :percentage="getProgress(badge.id)" :show-text="true" :stroke-width="4" />
            </div>
            <div v-else class="badge-earned-tag">✨ 已获得</div>
          </div>
        </div>
      </template>

      <div v-else class="auth-tip">
        <p>请先登录后查看星光收集册</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { badgeList, getBadgeProgress } from '@/utils/badges'

export default {
  name: 'Badges',
  data() {
    return {
      badgeList: badgeList
    }
  },
  computed: {
    ...mapState('badges', ['badges']),
    ...mapGetters('auth', ['isLoggedIn']),
    earnedCount() { return this.badges.length },
    progressPercent() { return Math.round((this.earnedCount / this.badgeList.length) * 100) },
    allProgressData() {
      return getBadgeProgress({
        letterCount: (this.$store.state.letter.letters || []).length,
        treeholeMessageCount: (this.$store.state.treehole.messages || []).length,
        capsuleOpenedCount: 0,
        wallLikeGivenCount: 0,
        challengeCurrentStreak: this.$store.state.challenge.checkInDays || 0,
        quoteCollectedCount: (this.$store.state.settings.collectedQuotes || []).length,
        totalVisitDays: 1,
        capsuleCount: (this.$store.state.capsule.capsules || []).length,
        wallMessageCount: (this.$store.state.wall.messages || []).length,
        challengeCheckInCount: (this.$store.state.challenge.records || []).length,
        earnedBadges: this.badges
      })
    }
  },
  methods: {
    isEarned(id) { return this.badges.includes(id) },
    getProgress(id) {
      var item = this.allProgressData.find(function(b) { return b.id === id })
      return item ? item.progress : 0
    },
    getProgressText(id) {
      var item = this.allProgressData.find(function(b) { return b.id === id })
      if (!item) return ''
      return item.current + '/' + item.target
    }
  }
}
</script>

<style lang="less" scoped>
.badges-page { padding: 48px 0 80px; }
.badges-progress { max-width: 500px; margin: 0 auto 48px; text-align: center; }
.progress-text { font-size: 16px; margin-bottom: 12px; color: @text-color; strong { font-size: 24px; color: @accent-color; font-family: @font-family-en; } }
.badges-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; max-width: 900px; margin: 0 auto; }
.badge-card { text-align: center; padding: 28px 16px; position: relative; }
.badge-card.earned { border: 2px solid @accent-color; animation: glowBadge 2s ease-in-out infinite; }
.badge-card.unearned { opacity: 0.6; }
.badge-icon { font-size: 40px; margin-bottom: 8px; }
.badge-name { font-size: 15px; font-weight: 600; margin-bottom: 6px; color: @primary-color; }
.badge-condition { font-size: 12px; color: @accent-color; margin-bottom: 6px; }
.badge-desc { font-size: 12px; color: @text-secondary; line-height: 1.5; margin-bottom: 8px; }
.badge-earned-tag { font-size: 12px; color: @accent-color; font-weight: 500; }
@keyframes glowBadge {
  0%, 100% { box-shadow: 0 0 8px rgba(232, 141, 94, 0.2); }
  50% { box-shadow: 0 0 20px rgba(232, 141, 94, 0.5); }
}
@media (max-width: @screen-md) { .badges-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: @screen-sm) { .badges-grid { grid-template-columns: 1fr; max-width: 320px; } }
</style>