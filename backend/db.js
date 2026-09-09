const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname, 'data.sqlite')
const db = new sqlite3.Database(dbPath)

// Promisify helper
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err)
      else resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

// 初始化表
async function initTables() {
  // 用户表
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nickname TEXT,
      avatar TEXT,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 信件表
  await run(`
    CREATE TABLE IF NOT EXISTS letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      recipient TEXT NOT NULL,
      salutation TEXT,
      content TEXT NOT NULL,
      moods TEXT,
      types TEXT,
      reply TEXT,
      is_public INTEGER DEFAULT 0,
      write_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  // 树洞消息表
  await run(`
    CREATE TABLE IF NOT EXISTS treehole_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      emotion TEXT,
      reply TEXT,
      song TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  // 时光胶囊表
  await run(`
    CREATE TABLE IF NOT EXISTS capsules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      items TEXT NOT NULL,
      open_date TEXT NOT NULL,
      is_public INTEGER DEFAULT 0,
      opened INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  // 留言墙表
  await run(`
    CREATE TABLE IF NOT EXISTS wall_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'encourage',
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  // 句签收藏表
  await run(`
    CREATE TABLE IF NOT EXISTS quote_favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      quote_text TEXT NOT NULL,
      quote_source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  // 每日挑战打卡表
  await run(`
    CREATE TABLE IF NOT EXISTS challenge_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  // 给 letters 表增加 likes 字段（兼容旧数据库）
  try {
    await run('ALTER TABLE letters ADD COLUMN likes INTEGER DEFAULT 0')
  } catch (e) {
    // 字段已存在则忽略
  }

  // 信件共鸣表（记录用户对哪些信件点过共鸣）
  await run(`
    CREATE TABLE IF NOT EXISTS letter_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      letter_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, letter_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (letter_id) REFERENCES letters(id)
    )
  `)

  // 给 capsules 表增加 likes 字段（兼容旧数据库）
  try {
    await run('ALTER TABLE capsules ADD COLUMN likes INTEGER DEFAULT 0')
  } catch (e) {
    // 字段已存在则忽略
  }

  // 胶囊点赞表（记录用户对哪些胶囊点过赞）
  await run(`
    CREATE TABLE IF NOT EXISTS capsule_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      capsule_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, capsule_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (capsule_id) REFERENCES capsules(id)
    )
  `)

  // 留言墙点赞表
  await run(`
    CREATE TABLE IF NOT EXISTS wall_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, message_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (message_id) REFERENCES wall_messages(id)
    )
  `)

  console.log('数据库表初始化完成')
}

initTables().catch(console.error)

module.exports = { db, run, get, all }
