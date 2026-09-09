<template>
  <!-- 回信展示组件：信纸风格 + 打字机效果 -->
  <div class="letter-reply">
    <!-- 信纸容器 -->
    <div ref="paper" class="paper">
      <!-- 纸质纹理层 -->
      <div class="paper-texture" />

      <!-- 信纸内容 -->
      <div class="paper-content">
        <!-- 称呼 -->
        <p class="salutation">亲爱的写信人：</p>

        <!-- 打字机效果正文 -->
        <div class="reply-body">
          <p
            v-for="(line, index) in displayLines"
            :key="index"
            class="typewriter-line"
            :style="{ animationDelay: `${index * 0.3}s` }"
          >
            {{ line }}
          </p>
        </div>

        <!-- 落款 -->
        <div class="signature">
          <p>—— 来自2036年的回信</p>
          <p class="date">{{ currentDate }}</p>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="reply-actions">
      <el-button
        type="primary"
        plain
        icon="el-icon-camera"
        @click="saveImage"
      >
        保存图片
      </el-button>
      <el-button
        type="primary"
        plain
        icon="el-icon-share"
        @click="handleShare"
      >
        分享到故事墙
      </el-button>
      <el-button
        type="primary"
        plain
        icon="el-icon-document-copy"
        @click="handleCopy"
      >
        复制回信
      </el-button>
      <el-button
        type="success"
        icon="el-icon-edit"
        @click="handleReset"
      >
        再写一封
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LetterReply',

  props: {
    /**
     * 回信文本内容（多行字符串）
     */
    replyText: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      // 打字机显示的行数组
      displayLines: [],
      // 当前日期
      currentDate: new Date().toLocaleDateString('zh-CN'),
      // 打字机定时器
      typeTimer: null
    };
  },

  watch: {
    /**
     * 监听 replyText 变化，重新启动打字机
     */
    replyText: {
      immediate: true,
      handler(val) {
        if (val) {
          this.startTypewriter(val);
        }
      }
    }
  },

  beforeDestroy() {
    // 清除定时器
    this.clearTypeTimer();
  },

  methods: {
    /**
     * 启动打字机效果，逐行显示（每行300ms间隔）
     * @param {string} text - 完整回信文本
     */
    startTypewriter(text) {
      this.clearTypeTimer();
      this.displayLines = [];

      // 按换行或句号分割为行
      const lines = text
        .split(/\n|。/)
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .map(l => (/[^。？！…!?]$/.test(l) ? l + '。' : l));

      let index = 0;
      const interval = 300; // 每行300ms间隔

      this.typeTimer = setInterval(() => {
        if (index < lines.length) {
          this.displayLines.push(lines[index]);
          index++;
        } else {
          this.clearTypeTimer();
        }
      }, interval);
    },

    /**
     * 清除打字机定时器
     */
    clearTypeTimer() {
      if (this.typeTimer) {
        clearInterval(this.typeTimer);
        this.typeTimer = null;
      }
    },

    /**
     * 等待打字机动画全部完成
     */
    waitForTypewriterDone() {
      return new Promise(resolve => {
        // 如果没有定时器在运行，说明动画已完成
        if (!this.typeTimer) {
          resolve();
          return;
        }
        // 轮询检查定时器是否被清除
        const check = setInterval(() => {
          if (!this.typeTimer) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });
    },

    /**
     * 保存图片（使用 html2canvas）
     * 关键：截图前必须把所有打字机行设为可见，截图完再恢复
     */
    async saveImage() {
      try {
        // 1. 等打字机动画全部完成
        await this.waitForTypewriterDone();
        await new Promise(r => setTimeout(r, 300));

        // 2. 强制所有行可见（html2canvas 无法捕获 CSS animation 的 forwards 状态）
        var paperEl = this.$refs.paper;
        var lines = paperEl.querySelectorAll('.typewriter-line');
        var originalStyles = [];
        lines.forEach(function(el) {
          originalStyles.push({
            opacity: el.style.opacity,
            transform: el.style.transform,
            animation: el.style.animation
          });
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.animation = 'none';
        });

        await new Promise(r => setTimeout(r, 200));

        // 3. 截图
        var Html2Canvas = (await import('html2canvas')).default;
        var canvas = await Html2Canvas(paperEl, {
          backgroundColor: '#F5F0E6',
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          height: paperEl.scrollHeight,
          width: paperEl.scrollWidth
        });
        var link = document.createElement('a');
        link.download = '时空回廊回信_' + Date.now() + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        // 4. 恢复样式
        lines.forEach(function(el, i) {
          el.style.opacity = originalStyles[i].opacity;
          el.style.transform = originalStyles[i].transform;
          el.style.animation = originalStyles[i].animation;
        });
      } catch (err) {
        this.$message.error('保存图片失败，请重试');
        console.error('html2canvas error:', err);
      }
    },

    /**
     * 分享到故事墙
     */
    handleShare() {
      this.$emit('share');
    },

    /**
     * 复制回信内容
     */
    handleCopy() {
      const text = this.displayLines.join('\n');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message.success('回信已复制到剪贴板');
        }).catch(() => {
          this.fallbackCopy(text);
        });
      } else {
        this.fallbackCopy(text);
      }
    },

    /**
     * 降级复制方案
     */
    fallbackCopy(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        this.$message.success('回信已复制到剪贴板');
      } catch (err) {
        this.$message.error('复制失败');
      }
      document.body.removeChild(textarea);
    },

    /**
     * 再写一封
     */
    handleReset() {
      this.$emit('reset');
    }
  }
};
</script>

<style lang="less" scoped>

// 回信容器
.letter-reply {
  max-width: 640px;
  margin: 0 auto;
}

// 信纸容器
.paper {
  position: relative;
  background: #F5F0E6; // 米黄色背景
  border-radius: @border-radius-md;
  padding: @spacing-xl * 1.5;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: visible;
  min-height: 300px;

  // 纸质纹理（CSS模拟）
  .paper-texture {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0.4;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 28px,
        rgba(139, 119, 101, 0.08) 28px,
        rgba(139, 119, 101, 0.08) 29px
      );
  }
}

// 信纸内容
.paper-content {
  position: relative;
  z-index: 1;
  font-family: @font-family-hand; // 手写字体 Caveat
  color: @primary-color;
  line-height: 2;
}

// 称呼
.salutation {
  font-size: 22px;
  margin-bottom: @spacing-lg;
  font-weight: 600;
}

// 打字机行
.typewriter-line {
  font-size: 20px;
  margin: 0 0 @spacing-sm;
  opacity: 0;
  animation: typewriterFadeIn 0.5s ease forwards;
}

// 打字机动画
@keyframes typewriterFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 落款
.signature {
  margin-top: @spacing-xl;
  text-align: right;
  font-size: 18px;

  .date {
    font-size: 14px;
    color: rgba(26, 42, 58, 0.6);
    margin-top: @spacing-xs;
  }
}

// 底部操作按钮
.reply-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: @spacing-sm;
  margin-top: @spacing-xl;
}

// 响应式
@media (max-width: 768px) {
  .paper {
    padding: @spacing-lg;
  }

  .salutation {
    font-size: 18px;
  }

  .typewriter-line {
    font-size: 16px;
  }

  .reply-actions {
    .el-button {
      flex: 1;
      min-width: 120px;
    }
  }
}
</style>
