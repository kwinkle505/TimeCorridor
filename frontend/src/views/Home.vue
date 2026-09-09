<template>
  <div class="home-page">
    <!-- Hero 区域 -->
    <section class="hero-section">
      <!-- 动态星空背景 -->
      <div class="stars-bg">
        <div v-for="n in 50" :key="n" class="star" :style="starStyle(n)"></div>
      </div>
      
      <!-- 光晕背景 -->
      <div class="glow-bg"></div>
      <div class="glow-bg glow-bg-2"></div>
      <div class="glow-bg glow-bg-3"></div>

      <div class="hero-content">
        <div class="hero-badge">
          <i class="el-icon-time"></i>
          <span>穿越时光的对话</span>
        </div>
        <h1 class="hero-title">
          <span class="title-line">写给十年后的自己</span>
          <span class="title-line title-line--accent">让未来回应现在</span>
        </h1>
        <p class="hero-subtitle">在这个时空回廊里，每一封信都是一颗穿越时空的星辰</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" class="btn-write" @click="$router.push('/write')">
            <i class="el-icon-edit"></i> 写一封信
          </el-button>
          <el-button type="default" size="large" class="btn-stories" @click="$router.push('/stories')">
            <i class="el-icon-reading"></i> 逛逛故事墙
          </el-button>
        </div>
      </div>

      <!-- 滚动提示 -->
      <div class="scroll-down" @click="scrollToStats">
        <div class="scroll-mouse">
          <div class="scroll-wheel"></div>
        </div>
        <span class="scroll-text">向下探索</span>
      </div>
    </section>

    <!-- 统计数据条 -->
    <section ref="statsSection" class="stats-section">
      <div class="stats-container">
        <div v-for="(item, index) in statsList" :key="index" class="stat-item" :style="{ animationDelay: index * 0.1 + 's' }">
          <div class="stat-icon">
            <i :class="item.icon"></i>
          </div>
          <div class="stat-number">
            <count-to :end-val="item.value" :duration="2500" separator="," />
          </div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </div>
    </section>

    <!-- 功能入口 -->
    <section class="features-section">
      <div class="section-header">
        <div class="section-tag">探索</div>
        <h2 class="section-title">探索时空回廊</h2>
        <p class="section-subtitle">每一种方式，都是与未来的自己对话</p>
      </div>
      <div class="features-grid">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="feature-card"
          :style="{ animationDelay: index * 0.08 + 's' }"
          @click="$router.push(feature.path)"
        >
          <div class="feature-glow"></div>
          <div class="feature-icon">
            <i :class="feature.icon"></i>
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.desc }}</p>
          <div class="feature-arrow">
            <i class="el-icon-arrow-right"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- 精选信件 -->
    <section class="letters-section">
      <div class="section-header">
        <div class="section-tag">精选</div>
        <h2 class="section-title">每周精选 · 时空好信</h2>
        <p class="section-subtitle">来自不同时空的温暖与力量</p>
      </div>
      <div class="letters-row">
        <div
          v-for="(letter, index) in featuredLetters"
          :key="index"
          class="letter-card"
          :style="{ animationDelay: index * 0.12 + 's' }"
          @click="viewLetter(letter)"
        >
          <div class="letter-glow" :style="{ background: letter.moodColor }"></div>
          <div class="letter-mood" :style="{ background: letter.moodColor }">
            {{ letter.mood }}
          </div>
          <div class="letter-quote">"</div>
          <p class="letter-preview">{{ letter.preview }}</p>
          <div class="letter-meta">
            <span class="letter-author">
              <i class="el-icon-user"></i> {{ letter.author }}
            </span>
            <span class="letter-date">{{ letter.date }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA 区域 -->
    <section class="cta-section">
      <div class="cta-content">
        <div class="cta-icon">✨</div>
        <h2>准备好开始你的时空之旅了吗？</h2>
        <p>写下此刻的心情，让它穿越时光，抵达未来的你</p>
        <el-button type="primary" size="large" class="btn-cta" @click="$router.push('/write')">
          <i class="el-icon-edit"></i> 立即写信
        </el-button>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { statsApi } from '@/api';

const CountTo = {
  props: {
    endVal: { type: Number, default: 0 },
    duration: { type: Number, default: 2500 },
    separator: { type: String, default: ',' }
  },
  data() {
    return {
      displayValue: 0,
      startTime: null,
      rafId: null,
      hasAnimated: false
    };
  },
  watch: {
    endVal: {
      immediate: true,
      handler() {
        this.startAnimate();
      }
    }
  },
  methods: {
    startAnimate() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.displayValue = 0;
      this.startTime = null;
      const animate = (timestamp) => {
        if (!this.startTime) this.startTime = timestamp;
        const progress = Math.min((timestamp - this.startTime) / this.duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        this.displayValue = Math.floor(ease * this.endVal);
        if (progress < 1) {
          this.rafId = requestAnimationFrame(animate);
        } else {
          this.displayValue = this.endVal;
        }
      };
      this.rafId = requestAnimationFrame(animate);
    },
    formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, this.separator);
    }
  },
  render(h) {
    return h('span', this.formatNumber(this.displayValue));
  }
};

