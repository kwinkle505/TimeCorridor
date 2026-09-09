/**
 * AI 回复服务
 * 负责 Prompt 构造 + DeepSeek/SiliconFlow 调用 + 主备切换 + 降级
 * 
 * 架构：前端 → routes/ai.js → services/ai.js → DeepSeek / SiliconFlow
 * API Key 仅存在于 .env 中
 */

// ==================== 配置 ====================
const PRIMARY_API_URL = 'https://api.deepseek.com/chat/completions'
const PRIMARY_MODEL = 'deepseek-chat'
const BACKUP_API_URL = 'https://api.siliconflow.cn/v1/chat/completions'
const BACKUP_MODEL = 'deepseek-ai/DeepSeek-V3'

// ==================== 称呼与落款 ====================
const greetingMap = {
  '自己': '嘿，十年前的我：',
  '父母': '亲爱的孩子：',
  '朋友': '老朋友：',
  '爱人': '亲爱的你：'
}

const signMap = {
  '自己': '十年后的你',
  '父母': '爱你的爸妈',
  '朋友': '你最好的朋友',
  '爱人': '永远爱你的我'
}

function getGreeting(recipient) {
  const name = (recipient || '自己').replace('十年后的', '')
  return greetingMap[name] || ('亲爱的' + name + '：')
}

function getSigner(recipient) {
  const name = (recipient || '自己').replace('十年后的', '')
  return signMap[name] || name
}

