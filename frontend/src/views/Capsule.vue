<template>
  <div class="capsule-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>时光胶囊</h1>
      <p>封存珍贵的记忆，约定未来开启</p>
    </div>

    <div v-if="!currentUser" class="auth-tip">
      <i class="el-icon-lock" style="font-size:48px;color:#D4926A" />
      <h2>需要登录</h2>
      <p>登录后可以封存属于自己的时光胶囊</p>
      <el-button type="primary" @click="$router.push('/login')">去登录</el-button>
    </div>

    <div v-else class="page-content">
      <!-- 创建胶囊表单 -->
      <div class="form-section">
        <div class="section-title">
          <h2>封存新胶囊</h2>
        </div>

        <el-form
          ref="capsuleForm"
          :model="form"
          :rules="rules"
          label-position="top"
          class="capsule-form"
        >
          <!-- 胶囊名称 -->
          <el-form-item label="胶囊名称" prop="name">
            <el-input
              v-model="form.name"
              placeholder="给这个胶囊起个名字..."
              maxlength="30"
              show-word-limit
            />
          </el-form-item>

          <!-- 物品多选 -->
          <el-form-item label="封存物品" prop="items">
            <div class="item-types">
              <el-checkbox-group v-model="form.items">
                <el-checkbox
                  v-for="(item, index) in itemTypes"
                  :key="index"
                  :label="item.key"
                  class="item-checkbox"
                >
                  <span class="item-icon">{{ item.icon }}</span>
                  {{ item.name }}
                </el-checkbox>
              </el-checkbox-group>
            </div>

            <!-- 对应输入区 -->
            <div class="item-inputs">
              <div v-if="form.items.includes('photo')" class="item-input-area">
                <label>照片记忆</label>
                <div class="photo-upload-area">
                  <div v-if="form.photoPreview" class="photo-preview">
                    <img :src="form.photoPreview" alt="照片预览" />
                    <span class="photo-remove" @click="form.photoPreview = ''; form.photoDesc = ''">✕</span>
                  </div>
                  <div v-else class="photo-placeholder" @click="$refs.photoInput.click()">
                    <i class="el-icon-plus" style="font-size:28px;color:#999" />
                    <span style="font-size:13px;color:#999;margin-top:8px">点击上传照片</span>
                  </div>
                  <input ref="photoInput" type="file" accept="image/*" style="display:none" @change="handlePhotoUpload" />
                </div>
                <el-input
                  v-model="form.photoDesc"
                  type="textarea"
                  :rows="2"
                  placeholder="描述这张照片记录了什么故事..."
                  resize="none"
                  style="margin-top:8px"
                />
              </div>

              <div v-if="form.items.includes('song')" class="item-input-area">
                <label>歌曲名</label>
                <el-input
                  v-model="form.songName"
                  placeholder="对你有特殊意义的歌曲名"
                />
                <el-input
                  v-model="form.songArtist"
                  placeholder="演唱者"
                  class="sub-input"
                />
              </div>

              <div v-if="form.items.includes('sentence')" class="item-input-area">
                <label>一句话</label>
                <el-input
                  v-model="form.sentence"
                  type="textarea"
                  :rows="2"
                  placeholder="写下此刻最想记住的一句话"
                  resize="none"
                />
              </div>

              <div v-if="form.items.includes('secret')" class="item-input-area">
                <label>秘密</label>
                <el-input
                  v-model="form.secret"
                  type="textarea"
                  :rows="3"
                  placeholder="把这个秘密藏进胶囊..."
                  resize="none"
                />
              </div>

              <div v-if="form.items.includes('wish')" class="item-input-area">
                <label>愿望</label>
                <el-input
                  v-model="form.wish"
                  type="textarea"
                  :rows="2"
                  placeholder="许下一个愿望..."
                  resize="none"
                />
              </div>
            </div>
          </el-form-item>

          <!-- 开启日期 -->
          <el-form-item label="开启日期" prop="openDate">
            <el-date-picker
              v-model="form.openDate"
              type="date"
              placeholder="选择未来开启胶囊的日期"
              :picker-options="datePickerOptions"
              style="width: 100%"
            />
          </el-form-item>

          <!-- 是否公开 -->
          <el-form-item label="公开设置">
            <el-switch
              v-model="form.isPublic"
              active-text="公开（出现在故事墙）"
              inactive-text="私密（仅自己可见）"
            />
          </el-form-item>

          <!-- 提交按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="submit-btn"
              @click="handleSubmit"
            >
              <i class="el-icon-time"></i> 封存胶囊
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 胶囊封存凭证弹窗 -->
      <el-dialog
        :visible.sync="certificateVisible"
        title="胶囊封存凭证"
        width="450px"
        :show-close="false"
        :close-on-click-modal="false"
        custom-class="certificate-dialog"
        center
      >
        <div class="certificate-content">
          <div class="certificate-icon">
            <i class="el-icon-time"></i>
          </div>
          <h3>"{{ submittedCapsule.name }}"</h3>
          <p class="certificate-desc">已成功封存入时光回廊</p>
          <div class="countdown-box">
            <p class="countdown-label">距离开启还有</p>
            <div class="countdown-time">
              <span class="time-unit">
                <span class="time-value">{{ countdown.days }}</span>
                <span class="time-label">天</span>
              </span>
              <span class="time-unit">
                <span class="time-value">{{ countdown.hours }}</span>
                <span class="time-label">时</span>
              </span>
              <span class="time-unit">
                <span class="time-value">{{ countdown.minutes }}</span>
                <span class="time-label">分</span>
              </span>
              <span class="time-unit">
                <span class="time-value">{{ countdown.seconds }}</span>
                <span class="time-label">秒</span>
              </span>
            </div>
          </div>
          <p class="open-date">开启日期：{{ formatDate(submittedCapsule.openDate) }}</p>
        </div>
        <div slot="footer">
          <el-button type="primary" @click="certificateVisible = false">确定</el-button>
        </div>
      </el-dialog>

      <!-- 我的胶囊列表 -->
      <div class="my-capsules">
        <div class="section-title">
          <h2>我的胶囊</h2>
          <span class="count">共 {{ capsules.length }} 个</span>
        </div>

        <div v-if="capsules.length > 0" class="capsules-list">
          <div
            v-for="(capsule, index) in capsules"
            :key="index"
            :class="['capsule-item', { opened: capsule.isOpened }]"
          >
            <div class="capsule-status">
              <span v-if="capsule.isOpened" class="status-badge opened">已开启</span>
              <span v-else-if="isOpenable(capsule)" class="status-badge openable">可开启</span>
              <span v-else class="status-badge sealed">封存中</span>
            </div>

            <div class="capsule-info">
              <h4>{{ capsule.name }}</h4>
              <p class="capsule-items">
                <span v-for="(item, idx) in capsule.items" :key="idx" class="item-tag">
                  {{ getItemName(typeof item === 'object' ? item.type : item) }}
                </span>
              </p>
              <p class="capsule-date">
                <i class="el-icon-date"></i>
                开启日期：{{ formatDate(capsule.openDate) }}
              </p>
            </div>

            <div class="capsule-actions">
              <el-button
                v-if="isOpenable(capsule) && !capsule.isOpened"
                type="primary"
                size="small"
                class="open-btn"
                @click="openCapsule(capsule)"
              >
                <i class="el-icon-unlock"></i> 开启
              </el-button>
              <el-button
                v-else-if="capsule.isOpened"
                type="text"
                size="small"
                @click="viewCapsule(capsule)"
              >
                查看内容
              </el-button>
              <span v-else class="countdown-text">
                还有 {{ getDaysLeft(capsule) }} 天
              </span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-capsules">
          <i class="el-icon-time"></i>
          <p>还没有封存任何胶囊</p>
          <p class="sub-text">把珍贵的记忆封存起来，等待未来开启</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

