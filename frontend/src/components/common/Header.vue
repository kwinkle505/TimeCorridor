<template>
  <header
    class="app-header"
    :class="{ 'is-scrolled': isScrolled, 'is-dark': isDarkMode, 'is-hidden': isHidden }"
  >
    <div class="header-inner">
      <!-- Logo -->
      <router-link to="/" class="logo-link">
        <div class="logo-badge">
          <span class="logo-icon">⏳</span>
        </div>
        <div class="logo-text-group">
          <span class="logo-text">时空回廊</span>
          <span class="logo-slogan">Time Corridor</span>
        </div>
      </router-link>

      <!-- 桌面导航 -->
      <nav class="nav-menu desktop-only">
        <router-link
          v-for="item in mainNavItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :exact="item.path === '/'"
          active-class="nav-item--active"
        >
          <span class="nav-dot"></span>
          {{ item.label }}
        </router-link>

        <el-dropdown
          class="nav-dropdown"
          trigger="hover"
          placement="bottom"
        >
          <span class="nav-item">
            更多
            <i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown" class="nav-dropdown-menu">
            <el-dropdown-item
              v-for="item in moreNavItems"
              :key="item.path"
            >
              <router-link :to="item.path" class="dropdown-link">
                {{ item.label }}
              </router-link>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </nav>

      <!-- 右侧操作区 -->
      <div class="header-actions">
        <!-- 夜间模式 -->
        <div class="theme-toggle" @click="toggleDarkMode(!localDarkMode)">
          <div class="toggle-track" :class="{ 'is-dark': localDarkMode }">
            <div class="toggle-thumb">
              <i v-if="!localDarkMode" class="el-icon-sunny"></i>
              <i v-else class="el-icon-moon"></i>
            </div>
          </div>
        </div>

        <!-- 登录/用户 -->
        <span v-if="!currentUser" class="login-btn desktop-only" @click="$router.push('/login')">
          <i class="el-icon-user" />
          <span>登录</span>
        </span>
        <el-dropdown v-else class="user-dropdown desktop-only" @command="handleUserCommand">
          <span class="login-btn user-avatar">
            <div class="avatar-circle">{{ userInitial }}</div>
            <span>{{ currentUser.nickname || currentUser.username }}</span>
            <i class="el-icon-arrow-down" style="font-size:12px;margin-left:4px" />
          </span>
          <el-dropdown-menu slot="dropdown" class="user-dropdown-menu">
            <el-dropdown-item command="profile">
              <i class="el-icon-user-solid"></i> 个人足迹
            </el-dropdown-item>
            <el-dropdown-item v-if="currentUser && currentUser.role === 'admin'" command="admin">
              <i class="el-icon-setting"></i> 后台管理
            </el-dropdown-item>
            <el-dropdown-item command="logout" divided>
              <i class="el-icon-switch-button"></i> 退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <!-- 移动端汉堡菜单 -->
        <button
          class="hamburger-btn mobile-only"
          :class="{ 'is-open': mobileMenuOpen }"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <span class="hamburger-line" />
          <span class="hamburger-line" />
          <span class="hamburger-line" />
        </button>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <transition name="slide-down">
      <div v-show="mobileMenuOpen" class="mobile-menu mobile-only">
        <router-link
          v-for="item in [...mainNavItems, ...moreNavItems]"
          :key="item.path"
          :to="item.path"
          class="mobile-nav-item"
          @click.native="mobileMenuOpen = false"
        >
          {{ item.label }}
        </router-link>
        <router-link
          to="/profile"
          class="mobile-nav-item"
          @click.native="mobileMenuOpen = false"
        >
          <i class="el-icon-user-solid" />
          个人足迹
        </router-link>
      </div>
    </transition>
  </header>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'AppHeader',

  data() {
    return {
      isScrolled: false,
      isHidden: false,
      lastScrollY: 0,
      mobileMenuOpen: false,
      localDarkMode: false,
      mainNavItems: [
        { label: '首页', path: '/' },
        { label: '写信', path: '/write' },
        { label: '故事墙', path: '/stories' },
        { label: '树洞', path: '/treehole' },
        { label: '句签', path: '/quote' }
      ],
      moreNavItems: [
        { label: '时光胶囊', path: '/capsule' },
        { label: '胶囊陈列馆', path: '/gallery' },
        { label: '留言墙', path: '/wall' },
        { label: '每日挑战', path: '/challenge' },
        { label: '星光收集册', path: '/badges' }
      ]
    };
  },

  computed: {
    isDarkMode() {
      return this.$store.state.settings?.darkMode || false;
    },
    currentUser() {
      return this.$store.state.auth.user || null;
    },
    userInitial() {
      if (!this.currentUser) return '';
      const name = this.currentUser.nickname || this.currentUser.username || '';
      return name.charAt(0).toUpperCase();
    }
  },

  watch: {
    isDarkMode: {
      immediate: true,
      handler(val) {
        this.localDarkMode = val;
      }
    },
    '$route'() {
      this.mobileMenuOpen = false;
    }
  },

  mounted() {
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.handleScroll();
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },

  methods: {
    handleScroll() {
      const currentY = window.scrollY;
      this.isScrolled = currentY > 20;
      // 向下滚动超过100px时隐藏导航栏
      if (currentY > this.lastScrollY && currentY > 100) {
        this.isHidden = true;
      } else {
        this.isHidden = false;
      }
      this.lastScrollY = currentY;
    },
    handleUserCommand(cmd) {
      if (cmd === 'profile') {
        if (this.$route.path !== '/profile') this.$router.push('/profile');
      } else if (cmd === 'admin') {
        if (this.$route.path !== '/admin') this.$router.push('/admin');
      } else if (cmd === 'logout') {
        this.$store.dispatch('auth/logout');
        this.$message.success('已退出登录');
      }
    },
    toggleDarkMode(val) {
      this.localDarkMode = val;
      this.$store.commit('settings/SET_DARK_MODE', val);
    }
  }
};
</script>

