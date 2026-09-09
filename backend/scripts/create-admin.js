/**
 * 创建管理员账号脚本
 * 
 * 用法：
 *   node scripts/create-admin.js <用户名> <密码> [昵称]
 *   node scripts/create-admin.js admin mypassword 管理员
 * 
 * 或使用环境变量：
 *   ADMIN_USERNAME=admin ADMIN_PASSWORD=mypassword node scripts/create-admin.js
 */

const path = require('path')
const bcrypt = require('bcryptjs')
const { run, get } = require('../db')

async function createAdmin() {
  // 从命令行参数或环境变量获取
  const username = process.argv[2] || process.env.ADMIN_USERNAME
  const password = process.argv[3] || process.env.ADMIN_PASSWORD
  const nickname = process.argv[4] || process.env.ADMIN_NICKNAME || '管理员'

  if (!username || !password) {
    console.error('用法: node scripts/create-admin.js <用户名> <密码> [昵称]')
    console.error('或设置环境变量: ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_NICKNAME')
    process.exit(1)
  }

  if (username.length < 2 || username.length > 20) {
    console.error('错误: 用户名长度应为 2-20 位')
    process.exit(1)
  }

  if (password.length < 6 || password.length > 30) {
    console.error('错误: 密码长度应为 6-30 位')
    process.exit(1)
  }

  if (nickname && nickname.length > 30) {
    console.error('错误: 昵称长度不能超过 30 个字符')
    process.exit(1)
  }

  // 检查是否已存在
  const existing = await get('SELECT id FROM users WHERE username = ?', [username])
  if (existing) {
    console.error(`错误: 用户 "${username}" 已存在`)
    process.exit(1)
  }

  // 创建管理员
  const hash = bcrypt.hashSync(password, 10)
  const result = await run(
    `INSERT INTO users (username, password_hash, nickname, role) VALUES (?, ?, ?, ?)`,
    [username, hash, nickname, 'admin']
  )

  console.log(`✅ 管理员创建成功!`)
  console.log(`   用户名: ${username}`)
  console.log(`   密码: ${'*'.repeat(password.length)}`)
  console.log(`   昵称: ${nickname}`)
  console.log(`   ID: ${result.lastID}`)
  process.exit(0)
}

createAdmin().catch(err => {
  console.error('创建失败:', err.message)
  process.exit(1)
})