// 物品类型配置
const itemTypes = [
  { key: 'photo', name: '照片记忆', icon: '📷' },
  { key: 'song', name: '一首歌', icon: '🎵' },
  { key: 'sentence', name: '一句话', icon: '💬' },
  { key: 'secret', name: '秘密', icon: '🔒' },
  { key: 'wish', name: '愿望', icon: '✨' }
];

export default {
  name: 'CapsulePage',
  data() {
    return {
      // 物品类型
      itemTypes,
      // 表单数据
      form: {
        name: '',
        items: [],
        photoDesc: '',
        photoPreview: '',
        songName: '',
        songArtist: '',
        sentence: '',
        secret: '',
        wish: '',
        openDate: null,
        isPublic: false
      },
      // 表单校验规则
      rules: {
        name: [
          { required: true, message: '请输入胶囊名称', trigger: 'blur' },
          { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
        ],
        items: [
          { type: 'array', required: true, message: '请至少选择一种物品', trigger: 'change' }
        ],
        openDate: [
          { required: true, message: '请选择开启日期', trigger: 'change' }
        ]
      },
      // 凭证弹窗
      certificateVisible: false,
      // 已提交的胶囊
      submittedCapsule: {},
      // 倒计时
      countdown: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      // 倒计时定时器
      countdownTimer: null,
      };
  },
  mounted() {
    this.$store.dispatch('capsule/initData');
  },
  computed: {
     ...mapGetters('auth', ['isLoggedIn']),
     ...mapState('capsule', ['capsules']),
     currentUser() { return this.isLoggedIn ? this.$store.state.auth.user : null },
     datePickerOptions() {
      return {
        disabledDate: (date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date.getTime() < today.getTime();
        }
      };
    }
  },
  beforeDestroy() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  },
  methods: {
    ...mapActions('capsule', { saveCapsuleStore: 'saveCapsule', openCapsuleStore: 'openCapsule' }),

    // 提交表单
    handleSubmit() {
      this.$refs.capsuleForm.validate(valid => {
        if (!valid) return;

        // 将表单输入转为 [{type, content}] 格式
        const items = [];
        if (this.form.items.includes('photo') && (this.form.photoDesc || this.form.photoPreview)) {
          items.push({ type: 'photo', content: this.form.photoDesc || '一张照片', image: this.form.photoPreview || '' });
        }
        if (this.form.items.includes('song') && this.form.songName) {
          items.push({ type: 'song', content: this.form.songName + ' - ' + (this.form.songArtist || '未知歌手') });
        }
        if (this.form.items.includes('sentence') && this.form.sentence) {
          items.push({ type: 'word', content: this.form.sentence });
        }
        if (this.form.items.includes('secret') && this.form.secret) {
          items.push({ type: 'secret', content: this.form.secret });
        }
        if (this.form.items.includes('wish') && this.form.wish) {
          items.push({ type: 'wish', content: this.form.wish });
        }

        const capsule = {
          name: this.form.name,
          items: items,
          openDate: this.form.openDate,
          isPublic: this.form.isPublic
        };

        // 保存到 Vuex
        this.saveCapsuleStore(capsule).then(saved => {
          this.$message.success('胶囊封存成功！');
          this.submittedCapsule = saved;
          this.certificateVisible = true;
          this.startCountdown(saved.openDate);
          this.resetForm();
        }).catch(() => {
          this.$message.error('封存失败，请重试');
        });
      });
    },

    // 重置表单
    resetForm() {
      this.$refs.capsuleForm.resetFields();
      this.form.photoDesc = '';
      this.form.photoPreview = '';
      this.form.songName = '';
      this.form.songArtist = '';
      this.form.sentence = '';
      this.form.secret = '';
      this.form.wish = '';
    },

    // 开始倒计时
    startCountdown(openDate) {
      if (this.countdownTimer) clearInterval(this.countdownTimer);

      const updateCountdown = () => {
        const now = new Date().getTime();
        const target = new Date(openDate).getTime();
        const diff = target - now;

        if (diff <= 0) {
          this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
          clearInterval(this.countdownTimer);
          return;
        }

        this.countdown.days = Math.floor(diff / (1000 * 60 * 60 * 24));
        this.countdown.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        this.countdown.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        this.countdown.seconds = Math.floor((diff % (1000 * 60)) / 1000);
      };

      updateCountdown();
      this.countdownTimer = setInterval(updateCountdown, 1000);
    },

    // 判断是否可开启
    isOpenable(capsule) {
      if (capsule.isOpened) return false;
      const now = new Date();
      const openDate = new Date(capsule.openDate);
      return now >= openDate;
    },

    // 获取剩余天数
    getDaysLeft(capsule) {
      const now = new Date();
      const openDate = new Date(capsule.openDate);
      const diff = openDate - now;
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    },

    // 开启胶囊
    openCapsule(capsule) {
      this.$confirm('确定要开启这个时光胶囊吗？', '开启胶囊', {
        confirmButtonText: '开启',
        cancelButtonText: '再等等',
        type: 'warning'
      }).then(() => {
        this.openCapsuleStore(capsule.id).then(() => {
          this.$message.success('胶囊已开启，快来看看当年的自己留下了什么吧！');
          this.viewCapsule(capsule);
        }).catch(() => {
          this.$message.error('开启失败');
        });
      }).catch(() => {});
    },

    // 查看胶囊内容
    viewCapsule(capsule) {
      const contentItems = [];
      if (capsule.items && Array.isArray(capsule.items)) {
        capsule.items.forEach(function(item) {
          var label = item.type === 'word' ? '一句话' : item.type === 'secret' ? '秘密' : item.type === 'wish' ? '愿望' : item.type === 'photo' ? '照片故事' : item.type === 'song' ? '歌曲' : item.type;
          contentItems.push(label + '：' + (item.content || ''));
        });
      }

      this.$alert(contentItems.join('\n\n'), '「' + capsule.name + '」的内容', {
        confirmButtonText: '关闭',
        customClass: 'capsule-content-dialog'
      });
    },

    // 获取物品名称
    getItemName(key) {
      var item = itemTypes.find(function(i) { return i.key === key });
      return item ? item.name : key;
    },

    // 处理照片上传
    handlePhotoUpload(e) {
      var file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        this.$message.warning('图片不能超过 2MB');
        return;
      }
      var self = this;
      var reader = new FileReader();
      reader.onload = function(ev) {
        self.$set(self.form, 'photoPreview', ev.target.result);
        self.form.photoDesc = file.name;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    }
  }
};
</script>