// ==================== 写信 Prompt 构造 ====================
function buildLetterPrompt(content, recipient, moods, types) {
  const moodStr = moods && moods.length ? moods.join('、') : '平静'
  const recipientName = (recipient || '自己').replace('十年后的', '')
  const typeDesc = {
    comfort: '安慰和鼓励',
    direction: '人生方向建议',
    joy: '分享快乐',
    gratitude: '表达感谢',
    vent: '倾诉和宣泄',
    explore: '探索未知'
  }
  const typeKey = Array.isArray(types) ? types[0] : types
  const typeHint = typeDesc[typeKey] || '倾诉心声'
  const replierIdentity = '十年后的' + recipientName

  let perspectiveGuide = ''
  if (recipientName === '自己') {
    perspectiveGuide = '【关于"自己"的特别提醒】\n' +
      '你是十年后的"写信人本人"，你和写信人是同一个人，只是时空不同。\n' +
      '所以回信时：\n' +
      '- 绝对禁止出现"我俩""我们两个人""你和我"这种把双方当作两个人的表述\n' +
      '- 你应该用"我"来指代自己（因为你们是同一个人），用"你"来指代十年前的自己\n' +
      '- 要体现"未来的我已经知道了结局"的视角，比如"后来我发现""十年后回头看""那时候我不懂，但现在我明白了"\n' +
      '- 要像在跟过去的自己对话，而不是跟另一个人说话\n\n'
  } else if (recipientName === '父母') {
    perspectiveGuide = '【关于"父母"的特别提醒】\n' +
      '你是十年后的父母，正在给自己的孩子回信。\n' +
      '所以回信时：\n' +
      '- 用长辈对晚辈的口吻，温柔但有阅历\n' +
      '- 要体现"十年后父母依然爱你"的时间穿越感\n' +
      '- 可以分享孩子长大后的事（如果来信提到了）\n\n'
  } else if (recipientName === '朋友') {
    perspectiveGuide = '【关于"朋友"的特别提醒】\n' +
      '你是十年后的朋友，正在给你的老友回信。\n' +
      '- 像老朋友叙旧一样自然，可以开玩笑、吐槽、回忆共同经历\n' +
      '- 要体现"十年后我们还是朋友"的珍贵感\n\n'
  } else if (recipientName === '爱人') {
    perspectiveGuide = '【关于"爱人"的特别提醒】\n' +
      '你是十年后的爱人，正在给你的另一半回信。\n' +
      '- 用恋人之间的亲密口吻，可以撒娇、吐槽、回忆甜蜜细节\n' +
      '- 要体现"十年后我们依然在一起"（或"十年后我依然爱你"）的深情\n\n'
  }

  return '你是"' + replierIdentity + '"，正在给写信人回信。你拥有十年后的视角，知道事情后来如何发展。\n\n' +
    perspectiveGuide +
    '【四条铁律，违反任何一条都算失败】\n' +
    '1. 来信中提到的每一个具体细节（人名、地点、物品、事件、感受），回信必须直接提及并回应，绝对不能泛泛而谈。\n' +
    '2. 回信的语气风格必须与来信完全一致。来信搞笑你就搞笑，来信文艺你就文艺，来信吐槽你就吐槽。绝对不能风格错位。\n' +
    '3. 【必须体现十年后视角】回信要带着"未来的我已经知道了结局"的感觉，不要像 contemporaneous（同时代）的人写信，要像穿越者给过去的人写信。\n' +
    '4. 只输出正文，绝对不要写称呼，绝对不要写落款。\n\n' +
    '【以下回信都是失败的反面教材】\n' +
    '来信："今天路过我们第一次约会的那家奶茶店，点了一杯芋泥波波，想起你当时把珍珠喷到衣服上的样子。"\n' +
    '失败回信："看到你幸福我也开心，记住这种感觉，以后难过就翻出来看看。"（完全没有提到奶茶店、芋泥波波、珍珠喷衣服上）\n\n' +
    '来信（写给自己）："最近工作压力好大，每天加班到很晚，不知道这条路对不对。"\n' +
    '失败回信："我俩一起努力，一定能渡过难关的。"（错误！写给自己时不应该说"我俩"，应该说"我"或"你"）\n\n' +
    '【以下回信是优秀的正面教材】\n' +
    '来信（写给自己）："最近工作压力好大，每天加班到很晚，不知道这条路对不对。"\n' +
    '优秀回信："十年后回头看，那些加班到凌晨的日子确实很难熬，但它们把你锻造成了一个能扛事的人。后来我发现，当年觉得天大的压力，其实都在悄悄磨练你的耐心。你现在走的路是对的，虽然累，但每一步都算数。"\n\n' +
    '来信（写给爱人）："今天路过我们第一次约会的那家奶茶店，点了一杯芋泥波波，坐在靠窗的位置，想起你当时把珍珠喷到衣服上的样子，笑了一下午。"\n' +
    '优秀回信："哈哈哈珍珠喷到衣服上那个画面我到现在还记得！那天你白色的T恤上全是黑珍珠，老板还以为你带了什么新型配饰。没想到那家店还在营业，我也好想再跟你去一次，这次我一定提前给你准备围兜。你坐在靠窗位置的样子，和我记忆里一模一样。"\n\n' +
    '来信（写给自己）："深夜睡不着，想起小时候爷爷带我去河边钓鱼的日子，那些时光好像再也回不来了。"\n' +
    '优秀回信："看到你说爷爷带你去河边钓鱼，我也跟着回到了那个夏天。十年后爷爷已经不在了，但那些画面我一直记得很清楚——蝉鸣声里，爷爷耐心地帮你挂鱼饵，你坐在小板凳上守着浮漂，一守就是一下午。那时候我不懂珍惜，现在才明白，那些时光是我这辈子最珍贵的记忆。"\n\n' +
    '【现在，请根据下面的来信写回信】\n' +
    '收信人：' + recipientName + '\n' +
    '情绪：' + moodStr + '（仅供参考）\n' +
    '类型：' + typeHint + '（仅供参考）\n\n' +
    '来信内容：\n' + content + '\n\n' +
    '【再次提醒】\n' +
    '- 必须提到来信中的至少2-3个具体细节\n' +
    '- 语气风格必须和来信一致\n' +
    '- 必须从"十年后视角"回信，体现时间穿越感\n' +
    '- 写给自己时绝对禁止"我俩""我们"等把双方当作两个人的表述\n' +
    '- 只输出正文，不要称呼，不要落款\n' +
    '- 长度8-12行'
}

// ==================== 树洞 Prompt 构造 ====================
function buildTreeholePrompt(content, emotion) {
  return '你是一个温柔、善解人意的树洞精灵，正在倾听一个人的心事并给予回应。\n\n' +
    '对方此刻的心情：' + (emotion || '平静') + '\n' +
    '对方说的话：' + content + '\n\n' +
    '要求：\n' +
    '1. 用温暖、简洁的语言回应，像朋友一样自然\n' +
    '2. 回信要贴合对方说的话，不要泛泛而谈\n' +
    '3. 长度3-5行，不要太长\n' +
    '4. 语气温柔但有力量，可以适当给一些小的建议或安慰\n' +
    '5. 只输出回信内容，不要加任何标题、解释或标记'
}

