<template>
  <div class="bgm-player">
    <!-- 上一首 -->
    <button
      class="bgm-btn bgm-btn-small"
      v-if="isPlaying"
      aria-label="上一首"
      title="上一首"
      @click="prevTrack"
    >
      <span class="note-icon">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
        </svg>
      </span>
    </button>

    <!-- 播放/暂停主按钮 -->
    <button
      class="bgm-btn"
      :class="{ 'is-playing': isPlaying, 'is-fading': isFading }"
      aria-label="背景音乐"
      @click="togglePlay"
      @contextmenu.prevent="nextTrack"
      :title="isPlaying ? '右键切换下一首' : '点击播放'"
    >
      <span class="note-icon">
        <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
        </svg>
      </span>
    </button>

    <!-- 下一首 -->
    <button
      class="bgm-btn bgm-btn-small"
      v-if="isPlaying"
      aria-label="下一首"
      title="下一首"
      @click="nextTrack"
    >
      <span class="note-icon">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
        </svg>
      </span>
    </button>

    <!-- 歌曲名 -->
    <transition name="bgm-fade">
      <span v-show="isPlaying" class="bgm-song-name" @click="nextTrack" title="点击切换下一首">
        {{ currentTrack.name }}
      </span>
    </transition>

    <!-- 两个 audio 元素用于交叉淡入淡出 -->
    <audio ref="audioA" :src="tracks[0].src" preload="auto" @ended="handleEnded" />
    <audio ref="audioB" :src="tracks[0].src" preload="auto" @ended="handleEnded" />
  </div>
</template>

<script>
/**
 * BGM 播放器
 * - 自动播放：页面加载后尝试自动播放，被浏览器拦截时会在用户首次交互后自动开始
 * - 支持多首歌曲列表，自动循环播放
 * - 切歌时交叉淡入淡出（1.5秒过渡），不会突兀
 * - 点击主按钮播放/暂停，左右小按钮切歌
 * - 播放状态保存在 localStorage，刷新页面后保持
 * - 后续加歌只需在 tracks 数组中新增一项 { name, src } 即可
 */

import storage from '@/utils/storage'

// 歌曲列表 —— 新增歌曲只需在这里加一项
const tracks = [
  { name: 'Merry Christmas Mr. Lawrence - 坂本龍一', src: '/bgm.mp3' },
  { name: 'Reach Me - Luv Letter(钢琴版)', src: '/bgm-2.mp3' }
  // 新歌示例: { name: '歌曲名 - 艺术家', src: '/bgm-3.mp3' }
]

const FADE_DURATION = 1500  // 淡入淡出时长（毫秒）
const FADE_STEP = 100       // 每步间隔
const FADE_AMOUNT = 1 / (FADE_DURATION / FADE_STEP)
const BGM_STATE_KEY = 'tc_bgm_state' // localStorage 存储 key

