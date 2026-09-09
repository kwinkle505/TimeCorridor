<template>
  <!-- 回到顶部按钮：滚动超过300px显示，点击平滑回到顶部 -->
  <transition name="fade">
    <button
      v-show="visible"
      class="back-to-top"
      aria-label="回到顶部"
      @click="scrollToTop"
    >
      <i class="el-icon-arrow-up" />
    </button>
  </transition>
</template>

<script>
export default {
  name: 'BackToTop',

  data() {
    return {
      // 按钮是否可见
      visible: false
    };
  },

  mounted() {
    // 监听滚动事件
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.handleScroll();
  },

  beforeDestroy() {
    // 移除滚动监听
    window.removeEventListener('scroll', this.handleScroll);
  },

  methods: {
    /**
     * 处理滚动事件，超过300px显示按钮
     */
    handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      this.visible = scrollTop > 300;
    },

    /**
     * 平滑滚动到顶部
     */
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
};
</script>

<style lang="less" scoped>
@import '~@/assets/styles/variables.less';

// 回到顶部按钮
.back-to-top {
  position: fixed;
  right: @spacing-xl;
  bottom: @spacing-xl;
  z-index: 999;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: @card-bg;
  border: none;
  box-shadow: @shadow-hover;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: @transition-base;

  i {
    font-size: 20px;
    color: @accent-color;
    transition: @transition-base;
  }

  &:hover {
    background: @accent-color;
    transform: translateY(-4px);

    i {
      color: @card-bg;
    }
  }

  &:active {
    transform: translateY(-2px) scale(0.96);
  }
}

// 淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

// 响应式
@media (max-width: 768px) {
  .back-to-top {
    right: @spacing-md;
    bottom: @spacing-md;
    width: 40px;
    height: 40px;

    i {
      font-size: 16px;
    }
  }
}
</style>