export default {
  name: 'HomePage',
  components: { CountTo },
  data() {
    return {
      features: [
        { title: '给未来写信', desc: '写下此刻的心情，寄给未来的自己', icon: 'el-icon-message', path: '/write' },
        { title: '情绪树洞', desc: '匿名倾诉，AI温柔回应你的情绪', icon: 'el-icon-chat-dot-round', path: '/treehole' },
        { title: '今日句签', desc: '每天一句温暖文字，治愈你的心灵', icon: 'el-icon-collection-tag', path: '/quote' },
        { title: '时光胶囊', desc: '封存珍贵的记忆，约定未来开启', icon: 'el-icon-time', path: '/capsule' },
        { title: '留言墙', desc: '在故事墙上留下你的足迹与温暖', icon: 'el-icon-postcard', path: '/wall' },
        { title: '每日挑战', desc: '完成每日小任务，遇见更好的自己', icon: 'el-icon-trophy', path: '/challenge' }
      ],
      siteStats: {
        letterCount: 0,
        wallMessageCount: 0,
        treeholeCount: 0,
        capsulesCount: 0
      },
      featuredLetters: [
        {
          mood: '期待',
          moodColor: 'linear-gradient(135deg, #e89b6c, #d4a574)',
          preview: '亲爱的十年后的我，你是否已经实现了那个看似遥不可及的梦想？无论结果如何，请记得感谢现在努力的自己...',
          author: '追光者',
          date: '2026.07.08'
        },
        {
          mood: '感恩',
          moodColor: 'linear-gradient(135deg, #6db3a0, #7ec8b8)',
          preview: '谢谢你，在我最迷茫的时候没有放弃。谢谢你，选择了那条少有人走的路。谢谢你，成为了我想成为的人...',
          author: '时光旅人',
          date: '2026.07.05'
        },
        {
          mood: '勇敢',
          moodColor: 'linear-gradient(135deg, #1e3a5f, #2d5a87)',
          preview: '我知道你现在很害怕，但请相信，勇气不是没有恐惧，而是带着恐惧依然前行。十年后的你会为今天的你骄傲...',
          author: '逆风而行',
          date: '2026.07.03'
        }
      ]
    };
  },
  computed: {
    statsList() {
      return [
        { icon: 'el-icon-message', value: this.siteStats.letterCount || 0, label: '今日已寄出封信' },
        { icon: 'el-icon-reading', value: this.siteStats.wallMessageCount || 0, label: '故事墙已积累份温暖' },
        { icon: 'el-icon-chat-dot-round', value: this.siteStats.treeholeCount || 0, label: '树洞已倾听次倾诉' },
        { icon: 'el-icon-time', value: this.siteStats.capsulesCount || 0, label: '已封存个时光胶囊' }
      ];
    }
  },
  created() {
    this.loadSiteStats();
  },
  methods: {
    async loadSiteStats() {
      try {
        const data = await statsApi.getPublicStats();
        if (data) {
          this.siteStats = {
            letterCount: data.letterCount || 0,
            wallMessageCount: data.wallMessageCount || 0,
            treeholeCount: data.treeholeCount || 0,
            capsulesCount: data.capsulesCount || 0
          };
        }
      } catch (err) {
        console.warn('获取站点统计失败:', err);
      }
    },
    starStyle(n) {
      const size = Math.random() * 2 + 1;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = Math.random() * 3 + 2;
      return {
        width: size + 'px',
        height: size + 'px',
        left: left + '%',
        top: top + '%',
        animationDelay: delay + 's',
        animationDuration: duration + 's'
      };
    },
    scrollToStats() {
      this.$refs.statsSection.scrollIntoView({ behavior: 'smooth' });
    },
    viewLetter(letter) {
      this.$message.info(`查看信件：${letter.author}的${letter.mood}之信`);
    }
  }
};
</script>

