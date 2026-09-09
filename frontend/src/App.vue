<template>
  <div id="app" :class="{ 'dark-mode': darkMode }">
    <Header v-if="!$route.meta.hideHeader" />
    <main class="main-content" :class="{ 'no-header': $route.meta.hideHeader }">
      <transition name="page" mode="out-in">
        <router-view />
      </transition>
    </main>
    <Footer v-if="!$route.meta.hideHeader" />
    <BackToTop />
    <BgmPlayer />
  </div>
</template>

<script>
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
import BackToTop from '@/components/common/BackToTop.vue'
import BgmPlayer from '@/components/common/BgmPlayer.vue'
import { mapState } from 'vuex'

export default {
  name: 'App',
  components: { Header, Footer, BackToTop, BgmPlayer },
  computed: {
    ...mapState('settings', ['darkMode'])
  },
  created() {
    // 不需要登录的模块直接初始化
    this.$store.dispatch('wall/initData')
    this.$store.dispatch('stats/initStats')
    this.$store.dispatch('badges/initData')
  }
}
</script>

<style lang="less">
@import '~@/assets/styles/variables.less';
#app { 
  min-height: 100vh; 
  display: flex; 
  flex-direction: column; 
  background-color: @bg-color; 
  color: @text-color; 
  transition: background-color 0.4s ease, color 0.4s ease; 
}

#app.dark-mode { 
  background-color: @dark-bg-color; 
  color: @dark-text-color; 
}

.main-content { 
  flex: 1; 
  padding-top: @header-height; 
}

.main-content.no-header { 
  padding-top: 0; 
}

// 页面过渡动画
.page-enter-active, 
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter {
  opacity: 0;
  transform: translateY(12px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.page-enter-to,
.page-leave {
  opacity: 1;
  transform: translateY(0);
}
</style>
