<template>
  <div class="login-page">
    <!-- 动态背景 -->
    <div class="login-bg">
      <div class="bg-gradient"></div>
      <div class="bg-particles">
        <div v-for="n in 30" :key="n" class="particle" :style="particleStyle(n)"></div>
      </div>
    </div>

    <div class="login-wrapper">
      <!-- 左侧品牌区 -->
      <div class="brand-section desktop-only">
        <div class="brand-content">
          <div class="brand-logo">
            <span class="brand-icon">⏳</span>
          </div>
          <h1 class="brand-title">时空回廊</h1>
          <p class="brand-slogan">Time Corridor</p>
          <div class="brand-divider"></div>
          <p class="brand-desc">写给未来的自己<br>让时间见证成长</p>
          <div class="brand-features">
            <div class="brand-feature">
              <i class="el-icon-message"></i>
              <span>寄信未来</span>
            </div>
            <div class="brand-feature">
              <i class="el-icon-chat-dot-round"></i>
              <span>情绪树洞</span>
            </div>
            <div class="brand-feature">
              <i class="el-icon-time"></i>
              <span>时光胶囊</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧卡片 -->
      <div class="login-card">
        <div class="card-glow"></div>
        
        <!-- 标题 -->
        <div class="login-header">
          <div class="header-icon">
            <i class="el-icon-user-solid"></i>
          </div>
          <h2>{{ activeTab === 'login' ? '欢迎回来' : '加入我们' }}</h2>
          <p>{{ activeTab === 'login' ? '登录以开启你的时空之旅' : '注册一个账号，开始记录时光' }}</p>
        </div>

        <!-- Tab 切换 -->
        <div class="login-tabs">
          <span
            :class="['tab-item', { active: activeTab === 'login' }]"
            @click="activeTab = 'login'"
          >
            <i class="el-icon-key"></i> 登录
          </span>
          <span
            :class="['tab-item', { active: activeTab === 'register' }]"
            @click="activeTab = 'register'"
          >
            <i class="el-icon-circle-plus"></i> 注册
          </span>
        </div>

        <!-- 登录表单 -->
        <el-form
          v-show="activeTab === 'login'"
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          label-position="top"
          class="auth-form"
          @submit.native.prevent="handleLogin"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
              clearable
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              class="submit-btn"
              @click="handleLogin"
            >
              <i class="el-icon-right"></i> 登录
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 注册表单 -->
        <el-form
          v-show="activeTab === 'register'"
          ref="registerForm"
          :model="registerForm"
          :rules="registerRules"
          label-position="top"
          class="auth-form"
          @submit.native.prevent="handleRegister"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
              clearable
            />
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input
              v-model="registerForm.nickname"
              placeholder="请输入昵称"
              prefix-icon="el-icon-s-custom"
              clearable
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              prefix-icon="el-icon-lock"
              show-password
            />
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="registerForm.gender">
              <el-radio label="male">男</el-radio>
              <el-radio label="female">女</el-radio>
              <el-radio label="secret">保密</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              class="submit-btn"
              @click="handleRegister"
            >
              <i class="el-icon-right"></i> 注册
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 底部 -->
        <div class="login-footer">
          <p>© 2026 时空回廊 · 用时间治愈时间</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'LoginPage',
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    return {
      activeTab: 'login',
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        gender: 'secret'
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 4, max: 30, message: '密码长度在 4 到 30 个字符', trigger: 'blur' }
        ]
      },
      registerRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 1, max: 20, message: '昵称长度在 1 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 4, max: 30, message: '密码长度在 4 到 30 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    if (this.$store.getters['auth/isLoggedIn']) {
      this.$router.replace('/')
      return
    }
  },
  computed: {
    loading() {
      return this.$store.state.auth.loading
    }
  },
  methods: {
    ...mapActions('auth', ['login', 'register']),
    particleStyle(n) {
      const size = Math.random() * 3 + 1;
      const left = Math.random() * 100;
      const delay = Math.random() * 10;
      const duration = Math.random() * 8 + 6;
      return {
        width: size + 'px',
        height: size + 'px',
        left: left + '%',
        animationDelay: delay + 's',
        animationDuration: duration + 's'
      };
    },
    async handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (!valid) return
        const result = await this.login({
          username: this.loginForm.username,
          password: this.loginForm.password
        })
        if (result.success) {
          this.$message.success(result.message || '登录成功，欢迎回来！')
          const redirect = this.$route.query.redirect
          this.$router.push(redirect || '/')
        } else {
          // 判断是否是用户不存在的情况
          this.$confirm(result.message || '登录失败', '提示', {
            confirmButtonText: '去注册',
            cancelButtonText: '重新输入',
            type: 'warning'
          }).then(() => {
            this.activeTab = 'register'
            this.registerForm.username = this.loginForm.username
          }).catch(() => {})
        }
      })
    },
    async handleRegister() {
      this.$refs.registerForm.validate(async valid => {
        if (!valid) return
        const result = await this.register({
          username: this.registerForm.username,
          password: this.registerForm.password,
          nickname: this.registerForm.nickname,
          gender: this.registerForm.gender
        })
        if (result.success) {
          this.$message.success(result.message || '注册成功，请登录')
          this.activeTab = 'login'
          this.loginForm.username = this.registerForm.username
          this.loginForm.password = ''
          this.$refs.registerForm.resetFields()
        } else {
          this.$message.error(result.message || '注册失败')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/assets/styles/variables.less';

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: @primary-dark;
}

.login-bg {
  position: absolute;
  inset: 0;
  z-index: 0;

  .bg-gradient {
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(ellipse at 20% 50%, rgba(45, 90, 135, 0.3) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(212, 165, 116, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 80%, rgba(232, 155, 108, 0.1) 0%, transparent 50%),
      linear-gradient(135deg, @primary-dark 0%, @primary-color 50%, @primary-light 100%);
  }

  .bg-particles {
    position: absolute;
    inset: 0;

    .particle {
      position: absolute;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      animation: particleFloat linear infinite;
    }
  }
}

@keyframes particleFloat {
  0% { transform: translateY(100vh) scale(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100px) scale(1); opacity: 0; }
}

.login-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 60px;
  max-width: 960px;
  width: 100%;
  padding: 40px 20px;
}

// 品牌区域
.brand-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-content {
  text-align: center;
  color: #fff;

  .brand-logo {
    width: 72px;
    height: 72px;
    background: @gradient-warm;
    border-radius: @radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    box-shadow: @shadow-accent-lg;
    animation: fadeInUp 0.6s ease-out;

    .brand-icon {
      font-size: 36px;
    }
  }

  .brand-title {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: 4px;
    animation: fadeInUp 0.6s ease-out 0.1s both;
  }

  .brand-slogan {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 6px;
    text-transform: uppercase;
    margin-bottom: 24px;
    animation: fadeInUp 0.6s ease-out 0.2s both;
  }

  .brand-divider {
    width: 40px;
    height: 2px;
    background: @gradient-warm;
    margin: 0 auto 24px;
    border-radius: 1px;
    animation: fadeInUp 0.6s ease-out 0.25s both;
  }

  .brand-desc {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.8;
    margin-bottom: 32px;
    animation: fadeInUp 0.6s ease-out 0.3s both;
  }

  .brand-features {
    display: flex;
    justify-content: center;
    gap: 24px;
    animation: fadeInUp 0.6s ease-out 0.4s both;

    .brand-feature {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: @radius-md;
      transition: @transition-base;

      &:hover {
        background: rgba(255, 255, 255, 0.12);
        transform: translateY(-2px);
      }

      i {
        font-size: 20px;
        color: @accent-light;
      }

      span {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}

// 登录卡片
.login-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: @radius-xl;
  padding: 40px 36px 28px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fadeInUp 0.6s ease-out 0.2s both;
  overflow: hidden;

  .card-glow {
    position: absolute;
    top: -100px;
    right: -100px;
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(232, 155, 108, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 28px;

  .header-icon {
    width: 56px;
    height: 56px;
    background: @gradient-warm;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    box-shadow: @shadow-accent;

    i {
      font-size: 24px;
      color: #fff;
    }
  }

  h2 {
    font-size: 24px;
    color: @text-color-deep;
    font-weight: 700;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: @text-secondary;
  }
}

.login-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
  background: @bg-color-warm;
  padding: 4px;
  border-radius: @radius-md;

  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
    color: @text-secondary;
    padding: 10px 16px;
    border-radius: @radius-sm;
    cursor: pointer;
    transition: @transition-base;
    user-select: none;

    i {
      font-size: 14px;
    }

    &.active {
      color: #fff;
      background: @gradient-warm;
      box-shadow: @shadow-sm;
      font-weight: 600;
    }

    &:hover:not(.active) {
      color: @accent-color;
      background: rgba(232, 155, 108, 0.06);
    }
  }
}

.auth-form {
  /deep/ .el-form-item__label {
    font-size: 13px;
    color: @text-color;
    font-weight: 500;
    padding-bottom: 6px;
  }

  /deep/ .el-input__inner {
    border-radius: @radius-md;
    height: 44px;
    line-height: 44px;
    border-color: @border-color;
    transition: @transition-base;

    &:focus {
      border-color: @accent-color;
      box-shadow: 0 0 0 3px rgba(232, 155, 108, 0.1);
    }
  }

  /deep/ .el-input__prefix {
    left: 14px;
    color: @text-muted;
  }

  /deep/ .el-input--prefix .el-input__inner {
    padding-left: 40px;
  }
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: @radius-md;
  background: @gradient-warm;
  border: none;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: @shadow-accent;
  transition: @transition-base;
  margin-top: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: @shadow-accent-lg;
  }

  &:active {
    transform: translateY(0);
  }

  i {
    margin-right: 4px;
  }
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid @border-color-light;

  p {
    font-size: 12px;
    color: @text-muted;
  }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

// 响应式
@media (max-width: @screen-md) {
  .login-wrapper {
    flex-direction: column;
    gap: 0;
  }

  .brand-section {
    display: none;
  }

  .login-card {
    max-width: 400px;
  }
}

@media (max-width: @screen-xs) {
  .login-card {
    padding: 28px 24px 20px;
    border-radius: @radius-lg;
  }

  .login-header h2 {
    font-size: 22px;
  }

  .brand-section {
    display: none !important;
  }
}
</style>