<style lang="less" scoped>
@import '~@/assets/styles/variables.less';

.home-page {
  min-height: 100vh;
  background-color: @bg-color;
}

// Hero 区域
.hero-section {
  position: relative;
  height: 100vh;
  min-height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: @gradient-hero;

  .stars-bg {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;

    .star {
      position: absolute;
      background: #fff;
      border-radius: 50%;
      animation: twinkle 3s ease-in-out infinite;
    }
  }

  .glow-bg {
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232, 155, 108, 0.2) 0%, transparent 70%);
    animation: breathe 8s ease-in-out infinite;
    top: 25%;
    left: 35%;
    transform: translate(-50%, -50%);
    z-index: 1;

    &.glow-bg-2 {
      width: 500px;
      height: 500px;
      top: 65%;
      left: 70%;
      animation-delay: -4s;
      background: radial-gradient(circle, rgba(212, 165, 116, 0.15) 0%, transparent 70%);
    }

    &.glow-bg-3 {
      width: 300px;
      height: 300px;
      top: 40%;
      left: 80%;
      animation-delay: -2s;
      background: radial-gradient(circle, rgba(45, 90, 135, 0.2) 0%, transparent 70%);
    }
  }

  .hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 0 20px;
    max-width: 800px;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 8px 20px;
    border-radius: @radius-full;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    margin-bottom: 32px;
    animation: fadeInUp 1s ease-out;

    i {
      font-size: 16px;
      color: @accent-light;
    }
  }

  .hero-title {
    font-size: 52px;
    font-weight: 700;
    color: #FFFFFF;
    margin-bottom: 20px;
    line-height: 1.2;
    animation: fadeInUp 1s ease-out 0.1s both;

    .title-line {
      display: block;
    }

    .title-line--accent {
      background: linear-gradient(135deg, @accent-light, @secondary-color);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .hero-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.75);
    margin-bottom: 48px;
    font-weight: 400;
    animation: fadeInUp 1s ease-out 0.2s both;
  }

  .hero-actions {
    display: flex;
    gap: 20px;
    justify-content: center;
    animation: fadeInUp 1s ease-out 0.3s both;

    .btn-write {
      background: linear-gradient(135deg, @accent-color, @secondary-color);
      border: none;
      padding: 16px 40px;
      font-size: 17px;
      border-radius: @radius-full;
      font-weight: 600;
      letter-spacing: 1px;
      box-shadow: 0 8px 24px rgba(232, 155, 108, 0.35);
      transition: @transition-base;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 32px rgba(232, 155, 108, 0.45);
      }
    }

    .btn-stories {
      background: rgba(255, 255, 255, 0.1);
      border: 1.5px solid rgba(255, 255, 255, 0.25);
      color: #FFFFFF;
      padding: 16px 40px;
      font-size: 17px;
      border-radius: @radius-full;
      font-weight: 500;
      transition: @transition-base;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.4);
        transform: translateY(-3px);
      }
    }
  }

  .scroll-down {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    animation: fadeIn 1s ease-out 0.8s both;

    .scroll-mouse {
      width: 24px;
      height: 38px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-radius: 12px;
      display: flex;
      justify-content: center;
      padding-top: 8px;

      .scroll-wheel {
        width: 3px;
        height: 8px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 2px;
        animation: scrollWheel 2s ease-in-out infinite;
      }
    }

    .scroll-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      letter-spacing: 2px;
    }
  }
}

