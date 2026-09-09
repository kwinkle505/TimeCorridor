/**
 * 数据库种子脚本
 * 清空所有数据并重新植入样例数据
 * 用法：node seed.js
 */
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const bcrypt = require('bcryptjs')

const dbPath = path.join(__dirname, 'data.sqlite')
const db = new sqlite3.Database(dbPath)

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
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

async function seed() {
  console.log('========== 开始植入样例数据 ==========')

  // 1. 清空所有表（按外键依赖顺序删除）
  console.log('清空旧数据...')
  await run('DELETE FROM challenge_records')
  await run('DELETE FROM quote_favorites')
  await run('DELETE FROM wall_messages')
  await run('DELETE FROM capsules')
  await run('DELETE FROM treehole_messages')
  await run('DELETE FROM letters')
  await run('DELETE FROM users')
  // 重置自增 ID
  await run("DELETE FROM sqlite_sequence WHERE name IN ('users','letters','treehole_messages','capsules','wall_messages','quote_favorites','challenge_records')")

  // 2. 创建演示用户（不含管理员，管理员请使用 scripts/create-admin.js 创建）
  console.log('创建演示用户...')
  const users = [
    { username: 'linwanqing', password: 'demo123', nickname: '林晚晴', role: 'user' },
    { username: 'chenyu', password: 'demo123', nickname: '陈屿', role: 'user' },
    { username: 'sunian', password: 'demo123', nickname: '苏念', role: 'user' },
    { username: 'zhoumo', password: 'demo123', nickname: '周末', role: 'user' }
  ]

  const userIds = {}
  for (const u of users) {
    const hash = bcrypt.hashSync(u.password, 10)
    const result = await run(
      'INSERT INTO users (username, password_hash, nickname, role) VALUES (?, ?, ?, ?)',
      [u.username, hash, u.nickname, u.role]
    )
    userIds[u.username] = result.lastID
    console.log(`  ✓ ${u.nickname} (${u.username})`)
  }

  // 3. 创建信件
  console.log('创建信件...')
  const letters = [
    // ========== 公开信件（故事墙展示用）==========
    {
      user: 'linwanqing',
      recipient: '十年后的自己',
      salutation: '亲爱的晚晴：',
      content: `今天是2026年7月10日，我坐在图书馆靠窗的位置，窗外的梧桐叶绿得发亮。

考研倒计时还有167天，数学真题做了三遍还是会错，英语阅读有时候一篇能错四道。室友都找到了不错的工作，只有我还在这条不确定的路上走着。

有时候我会问自己，这样做值得吗？如果没考上怎么办？

但我知道你一定会告诉我答案的。不管结果如何，谢谢你没有放弃。哪怕最后没有成功，这段为了梦想全力以赴的日子，也会成为生命里最亮的光。

对了，楼下那只三花猫还在吗？我每天都喂它。`,
      moods: ['迷茫', '勇敢', '期待'],
      types: ['成长'],
      reply: `展信安。

看到你写的这些，我忍不住笑了。你知道吗？你考上了。虽然过程比想象中艰难，虽然复试的时候紧张到声音发抖，但你做到了。

那只三花猫后来生了一窝小猫，毕业的时候你把其中一只送给了宿管阿姨。你说要带着这份温暖去往下一段旅程。

现在的我，在你曾经憧憬的城市里，做着自己喜欢的研究。偶尔也会迷茫，但每次想起当年那个在图书馆亮到深夜的自己，就觉得没有什么坎是过不去的。

谢谢你没有放弃。
—— 十年后的你，于北京`,
      isPublic: 1,
      writeDate: '2026-07-10'
    },
    {
      user: 'chenyu',
      recipient: '十年后的爱人',
      salutation: '致我最爱的人：',
      content: `今天的晚霞特别美，粉紫色的天空像被打翻的水彩。我站在天台上，身边是刚吃完的外卖盒子和一罐没喝完的啤酒。

我不知道你现在在哪里，也不知道我们是怎么相遇的。也许是在某个加班后的深夜便利店，也许是在一次朋友聚会上，也许——是在我完全意想不到的地方。

我想告诉你，在遇见你之前，我一直在努力成为更好的人。我学会了做饭，学会了照顾自己，学会了在这个大城市里站稳脚跟。

我在等你。不急，你慢慢来，但一定要来。

对了，我现在养了一只金毛，叫橙子。如果我们在一起了，它应该已经很老了吧？记得替我好好照顾它。`,
      moods: ['幸福', '期待', '思念'],
      types: ['爱情'],
      reply: `亲爱的：

看到这封信的时候，我忍不住红了眼眶。

你猜我们是怎么认识的？说出来你可能不信——是在宠物医院。橙子得了急性肠胃炎，你抱着它急得满头大汗，而我正好在那里帮朋友的猫做绝育。你那副慌张又认真的样子，我现在想起来还觉得好笑。

橙子现在十一岁了，牙都掉了好几颗，但还是每天早上六点准时叫我起床喂饭。它最爱的人已经不是你了，是我，哈哈。

谢谢你等我。我也在等你，只是那时候我还不知道。
—— 爱你的人，于2036年的某个清晨`,
      isPublic: 1,
      writeDate: '2026-06-15'
    },
    {
      user: 'sunian',
      recipient: '十年后的朋友',
      salutation: '老陈：',
      content: `咱俩都认识十六年了，从初中那个连暗恋都不敢说出口的年纪，到现在各自在不同的城市打拼。

上次见面还是春节，你胖了，我也胖了。我们坐在你家楼下的烧烤摊，喝着冰啤酒，聊起高中时候那些糗事，笑到眼泪都出来了。

不知道十年后我们还会不会像现在这样，一见面就有说不完的话。你家的小朋友会不会叫我干妈？我们还会不会一起通宵打游戏？

不管怎样，谢谢你出现在我的生命里。从校服到婚纱，从青涩到成熟，你是我青春里最重要的见证者。

等我们老了，就一起去养老院，继续当隔壁床的好朋友。`,
      moods: ['感恩', '幸福', '思念'],
      types: ['友情'],
      reply: `老苏：

看到这封信的时候，我正坐在你家客厅里，你家那个小丫头正骑在我脖子上喊"驾驾驾"。

我们确实还像以前一样，见面就有说不完的话。只不过话题从"哪个男生好看"变成了"哪个幼儿园靠谱"，从"考试挂科怎么办"变成了"房贷利率又涨了"。

但你知道吗？每次和你聊天，我都觉得自己还是当年那个站在教学楼走廊里，和你一起偷看喜欢的男生的小姑娘。

谢谢你一直在。养老院说好了，谁先去谁占床位。
—— 老陈，于你家客厅`,
      isPublic: 1,
      writeDate: '2026-05-20'
    },
    {
      user: 'zhoumo',
      recipient: '十年后的自己',
      salutation: '周末：',
      content: `今天我做了一个决定——辞职。

在这家公司待了三年，从一个什么都不会的新人，做到了小组负责人。薪水不错，同事也很好，但我每天醒来都觉得很累，不是身体累，是心里空落落的。

我想去做自己真正喜欢的事情——画画。你知道的，我从小就喜欢涂涂画画，大学选了计算机专业是因为"好找工作"，但这么多年过去了，我心里那团火从来没灭过。

朋友们都说我疯了，三十岁了还折腾什么。但我想，如果现在不做，十年后的我一定会后悔。

十年后的我，你现在在做什么呢？是成了一个小有名气的插画师，还是灰溜溜地回去上班了？

不管怎样，我不后悔。`,
      moods: ['勇敢', '迷茫', '期待'],
      types: ['成长', '梦想'],
      reply: `你好呀，三十岁的我。

我现在正坐在自己的工作室里，窗外是一片银杏林。桌上的手绘板用了八年，边缘都磨白了，但我还舍不得换。

你问我有没有后悔？说实话，有过。最穷的时候，连房租都差点交不起，那时候真的怀疑过自己的选择。

但是啊——当我第一次接到商稿的时候，当我的插画印在杂志封面上的时候，当有人在评论里说"你的画治愈了我"的时候，我就知道，一切都值得。

谢谢你当年的勇气。
—— 四十岁的你，于银杏工作室`,
      isPublic: 1,
      writeDate: '2026-03-08'
    },
    {
      user: 'linwanqing',
      recipient: '十年后的父母',
      salutation: '亲爱的爸爸妈妈：',
      content: `今天是妈妈的生日，我给您打了视频电话。您说家里一切都好，让我别惦记。可我看见您鬓角的白发又多了一些，爸爸的背好像也更驼了。

来北京读研两年了，回家的次数屈指可数。每次你们都说"忙就别回来了"，但我知道，你们其实天天都在盼着我回去。

十年后，我应该工作了吧？应该有能力把你们接过来住了吧？那时候我一定要多陪陪你们，带你们去看看祖国的大好河山，就像小时候你们带我去公园一样。

妈，您的腰不好，别老是坐着打麻将。爸，您的血压高，少喝点酒。你们一定要好好的，等我孝敬你们。

我爱你们。`,
      moods: ['思念', '感恩', '幸福'],
      types: ['亲情'],
      reply: `我的好女儿：

看到你的信，你妈又哭了，说我们女儿长大了。

你放心，我们身体都好着呢。你妈每天跳广场舞，我呢，就和老伙计们下下棋、钓钓鱼。日子过得充实得很。

你在外面好好工作，不用惦记我们。你过得好，就是对我们最大的孝顺。

对了，你说要接我们去北京住，我们不去。金窝银窝不如自己的狗窝，在这里住了一辈子，街坊邻居都熟，换个地方我们还不习惯呢。

你常回来看看就行。
—— 爱你的爸爸妈妈`,
      isPublic: 1,
      writeDate: '2026-04-22'
    },
    {
      user: 'sunian',
      recipient: '十年后的自己',
      salutation: '苏念：',
      content: `今天我终于拿到了那家公司的 offer。从投简历到最终录用，整整面了六轮，每一轮都像在闯关。

说起来你可能不信，我面试前一天晚上紧张到失眠，翻来覆去地想：要是面不上怎么办？要是被问到答不上来的问题怎么办？

结果到了现场，反而平静了。大概是因为准备得足够充分吧。

十年后的我，你还在这家公司吗？还是已经去了更远的地方？你有没有成为自己想成为的那种人——自信、从容、不被任何事情打倒？

我正在努力，一步一步地，朝你走去。`,
      moods: ['期待', '勇敢', '幸福'],
      types: ['成长', '事业'],
      reply: `你好呀，刚拿到 offer 的小苏。

我告诉你一个秘密——我不在那家公司了。

我在第三年的时候跳槽去了一家创业公司，从0到1搭建了整个产品体系。虽然比以前累，但也比以前更有成就感。

你问我有没有成为自信从容的人？嗯...大部分时候是的，但偶尔也会焦虑，也会自我怀疑。但我学会了和这些情绪和平共处。

告诉你，你比你想象的要勇敢得多。继续往前走吧，前面的风景很好。
—— 十年后的你，于某个加班后星光璀璨的夜晚`,
      isPublic: 1,
      writeDate: '2026-06-01'
    },
    // ========== 私有信件 ==========
    {
      user: 'chenyu',
      recipient: '十年后的自己',
      salutation: '陈屿：',
      content: `今天是她结婚的日子。

我在朋友圈看到了她的婚纱照，她笑得很好看，新郎看起来也很靠谱。

说不难过是假的。毕竟喜欢了整整七年，从高中到大学，再到毕业各奔东西。我一直没敢说出口，总觉得等自己更好一点再说，结果等着等着，她就成了别人的新娘。

十年后的我，你有没有遇见那个对的人？你有没有学会勇敢一点，不要等错过了才后悔？

如果遇见了，一定要好好珍惜。`,
      moods: ['遗憾', '思念', '勇敢'],
      types: ['爱情'],
      reply: `陈屿：

看到这封信，我沉默了很久。

我确实遇见了那个对的人，但不是你想象中的"她"。我后来才明白，有些人注定只能陪你走一段路，而那段路的意义，是让你成为更好的自己。

你问我有没有学会勇敢？学会了。但也学会了接受遗憾。

人生就是这样的，不是所有喜欢都要有结果。那些没说出口的话，那些错过的人，都会变成你生命里的养分。

好好生活，会有人来爱你的。
—— 十年后的你`,
      isPublic: 0,
      writeDate: '2026-05-03'
    },
    {
      user: 'zhoumo',
      recipient: '十年后的自己',
      salutation: '周末：',
      content: `辞职三个月了，存款花了快一半。

接了几个小单子，收入不稳定，时好时坏。有时候画到凌晨，看着窗外漆黑的夜空，会突然觉得很孤独。

朋友们都在劝我回去上班，说"画画当爱好就好了，当饭吃会饿死的"。我嘴上说着没关系，心里其实也在打鼓。

我能行吗？我选的这条路，是对的吗？

算了，不想了。既然选了，就再走走看吧。大不了，就当给自己放了一年的假。`,
      moods: ['迷茫', '焦虑', '勇敢'],
      types: ['梦想'],
      reply: `嘿，三个月的我。

你知道你现在住的这个小区吗？十年后，它旁边开了一家很棒的咖啡馆，我经常去那里画画。

你问你选的路对不对？我没法回答你。因为人生没有标准答案，选了A就会想B，选了B就会想A。

但我可以告诉你的是——你坚持下来了。而且你画得越来越好，真的。

再撑一撑，好吗？
—— 十年后的你`,
      isPublic: 0,
      writeDate: '2026-06-18'
    }
  ]

  for (const letter of letters) {
    const userId = userIds[letter.user]
    await run(
      `INSERT INTO letters (user_id, recipient, salutation, content, moods, types, reply, is_public, write_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        letter.recipient,
        letter.salutation,
        letter.content,
        JSON.stringify(letter.moods),
        JSON.stringify(letter.types),
        letter.reply,
        letter.isPublic,
        letter.writeDate
      ]
    )
    console.log(`  ✓ ${letter.recipient} (${letter.moods.join('/')}) - ${letter.isPublic ? '公开' : '私有'}`)
  }

  // 4. 创建时光胶囊
  console.log('创建时光胶囊...')
  const capsules = [
    {
      user: 'linwanqing',
      name: '2026年夏天的味道',
      items: [
        { type: '话语', content: '这个夏天一定要去看一次海，要在沙滩上踩出脚印，要让海浪打湿裤脚。' },
        { type: '歌曲', content: '晴天 - 周杰伦' },
        { type: '照片', content: '图书馆窗外的梧桐树' },
        { type: '秘密', content: '其实我偷偷喜欢图书馆三楼那个穿白衬衫的男生，但我从来不敢和他说话。' },
        { type: '愿望', content: '希望十年后的我，依然热爱夏天，依然会为一朵云停下脚步。' }
      ],
      openDate: '2036-07-01',
      isPublic: 1
    },
    {
      user: 'sunian',
      name: '毕业时的期许',
      items: [
        { type: '希望', content: '希望十年后我能在喜欢的城市，做着喜欢的工作，身边有喜欢的人。' },
        { type: '愿望', content: '希望爸妈身体健康，希望老友常伴左右。' },
        { type: '秘密', content: '毕业答辩的时候我紧张到忘词，还好老师没为难我。这件事我谁都没说。' }
      ],
      openDate: '2036-06-20',
      isPublic: 1
    },
    {
      user: 'chenyu',
      name: '十年后的约定',
      items: [
        { type: '话语', content: '十年后的我，你还记得今天的梦想吗？你还在为它努力吗？' },
        { type: '歌曲', content: '夜空中最亮的星 - 逃跑计划' },
        { type: '照片', content: '橙子一岁生日的照片' },
        { type: '愿望', content: '希望十年后，我爱的人都在身边。' }
      ],
      openDate: '2036-05-20',
      isPublic: 0
    },
    {
      user: 'zhoumo',
      name: '辞职那天',
      items: [
        { type: '话语', content: '2026年3月8日，我辞职了。不知道未来会怎样，但我想试试。' },
        { type: '照片', content: '最后一天下班拍的公司大楼' },
        { type: '歌曲', content: '追梦赤子心 - GALA' },
        { type: '愿望', content: '希望十年后的我，不会后悔今天的决定。' }
      ],
      openDate: '2036-03-08',
      isPublic: 1
    }
  ]

  for (const cap of capsules) {
    const userId = userIds[cap.user]
    await run(
      'INSERT INTO capsules (user_id, name, items, open_date, is_public) VALUES (?, ?, ?, ?, ?)',
      [userId, cap.name, JSON.stringify(cap.items), cap.openDate, cap.isPublic]
    )
    console.log(`  ✓ ${cap.name} (${cap.isPublic ? '公开' : '私有'})`)
  }

  // 5. 创建留言墙消息
  console.log('创建留言墙消息...')
  const wallMessages = [
    { user: 'linwanqing', content: '愿所有正在努力的人，都能被世界温柔以待。加油！', type: 'encourage', likes: 42 },
    { user: 'chenyu', content: '今天是我坚持跑步的第100天，从跑两步就喘到能跑完五公里。你看，只要不放弃，就一定会变好的。', type: 'growth', likes: 38 },
    { user: 'sunian', content: '刚刚和暗恋了三年的人表白了，虽然被拒绝了，但至少我勇敢了一回！', type: 'love', likes: 56 },
    { user: 'zhoumo', content: '"你不必生来勇敢，天赋过人，只要能投入勤奋，诚诚恳恳。" 这句话送给每一个在路上的人。', type: 'encourage', likes: 67 },
    { user: 'linwanqing', content: '最近心情不太好，但来这里看了看大家的留言，感觉温暖了很多。谢谢你们。', type: 'healing', likes: 29 },
    { user: 'chenyu', content: '今天橙子学会握手了！虽然只是为了吃零食，但我还是很开心。', type: 'growth', likes: 24 },
    { user: 'sunian', content: '拿到人生第一笔工资的时候，我给爸妈各买了一件礼物。他们嘴上说浪费钱，转头就拍照发了朋友圈。', type: 'love', likes: 73 },
    { user: 'zhoumo', content: '画了一整天，眼睛都花了，但看到成品的那一刻，觉得一切都值了。', type: 'growth', likes: 31 },
    { user: 'linwanqing', content: '考研上岸了！！！感谢去年那个没有放弃的自己！', type: 'encourage', likes: 89 },
    { user: 'sunian', content: '给所有深夜还没睡的人说一声：晚安，明天又是新的一天。', type: 'healing', likes: 45 }
  ]

  for (const msg of wallMessages) {
    const userId = userIds[msg.user]
    await run(
      'INSERT INTO wall_messages (user_id, content, type, likes) VALUES (?, ?, ?, ?)',
      [userId, msg.content, msg.type, msg.likes]
    )
    console.log(`  ✓ ${msg.content.substring(0, 20)}... (${msg.likes}赞)`)
  }

  // 6. 创建树洞消息
  console.log('创建树洞消息...')
  const treeholeMessages = [
    {
      user: 'linwanqing',
      content: '考研倒计时还有167天，数学真题做了三遍还是会错，我真的能考上吗？有时候真的好怕自己的努力都是白费。',
      emotion: '迷茫',
      reply: '亲爱的朋友，我听到了你心里的不安。考研这条路确实不容易，但你已经走了这么远了，不是吗？做三遍还会错没关系，那就做第四遍、第五遍。每一次犯错，都是在离正确更近一步。你不是在白费努力，你是在一点点积累力量。相信自己，你比你想象的要强大得多。',
      song: '夜空中最亮的星 - 逃跑计划'
    },
    {
      user: 'zhoumo',
      content: '辞职三个月了，存款越来越少，接的单子也不稳定。朋友们都劝我回去上班，我是不是真的太任性了？',
      emotion: '焦虑',
      reply: '我懂这种感觉——选择一条不那么"安全"的路，总会有自我怀疑的时候。但你知道吗？能为自己的梦想勇敢一次的人，已经比很多人都了不起了。存款会少，但经验和成长是你的。如果实在撑不住，给自己设一条"底线"，比如"再撑半年，如果还是不行就回去"，但现在，再给自己一点时间好吗？',
      song: '追梦赤子心 - GALA'
    },
    {
      user: 'chenyu',
      content: '今天她结婚了，我在朋友圈看到了照片。她笑得很好看。我喜欢了她七年，从来没说过。现在说什么都晚了。',
      emotion: '遗憾',
      reply: '七年的喜欢，说放下哪有那么容易。我知道你现在心里一定很难受。但请你相信，有些喜欢之所以美好，正是因为它停留在最纯粹的时刻。你没有说出口，不是因为你不够勇敢，而是因为你太珍惜这份感情了。下一次，遇到喜欢的人，记得要勇敢一点。好吗？',
      song: '后来 - 刘若英'
    },
    {
      user: 'sunian',
      content: '今天终于拿到了梦想公司的offer！！！面了六轮，每一轮都像在打仗。我做到了！！！',
      emotion: '开心',
      reply: '哇，太棒了！恭喜恭喜！！！六轮面试都撑下来了，你真的很厉害！这份offer是你应得的，是你无数个熬夜准备的夜晚换来的。好好庆祝一下吧，然后带着这份喜悦，去迎接新的挑战。未来的路还很长，但我知道你一定可以的！',
      song: '阳光总在风雨后 - 许美静'
    }
  ]

  for (const msg of treeholeMessages) {
    const userId = userIds[msg.user]
    await run(
      'INSERT INTO treehole_messages (user_id, content, emotion, reply, song) VALUES (?, ?, ?, ?, ?)',
      [userId, msg.content, msg.emotion, msg.reply, msg.song]
    )
    console.log(`  ✓ [${msg.emotion}] ${msg.content.substring(0, 20)}...`)
  }

  // 7. 创建打卡记录
  console.log('创建打卡记录...')
  const challengeRecords = [
    { user: 'linwanqing', date: '2026-07-09', content: '今天学了10个小时，数学真题又刷了一套，正确率提高了！' },
    { user: 'linwanqing', date: '2026-07-08', content: '背了200个单词，阅读只错了一个，开心！' },
    { user: 'linwanqing', date: '2026-07-07', content: '专业课复习到第三章了，虽然难但慢慢在啃。' },
    { user: 'chenyu', date: '2026-07-09', content: '今天带橙子去公园跑了五公里，它累得直喘气。' },
    { user: 'chenyu', date: '2026-07-08', content: '学了一道新菜——番茄牛腩，虽然盐放多了但还能吃。' },
    { user: 'sunian', date: '2026-07-09', content: '入职第一天，认识了新同事，感觉公司氛围还不错。' },
    { user: 'zhoumo', date: '2026-07-09', content: '今天画了一幅小插画，虽然是商稿但画得很开心。' },
    { user: 'zhoumo', date: '2026-07-08', content: '接了一个新单子，价格还不错，这个月房租有了。' }
  ]

  for (const record of challengeRecords) {
    const userId = userIds[record.user]
    await run(
      'INSERT INTO challenge_records (user_id, date, content) VALUES (?, ?, ?)',
      [userId, record.date, record.content]
    )
    console.log(`  ✓ ${record.date} - ${record.content.substring(0, 20)}...`)
  }

  // 8. 统计结果
  console.log('\n========== 数据植入完成 ==========')
  const userCount = await get('SELECT COUNT(*) as c FROM users')
  const letterCount = await get('SELECT COUNT(*) as c FROM letters')
  const publicLetterCount = await get('SELECT COUNT(*) as c FROM letters WHERE is_public = 1')
  const capsuleCount = await get('SELECT COUNT(*) as c FROM capsules')
  const wallCount = await get('SELECT COUNT(*) as c FROM wall_messages')
  const treeholeCount = await get('SELECT COUNT(*) as c FROM treehole_messages')
  const challengeCount = await get('SELECT COUNT(*) as c FROM challenge_records')

  console.log(`用户: ${userCount.c}`)
  console.log(`信件: ${letterCount.c} (公开 ${publicLetterCount.c} 封)`)
  console.log(`胶囊: ${capsuleCount.c}`)
  console.log(`留言墙: ${wallCount.c}`)
  console.log(`树洞: ${treeholeCount.c}`)
  console.log(`打卡记录: ${challengeCount.c}`)
  console.log('\n演示账号：')
  console.log('  普通用户: linwanqing / demo123 (林晚晴)')
  console.log('  普通用户: chenyu / demo123 (陈屿)')
  console.log('  普通用户: sunian / demo123 (苏念)')
  console.log('  普通用户: zhoumo / demo123 (周末)')
  console.log('\n如需创建管理员，请运行: node scripts/create-admin.js <用户名> <密码>')

  db.close()
}

seed().catch(err => {
  console.error('植入失败:', err)
  db.close()
  process.exit(1)
})
