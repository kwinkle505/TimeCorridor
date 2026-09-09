<template>
  <div class="not-found-page">
    <div class="auth-tip">
      <p class="not-found-code">404</p>
      <h2>页面走丢了</h2>
      <p>你访问的页面不存在或已被移除</p>
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style lang="less" scoped>
.not-found-page {
  padding: 48px 0 80px;
}
.not-found-code {
  font-size: 72px;
  font-weight: 700;
  color: @accent-color;
  margin-bottom: 8px;
  font-family: @font-family-en;
  line-height: 1;
}
</style>