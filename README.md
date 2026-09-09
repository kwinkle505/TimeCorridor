# 时空回廊 · TimeCorridor

> 用时间治愈时间 —— 一个温暖的情感治愈平台

「时空回廊」是一个全栈情感治愈 Web 应用，基于 Vue 2 + Node.js + SQLite 构建。你可以在这里给未来的自己写信、封存时光胶囊、在树洞中倾诉情绪、在故事墙里感受陌生人的温暖。

---

## 功能特性

### 给未来写信
- 给未来的自己、爱人、朋友或父母写信
- AI 根据情绪生成回信
- 支持分享到故事墙

### 情绪树洞
- 匿名倾诉你的心事
- AI 根据情绪类型生成回应，推荐歌曲
- 支持清空历史

### 时光胶囊
- 封存照片、歌曲、话语、秘密、愿望
- 设定开启日期，倒计时等待
- 公开陈列馆，浏览他人的时光故事

### 留言墙
- 发布留言，互相鼓励
- 四种类型：鼓励 / 治愈 / 感恩 / 勇敢
- 每日 3 条限制

### 今日句签
- 每天一句温暖文字
- 收藏喜欢的句签
- 支持保存为图片

### 每日挑战 & 星光收集册
- 每日小任务
- 连续打卡，记录成长
- 8 枚成就徽章

### 个人足迹
- 统计写信、树洞、打卡数据
- 管理收藏和胶囊
- 数据导入 / 导出

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 2.7 + Vuex + Vue Router + Element UI + Less |
| 后端 | Koa 2 + Koa Router + JWT + bcryptjs |
| 数据库 | SQLite3 |
| AI 能力 | DeepSeek / SiliconFlow API |
| 构建工具 | Vue CLI |

---

## 项目结构

```
TimeCorridor/
├── frontend/             # 前端 Vue 项目
│   ├── public/           # 静态资源
│   ├── src/
│   │   ├── api/          # API 封装
│   │   ├── assets/       # 样式与资源
│   │   ├── components/   # 组件
│   │   ├── router/       # 路由
│   │   ├── store/        # Vuex 状态管理
│   │   ├── utils/        # 工具函数
│   │   └── views/        # 页面
│   ├── package.json
│   ├── babel.config.js
│   └── vue.config.js
│
├── backend/              # 后端 Node.js 项目
│   ├── routes/           # API 路由
│   ├── middleware/       # 中间件
│   ├── services/         # 服务层
│   ├── scripts/          # 脚本
│   ├── server.js         # 入口文件
│   ├── db.js             # 数据库初始化
│   ├── seed.js           # 演示数据种子
│   └── package.json
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## 快速开始

### 环境要求

- Node.js >= 16.x
- npm

### 安装 & 运行

#### 1. 克隆项目

```bash
git clone https://github.com/kwinkle505/TimeCorridor.git
cd TimeCorridor
```

#### 2. 安装依赖

```bash
# 前端依赖
cd frontend
npm install

# 后端依赖
cd ../backend
npm install
```

#### 3. 配置环境变量

在 `backend/` 目录下复制 `.env.example` 为 `.env`：

```bash
cd backend
cp .env.example .env
```

| 变量 | 说明 | 必填 |
|------|------|------|
| `PORT` | 后端端口，默认 3000 | 否 |
| `JWT_SECRET` | JWT 加密密钥，生产环境务必修改 | 是 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | 否 |
| `SILICONFLOW_API_KEY` | SiliconFlow API Key（备用） | 否 |

#### 4. 初始化数据库

数据库会在首次启动时自动创建。如需演示数据：

```bash
cd backend
node seed.js
```

#### 5. 创建管理员账号

```bash
cd backend
node scripts/create-admin.js <用户名> <密码>
```

#### 6. 启动服务

```bash
# 终端 1：启动后端（端口 3000）
cd backend
npm start

# 终端 2：启动前端（端口 8080）
cd frontend
npm run serve
```

#### 7. 访问应用

打开浏览器访问：http://localhost:8080

---

## 演示账号

运行 `node seed.js` 后，会生成以下演示用户：

| 用户名 | 密码 | 昵称 |
|--------|------|------|
| `linwanqing` | `demo123` | 林晚晴 |
| `chenyu` | `demo123` | 陈屿 |
| `sunian` | `demo123` | 苏念 |
| `zhoumo` | `demo123` | 周末 |

管理员账号请使用 `scripts/create-admin.js` 手动创建。

---

## License

MIT License - 详见 [LICENSE](LICENSE) 文件。
