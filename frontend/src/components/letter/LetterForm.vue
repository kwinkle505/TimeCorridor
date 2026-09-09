<template>
  <div class="letter-form">
    <el-steps :active="currentStep" finish-status="success" class="form-steps" align-center>
      <el-step title="选择收信对象" />
      <el-step title="选择信件类型" />
      <el-step title="写信" />
      <el-step title="确认提交" />
    </el-steps>

    <!-- 步骤1：选择收信对象 -->
    <div v-show="currentStep === 0" class="step-content">
      <h3 class="step-title">你想给谁写信？</h3>
      <div class="recipient-cards">
        <div v-for="item in recipients" :key="item.value"
          class="recipient-card" :class="{ active: form.recipient === item.value }"
          @click="form.recipient = item.value">
          <span class="recipient-icon">{{ item.icon }}</span>
          <span class="recipient-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- 步骤2：选择信件类型 -->
    <div v-show="currentStep === 1" class="step-content">
      <h3 class="step-title">这封信是为了什么？（可多选，至少选1个）</h3>
      <div class="type-tags">
        <span v-for="t in letterTypes" :key="t.value"
          class="custom-tag" :class="{ checked: form.types.includes(t.value) }"
          @click="toggleType(t.value)">
          {{ t.label }}
        </span>
      </div>
    </div>

    <!-- 步骤3：写信 -->
    <div v-show="currentStep === 2" class="step-content">
      <h3 class="step-title">写下你的心声</h3>
      <el-form label-position="top" class="write-form">
        <el-form-item label="称呼">
          <el-input v-model="form.salutation" placeholder="例如：亲爱的自己" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="正文">
          <el-input v-model="form.content" type="textarea" :rows="8"
            placeholder="写下你此刻的心事、遗憾、愿望或任何想说的话..." maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="情绪标签（可多选）">
          <div class="mood-tags">
            <span v-for="mood in moodOptions" :key="mood"
              class="custom-tag" :class="{ checked: form.moods.includes(mood) }"
              @click="toggleMood(mood)">
              {{ mood }}
            </span>
          </div>
        </el-form-item>
        <el-form-item>
          <el-switch v-model="form.isPublic" active-text="公开到故事墙" inactive-text="仅自己可见" />
        </el-form-item>
        <el-form-item label="写信日期">
          <el-input :value="form.writeDate" disabled />
        </el-form-item>
      </el-form>
    </div>

    <!-- 步骤4：确认 -->
    <div v-show="currentStep === 3" class="step-content">
      <h3 class="step-title">确认寄出这封信</h3>
      <div class="confirm-card">
        <p><strong>收信对象：</strong>{{ form.recipient }}</p>
        <p><strong>信件类型：</strong>{{ typeLabels.join('、') }}</p>
        <p><strong>称呼：</strong>{{ form.salutation }}</p>
        <p><strong>正文：</strong>{{ form.content.slice(0, 100) }}{{ form.content.length > 100 ? '...' : '' }}</p>
        <p><strong>情绪标签：</strong>{{ form.moods.join('、') || '未选择' }}</p>
        <p><strong>是否公开：</strong>{{ form.isPublic ? '是' : '否' }}</p>
        <p><strong>日期：</strong>{{ form.writeDate }}</p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="form-actions">
      <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
      <el-button v-if="currentStep < 3" type="primary" :disabled="!canNext" @click="currentStep++">下一步</el-button>
      <el-button v-if="currentStep === 3" type="primary" size="large" class="btn-pulse" @click="handleSubmit">📨 寄往2036年</el-button>
    </div>
  </div>
</template>

<script>
function getTodayDate() {
  var d = new Date()
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日'
}
function createForm() {
  return {
    recipient: '十年后的自己',
    types: [],
    salutation: '亲爱的我',
    content: '',
    moods: [],
    isPublic: true,
    writeDate: getTodayDate()
  }
}

