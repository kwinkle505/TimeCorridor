/**
 * 句签库模块
 * 提供暖心句子、每日句签、随机句签功能
 */

/**
 * 句签数组，每条包含文本、出处、主题
 * theme 可选值: 'growth'(成长), 'courage'(勇气), 'love'(爱), 'loneliness'(孤独),
 *              'persistence'(坚持), 'gentleness'(温柔), 'hope'(希望), 'self'(自我)
 */
export const quotes = [
  { text: '你不必生来勇敢，天赋过人，只要能投入勤奋，诚诚恳恳。', source: '佚名', theme: 'growth' },
  { text: '万物皆有裂痕，那是光照进来的地方。', source: '莱昂纳德·科恩', theme: 'hope' },
  { text: '生活不是等待暴风雨过去，而是学会在雨中跳舞。', source: '维维安·格林', theme: 'courage' },
  { text: '如果你累了，学会休息，而不是放弃。', source: '佚名', theme: 'persistence' },
  { text: '你值得这世间所有的温柔与美好。', source: '佚名', theme: 'gentleness' },
  { text: '愿你被这个世界温柔以待，即使生命总以刻薄荒芜相欺。', source: '佚名', theme: 'gentleness' },
  { text: '你所经历的每一次低谷，都是为了下一次更高的飞跃。', source: '佚名', theme: 'growth' },
  { text: '别因为害怕结束，就拒绝所有的开始。', source: '佚名', theme: 'courage' },
  { text: '你要悄悄拔尖，然后惊艳所有人。', source: '佚名', theme: 'growth' },
  { text: '世界那么大，人生那么长，总会有一个人让你想要温柔以待。', source: '宫崎骏', theme: 'love' },
  { text: '陪伴是最长情的告白。', source: '佚名', theme: 'love' },
  { text: '孤独是人生的必修课，而学会与自己和解是这门课的满分答案。', source: '佚名', theme: 'loneliness' },
  { text: '有些路只能一个人走，有些风景只能一个人看。', source: '佚名', theme: 'loneliness' },
  { text: '星星发亮是为了让每一个人有一天都能找到属于自己的星星。', source: '小王子', theme: 'hope' },
  { text: '哪怕是最微小的光芒，也能照亮前行的方向。', source: '佚名', theme: 'hope' },
  { text: '真正的勇敢不是不害怕，而是害怕的时候依然去做该做的事。', source: '佚名', theme: 'courage' },
  { text: '坚持的意义：以后的日子里，放眼望去，全部都是自己喜欢的人和事。', source: '佚名', theme: 'persistence' },
  { text: '每一个不曾起舞的日子，都是对生命的辜负。', source: '尼采', theme: 'self' },
  { text: '成为你自己，因为别人都有人做了。', source: '奥斯卡·王尔德', theme: 'self' },
  { text: '你生而有翼，为何竟愿一生匍匐前进，形如虫蚁？', source: '鲁米', theme: 'self' },
  { text: '愿你在被打击时，记起你的珍贵，抵抗恶意。', source: '佚名', theme: 'self' },
  { text: '爱自己是终身浪漫的开始。', source: '奥斯卡·王尔德', theme: 'self' },
  { text: '愿你一生努力，一生被爱，想要的都拥有，得不到的都释怀。', source: '八月长安', theme: 'hope' },
  { text: '山有顶峰，湖有彼岸，在人生漫漫长途中，万物皆有回转。', source: '佚名', theme: 'persistence' },
  { text: '请再悄悄加点油，无论如何都想听你说：我终于成为不负众望的人了。', source: '佚名', theme: 'persistence' },
  { text: '当下的每一次呼吸，都是生命的馈赠。', source: '佚名', theme: 'gentleness' },
  { text: '温柔半两，从容一生。', source: '林清玄', theme: 'gentleness' },
  { text: '人生如逆旅，我亦是行人。', source: '苏轼', theme: 'loneliness' },
  { text: '世界上只有一种真正的英雄主义，就是认清了生活的真相后还依然热爱它。', source: '罗曼·罗兰', theme: 'courage' },
  { text: '愿你走出半生，归来仍是少年。', source: '佚名', theme: 'growth' },
  { text: '无人问津也好，技不如人也罢，你都要试着安静下来，去做自己该做的事。', source: '佚名', theme: 'persistence' },
  { text: '你的负担将变成礼物，你受的苦将照亮你的路。', source: '泰戈尔', theme: 'growth' },
  { text: '黑夜无论怎样悠长，白昼总会到来。', source: '莎士比亚', theme: 'hope' },
  { text: '向日葵告诉我，只要面对着阳光努力向上，日子就会变得单纯而美好。', source: '几米', theme: 'hope' },
  { text: '纵使人间不值得，我也从未辜负过人间。', source: '佚名', theme: 'self' },
  { text: '慢也好，步子小也好，是在往前走就好。', source: '佚名', theme: 'persistence' },
  { text: '生活能治愈的，是愿意好起来的人。', source: '佚名', theme: 'hope' },
  { text: '花开不是为了花落，而是为了开得更加灿烂。', source: '佚名', theme: 'growth' },
  { text: '去发光，而不是被照亮。', source: '佚名', theme: 'self' },
  { text: '世界上所有的惊喜和好运，都是你积累的温柔和善良。', source: '佚名', theme: 'gentleness' },
  { text: '你要相信，你生命里遇到的每个人每件事，都有它的价值和意义。', source: '佚名', theme: 'growth' },
  { text: '不必行色匆匆，不必光芒四射，不必成为别人，只需做自己。', source: '弗吉尼亚·伍尔夫', theme: 'self' },
  { text: '最好的时光，是你在我身边。', source: '佚名', theme: 'love' },
  { text: '不是因为看到希望才坚持，而是因为坚持了才看到希望。', source: '佚名', theme: 'persistence' },
  { text: '每个人的生命中，都有最艰难的那一年，将人生变得美好而辽阔。', source: '加布瑞埃拉·泽文', theme: 'growth' },
  { text: '你要储蓄你的可爱，眷顾你的善良，变得勇敢。', source: '佚名', theme: 'gentleness' },
  { text: '风停在窗边，嘱咐你要热爱这个世界。', source: '佚名', theme: 'hope' },
  { text: '你不一定非得长成玫瑰，你乐意的话，做茉莉，做雏菊，做千千万万。', source: '佚名', theme: 'self' },
  { text: '太阳下山了夜里也有灯打开，你看这世界不坏。', source: '佚名', theme: 'hope' },
  { text: '哪怕生活不宠你，也要好好善待自己。', source: '佚名', theme: 'self' },
  { text: '一生很短，晨暮与春秋；一生所求，平安与自由。', source: '佚名', theme: 'gentleness' },
  { text: '保持热爱，奔赴山海。', source: '佚名', theme: 'courage' },
  { text: '终有一天，你会静心下来，像个局外人一样看自己的故事，笑着摇摇头。', source: '佚名', theme: 'growth' },
  { text: '不必慌张，活好当下，来日方长；不必失望，人间值得，未来可期。', source: '佚名', theme: 'hope' },
  { text: '你若爱，生活哪里都可爱。', source: '丰子恺', theme: 'love' },
  { text: '岁月漫长，然而值得等待。', source: '村上春树', theme: 'persistence' },
  { text: '我们在黑暗中并肩前行，走在各自的朝圣路上。', source: '周国平', theme: 'loneliness' },
  { text: '活在这珍贵的人间，太阳强烈，水波温柔。', source: '海子', theme: 'gentleness' },
  { text: '人生如茶，空杯以对，才有喝不完的好茶。', source: '佚名', theme: 'growth' }
]

