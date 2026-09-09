<template>
  <div class="quote-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>今日句签</h1>
      <p>每天一句温暖文字，治愈你的心灵</p>
    </div>

    <div class="page-content">
      <!-- 句签大卡片 -->
      <div
        ref="quoteCard"
        class="quote-card"
        :style="cardGradientStyle"
      >
        <div class="quote-content">
          <!-- 装饰图标 -->
          <div class="quote-icon">"</div>
          <!-- 句签文本，字体 40px 以上 -->
          <p class="quote-text">{{ currentQuote.text }}</p>
          <!-- 出处 -->
          <p v-if="currentQuote.source" class="quote-source">
            —— {{ currentQuote.source }}
          </p>
        </div>
        <!-- 日期标识 -->
        <div class="quote-date">{{ todayDate }}</div>
      </div>

      <!-- 操作按钮 -->
      <div class="quote-actions">
        <el-button
          :type="isFavorite ? 'warning' : 'default'"
          size="medium"
          class="action-btn"
          @click="toggleFavorite"
        >
          <i :class="isFavorite ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
          {{ isFavorite ? '已收藏' : '收藏' }}
        </el-button>

        <el-button
          type="primary"
          size="medium"
          class="action-btn"
          @click="saveAsImage"
        >
          <i class="el-icon-picture-outline"></i> 保存图片
        </el-button>

        <el-button
          type="default"
          size="medium"
          class="action-btn"
          @click="copyQuote"
        >
          <i class="el-icon-document-copy"></i> 复制句子
        </el-button>

        <el-button
          type="default"
          size="medium"
          class="action-btn refresh-btn"
          @click="refreshQuote"
        >
          <i class="el-icon-refresh"></i> 换一句
        </el-button>
      </div>

      <!-- 我的收藏列表 -->
      <div v-if="collectedQuotes.length > 0" class="favorites-section">
        <div class="section-title">
          <h2>
            <i class="el-icon-star-on"></i> 我的收藏
          </h2>
          <span class="count">共 {{ collectedQuotes.length }} 条</span>
        </div>
        <div class="favorites-list">
          <div
            v-for="item in collectedQuotes"
            :key="item.index"
            class="favorite-item"
          >
            <p class="favorite-text">{{ item.text }}</p>
            <div class="favorite-meta">
              <span class="favorite-source">{{ item.source }}</span>
              <el-button
                type="text"
                size="mini"
                class="remove-btn"
                @click="removeFavorite(item.index)"
              >
                取消收藏
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空收藏提示 -->
      <div v-else class="empty-favorites">
        <i class="el-icon-star-off"></i>
        <p>还没有收藏任何句签</p>
        <p class="sub-text">遇到喜欢的句子，点击收藏按钮保存下来吧</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import html2canvas from 'html2canvas'
import { quotes, getDailyQuote, getRandomQuote, quoteGradients } from '@/utils/quotes'

export default {
  name: 'QuotePage',
  data() {
    return {
      // 当前显示的句签对象 { text, source, theme, index }
      currentQuote: { text: '', source: '', theme: '', index: -1 },
      // 当前渐变色对象 { from, to, name }
      currentGradient: { from: '#1A2A3A', to: '#2C3E50', name: '深海蓝' },
      // 今日日期字符串
      todayDate: ''
    }
  },
  computed: {
    // 从 Vuex settings 模块获取收藏列表
    ...mapState('settings', ['collectedQuotes']),

    // 卡片渐变背景样式
    cardGradientStyle() {
      return {
        background: `linear-gradient(135deg, ${this.currentGradient.from} 0%, ${this.currentGradient.to} 100%)`
      }
    },

    // 判断当前句签是否已收藏
    isFavorite() {
      if (!this.currentQuote || this.currentQuote.index < 0) return false
      return this.collectedQuotes.some(q => q.index === this.currentQuote.index)
    }
  },
  mounted() {
    this.initDailyQuote()
  },
  methods: {
    // 初始化每日句签（按日期固定）
    initDailyQuote() {
      const today = new Date()
      // 格式化日期
      this.todayDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`

      // 获取每日固定句签
      const daily = getDailyQuote(today)
      this.currentQuote = daily

      // 根据日期索引选择渐变背景，保证同一天背景一致
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
      const gradientIndex = dayOfYear % quoteGradients.length
      this.currentGradient = quoteGradients[gradientIndex]
    },

    // 刷新随机句签
    refreshQuote() {
      const newQuote = getRandomQuote(this.currentQuote.index)
      this.currentQuote = newQuote

      // 随机切换渐变背景
      let newIndex = Math.floor(Math.random() * quoteGradients.length)
      // 避免和当前背景相同
      while (quoteGradients[newIndex].name === this.currentGradient.name && quoteGradients.length > 1) {
        newIndex = Math.floor(Math.random() * quoteGradients.length)
      }
      this.currentGradient = quoteGradients[newIndex]
    },

    // 切换收藏状态
    toggleFavorite() {
      // 构造传给 store 的句签对象（包含 index 供 store 匹配）
      const quoteObj = {
        text: this.currentQuote.text,
        source: this.currentQuote.source,
        theme: this.currentQuote.theme || 'hope',
        index: this.currentQuote.index
      }
      this.$store.dispatch('settings/toggleQuoteFavorite', quoteObj)
    },

    // 取消收藏（从收藏列表中移除）
    removeFavorite(quoteIndex) {
      // 构造一个包含 index 的对象，store 会根据 index 匹配并移除
      const quoteObj = {
        text: '',
        source: '',
        index: quoteIndex
      }
      this.$store.dispatch('settings/toggleQuoteFavorite', quoteObj)
    },

    // 保存为图片
    async saveAsImage() {
      try {
        const card = this.$refs.quoteCard
        if (!card) return

        this.$message.info('正在生成图片...')

        const canvas = await html2canvas(card, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          logging: false
        })

        const link = document.createElement('a')
        link.download = `句签-${this.currentQuote.index}-${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()

        this.$message.success('图片已保存')
      } catch (error) {
        console.error('保存图片失败', error)
        this.$message.error('保存图片失败，请重试')
      }
    },

    // 复制句子到剪贴板
    copyQuote() {
      const text = this.currentQuote.source
        ? `${this.currentQuote.text} —— ${this.currentQuote.source}`
        : this.currentQuote.text

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message.success('已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopy(text)
        })
      } else {
        this.fallbackCopy(text)
      }
    },

    // 兼容性复制（降级方案）
    fallbackCopy(text) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        this.$message.success('已复制到剪贴板')
      } catch (err) {
        this.$message.error('复制失败')
      }
      document.body.removeChild(textarea)
    }
  }
}
</script>

