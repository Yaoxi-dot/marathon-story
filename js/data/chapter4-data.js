/** 第四、五章核心数据镜像（运行时图表数据已打包进 js/vendor/chapter45.js；此文件供查阅与扩展） */
window.marathonChapter45Data = window.marathonChapter45Data || {};
window.marathonChapter45Data.SAMPLE_SIZE = 5000;
window.marathonChapter45Data.SCORE_ANCHORS_2025 = {
  finishers: 390500,
  breakThree: 21997,
  breakThreeRatio: 0.056,
  peakBand: '3:30–4:00',
  peakCount: 102294,
  averageFinish: '4:06:04',
};
window.marathonChapter45Data.SOCIAL_THEMES = [
  {
    id: 'race',
    label: '赛事参与',
    count: 3351,
    texts: 1927,
    coverage: 0.3854,
    color: '#214A85',
    hint: '报名、比赛、完赛等赛事叙事',
  },
  {
    id: 'emotion',
    label: '社交情绪',
    count: 1610,
    texts: 998,
    coverage: 0.1996,
    color: '#5FA6A0',
    hint: '兴奋、焦虑、共鸣等情绪表达',
  },
  {
    id: 'score',
    label: '成绩竞争',
    count: 1149,
    texts: 804,
    coverage: 0.1608,
    color: '#E66A45',
    hint: 'PB、配速、成绩、突破等数字竞争',
  },
  {
    id: 'train',
    label: '训练提升',
    count: 380,
    texts: 261,
    coverage: 0.0522,
    color: '#E8C86A',
    hint: '训练计划、跑量、进步',
  },
  {
    id: 'gear',
    label: '装备消费',
    count: 301,
    texts: 207,
    coverage: 0.0414,
    color: '#7BAABF',
    hint: '跑鞋、装备与消费话题',
  },
  {
    id: 'health',
    label: '健康身体',
    count: 198,
    texts: 149,
    coverage: 0.0298,
    color: '#6E8FA8',
    hint: '健康、恢复、伤病相关提及',
  },
];
window.marathonChapter45Data.SCORE_KEYWORDS = [
  { word: '记录', count: 245, tip: '常与完赛、刷新、成绩一起出现' },
  { word: '配速', count: 244, tip: '常与控制、训练、节奏一起出现' },
  { word: '成绩', count: 240, tip: '直接的成绩评价与比较' },
  { word: 'PB', count: 180, tip: '常与突破、提升、目标一起出现' },
  { word: '纪录', count: 72, tip: '与「记录」为不同分词结果' },
  { word: '突破', count: 70, tip: '刷新个人目标' },
  { word: '破三', count: 47, tip: '全马进入3小时以内' },
  { word: '提升', count: 19, tip: '进阶与进步压力' },
  { word: '跑量', count: 18, tip: '成绩背后的训练投入' },
  { word: '330', count: 11, tip: '3小时30分成绩目标符号' },
  { word: '240', count: 3, tip: '2小时40分等更高阶目标' },
];
window.marathonChapter45Data.HEALTH_KEYWORDS = [
  { word: '健康', count: 98, body: 'torso', tip: '宽泛的整体健康概念' },
  { word: '身体', count: 45, body: 'torso', tip: '身体感受的泛化表达' },
  { word: '恢复', count: 20, body: 'rest', tip: '恢复与休息' },
  { word: '膝盖', count: 18, body: 'knee', tip: '身体部位提及，非伤病发生率' },
  { word: '受伤', count: 9, body: 'injury', tip: '损伤事件的标题提及' },
  { word: '康复', count: 3, body: 'rest', tip: '样本中提及较少' },
  { word: '疼痛', count: 3, body: 'injury', tip: '样本中提及较少' },
  { word: '伤病', count: 2, body: 'injury', tip: '样本中提及极少' },
];
window.marathonChapter45Data.SCORE_VS_HEALTH = {
  scoreKeywords: 1149,
  healthKeywords: 198,
  scoreTexts: 804,
  healthTexts: 149,
  scoreCoverage: 0.1608,
  healthCoverage: 0.0298,
  keywordRatio: 5.8,
  intersection: 46,
};
window.marathonChapter45Data.INJURY_STATS = {
  /** 跑步在运动伤害中的占比（接近 40%） */
  runningInjuryShare: 0.4,
  /** 马拉松跑者有运动损伤（超过 60%） */
  marathonInjuryRate: 0.6,
  /** 业余跑者存在不同程度心肌疲劳 */
  myocardialFatigue: 0.3,
  /** 伤者中因超负荷训练致伤 */
  overloadAmongInjured: 0.65,
  /** 就诊者中与过度训练相关（超过 40%） */
  overtrainAmongClinic: 0.4,
  /** 有伤后会停下来的比例（不到 20%） */
  stopDespiteInjury: 0.2,
  metrics: [
    {
      id: 'share',
      label: '跑步伤害占比',
      value: 0.4,
      display: '≈40%',
      tip: '2023年中国运动伤害报告：跑步伤害占比接近四成。',
    },
    {
      id: 'prevalence',
      label: '马拉松跑者有伤',
      value: 0.6,
      display: '>60%',
      tip: '超过六成马拉松跑者存在运动损伤。',
    },
    {
      id: 'heart',
      label: '业余跑者心肌疲劳',
      value: 0.3,
      display: '30%',
      tip: '约三成业余跑者存在不同程度心肌疲劳。',
    },
    {
      id: 'stop',
      label: '有伤后停下',
      value: 0.2,
      display: '<20%',
      tip: '伤者很多，真正停下来的却不到两成。',
    },
  ],
  causes: [
    {
      id: 'overload',
      label: '超负荷训练',
      value: 0.65,
      display: '65%',
      tip: '六成五伤者与“超负荷”训练有关——过度训练是主因。',
    },
    {
      id: 'clinic',
      label: '就诊与过度训练相关',
      value: 0.4,
      display: '>40%',
      tip: '超过四成就诊者的问题与过度训练相关。',
    },
  ],
};
window.marathonChapter45Data.COPY = {
  ch4Cover: {
    title: '成绩',
    subtitle: '',
    lead: '跑完42.195公里之后，越来越多跑者开始追逐另一个数字。',
    lines: ['同样42.195公里——有人想完赛，有人想破四，有人想破三。'],
  },
  m42: {
    title: '每100名完赛者，只有约6人破三',
    subtitle: '破三者只占5.6%，人数最多的成绩段位于3小时30分至4小时。',
    body: ['破三是一条醒目的标准，却不是大多数跑者所在的位置。'],
    note: '曲线为帮助理解成绩位置关系的示意轮廓，不代表官方完整成绩分布。',
    source: '',
  },
  m43: {
    title: '社交媒体里的马拉松，人们都在谈什么？',
    subtitle: '在5000条话题里，成绩竞争是醒目的次级叙事。',
    body: ['赛事参与占据主跑道，成绩竞争紧随其后，健康身体只保留短短一段。'],
    note: '色段长度表示六类主题关键词累计出现次数。',
    source: '',
  },
  m44: {
    title: '成绩竞争，到底在谈什么？',
    subtitle: '最常被提起的，是那些可量化、可比较的数字。',
    body: ['记录、配速、成绩、PB——可量化的词，挤满画面。'],
    note: '「记录」与「纪录」指向不同语境，前者更贴近日常跑者表达。',
    source: '',
  },
  m45: {
    title: '现实赛道，与被看见的赛道',
    body: [
      '现实里，大多数人跑向“完成”；',
      '屏幕上，更容易被看见的却是“更快”。',
    ],
    bridge: '',
  },
  ch5Cover: {
    title: '健康',
    subtitle: '被忽视的身体账单',
    lead: '马拉松真正难的，不只是跑完，而是在成绩压力里听见身体。',
    lines: [
      '超过 60% 的跑者有伤，但只有不到 20% 会停下来。',
      '陪你跑完的，不只是计时牌——还有呼吸、恢复、膝盖与疲惫。',
    ],
  },
  m51: {
    title: '伤病很多，停下很少',
    subtitle: '损伤普遍，真正停下的人却很少。',
    body: [
      '跑步是伤害占比最高的运动之一；超负荷训练，是最主要的致伤原因。',
      '身体风险不是突然出现的，它常常在训练量、恢复不足和成绩目标里慢慢累积。',
    ],
    note: '比例为公开报告整理口径；“接近 / 超过”按原文保留。个体风险受基础、环境与临场状态影响。',
    source: '',
  },
  m52: {
    title: '被看见的是成绩，不是身体',
    subtitle: '数字远比身体更常出现。',
    body: ['成绩词 1149 次，约为健康词的 5.8 倍；文本覆盖 16% vs 3%。'],
    note: '展示内容呈现差异，不代表跑者真实健康态度。',
    source: '',
  },
  m53: {
    title: '身体出现了，但声音很小',
    subtitle: '更多是宽泛的“健康”，少有直接的伤病表达。',
    body: ['健康、身体、恢复是大词；受伤、疼痛、伤病——只剩小点。'],
    note: '词频 ≠ 真实伤病发生率；「膝盖」不能直接推断膝伤最常见。',
    source: '',
  },
  m54: {
    title: '成绩和身体，很少同框',
    subtitle: '“更快”与“承受得住”，很少同框。',
    body: ['5000条里，只有 46 条同时提到成绩与身体。'],
    note: '',
    source: '',
  },
  m55: {
    title: '停下来，也是一种完成',
    tipA: ['可以继续追 PB、奖牌、更快——但数字都需要身体先同意。'],
    tipB: ['慢下来不是退步。恢复、停顿、调整，也属于奔跑。'],
    close: [
      '成绩更容易被看见；真正陪你跑完的，还有呼吸、恢复，与懂得何时停下来。',
    ],
  },
};
window.marathonChapter45Data.NAV_ITEMS = [
  { id: 'ch4-cover', label: '30km', title: '第四章开篇' },
  { id: 'ch4-break', label: '32km', title: '破三有多难' },
  { id: 'ch4-anchors', label: '34km', title: '成绩坐标' },
  { id: 'case-yang-wen', label: '35km', title: '杨雯案例' },
  { id: 'ch4-themes', label: '36km', title: '六主题' },
  { id: 'ch4-keywords', label: '37km', title: '成绩关键词' },
  { id: 'attr-obsession', label: '38km', title: '执念归因' },
  { id: 'ch4-bridge', label: '39km', title: '现实与看见' },
  { id: 'case-pace-collapse', label: '40km', title: '配速崩塌' },
  { id: 'ch5-cover', label: '40.5km', title: '第五章开篇' },
  { id: 'ch5-injury', label: '40.8km', title: '伤病与停下' },
  { id: 'ch5-compare', label: '41km', title: '成绩被看见' },
  { id: 'case-heart-rate', label: '41.3km', title: '心率警告' },
  { id: 'attr-keep-running', label: '41.6km', title: '为何继续' },
  { id: 'ch5-body', label: '41.8km', title: '身体很小声' },
  { id: 'case-195m', label: '41.9km', title: '195米卡片' },
  { id: 'ch5-close', label: '终点', title: '停下来' },
];
