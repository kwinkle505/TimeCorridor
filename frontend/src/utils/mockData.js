/**
 * 初始化示例数据模块
 * 首次访问时自动写入 localStorage
 */

/**
 * 示例信件数据（3封公开信，含回信）
 * 字段与 StoryCard/LetterReply 组件完全匹配
 */
export const mockLetters = [
  {
    id: 'letter_001',
    recipient: '十年后的自己',
    salutation: '亲爱的我',
    content: '你好呀，2036年的我。现在的我正在为考研焦虑，不知道未来的你有没有考上理想的学校？不管结果如何，我希望你没有辜负这段努力的日子。现在的我有时候会怀疑自己，但我想告诉你，你比想象中更强大。',
    moods: ['迷茫', '焦虑', '勇敢'],
    writeDate: '2026年7月10日',
    createTime: '2026-07-10T08:30:00.000Z',
    reply: '亲爱的我：\n\n展信安。我已经坐在那所学校的图书馆里了，窗外是梧桐树，秋天的时候会落下金色的叶子。那段备考的日子确实辛苦，但现在的我很感谢当时的你没有放弃。\n\n每天早上我还是会喝一杯咖啡，只是不再是为了提神，而是因为喜欢那个味道。生活依然不完美，但我学会了和不完美共处。\n\n你比你以为的更值得被温柔以待。\n\n—— 十年后的自己，于2036年7月10日',
    isPublic: true,
    likes: 42,
    views: 156
  },
  {
    id: 'letter_002',
    recipient: '十年后的父母',
    salutation: '亲爱的爸爸妈妈',
    content: '爸妈，现在的我不能经常回家，每次视频看到你们的白发都觉得时间过得太快了。我很抱歉有时候会对你们不耐烦，那些话都不是真心的。谢谢你们一直支持我的每一个决定，即使你们并不完全理解。',
    moods: ['感恩', '思念'],
    writeDate: '2026年7月9日',
    createTime: '2026-07-09T15:20:00.000Z',
    reply: '亲爱的孩子：\n\n收到你的信，我和你爸都红了眼眶。我们在阳台上种了新的月季，每天浇水的时候就想起了你小时候。\n\n别担心我们，我们每天都去公园散步，还跟老年合唱团学会了新的歌。你爸最近在学用智能手机剪视频，说要给你做个成长合集。\n\n你的不耐烦我们从来不放在心上，因为知道你心里有我们。常回来看看就好。\n\n—— 爱你的爸爸妈妈，于2036年7月10日',
    isPublic: true,
    likes: 67,
    views: 203
  },
  {
    id: 'letter_003',
    recipient: '十年后的爱人',
    salutation: '亲爱的你',
    content: '我现在还不知道你是谁，但我每天都在努力成为更好的自己，希望遇到你的时候，我是最好的状态。我有很多小缺点，容易焦虑，有时候会很宅，但我会为了你变得更好。',
    moods: ['期待', '幸福'],
    writeDate: '2026年7月8日',
    createTime: '2026-07-08T22:00:00.000Z',
    reply: '亲爱的：\n\n终于等到你。此刻你就睡在我旁边，呼吸声轻轻的。我们住在有落地窗的房子里，早晨的阳光会把你的睫毛照成金色。\n\n你确实有焦虑的毛病，但我学会了在你紧张的时候给你泡一杯热可可。你还是很宅，但周末我们会一起去超市买菜，回家做火锅。\n\n谢谢你成为更好的自己，也谢谢你让我变得更好。\n\n—— 你的爱人，于2036年7月10日',
    isPublic: true,
    likes: 89,
    views: 312
  },
  {
    id: 'letter_004',
    recipient: '十年后的自己',
    salutation: '未来的我',
    content: '最近工作压力好大，项目一直延期，老板总是不满意。有时候觉得自己是不是不适合这个行业。但我还是想再坚持一下，想问问你，现在的你过得开心吗？',
    moods: ['迷茫', '焦虑'],
    writeDate: '2026年7月7日',
    createTime: '2026-07-07T18:45:00.000Z',
    reply: '未来的我：\n\n别担心，项目后来顺利上线了，而且你从中学会了怎么更好地管理时间。现在回头看，那段日子虽然辛苦，却是成长最快的一段。\n\n我已经换了工作，在一家更适合自己的公司。每天下班会去游泳馆游半小时，周末偶尔弹弹吉他。不开心的时候还是会有，但我学会了和情绪相处。\n\n记住，所有的困境都是暂时的。\n\n—— 十年后的自己，于2036年7月10日',
    isPublic: true,
    likes: 35,
    views: 178
  },
  {
    id: 'letter_005',
    recipient: '十年后的自己',
    salutation: '嗨',
    content: '今天的阳光很好，我坐在咖啡馆里写下这封信。生活中有很多小确幸，只是我们常常忘记去发现。我想对未来的你说，不要忘记现在的这份感动。',
    moods: ['感恩', '幸福'],
    writeDate: '2026年7月6日',
    createTime: '2026-07-06T10:15:00.000Z',
    reply: '嗨：\n\n同样的阳光正照在我的书桌上。我保留了记录小确幸的习惯，手机备忘录里存了上千条开心的事。\n\n今天早上煎蛋的形状是个心形，楼下流浪猫让我摸了它的头，咖啡店的老板娘记得我不加糖。这些小事，我都记得。\n\n谢谢你提醒我要感恩。\n\n—— 十年后的自己，于2036年7月10日',
    isPublic: true,
    likes: 56,
    views: 234
  }
]