<style lang="less" scoped>
.capsule-page {
  min-height: 100vh;
  background-color: @bg-color;
  padding-bottom: 60px;
}

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
  }
}

.page-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

// 表单区域
.form-section {
  background: @card-bg;
  border-radius: @radius-md;
  padding: 30px;
  margin-bottom: 40px;
  box-shadow: @shadow-card;

  .section-title {
    margin-bottom: 24px;

    h2 {
      font-size: 20px;
      color: @primary-color;
      font-weight: 600;
    }
  }
}

// 物品选择
.item-types {
  margin-bottom: 16px;

  .item-checkbox {
    margin-right: 20px;
    margin-bottom: 10px;

    /deep/ .el-checkbox__label {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
    }

    .item-icon {
      font-size: 16px;
    }
  }
}

// 物品输入区
.item-inputs {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .item-input-area {
    background: @bg-color;
    border-radius: @radius-sm;
    padding: 16px;

    label {
      display: block;
      font-size: 13px;
      color: @text-color;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .sub-input {
      margin-top: 8px;
    }
  }
  .photo-upload-area {
    margin-bottom: 8px;
    .photo-placeholder {
      border: 2px dashed @border-color;
      border-radius: @radius-sm;
      height: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: @transition-base;
      &:hover { border-color: @accent-color; }
    }
    .photo-preview {
      position: relative;
      border-radius: @radius-sm;
      overflow: hidden;
      max-height: 200px;
      img { display: block; max-width: 100%; max-height: 200px; object-fit: contain; }
      .photo-remove {
        position: absolute; top: 4px; right: 4px;
        width: 24px; height: 24px; border-radius: 50%;
        background: rgba(0,0,0,0.5); color: #fff;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; font-size: 14px;
      }
    }
  }
}

// 提交按钮
.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, @secondary-color, @accent-color);
  border: none;
  border-radius: 25px;
  padding: 14px 0;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(232, 141, 94, 0.3);
  }
}

