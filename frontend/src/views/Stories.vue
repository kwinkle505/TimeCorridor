<template>
  <div class="stories-page">
    <!-- 页面标题 + 统计条 -->
    <div class="page-header">
      <h1>故事墙</h1>
      <p>这里收藏着来自不同时空的温暖与力量</p>
      <div class="header-stats">
        <span class="stat-item">
          <i class="el-icon-reading"></i>
          共 {{ totalCount }} 个故事
        </span>
        <span class="stat-item">
          <i class="el-icon-star-on"></i>
          累计 {{ totalLikes }} 次共鸣
        </span>
      </div>
    </div>

    <div class="page-content">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <!-- 情绪标签筛选（按 letter.moods 数组包含关系） -->
        <div class="filter-group">
          <span class="filter-label">情绪：</span>
          <el-radio-group v-model="filterMood" size="small">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button
              v-for="mood in moodOptions"
              :key="mood"
              :label="mood"
            >
              {{ mood }}
            </el-radio-button>
          </el-radio-group>
        </div>

        <!-- 排序 -->
        <div class="filter-group">
          <span class="filter-label">排序：</span>
          <el-radio-group v-model="sortBy" size="small">
            <el-radio-button label="newest">最新</el-radio-button>
            <el-radio-button label="hottest">最热</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 搜索框 -->
        <div class="filter-search">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索信件内容..."
            prefix-icon="el-icon-search"
            size="small"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
      </div>

      <!-- 故事卡片网格（prop 名为 :letter，事件为 @resonate） -->
      <div v-if="paginatedStories.length > 0" class="stories-grid">
        <story-card
          v-for="item in paginatedStories"
          :key="item.id"
          :letter="item"
          @resonate="handleResonate"
          @view="handleView"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <i class="el-icon-reading"></i>
        <p>暂无符合条件的故事</p>
        <el-button type="primary" @click="resetFilters">清除筛选</el-button>
      </div>

      <!-- 分页 -->
      <div v-if="filteredStories.length > 0" class="pagination-wrapper">
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="filteredStories.length"
          :page-size="pageSize"
          :current-page.sync="currentPage"
          @current-change="handlePageChange"
        />
      </div>

      <!-- 我也要写信按钮 -->
      <div class="action-area">
        <el-button
          type="primary"
          size="large"
          class="btn-write"
          @click="$router.push('/write')"
        >
          <i class="el-icon-edit"></i> 我也要写信
        </el-button>
      </div>

      <!-- 详情弹窗 -->
      <el-dialog :visible.sync="detailVisible" :title="detailLetter ? detailLetter.salutation : ''" width="640px" top="8vh" custom-class="detail-dialog">
        <div v-if="detailLetter" class="detail-content">
          <div class="detail-meta">
            <span>收信人：{{ detailLetter.recipient }}</span>
            <span>日期：{{ detailLetter.writeDate }}</span>
            <span v-if="detailLetter.moods">情绪：{{ detailLetter.moods.join('、') }}</span>
          </div>
          <div class="detail-section">
            <h4>📝 原信</h4>
            <p>{{ detailLetter.content }}</p>
          </div>
          <div class="detail-section" v-if="detailLetter.reply">
            <h4>💌 回信</h4>
            <p>{{ detailLetter.reply }}</p>
          </div>
          <div class="detail-actions" v-if="canDelete(detailLetter)">
            <el-button type="danger" size="small" plain @click="handleDelete(detailLetter.id)">
              <i class="el-icon-delete"></i> 删除我的故事
            </el-button>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import StoryCard from '@/components/letter/StoryCard.vue'