/**
 * 示例树洞对话数据（5组，每组包含用户消息和AI回复）
 * type: 'user' | 'ai'
 */
export const mockTreeholeMessages = [
  { id: 'th_u1', type: 'user', content: '今天面试又被拒了，感觉好挫败...', emotion: '😢难过', reply: null, song: null, createTime: '2026-07-10T09:00:00.000Z' },
  { id: 'th_a1', type: 'ai', content: '抱抱你，今天的雨总会停的。每一次拒绝都是在帮你筛选更适合的机会。', emotion: '难过', reply: null, song: { name: '曾经我也想过一了百了', artist: '中岛美嘉', reason: '在最低谷时给你继续走下去的力量。' }, createTime: '2026-07-10T09:00:05.000Z' },
  { id: 'th_u2', type: 'user', content: '终于拿到了心仪的offer！', emotion: '😊开心', reply: null, song: null, createTime: '2026-07-10T10:30:00.000Z' },
  { id: 'th_a2', type: 'ai', content: '真好呀，这份快乐值得被记住。愿这份喜悦伴你走向更好的未来！', emotion: '开心', reply: null, song: { name: 'Good Time', artist: 'Owl City', reason: '轻快的旋律像阳光洒在脸上，让快乐翻倍。' }, createTime: '2026-07-10T10:30:05.000Z' },
  { id: 'th_u3', type: 'user', content: '室友又把公共区域弄得一团糟！', emotion: '😤生气', reply: null, song: null, createTime: '2026-07-10T14:00:00.000Z' },
  { id: 'th_a3', type: 'ai', content: '深呼吸，你已经比事情本身更强大了。找个合适的时机沟通，相信会有改善的。', emotion: '生气', reply: null, song: { name: 'Roar', artist: 'Katy Perry', reason: '把愤怒化作狮子般的怒吼，释放它！' }, createTime: '2026-07-10T14:00:05.000Z' },
  { id: 'th_u4', type: 'user', content: '不知道未来的方向在哪里...', emotion: '🤔迷茫', reply: null, song: null, createTime: '2026-07-10T16:20:00.000Z' },
  { id: 'th_a4', type: 'ai', content: '迷茫的时候，说明你在思考。给自己一点时间，答案会慢慢浮现的。', emotion: '迷茫', reply: null, song: { name: '消愁', artist: '毛不易', reason: '一杯敬过往，一杯敬明天，在迷茫中寻找方向。' }, createTime: '2026-07-10T16:20:05.000Z' },
  { id: 'th_u5', type: 'user', content: '今天什么都没发生，但我喜欢这样的平静。', emotion: '😌平静', reply: null, song: null, createTime: '2026-07-10T19:00:00.000Z' },
  { id: 'th_a5', type: 'ai', content: '平静也是一种幸福。愿你常有这样的时光，与自己温柔相处。', emotion: '平静', reply: null, song: { name: 'River Flows in You', artist: 'Yiruma', reason: '钢琴曲如溪水潺潺，洗涤心灵。' }, createTime: '2026-07-10T19:00:05.000Z' }
]

