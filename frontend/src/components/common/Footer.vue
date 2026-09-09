<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <!-- 顶部装饰线 -->
      <div class="footer-top-line"></div>

      <!-- 主要内容区 -->
      <div class="footer-main">
        <!-- 品牌区 -->
        <div class="footer-brand">
          <div class="brand-logo">
            <span class="logo-icon">⏳</span>
            <span class="logo-text">时空回廊</span>
          </div>
          <p class="brand-desc">写给未来的自己，让时间见证成长<br>在这个时空回廊里，每一封信都是一颗穿越时空的星辰</p>
          <div class="social-icons">
            <div class="social-item" title="支持一下" @click="showWechat = true">
              <div class="social-icon">
                <i class="el-icon-chat-dot-round" />
              </div>
              <span class="social-name">支持</span>
            </div>
            <div class="social-item" title="官方微博" @click="openExternal('https://weibo.com')">
              <div class="social-icon">
                <i class="el-icon-microphone" />
              </div>
              <span class="social-name">微博</span>
            </div>
            <div class="social-item" title="豆瓣小站" @click="openExternal('https://www.douban.com')">
              <div class="social-icon">
                <i class="el-icon-notebook-2" />
              </div>
              <span class="social-name">豆瓣</span>
            </div>
          </div>
        </div>

        <!-- 链接区 -->
        <div class="footer-links">
          <div class="links-group">
            <h4>探索</h4>
            <router-link v-for="link in exploreLinks" :key="link.name" :to="link.path">
              {{ link.name }}
            </router-link>
          </div>
          <div class="links-group">
            <h4>关于</h4>
            <router-link v-for="link in aboutLinks" :key="link.name" :to="link.path">
              {{ link.name }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- 底部版权 -->
      <div class="footer-bottom">
        <div class="bottom-line"></div>
        <p>© 2026 时空回廊 · 用时间治愈时间</p>
      </div>
    </div>

    <!-- 微信二维码弹窗 -->
    <el-dialog :visible.sync="showWechat" title="支持一下" width="380px" center :modal-append-to-body="false">
      <div class="qrcode-box">
        <img src="/wechat-qrcode.jpg" alt="支持一下" class="qrcode-img" />
        <p class="qrcode-tip">长按或扫描二维码，感谢你的支持与鼓励</p>
      </div>
    </el-dialog>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',

  data() {
    return {
      exploreLinks: [
        { name: '给未来写信', path: '/write' },
        { name: '情绪树洞', path: '/treehole' },
        { name: '时光胶囊', path: '/capsule' },
        { name: '故事墙', path: '/stories' },
        { name: '留言墙', path: '/wall' },
        { name: '每日挑战', path: '/challenge' }
      ],
      aboutLinks: [
        { name: '关于我们', path: '/about' },
        { name: '星光收集册', path: '/badges' },
        { name: '个人足迹', path: '/profile' }
      ],
      showWechat: false
    }
  },

  methods: {
    openExternal(url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/assets/styles/variables.less';

.app-footer {
  background: @primary-dark;
  padding: @spacing-48 0 0;
  margin-top: auto;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.3), transparent);
  }
}

.footer-inner {
  max-width: @max-content-width;
  margin: 0 auto;
  padding: 0 @spacing-24;
}

.footer-top-line {
  height: 3px;
  width: 60px;
  background: @gradient-warm;
  border-radius: 2px;
  margin: 0 auto @spacing-48;
}

.footer-main {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: @spacing-64;
  margin-bottom: @spacing-48;

  @media (max-width: @screen-md) {
    grid-template-columns: 1fr;
    gap: @spacing-40;
  }
}

.footer-brand {
  .brand-logo {
    display: flex;
    align-items: center;
    gap: @spacing-12;
    margin-bottom: @spacing-20;

    .logo-icon {
      font-size: 28px;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 2px;
    }
  }

  .brand-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.8;
    margin-bottom: @spacing-24;
  }

  .social-icons {
    display: flex;
    gap: @spacing-16;

    .social-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: @transition-base;

      &:hover {
        .social-icon {
          background: @gradient-warm;
          transform: translateY(-3px);
        }

        .social-name {
          color: @accent-light;
        }
      }

      .social-icon {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: @radius-md;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: @transition-base;

        i {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.7);
        }
      }

      .social-name {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
        transition: @transition-base;
      }
    }
  }
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: @spacing-32;

  .links-group {
    h4 {
      font-size: 14px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: @spacing-16;
      letter-spacing: 1px;
    }

    a {
      display: block;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.45);
      text-decoration: none;
      padding: 6px 0;
      transition: @transition-base;
      position: relative;
      width: fit-content;

      &::after {
        content: '';
        position: absolute;
        bottom: 4px;
        left: 0;
        width: 0;
        height: 1px;
        background: @accent-color;
        transition: width 0.3s ease;
      }

      &:hover {
        color: @accent-light;
        padding-left: 4px;

        &::after {
          width: 100%;
        }
      }
    }
  }
}

.footer-bottom {
  padding: @spacing-24 0;
  position: relative;

  .bottom-line {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
    margin-bottom: @spacing-24;
  }

  p {
    text-align: center;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.25);
    letter-spacing: 1px;
  }
}

.qrcode-box {
  text-align: center;
  padding: 16px 0;

  .qrcode-img {
    width: 260px;
    height: 260px;
    object-fit: contain;
    margin-bottom: 12px;
    border-radius: @radius-sm;
  }

  .qrcode-tip {
    font-size: 13px;
    color: @text-secondary;
  }
}

// 响应式
@media (max-width: @screen-sm) {
  .app-footer {
    padding: @spacing-32 0 0;
  }

  .footer-inner {
    padding: 0 @spacing-16;
  }

  .footer-main {
    margin-bottom: @spacing-32;
  }

  .footer-links {
    gap: @spacing-20;
  }
}
</style>
