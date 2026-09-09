const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  outputDir: 'dist',
  assetsDir: 'static',
  publicPath: '/',
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    open: true,
    historyApiFallback: true
  },
  css: {
    loaderOptions: {
      less: {
        additionalData: `
          @import "~@/assets/styles/variables.less";
        `
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    }
  },
  productionSourceMap: false
})