/**
 * 示例时光胶囊数据（3个）
 */
export const mockCapsules = [
  {
    id: 'cap_001',
    name: '2026年夏天的味道',
    items: [
      { type: 'word', content: '这个夏天一定要去看一次海' },
      { type: 'song', content: '晴天 - 周杰伦' }
    ],
    sealDate: '2026-07-01T08:00:00.000Z',
    openDate: '2036-07-01T08:00:00.000Z',
    isPublic: true,
    isOpened: false,
    color: '#FFD93D',
    likes: 12
  },
  {
    id: 'cap_002',
    name: '毕业时的期许',
    items: [
      { type: 'word', content: '希望毕业时已经找到了热爱的方向' },
      { type: 'wish', content: '愿我们都能在各自的路上闪闪发光' },
      { type: 'secret', content: '其实我偷偷喜欢了同班同学三年' }
    ],
    sealDate: '2026-06-01T12:00:00.000Z',
    openDate: '2027-06-01T12:00:00.000Z',
    isPublic: true,
    isOpened: false,
    color: '#6BCB77',
    likes: 8
  },
  {
    id: 'cap_003',
    name: '十年后的约定',
    items: [
      { type: 'word', content: '十年后的我，你还记得今天的梦想吗？' },
      { type: 'wish', content: '希望十年后的你没有改变那颗热爱生活的心' }
    ],
    sealDate: '2026-05-20T13:14:00.000Z',
    openDate: '2036-05-20T13:14:00.000Z',
    isPublic: true,
    isOpened: false,
    color: '#4D96FF',
    likes: 25
  }
]

/**
 * 示例留言墙数据（5条）
 */
export const mockWallMessages = [
  { id: 'wall_001', content: '愿所有正在努力的人，都能被世界温柔以待。加油！', type: 'encourage', likes: 23, createTime: '2026-07-10T08:00:00.000Z' },
  { id: 'wall_002', content: '你不需要很厉害才能开始，但你需要开始才能很厉害。', type: 'remind', likes: 45, createTime: '2026-07-09T14:30:00.000Z' },
  { id: 'wall_003', content: '今天在地铁上看到一个小女孩给老人让座，瞬间被治愈了。', type: 'share', likes: 31, createTime: '2026-07-09T09:15:00.000Z' },
  { id: 'wall_004', content: '如果你正在经历低谷，请相信：低谷之后一定会上坡。', type: 'encourage', likes: 67, createTime: '2026-07-08T20:00:00.000Z' },
  { id: 'wall_005', content: '陌生人，你今天辛苦了，早点休息吧。', type: 'encourage', likes: 89, createTime: '2026-07-07T22:45:00.000Z' }
]

/**
 * 示例收藏句签（10个，存的是 quotes 数组中的 index）
 */
export const mockCollectedQuotes = [0, 3, 5, 9, 12, 15, 20, 24, 28, 30]

/**
 * 初始统计数据
 */
export const initialStats = {
  letterCount: 128,
  storyCount: 86,
  treeholeCount: 256,
  capsuleCount: 42,
  quoteCount: 55,
  wallMessageCount: 156,
  todayLetters: 12,
  todayTreehole: 34
}