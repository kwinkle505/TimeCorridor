/**
 * 徽章配置模块
 * 定义所有徽章及解锁条件，提供徽章进度检查功能
 */

/**
 * 徽章列表（共 8 个）
 * id: 唯一标识
 * name: 徽章名称
 * icon: 图标类名或 emoji（项目中可替换为具体图标字体）
 * condition: 解锁条件类型
 * description: 徽章描述
 * threshold: 触发阈值（部分徽章需要）
 */
export const badgeList = [
  {
    id: 'badge_first_letter',
    name: '初次倾诉',
    icon: '📝',
    condition: 'first_letter',
    description: '写下第一封信，把心事说给未来的自己听。',
    threshold: 1
  },
  {
    id: 'badge_treehole_10',
    name: '树洞常客',
    icon: '🌳',
    condition: 'treehole_count',
    description: '在树洞倾诉 10 次，每一次倾诉都是自我疗愈的开始。',
    threshold: 10
  },
  {
    id: 'badge_capsule_opened',
    name: '时光旅人',
    icon: '⏳',
    condition: 'capsule_opened',
    description: '打开第一个时间胶囊，与过去的自己重逢。',
    threshold: 1
  },
  {
    id: 'badge_wall_5_likes',
    name: '温暖传递者',
    icon: '❤️',
    condition: 'wall_likes_given',
    description: '在留言墙送出 5 个赞，温暖是会流动的。',
    threshold: 5
  },
  {
    id: 'badge_checkin_7',
    name: '自律之星',
    icon: '⭐',
    condition: 'checkin_streak',
    description: '连续打卡 7 天，习惯的力量正在悄悄改变你。',
    threshold: 7
  },
  {
    id: 'badge_quote_20',
    name: '句签收藏家',
    icon: '📖',
    condition: 'quotes_collected',
    description: '收藏 20 条句签，那些打动你的文字都是心灵的宝藏。',
    threshold: 20
  },
  {
    id: 'badge_visit_30',
    name: '时光见证者',
    icon: '🕰️',
    condition: 'visit_days',
    description: '累计访问 30 天，你一直在认真地生活。',
    threshold: 30
  },
  {
    id: 'badge_all_in_one',
    name: '时空主宰',
    icon: '👑',
    condition: 'all_features',
    description: '使用过所有功能（信件、树洞、胶囊、留言墙、挑战），时空回廊因你而完整。',
    threshold: null
  }
]

/**
 * 检查徽章进度
 * 根据传入的数据判断是否有新徽章解锁
 * @param {string} type - 检查类型，对应 badgeList 中的 condition 字段
 * @param {Object} data - 当前用户数据，用于判断条件
 * @returns {Array} 新解锁的徽章 ID 数组（可能为空）
 */
export function checkBadgeProgress(type, data) {
  const newBadges = []

  badgeList.forEach(badge => {
    // 如果徽章已经解锁，跳过
    if (data.earnedBadges && data.earnedBadges.includes(badge.id)) {
      return
    }

    let isUnlocked = false

    switch (badge.condition) {
      case 'first_letter':
        isUnlocked = (data.letterCount || 0) >= badge.threshold
        break

      case 'treehole_count':
        isUnlocked = (data.treeholeMessageCount || 0) >= badge.threshold
        break

      case 'capsule_opened':
        isUnlocked = (data.capsuleOpenedCount || 0) >= badge.threshold
        break

      case 'wall_likes_given':
        isUnlocked = (data.wallLikeGivenCount || 0) >= badge.threshold
        break

      case 'checkin_streak':
        isUnlocked = (data.challengeCurrentStreak || 0) >= badge.threshold
        break

      case 'quotes_collected':
        isUnlocked = (data.quoteCollectedCount || 0) >= badge.threshold
        break

      case 'visit_days':
        isUnlocked = (data.totalVisitDays || 0) >= badge.threshold
        break

      case 'all_features': {
        // 使用过所有主要功能
        const hasLetter = (data.letterCount || 0) > 0
        const hasTreehole = (data.treeholeMessageCount || 0) > 0
        const hasCapsule = (data.capsuleCount || 0) > 0
        const hasWall = (data.wallMessageCount || 0) > 0
        const hasChallenge = (data.challengeCheckInCount || 0) > 0
        isUnlocked = hasLetter && hasTreehole && hasCapsule && hasWall && hasChallenge
        break
      }

      default:
        break
    }

    if (isUnlocked) {
      newBadges.push(badge.id)
    }
  })

  return newBadges
}

/**
 * 根据 ID 获取徽章详情
 * @param {string} badgeId - 徽章 ID
 * @returns {Object|null} 徽章对象
 */
export function getBadgeById(badgeId) {
  return badgeList.find(b => b.id === badgeId) || null
}

/**
 * 获取所有徽章的解锁进度
 * @param {Object} data - 当前用户数据
 * @returns {Array} 包含进度信息的徽章数组
 */
export function getBadgeProgress(data) {
  return badgeList.map(badge => {
    let current = 0
    let target = badge.threshold || 1

    switch (badge.condition) {
      case 'first_letter':
        current = data.letterCount || 0
        break
      case 'treehole_count':
        current = data.treeholeMessageCount || 0
        break
      case 'capsule_opened':
        current = data.capsuleOpenedCount || 0
        break
      case 'wall_likes_given':
        current = data.wallLikeGivenCount || 0
        break
      case 'checkin_streak':
        current = data.challengeCurrentStreak || 0
        break
      case 'quotes_collected':
        current = data.quoteCollectedCount || 0
        break
      case 'visit_days':
        current = data.totalVisitDays || 0
        break
      case 'all_features': {
        const checks = [
          (data.letterCount || 0) > 0,
          (data.treeholeMessageCount || 0) > 0,
          (data.capsuleCount || 0) > 0,
          (data.wallMessageCount || 0) > 0,
          (data.challengeCheckInCount || 0) > 0
        ]
        current = checks.filter(Boolean).length
        target = checks.length
        break
      }
      default:
        break
    }

    const isEarned = data.earnedBadges ? data.earnedBadges.includes(badge.id) : false

    return {
      ...badge,
      current,
      target,
      isEarned,
      progress: Math.min(100, Math.round((current / target) * 100))
    }
  })
}

export default {
  badgeList,
  checkBadgeProgress,
  getBadgeById,
  getBadgeProgress
}