export default {
  name: 'BgmPlayer',

  data() {
    return {
      isPlaying: false,
      isFading: false,
      currentIndex: 0,
      activeAudio: 'A',  // 当前正在播放的是 A 还是 B
      fadeTimer: null,
      hasAutoPlayed: false,  // 是否已尝试过自动播放
      interactionHandler: null // 首次交互监听器引用
    }
  },

  computed: {
    tracks() {
      return tracks
    },
    currentTrack() {
      return tracks[this.currentIndex]
    },
    activeAudioEl() {
      return this.activeAudio === 'A' ? this.$refs.audioA : this.$refs.audioB
    },
    standbyAudioEl() {
      return this.activeAudio === 'A' ? this.$refs.audioB : this.$refs.audioA
    }
  },

  mounted() {
    if (this.$refs.audioA) this.$refs.audioA.volume = 0
    if (this.$refs.audioB) this.$refs.audioB.volume = 0

    // 读取上次播放进度和歌曲索引
    const savedState = storage.get(BGM_STATE_KEY, null)
    if (savedState && typeof savedState.currentIndex === 'number') {
      this.currentIndex = savedState.currentIndex % tracks.length
    }

    // 尝试自动播放
    this.tryAutoPlay()
  },

  beforeDestroy() {
    this.clearFadeTimer()
    this.removeInteractionListener()
    if (this.$refs.audioA) this.$refs.audioA.pause()
    if (this.$refs.audioB) this.$refs.audioB.pause()
    // 保存状态
    this.saveState()
  },

  methods: {
    /**
     * 尝试自动播放
     * 先直接尝试播放，如果被浏览器拦截（自动播放策略），
     * 则监听用户首次交互事件，等用户点击页面后自动开始播放
     */
    tryAutoPlay() {
      if (this.hasAutoPlayed) return

      const audio = this.activeAudioEl
      if (!audio) return

      audio.src = this.currentTrack.src
      audio.loop = false
      audio.volume = 0

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // 自动播放成功
          this.isPlaying = true
          this.hasAutoPlayed = true
          this.fadeIn(audio)
        }).catch(() => {
          // 被浏览器拦截了，等用户首次交互后再播
          this.hasAutoPlayed = false
          this.listenForFirstInteraction()
        })
      } else {
        this.listenForFirstInteraction()
      }
    },

    /**
     * 监听用户首次交互（点击、触摸、按键），触发后自动开始播放
     */
    listenForFirstInteraction() {
      if (this.interactionHandler) return

      this.interactionHandler = () => {
        if (this.hasAutoPlayed) return
        this.hasAutoPlayed = true
        this.removeInteractionListener()
        // 用户有交互了，可以播放了
        this.playCurrent()
      }

      // 监听多种交互事件，只触发一次
      document.addEventListener('click', this.interactionHandler, { once: true, passive: true })
      document.addEventListener('touchstart', this.interactionHandler, { once: true, passive: true })
      document.addEventListener('keydown', this.interactionHandler, { once: true, passive: true })
    },

    removeInteractionListener() {
      if (this.interactionHandler) {
        document.removeEventListener('click', this.interactionHandler)
        document.removeEventListener('touchstart', this.interactionHandler)
        document.removeEventListener('keydown', this.interactionHandler)
        this.interactionHandler = null
      }
    },

    togglePlay() {
      if (this.isPlaying) {
        if (this.isFading) return
        this.pauseCurrent()
      } else {
        this.playCurrent()
      }
    },

    playCurrent() {
      const audio = this.activeAudioEl
      if (!audio) return
      audio.src = this.currentTrack.src
      audio.loop = false
      audio.volume = 0

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true
          this.hasAutoPlayed = true
          this.fadeIn(audio)
          this.saveState()
        }).catch(() => {})
      }
    },

    pauseCurrent() {
      const audio = this.activeAudioEl
      if (!audio) return
      this.clearFadeTimer()
      // 快速淡出（0.5秒）
      this.fadeOut(audio, 500, () => {
        audio.pause()
        this.isPlaying = false
        this.saveState()
      })
    },

    // 上一首
    prevTrack() {
      if (this.isFading) return
      this.isFading = true

      const oldAudio = this.activeAudioEl
      const newAudio = this.standbyAudioEl

      // 切换到上一首
      this.currentIndex = (this.currentIndex - 1 + tracks.length) % tracks.length
      newAudio.src = this.currentTrack.src
      newAudio.loop = false
      newAudio.volume = 0

      const playPromise = newAudio.play()
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.fadeOut(oldAudio, FADE_DURATION)
          this.fadeIn(newAudio)

          setTimeout(() => {
            oldAudio.pause()
            oldAudio.volume = 0
            this.activeAudio = this.activeAudio === 'A' ? 'B' : 'A'
            this.isFading = false
            this.saveState()
          }, FADE_DURATION)
        }).catch(() => {
          this.isFading = false
        })
      } else {
        this.isFading = false
      }
    },

    // 下一首
    nextTrack() {
      if (this.isFading) return
      this.isFading = true

      const oldAudio = this.activeAudioEl
      const newAudio = this.standbyAudioEl

      // 切换到下一首
      this.currentIndex = (this.currentIndex + 1) % tracks.length
      newAudio.src = this.currentTrack.src
      newAudio.loop = false
      newAudio.volume = 0

      const playPromise = newAudio.play()
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.fadeOut(oldAudio, FADE_DURATION)
          this.fadeIn(newAudio)

          setTimeout(() => {
            oldAudio.pause()
            oldAudio.volume = 0
            this.activeAudio = this.activeAudio === 'A' ? 'B' : 'A'
            this.isFading = false
            this.saveState()
          }, FADE_DURATION)
        }).catch(() => {
          this.isFading = false
        })
      } else {
        this.isFading = false
      }
    },

    handleEnded() {
      if (!this.isFading) {
        this.nextTrack()
      }
    },

    fadeIn(audio) {
      this.clearFadeTimer()
      const step = () => {
        if (audio.volume < 0.6) {
          audio.volume = Math.min(0.6, audio.volume + FADE_AMOUNT * 0.6)
          this.fadeTimer = setTimeout(step, FADE_STEP)
        } else {
          audio.volume = 0.6
        }
      }
      step()
    },

    fadeOut(audio, duration, callback) {
      const steps = duration / FADE_STEP
      const amount = 0.6 / steps
      let current = audio.volume

      const tick = () => {
        current = Math.max(0, current - amount)
        audio.volume = current
        if (current > 0) {
          setTimeout(tick, FADE_STEP)
        } else {
          audio.volume = 0
          if (callback) callback()
        }
      }
      tick()
    },

    clearFadeTimer() {
      if (this.fadeTimer) {
        clearTimeout(this.fadeTimer)
        this.fadeTimer = null
      }
    },

    // 保存播放状态到 localStorage
    saveState() {
      storage.set(BGM_STATE_KEY, {
        currentIndex: this.currentIndex,
        isPlaying: this.isPlaying
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/assets/styles/variables.less';

.bgm-player {
  position: fixed;
  left: @spacing-xl;
  bottom: @spacing-xl;
  z-index: @z-fixed;
  display: flex;
  align-items: center;
  gap: @spacing-8;
}

.bgm-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid @glass-border;
  background: @glass-bg;
  backdrop-filter: @glass-blur;
  -webkit-backdrop-filter: @glass-blur;
  box-shadow: @shadow-sm, 0 0 0 0 @accent-glow;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: @transition-base;
  outline: none;
  padding: 0;

  .note-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: @accent-color;
    transition: @transition-base;
  }

  &:hover {
    transform: scale(1.15);
    box-shadow: @shadow-md, 0 0 16px @accent-glow;
    background: rgba(255, 255, 255, 0.9);
    border-color: @accent-light;

    .note-icon {
      color: @secondary-color;
    }
  }

  &:active {
    transform: scale(1.05);
  }

  &.is-playing {
    border-color: rgba(232, 155, 108, 0.4);
    box-shadow: @shadow-md, 0 0 20px @accent-glow;
  }

  &.is-fading {
    .note-icon {
      animation: note-pulse 0.8s ease-in-out infinite;
    }
  }

  // 小按钮（上一首/下一首）
  &.bgm-btn-small {
    width: 30px;
    height: 30px;
    opacity: 0;
    transform: translateX(8px) scale(0.8);
    pointer-events: none;

    &:hover {
      transform: scale(1.1);
    }
  }
}

// 播放时显示上下首按钮
.bgm-player:hover .bgm-btn-small,
.bgm-btn-small.is-visible {
  opacity: 1;
  transform: translateX(0) scale(1);
  pointer-events: auto;
}

.bgm-song-name {
  font-size: 12px;
  color: @text-secondary;
  white-space: nowrap;
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-width 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease;
  pointer-events: none;
  font-family: @font-family-en, @font-family-cn;
  letter-spacing: 0.5px;
  cursor: pointer;

  &:hover {
    color: @accent-color;
  }
}

.bgm-fade-enter-active,
.bgm-fade-leave-active {
  transition: opacity 0.4s ease, max-width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.bgm-fade-enter-to,
.bgm-fade-leave {
  max-width: 260px;
  opacity: 1;
}

.bgm-fade-enter,
.bgm-fade-leave-to {
  max-width: 0;
  opacity: 0;
}

@keyframes note-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.85); opacity: 0.6; }
}

// 暗色模式适配
#app.dark-mode {
  .bgm-btn {
    background: @glass-bg-dark;
    border-color: @glass-border-dark;
    box-shadow: @shadow-dark-sm, 0 0 0 0 @accent-glow;

    .note-icon {
      color: @accent-light;
    }

    &:hover {
      background: rgba(26, 35, 50, 0.9);
      border-color: rgba(232, 155, 108, 0.3);
    }

    &.is-playing {
      border-color: rgba(232, 155, 108, 0.25);
    }
  }

  .bgm-song-name {
    color: @dark-text-secondary;
  }
}

// 响应式
@media (max-width: 768px) {
  .bgm-player {
    left: @spacing-md;
    bottom: @spacing-md;
  }
}
</style>
