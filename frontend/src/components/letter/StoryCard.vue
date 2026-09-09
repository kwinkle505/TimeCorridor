<template>
  <!-- 故事卡片：展示单个公开信件摘要 -->
  <div class="story-card" :class="{ 'is-expanded': isExpanded }">
    <!-- 卡片头部：收信对象 + 写信日期 -->
    <div class="card-header">
      <div class="recipient-info">
        <span class="recipient-badge">{{ letter.recipient || '未知' }}</span>
        <span class="write-time">{{ letter.writeDate || '' }}</span>
      </div>
      <!-- 情绪标签（直接显示 letter.moods 中的中文值） -->
      <div v-if="letter.moods && letter.moods.length > 0" class="mood-tags">
        <el-tag
          v-for="mood in letter.moods"
          :key="mood"
          size="mini"
          effect="plain"
          class="mood-tag"
        >
          {{ mood }}
        </el-tag>
      </div>
    </div>

    <!-- 信件摘要（60字） -->
    <div class="letter-summary">
      <p class="summary-label">信件</p>
      <p class="summary-text">{{ truncate(letter.content, 60) }}</p>
    </div>

    <!-- 回信摘要（60字） -->
    <div v-if="letter.reply" class="reply-summary">
      <p class="summary-label">回信</p>
      <p class="summary-text reply-text">{{ truncate(typeof letter.reply === 'string' ? letter.reply : letter.reply.content, 60) }}</p>
    </div>

    <!-- 展开后的完整内容 -->
    <transition name="expand">
      <div v-show="isExpanded" class="expanded-content">
        <div class="full-letter">
          <p class="full-label">完整信件</p>
          <p class="full-text">{{ letter.content }}</p>
        </div>
        <div v-if="letter.reply" class="full-reply">
          <p class="full-label">完整回信</p>
          <p class="full-text reply-text">{{ typeof letter.reply === 'string' ? letter.reply : letter.reply.content }}</p>
        </div>
      </div>
    </transition>

    <!-- 卡片底部：共鸣数 + 操作按钮 -->
    <div class="card-footer">
      <div class="resonate-section">
        <el-button
          type="text"
          size="small"
          class="resonate-btn"
          :class="{ 'is-resonated': letter._resonated }"
          @click="handleResonate"
        >
          <i :class="letter._resonated ? 'el-icon-star-on' : 'el-icon-star-off'" />
          <span>共鸣 {{ letter.likes || 0 }}</span>
        </el-button>
      </div>
      <div class="actions">
        <el-button
          type="text"
          size="small"
          class="view-btn"
          @click="toggleExpand"
        >
          {{ isExpanded ? '收起' : '查看详情' }}
          <i :class="isExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StoryCard',

  props: {
    /**
     * 信件数据对象
     * 字段映射：moods（情绪标签数组）、writeDate、content、reply、likes
     */
    letter: {
      type: Object,
      required: true,
      default: function () {
        return {
          id: '',
          recipient: '',
          content: '',
          reply: '',
          moods: [],
          writeDate: '',
          likes: 0
        }
      }
    }
  },

  data() {
    return {
      // 是否展开完整内容
      isExpanded: false
    }
  },

  methods: {
    /**
     * 截断文本到指定长度
     * @param {string} text - 原文本
     * @param {number} length - 最大长度
     * @returns {string} 截断后的文本
     */
    truncate(text, length) {
      if (!text) return ''
      if (text.length <= length) return text
      return text.slice(0, length) + '...'
    },

    /**
     * 切换展开/收起状态
     * 展开时 emit view 事件，传出 letter 对象
     */
    toggleExpand() {
      this.isExpanded = !this.isExpanded
      if (this.isExpanded) {
        this.$emit('view', this.letter)
      }
    },

    /**
     * 触发共鸣（点赞）
     * emit resonate 事件，传出 letter.id
     */
    handleResonate() {
      this.$emit('resonate', this.letter.id)
    }
  }
}
</script>

<style lang="less" scoped>
// 故事卡片
.story-card {
  background: @card-bg;
  border-radius: @border-radius-lg;
  padding: @spacing-lg;
  box-shadow: @shadow-base;
  transition: @transition-base;
  border: 1px solid transparent;

  &:hover {
    box-shadow: @shadow-hover;
    border-color: rgba(212, 146, 106, 0.2);
  }
}

// 卡片头部
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: @spacing-md;
  flex-wrap: wrap;
  gap: @spacing-sm;
}

.recipient-info {
  display: flex;
  align-items: center;
  gap: @spacing-sm;
}

// 收信对象徽章（直接显示中文字符串）
.recipient-badge {
  display: inline-block;
  padding: @spacing-xs @spacing-sm;
  background: rgba(232, 141, 94, 0.12);
  color: @accent-color;
  font-size: 13px;
  font-weight: 600;
  border-radius: @border-radius-sm;
}

// 写信日期（中文格式直接显示）
.write-time {
  font-size: 13px;
  color: rgba(44, 62, 80, 0.5);
}

// 情绪标签（直接显示中文值，不需要 emotionMap 转换）
.mood-tags {
  display: flex;
  gap: @spacing-xs;
  flex-wrap: wrap;
}

.mood-tag {
  border-color: rgba(212, 146, 106, 0.3);
  color: @secondary-color;
}

// 摘要区
.letter-summary,
.reply-summary {
  margin-bottom: @spacing-md;

  .summary-label {
    font-size: 12px;
    color: rgba(44, 62, 80, 0.4);
    margin-bottom: @spacing-xs;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .summary-text {
    font-family: @font-family-cn;
    font-size: 14px;
    color: @text-color;
    line-height: 1.8;
    margin: 0;

    &.reply-text {
      color: @secondary-color;
      font-style: italic;
    }
  }
}

// 展开内容
.expanded-content {
  margin-top: @spacing-lg;
  padding-top: @spacing-lg;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}

.full-letter,
.full-reply {
  margin-bottom: @spacing-lg;

  &:last-child {
    margin-bottom: 0;
  }

  .full-label {
    font-size: 12px;
    color: rgba(44, 62, 80, 0.4);
    margin-bottom: @spacing-sm;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .full-text {
    font-family: @font-family-cn;
    font-size: 15px;
    color: @text-color;
    line-height: 2;
    margin: 0;
    white-space: pre-wrap;

    &.reply-text {
      color: @secondary-color;
      background: rgba(212, 146, 106, 0.06);
      padding: @spacing-md;
      border-radius: @border-radius-sm;
    }
  }
}

// 展开动画
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 800px;
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  padding-top: 0;
}

// 卡片底部
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: @spacing-md;
  padding-top: @spacing-md;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.resonate-btn {
  color: rgba(44, 62, 80, 0.5);
  transition: @transition-base;

  i {
    margin-right: @spacing-xs;
    transition: @transition-base;
  }

  &:hover {
    color: @accent-color;

    i {
      transform: scale(1.2);
    }
  }

  &.is-resonated {
    color: @accent-color;

    i {
      color: @accent-color;
    }
  }
}

.view-btn {
  color: @accent-color;

  i {
    margin-left: @spacing-xs;
    transition: transform 0.3s ease;
  }
}

// 响应式
@media (max-width: 768px) {
  .story-card {
    padding: @spacing-md;
    border-radius: @border-radius-md;
  }

  .card-header {
    flex-direction: column;
  }
}
</style>