<style lang="less" scoped>
.quote-page {
  min-height: 100vh;
  background-color: @bg-color;
  padding-bottom: 60px;
}

// 页面头部
.page-header {
  text-align: center;
  padding: 60px 20px 40px;
  background: @gradient-primary;
  margin-bottom: 40px;

  h1 {
    font-size: 36px;
    color: #FFFFFF;
    margin-bottom: 12px;
    font-weight: 600;
  }

  p {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
  }
}

.page-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

// 句签大卡片
.quote-card {
  border-radius: @radius-lg;
  padding: 60px 40px;
  margin-bottom: 30px;
  box-shadow: @shadow-hover;
  position: relative;
  overflow: hidden;
  transition: @transition-base;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  .quote-content {
    position: relative;
    z-index: 1;
    text-align: center;
  }

  // 装饰引号
  .quote-icon {
    font-size: 80px;
    color: rgba(255, 255, 255, 0.2);
    font-family: @font-family-en;
    line-height: 1;
    margin-bottom: 10px;
    user-select: none;
  }

  // 句签文本，字体 40px 以上
  .quote-text {
    font-size: 42px;
    color: #FFFFFF;
    line-height: 1.8;
    margin-bottom: 30px;
    font-weight: 500;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  // 出处
  .quote-source {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 400;
  }

  // 日期标识
  .quote-date {
    position: absolute;
    top: 20px;
    right: 24px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    font-family: 'Courier New', monospace;
    z-index: 1;
  }
}

// 操作按钮
.quote-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 50px;
  flex-wrap: wrap;

  .action-btn {
    border-radius: 25px;
    padding: 12px 24px;
    font-size: 14px;
    transition: @transition-base;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.el-button--primary {
      background: linear-gradient(135deg, @secondary-color, @accent-color);
      border: none;
    }

    &.el-button--warning {
      background: linear-gradient(135deg, #E6A23C, #f0c78a);
      border: none;
      color: #FFFFFF;
    }
  }

  .refresh-btn {
    i {
      transition: transform 0.5s ease;
    }

    &:hover i {
      transform: rotate(180deg);
    }
  }
}

// 收藏区域
.favorites-section {
  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      font-size: 20px;
      color: @primary-color;
      font-weight: 600;

      i {
        color: @warning-color;
        margin-right: 8px;
      }
    }

    .count {
      font-size: 14px;
      color: @text-color;
      opacity: 0.5;
    }
  }

  .favorites-list {
    display: grid;
    gap: 16px;
  }

  .favorite-item {
    background: @card-bg;
    border-radius: @radius-md;
    padding: 20px 24px;
    box-shadow: @shadow-card;
    transition: @transition-base;

    &:hover {
      box-shadow: @shadow-hover;
      transform: translateY(-2px);
    }

    .favorite-text {
      font-size: 15px;
      color: @text-color;
      line-height: 1.8;
      margin-bottom: 12px;
    }

    .favorite-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .favorite-source {
        font-size: 13px;
        color: @text-color;
        opacity: 0.5;
      }

      .remove-btn {
        color: @info-color;
        font-size: 13px;
        padding: 0;

        &:hover {
          color: @danger-color;
        }
      }
    }
  }
}

// 空收藏提示
.empty-favorites {
  text-align: center;
  padding: 60px 20px;

  i {
    font-size: 48px;
    color: @info-color;
    opacity: 0.5;
    margin-bottom: 16px;
    display: block;
  }

  p {
    font-size: 16px;
    color: @text-color;
    opacity: 0.6;
    margin-bottom: 8px;

    &.sub-text {
      font-size: 14px;
      opacity: 0.4;
    }
  }
}
</style>