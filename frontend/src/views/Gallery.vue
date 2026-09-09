<template>
  <div class="gallery-page">
    <div class="container">
      <h1 class="page-title">🏛️ 胶囊陈列馆 · 穿越时空的碎片</h1>
      <p class="page-subtitle">每一个胶囊都是一段被封存的时光</p>

      <div class="filter-bar">
        <el-radio-group v-model="yearFilter" size="small" @change="currentPage=1">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button v-for="y in years" :key="y" :label="y">{{ y }}</el-radio-button>
        </el-radio-group>
      </div>

      <div class="gallery-grid" v-if="pagedCapsules.length">
        <div v-for="cap in pagedCapsules" :key="cap.id" class="gallery-card card" @click="openDetail(cap)">
          <div class="capsule-icon" :style="{background: cap.color}">📦</div>
          <h4 class="capsule-name">{{ cap.name }}</h4>
          <p class="capsule-date">封存于 {{ formatDate(cap.sealDate) }}</p>
          <p class="capsule-countdown">{{ getCountdown(cap.openDate) }}</p>
          <div class="capsule-items">
            <span v-for="item in cap.items" :key="item.type" class="item-tag">{{ itemIcon(item.type) }}</span>
          </div>
          <div class="capsule-likes">❤️ {{ cap.likes || 0 }}</div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-icon">🏛️</p>
        <p>陈列馆还是空的，成为第一个封存时光的人吧</p>
        <el-button type="primary" @click="$router.push('/capsule')">去封存胶囊</el-button>
      </div>

      <div class="pagination-wrapper" v-if="filteredCapsules.length > pageSize">
        <el-pagination background layout="prev, pager, next" :total="filteredCapsules.length" :page-size="pageSize" :current-page.sync="currentPage" />
      </div>

      <p class="gallery-footer">陈列馆已收藏 {{ publicCapsules.length }} 个时光胶囊</p>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog :visible.sync="detailVisible" :title="currentCap ? currentCap.name : ''" width="500px">
      <div v-if="currentCap" class="cap-detail">
        <p class="detail-seal">封存日期：{{ formatDate(currentCap.sealDate) }}</p>
        <p class="detail-open">开启日期：{{ formatDate(currentCap.openDate) }}</p>
        <div class="detail-items">
          <div v-for="item in currentCap.items" :key="item.type" class="detail-item">
            <span class="item-icon">{{ itemIcon(item.type) }}</span>
            <span class="item-content">{{ item.content }}</span>
          </div>
        </div>
        <el-button type="primary" @click="likeCap(currentCap.id)">❤️ 点赞 {{ currentCap.likes || 0 }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'Gallery',
  data() {
    return { yearFilter: 'all', currentPage: 1, pageSize: 9, detailVisible: false, currentCap: null }
  },
  computed: {
    ...mapState('capsule', ['publicCapsules', 'publicTotal']),
    ...mapGetters('auth', ['isLoggedIn']),
    years() {
      const ys = new Set(this.publicCapsules.map(c => new Date(c.sealDate).getFullYear()))
      return Array.from(ys).sort((a, b) => b - a)
    },
    filteredCapsules() {
      let list = [...this.publicCapsules]
      if (this.yearFilter !== 'all') {
        list = list.filter(c => new Date(c.sealDate).getFullYear() === +this.yearFilter)
      }
      return list
    },
    pagedCapsules() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredCapsules.slice(start, start + this.pageSize)
    }
  },
  methods: {
    ...mapActions('capsule', ['likeCapsule', 'loadPublicCapsules']),
    formatDate(d) {
      if (!d) return ''
      const date = new Date(d)
      return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
    },
    getCountdown(openDate) {
      const now = Date.now()
      const target = new Date(openDate).getTime()
      const diff = target - now
      if (diff <= 0) return '已可开启'
      const days = Math.floor(diff / 86400000)
      return `还有 ${days} 天开启`
    },
    itemIcon(type) {
      const map = { photo: '📷', song: '🎵', word: '💬', secret: '🤫', wish: '🌟' }
      return map[type] || '📦'
    },
    openDetail(cap) { this.currentCap = cap; this.detailVisible = true },
    async likeCap(id) {
      if (!this.isLoggedIn) {
        this.$message.info('登录后才能点赞哦')
        return
      }
      const result = await this.likeCapsule(id)
      if (result.success) {
        // 同步更新弹窗中的 currentCap
        if (this.currentCap && this.currentCap.id == id) {
          this.$set(this.currentCap, 'likes', (this.currentCap.likes || 0) + (result.liked ? 1 : -1))
          this.$set(this.currentCap, '_liked', result.liked)
        }
        this.$message.success(result.liked ? '点赞成功' : '已取消点赞')
      } else {
        this.$message.error(result.message || '操作失败')
      }
    }
  },
  mounted() {
    this.loadPublicCapsules()
  }
}
</script>

<style lang="less" scoped>
.gallery-page { padding: 48px 0 80px; }
.filter-bar { text-align: center; margin-bottom: 32px; }
.gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.gallery-card { text-align: center; cursor: pointer; padding: 28px 20px; }
.capsule-icon { width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
.capsule-name { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
.capsule-date, .capsule-countdown { font-size: 12px; color: @text-secondary; margin-bottom: 4px; }
.capsule-items { margin: 8px 0; }
.item-tag { font-size: 18px; margin: 0 4px; }
.capsule-likes { font-size: 13px; color: #F56C6C; }
.empty-state { text-align: center; padding: 80px 0; .empty-icon { font-size: 64px; margin-bottom: 16px; } p { color: @text-secondary; margin-bottom: 24px; } }
.pagination-wrapper { display: flex; justify-content: center; margin-top: 48px; }
.gallery-footer { text-align: center; color: @text-secondary; font-size: 14px; margin-top: 32px; }
.cap-detail { .detail-seal, .detail-open { font-size: 14px; color: @text-secondary; margin-bottom: 8px; } .detail-items { margin: 16px 0; } .detail-item { display: flex; gap: 8px; padding: 8px 0; border-bottom: 1px solid @border-color; .item-icon { font-size: 20px; } .item-content { font-size: 14px; color: @text-color; } } }
@media (max-width: @screen-md) { .gallery-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: @screen-sm) { .gallery-grid { grid-template-columns: 1fr; } }
</style>