@keyframes scrollWheel {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(12px); opacity: 0; }
}

// 统计区域
.stats-section {
  background: @card-bg;
  padding: 64px 20px;
  box-shadow: @shadow-sm;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, @border-color, transparent);
  }

  .stats-container {
    max-width: @max-content-width;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 40px;

    @media (max-width: @screen-sm) {
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
  }

  .stat-item {
    text-align: center;
    padding: 20px;
    animation: fadeInUp 0.6s ease-out both;

    .stat-icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 16px;
      background: @gradient-primary;
      border-radius: @radius-md;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: @shadow-sm;
      transition: @transition-bounce;

      &:hover {
        transform: scale(1.1) rotate(-5deg);
      }

      i {
        font-size: 22px;
        color: #FFFFFF;
      }
    }

    .stat-number {
      font-size: 36px;
      font-weight: 700;
      color: @primary-color;
      margin-bottom: 8px;
      font-family: @font-family-en;
    }

    .stat-label {
      font-size: 14px;
      color: @text-secondary;
      font-weight: 400;
    }
  }
}

// 功能区域
.features-section {
  padding: 100px 20px;
  max-width: @max-content-width;
  margin: 0 auto;

  .section-header {
    text-align: center;
    margin-bottom: 60px;

    .section-tag {
      display: inline-block;
      padding: 6px 16px;
      background: rgba(232, 155, 108, 0.1);
      color: @accent-color;
      font-size: 13px;
      font-weight: 600;
      border-radius: @radius-full;
      margin-bottom: 16px;
      letter-spacing: 1px;
    }

    .section-title {
      font-size: 36px;
      color: @text-color-deep;
      margin-bottom: 12px;
      font-weight: 700;
    }

    .section-subtitle {
      font-size: 16px;
      color: @text-secondary;
      font-weight: 400;
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;

    @media (max-width: @screen-md) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: @screen-sm) {
      grid-template-columns: 1fr;
    }
  }

  .feature-card {
    background: @card-bg;
    border-radius: @radius-lg;
    padding: 40px 32px;
    text-align: center;
    cursor: pointer;
    transition: @transition-base;
    box-shadow: @shadow-sm;
    border: 1px solid @border-color-light;
    position: relative;
    overflow: hidden;
    animation: fadeInUp 0.6s ease-out both;

    &:hover {
      transform: translateY(-8px);
      box-shadow: @shadow-hover;
      border-color: @border-color-hover;

      .feature-glow {
        opacity: 1;
      }

      .feature-arrow {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .feature-glow {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(232, 155, 108, 0.06) 0%, transparent 70%);
      opacity: 0;
      transition: @transition-slow;
      pointer-events: none;
    }

    .feature-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 24px;
      background: @gradient-warm;
      border-radius: @radius-md;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: @shadow-accent;
      transition: @transition-bounce;

      &:hover {
        transform: scale(1.1) rotate(5deg);
      }

      i {
        font-size: 26px;
        color: #FFFFFF;
      }
    }

    h3 {
      font-size: 20px;
      color: @text-color-deep;
      margin-bottom: 12px;
      font-weight: 600;
    }

    p {
      font-size: 14px;
      color: @text-secondary;
      line-height: 1.7;
      margin-bottom: 20px;
    }

    .feature-arrow {
      opacity: 0;
      transform: translateX(-10px);
      transition: @transition-base;
      color: @accent-color;
      font-size: 16px;
    }
  }
}