// 凭证弹窗
.certificate-dialog {
  .certificate-content {
    text-align: center;
    padding: 20px 0;

    .certificate-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, @secondary-color, @accent-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 36px;
        color: #FFFFFF;
      }
    }

    h3 {
      font-size: 20px;
      color: @primary-color;
      margin-bottom: 8px;
    }

    .certificate-desc {
      font-size: 14px;
      color: @text-color;
      opacity: 0.6;
      margin-bottom: 24px;
    }

    .countdown-box {
      background: @bg-color;
      border-radius: @radius-md;
      padding: 20px;
      margin-bottom: 20px;

      .countdown-label {
        font-size: 13px;
        color: @text-color;
        opacity: 0.5;
        margin-bottom: 12px;
      }

      .countdown-time {
        display: flex;
        justify-content: center;
        gap: 12px;

        .time-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;

          .time-value {
            display: block;
            width: 50px;
            height: 50px;
            line-height: 50px;
            background: linear-gradient(135deg, @primary-color, #2C3E50);
            color: #FFFFFF;
            font-size: 20px;
            font-weight: 700;
            border-radius: @radius-sm;
          }

          .time-label {
            font-size: 12px;
            color: @text-color;
            opacity: 0.5;
          }
        }
      }
    }

    .open-date {
      font-size: 14px;
      color: @text-color;
      opacity: 0.6;
    }
  }
}

