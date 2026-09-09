<template>
  <div class="admin-page">
    <div class="container">
      <h1 class="page-title">⚙️ 后台管理</h1>
      <p class="page-subtitle">系统管理与数据概览</p>

      <!-- 无权访问 -->
      <div v-if="!isAdmin" class="card no-permission">
        <div class="permission-icon">
          <i class="el-icon-warning-outline"></i>
        </div>
        <h2>无权访问</h2>
        <p>您不是管理员，无法访问此页面。</p>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </div>

      <!-- 管理内容 -->
      <template v-else>
        <el-tabs v-model="activeTab" type="border-card" class="admin-tabs">
          <!-- 统计数据 -->
          <el-tab-pane label="数据统计" name="stats">
            <div class="stats-grid" v-if="stats">
              <div class="stat-card card" v-for="s in statCards" :key="s.label">
                <div class="stat-icon">{{ s.icon }}</div>
                <div class="stat-value">{{ s.value }}</div>
                <div class="stat-label">{{ s.label }}</div>
              </div>
            </div>
            <div v-else class="loading-placeholder">
              <i class="el-icon-loading"></i> 加载中...
            </div>
          </el-tab-pane>

          <!-- 用户管理 -->
          <el-tab-pane label="用户管理" name="users">
            <div class="tab-header">
              <el-input
                v-model="userKeyword"
                placeholder="搜索用户名/昵称"
                prefix-icon="el-icon-search"
                clearable
                style="width: 260px;"
                @clear="loadUsers"
                @keyup.enter.native="loadUsers"
              />
              <el-button type="primary" icon="el-icon-refresh" @click="loadUsers">刷新</el-button>
            </div>
            <el-table :data="userList" v-loading="userLoading" stripe style="width: 100%">
              <el-table-column prop="id" label="ID" width="60" />
              <el-table-column prop="username" label="用户名" width="140" />
              <el-table-column prop="nickname" label="昵称" width="140" />
              <el-table-column prop="role" label="角色" width="120">
                <template slot-scope="{ row }">
                  <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">
                    {{ row.role === 'admin' ? '管理员' : '普通用户' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="注册时间" width="180">
                <template slot-scope="{ row }">
                  {{ formatDate(row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="180">
                <template slot-scope="{ row }">
                  <el-button
                    type="text"
                    size="small"
                    @click="toggleRole(row)"
                  >
                    {{ row.role === 'admin' ? '设为普通用户' : '设为管理员' }}
                  </el-button>
                  <el-button
                    type="text"
                    size="small"
                    style="color: #e07070;"
                    @click="deleteUser(row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-wrap" v-if="userTotal > userPageSize">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="userTotal"
                :page-size="userPageSize"
                :current-page.sync="userPage"
                @current-change="loadUsers"
              />
            </div>
          </el-tab-pane>

          <!-- 信件管理 -->
          <el-tab-pane label="信件管理" name="letters">
            <div class="tab-header">
              <el-button type="primary" icon="el-icon-refresh" @click="loadLetters">刷新</el-button>
            </div>
            <el-table :data="letterList" v-loading="letterLoading" stripe style="width: 100%">
              <el-table-column prop="id" label="ID" width="60" />
              <el-table-column prop="username" label="作者" width="120" />
              <el-table-column prop="nickname" label="昵称" width="120" />
              <el-table-column prop="recipient" label="收信人" min-width="120" show-overflow-tooltip />
              <el-table-column prop="is_public" label="公开" width="80">
                <template slot-scope="{ row }">
                  <el-tag :type="row.is_public ? 'success' : 'info'" size="mini">
                    {{ row.is_public ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="创建时间" width="180">
                <template slot-scope="{ row }">
                  {{ formatDate(row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template slot-scope="{ row }">
                  <el-button
                    type="text"
                    size="small"
                    style="color: #e07070;"
                    @click="deleteLetter(row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-wrap" v-if="letterTotal > letterPageSize">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="letterTotal"
                :page-size="letterPageSize"
                :current-page.sync="letterPage"
                @current-change="loadLetters"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { adminApi } from '@/api'

export default {
  name: 'AdminPage',
  data() {
    return {
      activeTab: 'stats',
      // 统计
      stats: null,
      // 用户管理
      userList: [],
      userLoading: false,
      userKeyword: '',
      userPage: 1,
      userPageSize: 20,
      userTotal: 0,
      // 信件管理
      letterList: [],
      letterLoading: false,
      letterPage: 1,
      letterPageSize: 20,
      letterTotal: 0
    }
  },
  computed: {
    ...mapGetters('auth', ['isAdmin']),
    statCards() {
      if (!this.stats) return []
      return [
        { icon: '👥', label: '用户总数', value: this.stats.userCount },
        { icon: '✉️', label: '信件总数', value: this.stats.letterCount },
        { icon: '📖', label: '公开信件', value: this.stats.publicLetterCount },
        { icon: '🌳', label: '树洞消息', value: this.stats.treeholeCount },
        { icon: '⏳', label: '时光胶囊', value: this.stats.capsuleCount },
        { icon: '💬', label: '留言墙', value: this.stats.wallCount },
        { icon: '📅', label: '打卡记录', value: this.stats.challengeCount }
      ]
    }
  },
  mounted() {
    if (this.isAdmin) {
      this.loadStats()
    }
  },
  methods: {
    formatDate(str) {
      if (!str) return ''
      return str.replace('T', ' ').substring(0, 19)
    },

    // 加载统计数据
    async loadStats() {
      try {
        this.stats = await adminApi.getStats()
      } catch (err) {
        this.$message.error('获取统计数据失败: ' + (err.message || '未知错误'))
      }
    },

    // 加载用户列表
    async loadUsers() {
      this.userLoading = true
      try {
        const data = await adminApi.getUsers({
          page: this.userPage,
          size: this.userPageSize,
          keyword: this.userKeyword
        })
        this.userList = data.list || []
        this.userTotal = data.total || 0
      } catch (err) {
        this.$message.error('获取用户列表失败: ' + (err.message || '未知错误'))
      } finally {
        this.userLoading = false
      }
    },

    // 切换用户角色
    toggleRole(row) {
      const newRole = row.role === 'admin' ? 'user' : 'admin'
      const action = newRole === 'admin' ? '设为管理员' : '设为普通用户'
      this.$confirm(`确定将用户 "${row.username}" ${action}吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await adminApi.changeUserRole(row.id, { role: newRole })
          this.$message.success('修改成功')
          this.loadUsers()
        } catch (err) {
          this.$message.error('修改失败: ' + (err.message || '未知错误'))
        }
      }).catch(() => {})
    },

    // 删除用户
    deleteUser(row) {
      this.$confirm(`确定删除用户 "${row.username}" 吗？此操作不可恢复。`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await adminApi.deleteUser(row.id)
          this.$message.success('删除成功')
          this.loadUsers()
        } catch (err) {
          this.$message.error('删除失败: ' + (err.message || '未知错误'))
        }
      }).catch(() => {})
    },

    // 加载信件列表
    async loadLetters() {
      this.letterLoading = true
      try {
        const data = await adminApi.getAllLetters({
          page: this.letterPage,
          size: this.letterPageSize
        })
        this.letterList = data.list || []
        this.letterTotal = data.total || 0
      } catch (err) {
        this.$message.error('获取信件列表失败: ' + (err.message || '未知错误'))
      } finally {
        this.letterLoading = false
      }
    },

    // 删除信件
    deleteLetter(row) {
      this.$confirm(`确定删除信件 "${row.recipient || '未知收信人'}" 吗？此操作不可恢复。`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await adminApi.deleteLetter(row.id)
          this.$message.success('删除成功')
          this.loadLetters()
        } catch (err) {
          this.$message.error('删除失败: ' + (err.message || '未知错误'))
        }
      }).catch(() => {})
    }
  },
  watch: {
    activeTab(val) {
      if (val === 'users' && this.userList.length === 0) {
        this.loadUsers()
      }
      if (val === 'letters' && this.letterList.length === 0) {
        this.loadLetters()
      }
      if (val === 'stats') {
        this.loadStats()
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/assets/styles/variables.less';

.admin-page {
  padding-bottom: @spacing-48;
}

.page-title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: @text-color-deep;
  margin-bottom: @spacing-8;
}

.page-subtitle {
  text-align: center;
  font-size: 15px;
  color: @text-secondary;
  margin-bottom: @spacing-32;
}

// 无权访问
.no-permission {
  text-align: center;
  padding: @spacing-48 @spacing-24;

  .permission-icon {
    font-size: 64px;
    color: @warning-color;
    margin-bottom: @spacing-24;
  }

  h2 {
    font-size: 22px;
    color: @text-color-deep;
    margin-bottom: @spacing-12;
  }

  p {
    font-size: 15px;
    color: @text-secondary;
    margin-bottom: @spacing-24;
  }
}

// 管理标签页
.admin-tabs {
  border-radius: @radius-md;
  overflow: hidden;

  /deep/ .el-tabs__header {
    background: @gradient-warm;

    .el-tabs__item {
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
      border-color: transparent;

      &.is-active {
        color: #fff;
        background: rgba(255, 255, 255, 0.15);
        border-radius: @radius-sm @radius-sm 0 0;
      }

      &:hover {
        color: #fff;
      }
    }
  }
}

// 统计卡片
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: @spacing-16;
  padding: @spacing-24 0;
}

.stat-card {
  text-align: center;
  padding: @spacing-24 @spacing-16;

  .stat-icon {
    font-size: 32px;
    margin-bottom: @spacing-12;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: @accent-color;
    margin-bottom: @spacing-6;
  }

  .stat-label {
    font-size: 13px;
    color: @text-secondary;
  }
}

// Tab 内头部
.tab-header {
  display: flex;
  align-items: center;
  gap: @spacing-12;
  margin-bottom: @spacing-16;
}

// 表格
.el-table {
  border-radius: @radius-sm;
}

// 分页
.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: @spacing-20 0;
}

// 加载占位
.loading-placeholder {
  text-align: center;
  padding: @spacing-48;
  font-size: 15px;
  color: @text-muted;

  i {
    margin-right: @spacing-8;
  }
}
</style>