<style lang="less" scoped>
@import '~@/assets/styles/variables.less';

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: @z-fixed;
  height: @header-height;
  background: transparent;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
              background 0.4s ease,
              box-shadow 0.4s ease;

  &.is-scrolled {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    box-shadow: 0 1px 3px rgba(30, 58, 95, 0.06), 
                0 4px 12px rgba(30, 58, 95, 0.04);
    height: @header-height-scrolled;
  }

  &.is-hidden {
    transform: translateY(-100%);
  }

  &.is-dark {
    .logo-text, .logo-slogan { color: @dark-text-color; }
    .nav-item { color: rgba(255, 255, 255, 0.85); }
    .nav-item:hover, .nav-item--active { color: @accent-light; }
    .hamburger-line { background: @dark-text-color; }
    .login-btn { color: rgba(255, 255, 255, 0.85); }
    .login-btn:hover { color: @accent-light; }
    
    &.is-scrolled {
      background: rgba(18, 24, 36, 0.85);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 
                  0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: @max-content-width;
  height: 100%;
  margin: 0 auto;
  padding: 0 @spacing-24;
}

// Logo 区域
.logo-link {
  display: flex;
  align-items: center;
  gap: @spacing-12;
  text-decoration: none;
  transition: @transition-base;

  &:hover {
    opacity: 0.85;
    transform: scale(1.02);
  }
}

.logo-badge {
  width: 40px;
  height: 40px;
  background: @gradient-warm;
  border-radius: @radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: @shadow-accent;
  transition: @transition-bounce;

  .logo-icon {
    font-size: 22px;
    line-height: 1;
  }
}

.logo-text-group {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.logo-text {
  font-family: @font-family-display;
  font-size: 18px;
  font-weight: 700;
  color: @text-color-deep;
  letter-spacing: 2px;
}

.logo-slogan {
  font-size: 10px;
  color: @text-muted;
  font-weight: 400;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

// 桌面导航
.nav-menu {
  display: flex;
  align-items: center;
  gap: @spacing-8;
}

.nav-item {
  font-family: @font-family-cn;
  font-size: 14px;
  font-weight: 500;
  color: @text-secondary;
  text-decoration: none;
  padding: @spacing-8 @spacing-12;
  position: relative;
  transition: @transition-base;
  cursor: pointer;
  border-radius: @radius-sm;
  display: flex;
  align-items: center;
  gap: @spacing-6;

  .nav-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: @accent-color;
    opacity: 0;
    transform: scale(0);
    transition: @transition-bounce;
  }

  &:hover {
    color: @accent-color;
    background: rgba(232, 155, 108, 0.06);

    .nav-dot {
      opacity: 1;
      transform: scale(1);
    }
  }

  &--active {
    color: @accent-color;
    background: rgba(232, 155, 108, 0.08);
    font-weight: 600;

    .nav-dot {
      opacity: 1;
      transform: scale(1);
    }
  }
}

.dropdown-link {
  display: block;
  color: inherit;
  text-decoration: none;
  padding: @spacing-8 @spacing-16;
}

// 右侧操作区
.header-actions {
  display: flex;
  align-items: center;
  gap: @spacing-16;
}

// 主题切换
.theme-toggle {
  cursor: pointer;
  padding: 4px;

  .toggle-track {
    width: 44px;
    height: 24px;
    background: @bg-color-cool;
    border-radius: @radius-full;
    border: 1px solid @border-color;
    position: relative;
    transition: @transition-base;

    &.is-dark {
      background: @primary-light;
      border-color: @primary-light;

      .toggle-thumb {
        transform: translateX(20px);
        background: @accent-light;

        i {
          color: @primary-dark;
        }
      }
    }
  }

  .toggle-thumb {
    width: 20px;
    height: 20px;
    background: @accent-color;
    border-radius: 50%;
    position: absolute;
    top: 1px;
    left: 1px;
    transition: @transition-bounce;
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 11px;
      color: #fff;
      transition: @transition-fast;
    }
  }
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  color: @text-secondary;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: @transition-base;
  padding: @spacing-6 @spacing-12;
  border-radius: @radius-sm;

  &:hover { 
    color: @accent-color; 
    background: rgba(232, 155, 108, 0.06);
  }

  &.user-avatar {
    gap: 8px;
  }
}

.avatar-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: @gradient-warm;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

// 汉堡菜单
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;

  .hamburger-line {
    display: block;
    width: 100%;
    height: 2px;
    background: @text-color-deep;
    border-radius: 2px;
    transition: @transition-base;
  }

  &.is-open {
    .hamburger-line:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    .hamburger-line:nth-child(2) {
      opacity: 0;
    }
    .hamburger-line:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }
  }
}