// 我的胶囊
.my-capsules {
  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      font-size: 20px;
      color: @primary-color;
      font-weight: 600;
    }

    .count {
      font-size: 14px;
      color: @text-color;
      opacity: 0.5;
    }
  }

  .capsules-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .capsule-item {
    background: @card-bg;
    border-radius: @radius-md;
    padding: 24px;
    box-shadow: @shadow-card;
    display: flex;
    align-items: center;
    gap: 20px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: @shadow-hover;
      transform: translateY(-2px);
    }

    &.opened {
      opacity: 0.7;
    }
  }

  .capsule-status {
    flex-shrink: 0;

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;

      &.sealed {
        background: rgba(26, 42, 58, 0.1);
        color: @primary-color;
      }

      &.openable {
        background: rgba(103, 194, 58, 0.15);
        color: @success-color;
      }

      &.opened {
        background: rgba(144, 147, 153, 0.15);
        color: @info-color;
      }
    }
  }

  .capsule-info {
    flex: 1;
    min-width: 0;

    h4 {
      font-size: 16px;
      color: @primary-color;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .capsule-items {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;

      .item-tag {
        display: inline-block;
        padding: 2px 8px;
        background: @bg-color;
        border-radius: 10px;
        font-size: 12px;
        color: @text-color;
        opacity: 0.7;
      }
    }

    .capsule-date {
      font-size: 13px;
      color: @text-color;
      opacity: 0.5;

      i {
        margin-right: 4px;
      }
    }
  }

  .capsule-actions {
    flex-shrink: 0;

    .open-btn {
      background: linear-gradient(135deg, @secondary-color, @accent-color);
      border: none;
      border-radius: 20px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(232, 141, 94, 0.3);
      }
    }

    .countdown-text {
      font-size: 13px;
      color: @text-color;
      opacity: 0.5;
    }
  }
}

// 空状态
.empty-capsules {
  text-align: center;
  padding: 60px 20px;

  i {
    font-size: 48px;
    color: @info-color;
    opacity: 0.5;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    color: @text-color;
    opacity: 0.6;
    margin-bottom: 8px;

    &.sub-text {
      font-size: 14px;
      opacity: 0.4;
    }
  }
}
</style>