export default {
  name: 'StoriesPage',
  components: {
    StoryCard
  },
  data() {
    return {
      // 情绪筛选选项
      moodOptions: ['迷茫', '期待', '遗憾', '感恩', '焦虑', '幸福', '思念', '勇敢'],
      // 当前选中的情绪筛选
      filterMood: '',
      // 排序方式
      sortBy: 'newest',
      // 搜索关键词
      searchKeyword: '',
      // 当前页码
      currentPage: 1,
      // 每页条数
      pageSize: 12,
      // 详情弹窗
      detailVisible: false,
      detailLetter: null
    }
  },
  mounted() {
    this.$store.dispatch('letter/fetchPublicLetters')
  },
  computed: {
    // 从 Vuex letter 模块读取公开信件数据
    ...mapState('letter', ['publicLetters']),
    ...mapGetters('auth', ['isLoggedIn']),

    /**
     * 总故事数（公开信件数量）
     */
    totalCount() {
      return this.publicLetters.length
    },

    /**
     * 累计共鸣数
     */
    totalLikes() {
      return this.publicLetters.reduce(function (sum, item) {
        return sum + (item.likes || 0)
      }, 0)
    },

    /**
     * 筛选后的信件列表
     * 按情绪标签（moods 数组包含关系）、搜索关键词、排序
     */
    filteredStories() {
      var result = this.publicLetters.slice()

      // 情绪筛选：letter.moods 数组中是否包含选中的情绪
      if (this.filterMood) {
        var mood = this.filterMood
        result = result.filter(function (item) {
          return Array.isArray(item.moods) && item.moods.indexOf(mood) > -1
        })
      }

      // 搜索筛选：按信件正文内容搜索
      if (this.searchKeyword.trim()) {
        var keyword = this.searchKeyword.trim().toLowerCase()
        result = result.filter(function (item) {
          return item.content && item.content.toLowerCase().indexOf(keyword) > -1
        })
      }

      // 排序
      if (this.sortBy === 'newest') {
        result.sort(function (a, b) {
          return new Date(b.createTime) - new Date(a.createTime)
        })
      } else if (this.sortBy === 'hottest') {
        result.sort(function (a, b) {
          return (b.likes || 0) - (a.likes || 0)
        })
      }

      return result
    },

    /**
     * 分页后的信件列表
     */
    paginatedStories() {
      var start = (this.currentPage - 1) * this.pageSize
      var end = start + this.pageSize
      return this.filteredStories.slice(start, end)
    }
  },
  watch: {
    // 筛选条件变化时重置页码
    filterMood() {
      this.currentPage = 1
    },
    sortBy() {
      this.currentPage = 1
    },
    searchKeyword() {
      this.currentPage = 1
    }
  },
  methods: {
    ...mapActions('letter', ['deleteLetter']),

    /**
     * 搜索
     */
    handleSearch() {
      this.currentPage = 1
    },

    /**
     * 重置所有筛选条件
     */
    resetFilters() {
      this.filterMood = ''
      this.sortBy = 'newest'
      this.searchKeyword = ''
      this.currentPage = 1
    },

    /**
     * 页码变化，滚动到顶部
     */
    handlePageChange(page) {
      this.currentPage = page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    /**
     * 共鸣操作：调用后端 API
     * @param {string} letterId - 信件 ID
     */
    async handleResonate(letterId) {
      var letter = this.publicLetters.find(function (item) {
        return item.id === letterId
      })
      if (!letter) return

      // 未登录提示
      if (!this.isLoggedIn) {
        this.$message.info('登录后才能共鸣哦')
        return
      }

      const result = await this.$store.dispatch('letter/toggleLike', letterId)
      if (result.success) {
        if (result.liked) {
          this.$message.success('已共鸣，感谢你的温暖！')
        } else {
          this.$message.info('已取消共鸣')
        }
      } else {
        this.$message.error(result.message || '操作失败')
      }
    },

    /**
     * 查看信件详情
     * @param {Object} letter - 信件对象
     */
    handleView(letter) {
      this.detailLetter = letter
      this.detailVisible = true
    },

    canDelete(letter) {
      if (!letter) return false
      var user = this.$store.state.auth.user
      if (!user) return false
      if (letter.author) {
        return letter.author === user.username || letter.author === user.nickname
      }
      return true
    },

    handleDelete(id) {
      this.$confirm('确定要删除这个故事吗？删除后不可恢复。', '确认删除', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteLetter(id)
        this.detailVisible = false
        this.detailLetter = null
        this.$message.success('已删除')
      }).catch(function() {})
    }
  }
}
</script>

<style lang="less" scoped>
// 故事墙页面
.stories-page {
  min-height: 100vh;
  background-color: @bg-color;
  padding-bottom: 60px;
}

// 页面头部
.page-header {
  text-align: center;
  padding: 60px 20px 40px;
  background: linear-gradient(135deg, #1A2A3A 0%, #2C3E50 100%);
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
    margin-bottom: 24px;
  }

  .header-stats {
    display: flex;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;

    .stat-item {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;

      i {
        margin-right: 6px;
        color: @secondary-color;
      }
    }
  }
}

// 页面内容区
.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

// 筛选栏
.filter-bar {
  background: @card-bg;
  border-radius: @radius-md;
  padding: 20px 24px;
  margin-bottom: 30px;
  box-shadow: @shadow-card;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;

  .filter-group {
    display: flex;
    align-items: center;
    gap: 8px;

    .filter-label {
      font-size: 14px;
      color: @text-color;
      font-weight: 500;
    }
  }

  .filter-search {
    margin-left: auto;
    width: 240px;

    @media (max-width: 768px) {
      margin-left: 0;
      width: 100%;
    }
  }
}

// 故事卡片网格
.stories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 80px 20px;

  i {
    font-size: 60px;
    color: @info-color;
    margin-bottom: 20px;
    display: block;
  }

  p {
    font-size: 16px;
    color: @text-color;
    opacity: 0.6;
    margin-bottom: 20px;
  }
}

// 分页
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

// 操作区域
.action-area {
  text-align: center;
  padding: 20px 0 40px;

  .btn-write {
    background: linear-gradient(135deg, #E88D5E, #D4926A);
    border: none;
    padding: 16px 40px;
    font-size: 18px;
    border-radius: 30px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(232, 141, 94, 0.4);
    }
  }
}
.detail-content { .detail-meta { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; span { font-size: 13px; color: @text-secondary; } } .detail-section { margin-bottom: 20px; h4 { font-size: 16px; color: @primary-color; margin-bottom: 10px; } p { font-size: 14px; color: @text-color; line-height: 1.8; white-space: pre-wrap; } } .detail-actions { text-align: right; padding-top: 12px; border-top: 1px solid @border-color; } }
</style>