// 移动端菜单
.mobile-menu {
  position: absolute;
  top: @header-height;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: @spacing-16;
  box-shadow: @shadow-lg;
  border-top: 1px solid @border-color-light;
}

.is-dark .mobile-menu {
  background: rgba(18, 24, 36, 0.95);
  border-top-color: @dark-border-color;
  box-shadow: @shadow-dark-lg;

  .mobile-nav-item {
    color: rgba(255, 255, 255, 0.8);
    border-bottom-color: rgba(255, 255, 255, 0.06);

    &:hover {
      color: @accent-light;
      background: rgba(232, 155, 108, 0.08);
    }
  }
}

.mobile-nav-item {
  display: block;
  padding: @spacing-16;
  color: @text-color;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border-bottom: 1px solid @border-color-light;
  transition: @transition-base;
  border-radius: @radius-sm;

  &:hover {
    color: @accent-color;
    background: rgba(232, 155, 108, 0.05);
  }

  &:last-child {
    border-bottom: none;
  }
}

// 下拉菜单样式
.nav-dropdown-menu, .user-dropdown-menu {
  border-radius: @radius-md;
  box-shadow: @shadow-lg;
  border: 1px solid @border-color-light;
  padding: @spacing-8 0;

  .el-dropdown-menu__item {
    padding: @spacing-12 @spacing-20;
    font-size: 14px;
    transition: @transition-fast;

    i {
      margin-right: @spacing-8;
      font-size: 14px;
    }

    &:hover {
      background: rgba(232, 155, 108, 0.08);
      color: @accent-color;
    }
  }
}

// 动画
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 响应式
@media (max-width: @screen-sm) {
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: flex !important;
  }

  .hamburger-btn {
    display: flex;
  }

  .mobile-menu {
    display: block;
  }

  .header-inner {
    padding: 0 @spacing-16;
  }

  .logo-badge {
    width: 36px;
    height: 36px;
  }

  .logo-slogan {
    display: none;
  }
}

@media (min-width: 769px) {
  .mobile-only {
    display: none !important;
  }
}
</style>