export default {
  name: 'LetterForm',
  data() {
    return {
      currentStep: 0,
      form: createForm(),
      recipients: [
        { value: '十年后的自己', label: '自己', icon: '🙋' },
        { value: '十年后的父母', label: '父母', icon: '👨‍👩‍👧' },
        { value: '十年后的朋友', label: '朋友', icon: '👫' },
        { value: '十年后的爱人', label: '爱人', icon: '💑' }
      ],
      letterTypes: [
        { value: 'comfort', label: '💔 需要安慰', display: '需要安慰' },
        { value: 'direction', label: '🎯 需要方向', display: '需要方向' },
        { value: 'joy', label: '🎉 分享喜悦', display: '分享喜悦' },
        { value: 'gratitude', label: '🙏 表达感谢', display: '表达感谢' },
        { value: 'vent', label: '😤 宣泄情绪', display: '宣泄情绪' },
        { value: 'explore', label: '🤔 自我探索', display: '自我探索' }
      ],
      moodOptions: ['迷茫', '期待', '遗憾', '感恩', '焦虑', '幸福', '思念', '勇敢']
    }
  },
  computed: {
    canNext() {
      if (this.currentStep === 0) return !!this.form.recipient
      if (this.currentStep === 1) return this.form.types.length > 0
      if (this.currentStep === 2) return this.form.content.trim().length > 0
      return true
    },
    typeLabels() {
      var self = this
      return this.form.types.map(function(v) {
        var found = self.letterTypes.find(function(t) { return t.value === v })
        return found ? found.display : v
      })
    }
  },
  methods: {
    toggleType(v) {
      var i = this.form.types.indexOf(v)
      if (i > -1) this.form.types.splice(i, 1)
      else this.form.types.push(v)
    },
    toggleMood(m) {
      var i = this.form.moods.indexOf(m)
      if (i > -1) this.form.moods.splice(i, 1)
      else this.form.moods.push(m)
    },
    handleSubmit() {
      this.$emit('submit', { ...this.form })
    },
    resetForm() {
      this.currentStep = 0
      this.form = createForm()
    }
  }
}
</script>

<style lang="less" scoped>
.letter-form { max-width: 720px; margin: 0 auto; padding: 32px; background: @card-bg; border-radius: @border-radius-lg; box-shadow: @shadow-card; }
.form-steps { margin-bottom: 32px; }
.step-content { min-height: 300px; }
.step-title { font-size: 20px; font-weight: 500; color: @primary-color; text-align: center; margin-bottom: 24px; }
.recipient-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 400px; margin: 0 auto; }
.recipient-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 16px; border: 2px solid @border-color; border-radius: @border-radius-md; cursor: pointer; transition: all 0.3s; background: @bg-color; user-select: none; }
.recipient-card .recipient-icon { font-size: 36px; }
.recipient-card .recipient-label { font-size: 16px; color: @text-color; }
.recipient-card:hover { border-color: @secondary-color; transform: translateY(-4px); box-shadow: @shadow-hover; }
.recipient-card.active { border-color: @accent-color; background: rgba(232, 141, 94, 0.08); }
.recipient-card.active .recipient-label { color: @accent-color; font-weight: 600; }
.type-tags { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; max-width: 500px; margin: 0 auto; }
.mood-tags { display: flex; flex-wrap: wrap; gap: 10px; }
.custom-tag { display: inline-block; padding: 8px 18px; border-radius: 20px; font-size: 14px; cursor: pointer; border: 1px solid @border-color; color: @text-color; transition: all 0.25s; user-select: none; }
.custom-tag:hover { border-color: @accent-color; color: @accent-color; }
.custom-tag.checked { background: @accent-color; color: #fff; border-color: @accent-color; }
.write-form { max-width: 560px; margin: 0 auto; }
.confirm-card { max-width: 560px; margin: 0 auto; padding: 24px; background: @bg-color; border-radius: @border-radius-md; }
.confirm-card p { font-size: 14px; color: @text-color; line-height: 2.2; margin: 0; }
.confirm-card strong { color: @primary-color; }
.form-actions { display: flex; justify-content: center; gap: 16px; margin-top: 32px; padding-top: 24px; border-top: 1px solid @border-color; }
@media (max-width: 768px) { .letter-form { padding: 16px; } .form-actions { flex-direction: column; } .form-actions .el-button { width: 100%; } }
</style>