// 信件区域
.letters-section {
  padding: 100px 20px;
  max-width: @max-content-width;
  margin: 0 auto;

  .section-header {
    text-align: center;
    margin-bottom: 60px;

    .section-tag {
      display: inline-block;
      padding: 6px 16px;
      background: rgba(109, 179, 160, 0.1);
      color: @success-color;
      font-size: 13px;
      font-weight: 600;
      border-radius: @radius-full;
      margin-bottom: 16px;
      letter-spacing: 1px;
    }

    .section-title {
      font-size: 36px;
      color: @text-color-deep;
      margin-bottom: 12px;
      font-weight: 700;
    }

    .section-subtitle {
      font-size: 16px;
      color: @text-secondary;
      font-weight: 400;
    }
  }

  .letters-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;

    @media (max-width: @screen-md) {
      grid-template-columns: 1fr;
    }
  }

  .letter-card {
    background: @card-bg;
    border-radius: @radius-lg;
    padding: 36px;
    cursor: pointer;
    transition: @transition-base;
    box-shadow: @shadow-sm;
    border: 1px solid @border-color-light;
    position: relative;
    overflow: hidden;
    animation: fadeInUp 0.6s ease-out both;

    &:hover {
      transform: translateY(-6px);
      box-shadow: @shadow-hover;
      border-color: @border-color-hover;

      .letter-glow {
        opacity: 0.6;
      }
    }

    .letter-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      opacity: 0.3;
      transition: @transition-base;
    }

    .letter-mood {
      display: inline-block;
      padding: 5px 18px;
      border-radius: @radius-full;
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 20px;
      letter-spacing: 1px;
    }

    .letter-quote {
      font-family: @font-family-en;
      font-size: 48px;
      color: @accent-color;
      opacity: 0.2;
      line-height: 1;
      margin-bottom: 8px;
    }

    .letter-preview {
      font-size: 15px;
      color: @text-color;
      line-height: 1.8;
      margin-bottom: 24px;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .letter-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: @text-secondary;
      padding-top: 16px;
      border-top: 1px solid @border-color-light;

      .letter-author {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
        color: @text-color;

        i {
          font-size: 12px;
        }
      }
    }
  }
}

// CTA 区域
.cta-section {
  padding: 100px 20px;
  background: @gradient-primary;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.5;
  }

  .cta-content {
    position: relative;
    z-index: 1;
    text-align: center;
    max-width: 600px;
    margin: 0 auto;

    .cta-icon {
      font-size: 48px;
      margin-bottom: 24px;
      animation: float 3s ease-in-out infinite;
    }

    h2 {
      font-size: 32px;
      color: #FFFFFF;
      margin-bottom: 16px;
      font-weight: 700;
    }

    p {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.75);
      margin-bottom: 36px;
    }

    .btn-cta {
      background: linear-gradient(135deg, @accent-color, @secondary-color);
      border: none;
      padding: 16px 48px;
      font-size: 17px;
      border-radius: @radius-full;
      font-weight: 600;
      letter-spacing: 1px;
      box-shadow: 0 8px 24px rgba(232, 155, 108, 0.35);
      transition: @transition-base;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 32px rgba(232, 155, 108, 0.45);
      }
    }
  }
}

// 动画定义
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

@keyframes breathe {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.9; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

// 响应式
@media (max-width: @screen-sm) {
  .hero-section {
    .hero-title { font-size: 32px; }
    .hero-subtitle { font-size: 15px; }
    .hero-actions {
      flex-direction: column;
      align-items: center;
      .btn-write, .btn-stories { width: 220px; }
    }
  }

  .features-section, .letters-section {
    padding: 60px 16px;

    .section-title { font-size: 28px; }
  }

  .cta-section {
    padding: 60px 16px;
    .cta-content h2 { font-size: 24px; }
  }
}
</style>