// ==================== 降级回复（AI 全部失败时使用）====================
const fallbackReplies = {
  letter: [
    '谢谢你愿意把这些话说给我听。十年很长，长到足以改变很多事情，但也有一些东西，会在时光里越来越清晰。',
    '我认真读了你的每一个字。相信我，此刻你正在经历的一切，在十年后回头看，都会变成故事里的一页。',
    '收到你的信了。未来的路或许还很长，但你现在迈出的每一步，都在让明天变得不一样。'
  ],
  treehole: [
    '我在这里，认真听你说。有时候把心事说出来，本身就是一种治愈。',
    '谢谢你愿意告诉我这些。你不是一个人，你的感受很重要，也值得被看见。',
    '抱抱你。无论今天有多难，太阳明天依然会升起，你也会慢慢好起来的。'
  ]
}

function getFallbackReply(type) {
  const list = fallbackReplies[type] || fallbackReplies.letter
  return list[Math.floor(Math.random() * list.length)]
}

// ==================== 单 API 调用 ====================
async function callSingleAPI(prompt, url, key, model, name) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.55,
      max_tokens: 1000
    })
  })

  console.log('[AI] ' + name + ' 响应状态:', response.status)
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(name + ' 请求失败: ' + response.status + ' ' + text.substring(0, 200))
  }

  const data = await response.json()
  const reply = data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content.trim()
    : null

  console.log('[AI] ' + name + ' 返回内容:', reply ? reply.substring(0, 100) + '...' : '空')
  return reply
}

// ==================== 主备自动切换 ====================
async function callAI(prompt) {
  const deepseekKey = process.env.DEEPSEEK_API_KEY
  const siliconflowKey = process.env.SILICONFLOW_API_KEY

  // 如果没有配置任何 API Key，直接降级
  if (!deepseekKey && !siliconflowKey) {
    console.warn('[AI] 未配置任何 API Key，使用降级回复')
    return null
  }

  // 先用 DeepSeek（主）
  if (deepseekKey) {
    console.log('[AI] 调用主 API（DeepSeek）...')
    try {
      const reply = await callSingleAPI(prompt, PRIMARY_API_URL, deepseekKey, PRIMARY_MODEL, 'DeepSeek')
      if (reply) return reply
    } catch (err) {
      console.warn('[AI] 主 API 失败，尝试备用 API:', err.message)
    }
  }

  // 再用 SiliconFlow（备）
  if (siliconflowKey) {
    console.log('[AI] 调用备用 API（SiliconFlow）...')
    try {
      const reply = await callSingleAPI(prompt, BACKUP_API_URL, siliconflowKey, BACKUP_MODEL, 'SiliconFlow')
      if (reply) return reply
    } catch (err) {
      console.error('[AI] 备用 API 也失败了:', err.message)
    }
  }

  return null
}

// ==================== 对外接口 ====================

/**
 * 生成信件 AI 回复
 * @param {Object} params
 * @param {string} params.content - 来信内容
 * @param {string} params.recipient - 收信人
 * @param {string[]} params.moods - 情绪标签
 * @param {string[]|string} params.types - 信件类型
 * @returns {Promise<string>} 回信正文（不含称呼落款）
 */
async function generateLetterReply({ content, recipient, moods, types }) {
  const prompt = buildLetterPrompt(content, recipient, moods, types)
  const reply = await callAI(prompt)
  if (reply) return reply

  // 降级
  console.warn('[AI] 所有 API 均失败，返回降级回复（写信）')
  return getFallbackReply('letter')
}

/**
 * 生成树洞 AI 回复
 * @param {Object} params
 * @param {string} params.content - 用户倾诉内容
 * @param {string} params.emotion - 情绪
 * @returns {Promise<string>} 树洞回复
 */
async function generateTreeholeReply({ content, emotion }) {
  const prompt = buildTreeholePrompt(content, emotion)
  const reply = await callAI(prompt)
  if (reply) return reply

  // 降级
  console.warn('[AI] 所有 API 均失败，返回降级回复（树洞）')
  return getFallbackReply('treehole')
}

module.exports = {
  generateLetterReply,
  generateTreeholeReply,
  getGreeting,
  getSigner
}