/**
 * 根据日期种子返回固定句签
 * 同一天返回相同的句签，让用户每天都有专属的一句话
 * @param {Date|string} date - 日期对象或日期字符串，默认为今天
 * @returns {Object} 句签对象，包含 index 字段表示在数组中的位置
 */
export function getDailyQuote(date = new Date()) {
  const d = new Date(date)
  // 以年月日作为种子，确保同一天结果固定
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()

  // 简单的确定性哈希算法
  let seed = year * 10000 + month * 100 + day
  seed = (seed * 9301 + 49297) % 233280
  const index = seed % quotes.length

  return {
    ...quotes[index],
    index
  }
}

/**
 * 随机返回一条句签
 * @param {number|null} excludeIndex - 需要排除的索引（避免连续重复）
 * @returns {Object} 句签对象，包含 index 字段
 */
export function getRandomQuote(excludeIndex = null) {
  if (quotes.length === 0) {
    return { text: '暂无句签', source: '', theme: 'hope', index: -1 }
  }
  if (quotes.length === 1) {
    return { ...quotes[0], index: 0 }
  }

  let index
  do {
    index = Math.floor(Math.random() * quotes.length)
  } while (index === excludeIndex)

  return {
    ...quotes[index],
    index
  }
}

/**
 * 按主题筛选句签
 * @param {string} theme - 主题名称
 * @returns {Array} 符合主题的句签数组
 */
export function getQuotesByTheme(theme) {
  return quotes.filter(q => q.theme === theme)
}

/**
 * 句签卡片渐变色库
 * 每个元素包含 from（起始色）、to（终止色）、name（名称）
 */
export const quoteGradients = [
  { from: '#1A2A3A', to: '#2C3E50', name: '深海蓝' },
  { from: '#D4926A', to: '#E88D5E', name: '暖阳橙' },
  { from: '#667eea', to: '#764ba2', name: '梦幻紫' },
  { from: '#f093fb', to: '#f5576c', name: '樱花粉' },
  { from: '#4facfe', to: '#00f2fe', name: '天空蓝' },
  { from: '#43e97b', to: '#38f9d7', name: '薄荷绿' },
  { from: '#fa709a', to: '#fee140', name: '落日霞' },
  { from: '#30cfd0', to: '#330867', name: '星河夜' },
  { from: '#ff9a9e', to: '#fecfef', name: '桃花粉' },
  { from: '#a18cd1', to: '#fbc2eb', name: '薰衣草' },
  { from: '#ffecd2', to: '#fcb69f', name: '蜜桃色' },
  { from: '#2C3E50', to: '#D4926A', name: '时空色' }
]

export default {
  quotes,
  quoteGradients,
  getDailyQuote,
  getRandomQuote,
  getQuotesByTheme
}
