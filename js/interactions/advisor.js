/**
 * 42.195km｜我的入场报告 — 专业版规则引擎
 * 业务判断与 DOM 渲染分离
 */
(function () {
  const root = document.getElementById('mobile-advisor');
  if (!root) return;

  const $ = (sel, el = root) => el.querySelector(sel);
  const $$ = (sel, el = root) => Array.from(el.querySelectorAll(sel));

  let lastResult = null;
  let currentStep = 1;

  const REQUIRED = ['running', 'recentRace', 'weeklyTime', 'injury', 'goal', 'budget'];

  const SITE_LABEL = {
    knee: '膝盖', ankle: '脚踝', calf: '小腿', foot: '足底',
    hip: '髋部', back: '腰背', other: '其他', none: '无',
  };

  /* =========================
   * 工具函数
   * ========================= */
  function parseRaceTime(str) {
    if (!str || !String(str).trim()) return { ok: true, sec: null, empty: true };
    const raw = String(str).trim().replace(/：/g, ':');
    const parts = raw.split(':');
    if (parts.length < 2 || parts.length > 3) {
      return { ok: false, sec: null, msg: '请用 mm:ss 或 h:mm:ss，例如 28:30 或 1:02:00' };
    }
    const nums = parts.map(Number);
    if (nums.some((n) => Number.isNaN(n) || n < 0)) {
      return { ok: false, sec: null, msg: '成绩格式不太对，再检查一下数字～' };
    }
    let sec = 0;
    if (nums.length === 2) sec = nums[0] * 60 + nums[1];
    else sec = nums[0] * 3600 + nums[1] * 60 + nums[2];
    if (sec <= 0 || sec > 10 * 3600) {
      return { ok: false, sec: null, msg: '成绩看起来不太合理，请再确认一下' };
    }
    return { ok: true, sec, empty: false };
  }

  function fmtDuration(sec) {
    if (!sec || !isFinite(sec)) return '—';
    const s = Math.round(sec);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    return `${m}:${String(ss).padStart(2, '0')}`;
  }

  function fmtPace(secPerKm) {
    if (!secPerKm || !isFinite(secPerKm)) return '—';
    const m = Math.floor(secPerKm / 60);
    const s = Math.round(secPerKm % 60);
    return `${m}'${String(s).padStart(2, '0')}''/km`;
  }

  /** 中国时区：YYYY年M月D日 星期X HH:mm */
  function formatChinaDateTime(date) {
    const parts = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);

    const get = (type) => {
      const p = parts.find((x) => x.type === type);
      return p ? p.value : '';
    };

    const year = get('year');
    const month = get('month');
    const day = get('day');
    const weekday = get('weekday'); // 如：星期一
    const hour = get('hour');
    const minute = get('minute');
    return `${year}年${month}月${day}日 ${weekday} ${hour}:${minute}`;
  }

  function predictRaceTime(baseDistance, baseTime, targetDistance) {
    if (!baseDistance || !baseTime || !targetDistance) return null;
    return baseTime * Math.pow(targetDistance / baseDistance, 1.06);
  }

  function inferWeeklyKm(running, weeklyTime) {
    if (running === 'never') return '0-5';
    if (running === 'occasional') return weeklyTime === '1-2' ? '0-5' : '6-15';
    if (running === 'stable') {
      if (weeklyTime === '1-2') return '6-15';
      if (weeklyTime === '3-4') return '16-30';
      return '31-45';
    }
    if (running === 'experienced') return weeklyTime === '1-2' ? '16-30' : '31-45';
    return '6-15';
  }

  function inferLongest(running, weeklyTime) {
    if (running === 'never') return 'lt3';
    if (running === 'occasional') return weeklyTime === '1-2' ? '3-5' : '6-10';
    if (running === 'stable') {
      if (weeklyTime === '1-2' || weeklyTime === '3-4') return '6-10';
      return '11-16';
    }
    return '17-24';
  }

  /* =========================
   * 收集输入
   * ========================= */
  function collectAdvisorInput() {
    const getOpt = (field) => {
      const sel = $(`.ma-q[data-field="${field}"] .ma-opt.is-selected`);
      return sel ? sel.dataset.value : '';
    };
    const val = (id) => {
      const el = document.getElementById(id);
      return el ? String(el.value || '').trim() : '';
    };

    const running = getOpt('running');
    const recentRace = getOpt('recentRace');
    const weeklyTime = getOpt('weeklyTime');
    const injury = getOpt('injury');
    const goal = getOpt('goal');
    const budget = getOpt('budget');

    let weeklyKm = getOpt('weeklyKm') || inferWeeklyKm(running, weeklyTime);
    let longest = getOpt('longest') || inferLongest(running, weeklyTime);
    const weeklyKmFilled = !!getOpt('weeklyKm');
    const longestFilled = !!getOpt('longest');

    const raceTimeRaw = val('maRaceTime');
    let time5kRaw = val('maTime5k');
    let time10kRaw = val('maTime10k');
    if (recentRace === '5k' && raceTimeRaw && !time5kRaw) time5kRaw = raceTimeRaw;
    if (recentRace === '10k' && raceTimeRaw && !time10kRaw) time10kRaw = raceTimeRaw;

    const p5 = parseRaceTime(time5kRaw);
    const p10 = parseRaceTime(time10kRaw);
    const pRace = parseRaceTime(raceTimeRaw);

    return {
      running,
      recentRace,
      weeklyTime,
      injury,
      goal,
      budget,
      age: val('maAge'),
      gender: val('maGender'),
      city: val('maCity'),
      weeklyKm,
      longest,
      weeklyKmFilled,
      longestFilled,
      time5kRaw,
      time10kRaw,
      time5k: p5.ok ? p5.sec : null,
      time10k: p10.ok ? p10.sec : null,
      raceTimeParse: pRace,
      time5kParse: p5,
      time10kParse: p10,
      injurySite: getOpt('injurySite') || (injury === 'none' ? 'none' : ''),
      redFlag: getOpt('redFlag') || 'no',
      recovery: getOpt('recovery') || 'good',
      dieting: getOpt('dieting') || 'no',
      targetWeeks: getOpt('targetWeeks') || 'flexible',
      racePref: getOpt('racePref') || 'local',
      missingVolume: !weeklyKmFilled || !longestFilled,
      missingTimes: !time5kRaw && !time10kRaw && recentRace === 'none',
    };
  }

  /* =========================
   * 准备度评分
   * ========================= */
  function calculateReadinessScore(profile) {
    const baseMap = { never: 5, occasional: 10, stable: 16, experienced: 20 };
    const kmMap = { '0-5': 3, '6-15': 8, '16-30': 14, '31-45': 18, '45+': 20 };
    const longMap = { lt3: 3, '3-5': 7, '6-10': 12, '11-16': 16, '17-24': 18, '25+': 20 };
    const timeMap = { '1-2': 4, '3-4': 9, '5-7': 13, '8+': 15, '5+': 13 };

    let base = baseMap[profile.running] || 5;
    let km = kmMap[profile.weeklyKm] || 3;
    let longest = longMap[profile.longest] || 3;
    let time = timeMap[profile.weeklyTime] || 4;

    let safety = 15;
    if (profile.injury === 'mild') safety = 8;
    if (profile.injury === 'injured') safety = 3;
    if (profile.redFlag === 'yes') safety = 0;
    else if (profile.redFlag === 'unsure') safety = Math.min(safety, 5);

    // 目标匹配
    let match = 10;
    const ambitious = profile.goal === 'sub4' || profile.goal === 'sub5' || profile.goal === 'full';
    const weakBase = profile.running === 'never' || profile.running === 'occasional'
      || profile.weeklyKm === '0-5' || profile.weeklyKm === '6-15'
      || profile.longest === 'lt3' || profile.longest === '3-5' || profile.longest === '6-10';
    if (profile.injury === 'injured' || profile.redFlag === 'yes') {
      if (ambitious || profile.goal === 'half') match = 0;
      else match = 2;
    } else if (profile.goal === 'sub4' && weakBase) {
      match = 2;
    } else if ((profile.goal === 'sub5' || profile.goal === 'full') && weakBase) {
      match = 6;
    } else if (profile.goal === 'half' && (profile.running === 'never' || profile.longest === 'lt3' || profile.longest === '3-5')) {
      match = 6;
    } else {
      match = 10;
    }

    let score = base + km + longest + time + safety + match;

    if (profile.redFlag === 'yes') score = Math.min(score, 39);
    if (profile.injury === 'injured') score = Math.min(score, 49);
    if (profile.running === 'never') score = Math.min(score, 59);
    if (['lt3', '3-5', '6-10'].includes(profile.longest)) score = Math.min(score, 69);
    if ((profile.weeklyKm === '0-5' || profile.weeklyKm === '6-15')
      && (profile.goal === 'full' || profile.goal === 'sub4')) {
      score = Math.min(score, 59);
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    let band = '先恢复或先打基础';
    if (score >= 90) band = '基础较好，但仍需系统备赛';
    else if (score >= 75) band = '具备全马入场基础';
    else if (score >= 60) band = '适合半马过渡';
    else if (score >= 40) band = '适合5K/10K验证';

    return { score, band, parts: { base, km, longest, time, safety, match } };
  }

  /* =========================
   * 风险等级
   * ========================= */
  function determineRiskLevel(profile) {
    if (profile.redFlag === 'yes') return { level: '高', cls: 'risk-high' };
    if (profile.injury === 'injured') return { level: '高', cls: 'risk-high' };
    if (profile.redFlag === 'unsure') return { level: '中', cls: 'risk-mid' };
    if (profile.injury === 'mild') return { level: '中', cls: 'risk-mid' };
    if (profile.recovery === 'poor') return { level: '中', cls: 'risk-mid' };
    if ((profile.goal === 'sub4' || profile.goal === 'sub5')
      && (profile.running === 'never' || profile.running === 'occasional'
        || profile.weeklyKm === '0-5' || profile.weeklyKm === '6-15')) {
      return { level: '中', cls: 'risk-mid' };
    }
    return { level: '低', cls: 'risk-low' };
  }

  /* =========================
   * 阶段判断
   * ========================= */
  function determineStage(profile, scoreObj) {
    const g = profile.goal;
    const ambitious = g === 'half' || g === 'full' || g === 'sub5' || g === 'sub4';

    if (profile.redFlag === 'yes'
      || (profile.injury === 'injured' && ambitious)) {
      return {
        key: 'risk',
        name: '风险排查期',
        path: '先恢复与风险排查',
        why: '你报告了明显身体风险信号，或伤病尚未稳定却瞄准较长距离目标。',
        focus: '当前最重要的是确认身体是否适合进入系统训练，而不是报名。',
        avoid: '暂缓半马、全马备赛，也不要用比赛验证意志力。',
      };
    }

    if (profile.running === 'never'
      || profile.weeklyKm === '0-5'
      || profile.longest === 'lt3'
      || (profile.running === 'never' && profile.weeklyTime === '1-2')) {
      return {
        key: 'start',
        name: '无伤起跑期',
        path: '无伤起跑，先建立运动习惯',
        why: '你还在建立跑步习惯的起点，这不是失败，而是最适合打基础的位置。',
        focus: '未来4周先建立每周2–3次、每次20–30分钟的低强度活动习惯。',
        avoid: '暂时不要报名半马或全马。',
      };
    }

    if (profile.running === 'occasional'
      && (profile.longest === '3-5' || profile.weeklyKm === '6-15')
      && profile.injury !== 'injured') {
      return {
        key: '5k',
        name: '稳定5K期',
        path: '稳定5K，再进入10K验证',
        why: '你已经可以开始跑步，但身体还需要适应规律训练。',
        focus: '把5公里跑得轻松、稳定，而不是追求配速。',
        avoid: '不要急着拉长到半马距离。',
      };
    }

    if ((profile.longest === '6-10' || profile.weeklyKm === '6-15' || profile.weeklyKm === '16-30')
      && (profile.weeklyTime === '3-4' || profile.weeklyTime === '5-7' || profile.weeklyTime === '8+' || profile.weeklyTime === '5+')
      && profile.injury !== 'injured'
      && profile.running !== 'experienced'
      && !(profile.longest === '11-16' || profile.longest === '17-24' || profile.longest === '25+')) {
      return {
        key: '10k',
        name: '10K验证期',
        path: '先完成10K验证，再进入半马过渡',
        why: '在考虑半马之前，建议先完成一次舒适的10公里，并观察第二天恢复。',
        focus: '10K是判断耐力、恢复和配速控制的关键门槛。',
        avoid: '暂不建议把全马当作近期唯一目标。',
      };
    }

    if ((profile.running === 'stable' || profile.running === 'experienced')
      && (profile.longest === '11-16')
      && (profile.weeklyKm === '16-30' || profile.weeklyKm === '31-45' || profile.weeklyKm === '45+')
      && profile.injury !== 'injured') {
      return {
        key: 'half',
        name: '半马过渡期',
        path: '半马过渡，暂缓全马',
        why: '你已经有一定耐力基础，可以开始准备半马。',
        focus: '接下来要练的是长距离、补给和恢复，而不只是速度。',
        avoid: '暂时不建议直接冲全马。',
      };
    }

    if ((profile.running === 'stable' || profile.running === 'experienced')
      && (profile.longest === '17-24' || profile.longest === '25+')
      && (profile.weeklyKm === '31-45' || profile.weeklyKm === '45+')
      && (profile.weeklyTime === '5-7' || profile.weeklyTime === '8+' || profile.weeklyTime === '5+')
      && profile.injury === 'none'
      && profile.redFlag === 'no') {
      let path = '具备全马入场基础，建议12–16周系统备赛';
      if (profile.goal === 'sub4' || profile.goal === 'sub5') {
        path = '破4/破5可以作为长期目标，但近期不建议硬冲';
      }
      return {
        key: 'full',
        name: '全马入场期',
        path,
        why: '你具备进入全马备赛的基础，但全马是12–16周系统训练的结果。',
        focus: '把目标放在稳定完成训练周期，而不是只看比赛日。',
        avoid: '不要用短期硬冲替代完整备赛。',
      };
    }

    // 默认兜底：按分数与基础
    if (scoreObj.score < 40) {
      return {
        key: 'start',
        name: '无伤起跑期',
        path: '无伤起跑，先建立运动习惯',
        why: '当前准备度更适合先打基础。',
        focus: '先把运动习惯建立起来。',
        avoid: '暂缓长距离赛事。',
      };
    }
    if (scoreObj.score < 60) {
      return {
        key: '10k',
        name: '10K验证期',
        path: '先完成10K验证，再进入半马过渡',
        why: '你不是不适合马拉松，只是现在更适合从10K开始。',
        focus: '先完成一次舒适10K验证。',
        avoid: '不要把全马当作短期考试。',
      };
    }
    if (scoreObj.score < 75) {
      return {
        key: 'half',
        name: '半马过渡期',
        path: '半马过渡，暂缓全马',
        why: '半马是从日常跑步过渡到马拉松文化的更稳妥入口。',
        focus: '练长距离、补给和恢复。',
        avoid: '暂缓直接冲全马。',
      };
    }
    return {
      key: 'full',
      name: '全马入场期',
      path: '具备全马入场基础，建议12–16周系统备赛',
      why: '你已有较好基础，仍需系统备赛。',
      focus: '进入完整周期，保留恢复周。',
      avoid: '避免临时猛练。',
    };
  }

  /* =========================
   * 各板块生成
   * ========================= */
  function generateStageCard(stage) {
    return {
      title: '我现在在哪一站',
      html: `<p><strong>当前阶段：${stage.name}</strong></p>
        <p>${stage.why}</p>
        <p><strong>现在最重要：</strong>${stage.focus}</p>
        <p><strong>暂时不建议：</strong>${stage.avoid}</p>`,
    };
  }

  function generateRaceAdvice(profile, stage, risk) {
    let type = '';
    let major = '';
    let travel = '';
    let when = '';
    let body = '';

    if (risk.level === '高' || stage.key === 'risk') {
      type = '暂缓报名';
      major = '不建议';
      travel = '不建议跨城';
      when = '完成风险排查与恢复后再评估';
      body = '当前不建议把比赛作为近期目标。先完成身体风险排查和恢复，再考虑本地低强度活动或短距离赛事。比赛可以晚一点，身体反馈要早一点听见。';
    } else if (stage.key === 'start' || stage.key === '5k') {
      type = '本地5K/10K、公益跑、小规模赛事';
      major = '暂不建议';
      travel = '暂不建议为了热门赛事跨城';
      when = '习惯稳定、能轻松完成5K后再考虑';
      body = '本地赛事成本低、气候熟悉、赛前压力小，更适合作为第一次参赛体验。暂不建议为了热门赛事跨城。';
    } else if (stage.key === '10k') {
      type = '本地10K或小城半马';
      major = '可作为长期目标，近期不必把中签当作唯一入口';
      travel = '谨慎，优先熟悉环境';
      when = '完成一次舒适10K后，可考虑本地10K或小规模半马';
      body = '可以选择组织成熟、规模适中、交通压力较小的赛事。头部赛事可以作为长期目标，但近期不必把中签作为唯一入口。';
    } else if (stage.key === 'half') {
      type = '本地或周边半马';
      major = '暂缓，先以半马验证';
      travel = '可考虑，但行程不要过满';
      when = '最长距离稳定到12–16km后报名';
      body = '半马是从日常跑步过渡到马拉松文化的更稳妥入口。旅游型赛事可以考虑，但不要把行程安排得过满。';
    } else {
      type = '本地全马、成熟小城全马；谨慎选择头部赛事';
      major = '谨慎选择，优先赛道与气候匹配';
      travel = '可安排，但预留恢复与熟悉赛道的时间';
      when = '进入12–16周备赛周期后再确定比赛日';
      body = '如果目标是完赛，本地或熟悉气候的赛事更稳；如果目标是PB或破4，需优先考虑赛道、天气、补给和起跑分区。';
    }

    // 偏好修正
    let prefNote = '';
    if (profile.racePref === 'local') prefNote = '你偏好本地赛事：这通常意味着更低成本、更低风险、更好恢复。';
    else if (profile.racePref === 'small') prefNote = '你偏好小城赛事：中签压力通常较小，体验也可能更从容。';
    else if (profile.racePref === 'travel') prefNote = '你偏好旅游型赛事：请额外关注交通住宿、赛前疲劳和饮食变化。';
    else if (profile.racePref === 'major') prefNote = '你偏好头部赛事：请预估抽签难度、分区压力、成绩焦虑与更高成本。';

    return {
      title: '我适合报什么赛事',
      summary: type,
      html: `<p><strong>推荐类型：</strong>${type}</p>
        <p><strong>头部赛事：</strong>${major}</p>
        <p><strong>跨城建议：</strong>${travel}</p>
        <p><strong>报名时机：</strong>${when}</p>
        <p>${body}</p>
        ${prefNote ? `<p>${prefNote}</p>` : ''}`,
    };
  }

  function generateTrainingAdvice(profile, stage, risk) {
    const lines = [];
    if (stage.key === 'risk') {
      lines.push('暂停高强度跑步，以低强度活动、康复步行或医生建议的活动为主。');
      lines.push('长距离：暂不安排。');
      lines.push('强度：保持能轻松说话的水平，不做间歇。');
      lines.push('力量：仅在无痛前提下做基础活动度与稳定训练。');
      lines.push('出现疼痛加重、胸闷、头晕等情况立即停止。');
      lines.push('连续2–4周无不适后再重新评估。');
    } else if (stage.key === 'start') {
      lines.push('每周2–3次跑走结合，每次20–30分钟。');
      lines.push('长距离：暂不强调，先做到连续开跑。');
      lines.push('强度：以能完整说话为标准，不安排间歇跑。');
      lines.push('力量：每周1–2次基础力量（臀腿、核心、脚踝稳定）。');
      lines.push('疼痛加重或影响走路时停止加量。');
    } else if (stage.key === '5k') {
      lines.push('每周3次训练：2次轻松跑 + 1次稍长跑。');
      lines.push('长距离：从4–5km逐步到6–8km。');
      lines.push('强度：先保证连续性，再考虑配速。');
      lines.push('力量：每周1–2次。');
      lines.push('跑后明显疼痛超过48小时，则降强度。');
    } else if (stage.key === '10k') {
      lines.push('每周3–4次：2次轻松跑 + 1次稍长距离。');
      lines.push('可加入1次短节奏跑，但不要每次都跑快。');
      lines.push('8周目标：舒服完成一次10K。');
      lines.push('力量：每周1–2次，服务跑姿稳定。');
      lines.push('第二天仍明显疲劳时，下一练改为轻松跑或休息。');
    } else if (stage.key === 'half') {
      lines.push('每周3–4次跑步：含1次长距离（逐步到12–16km）。');
      lines.push('另安排轻松跑、稳定跑/节奏跑，大部分保持轻松。');
      lines.push('力量：每周1–2次。');
      lines.push('至少做一次补给和装备演练。');
      lines.push('连续加量2–3周后安排恢复周。');
    } else {
      lines.push('建议进入12–16周系统备赛，每周约4次训练。');
      lines.push('大部分训练保持轻松强度；长距离逐步增加，不连续硬顶。');
      lines.push('周期中保留恢复周；赛前2–3周逐渐减量。');
      lines.push('力量：每周1–2次，并完成补给演练。');
      lines.push('出现持续疼痛或异常气短时立即停止并评估。');
    }

    if (profile.recovery === 'poor') {
      lines.push('本周先减少强度，不增加跑量——睡眠和恢复差时，训练收益会下降。');
    }
    if (profile.dieting === 'yes') {
      lines.push('不要同时增加跑量和明显减少能量摄入。');
    }
    if ((profile.goal === 'sub4' || profile.goal === 'sub5')
      && (stage.key !== 'full' || risk.level !== '低')) {
      lines.push('破4/破5需要更长期积累，建议先用半马成绩验证。');
    }

    const summary = lines[0];
    return {
      title: '我未来8周怎么练',
      summary,
      html: `<ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul>`,
    };
  }

  function generateBudgetAdvice(profile) {
    let tier = '';
    let must = '';
    let optional = '';
    let avoid = '';
    let line = '';

    if (profile.budget === '500') {
      tier = '极简安全档';
      must = '合脚缓震跑鞋、速干衣裤、基础补给';
      optional = '号码带、水壶';
      avoid = '碳板鞋、专业手表、训练营、跨城赛事';
      line = '预算有限时，最重要的是减少摩擦和受伤风险，而不是追求装备完整。先把钱花在合脚跑鞋和基础服装上。';
    } else if (profile.budget === '2000') {
      tier = '标准备赛档';
      must = '日常训练跑鞋、速干衣裤、基础运动手表/手环、腰包或水壶、补给';
      optional = '第二双轮换鞋、心率带';
      avoid = '高价碳板鞋、昂贵私教课、远距离跨城赛事';
      line = '这个预算已能覆盖大多数普通跑者刚需。比起买顶级竞速鞋，更值得投入的是稳定训练和恢复习惯。';
    } else {
      tier = '进阶体验档';
      must = '训练鞋+比赛鞋轮换、心率监测；可预留运动康复/跑姿分析与跨城预算';
      optional = '训练营、私教、旅游型赛事';
      avoid = '把消费误认为能力提升；不要用装备替代训练';
      line = '更高预算可以提升体验，但不能替代训练。康复和恢复服务通常比盲目升级装备更值得。';
    }

    const anti = '碳板鞋不是入场券，稳定训练才是。跑得长久，比买得高级更重要。';

    return {
      title: '我的预算怎么花',
      summary: `${tier}：优先${must.split('、')[0]}`,
      html: `<p><strong>当前档位：</strong>${tier}</p>
        <p><strong>必买项：</strong>${must}</p>
        <p><strong>可选项：</strong>${optional}</p>
        <p><strong>暂缓优先：</strong>${avoid}</p>
        <p>${line}</p>
        <p>${anti}</p>`,
    };
  }

  function generateRiskAdvice(profile, stage, risk) {
    const items = [];
    if (profile.redFlag === 'yes' || profile.redFlag === 'unsure') {
      items.push('你报告了运动相关红旗信号（或尚不确定）。请不要把这次评估理解为训练许可。出现胸痛、晕厥、异常气短、明显心悸等情况时，应优先寻求医学评估。');
    }
    if (profile.injury === 'injured' || profile.injury === 'mild') {
      const site = profile.injurySite && profile.injurySite !== 'none'
        ? `（关注部位：${SITE_LABEL[profile.injurySite] || profile.injurySite}）`
        : '';
      items.push(`当前最需要避免的是「带伤证明自己」${site}。若疼痛持续超过一周、跑后加重、影响走路或睡眠，请暂缓比赛目标。`);
    }
    if ((profile.running === 'never' || profile.running === 'occasional' || profile.weeklyKm === '0-5')
      && (profile.goal === 'full' || profile.goal === 'sub4' || profile.goal === 'sub5' || profile.goal === 'half')) {
      items.push('不要突然把跑量翻倍。新手阶段最容易受伤的不是跑得慢，而是增长太快。请优先稳定频次，再小幅增加距离。');
    }
    if ((profile.goal === 'sub4' || profile.goal === 'sub5')
      && (stage.key !== 'full' || profile.running === 'never' || profile.running === 'occasional')) {
      items.push('破4或破5可以作为长期目标，但不适合用短期硬冲完成。建议先用10K或半马成绩验证，而不是直接把全马当作考试。');
    }
    if (profile.recovery === 'poor') {
      items.push('睡眠和恢复差时，训练收益会下降，受伤风险会上升。本周建议减少强度，把轻松跑和休息放在第一位。');
    }
    if (profile.dieting === 'yes') {
      items.push('不要同时大幅减重和增加跑量。长距离训练需要能量支持，吃得太少会影响恢复与免疫。');
    }
    if (profile.budget === '5000' || profile.goal === 'sub4') {
      items.push('高价装备能改善体验，但不能替代训练基础。尤其是碳板鞋，对新手不一定更安全，也不应成为冲成绩的理由。');
    }
    if (items.length === 0) {
      items.push('目前未发现高风险红旗，但仍请循序渐进：不连续大幅加量，疼痛持续或加重时停下来比硬撑更勇敢。');
    }

    return {
      title: '我最该注意什么风险',
      summary: items[0].slice(0, 42) + (items[0].length > 42 ? '…' : ''),
      html: `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`,
    };
  }

  function generateNextSteps(profile, stage, risk) {
    let week = '';
    let month = '';
    let signup = '';
    let reassess = '';

    if (stage.key === 'risk') {
      week = '暂停高强度跑步，记录不适出现的时间、部位和诱因。';
      month = '先恢复到日常活动无明显不适。';
      signup = '暂缓报名。';
      reassess = '连续2–4周无痛，并排除红旗风险后再评估。';
    } else if (stage.key === 'start') {
      week = '完成2次20–30分钟跑走结合。';
      month = '建立每周2–3次运动习惯。';
      signup = '暂不报名半马或全马，可关注本地5K/公益跑。';
      reassess = '能轻松完成5K后再生成报告。';
    } else if (stage.key === '5k') {
      week = '安排3次训练，其中一次稍长到5–6km。';
      month = '把5K跑得轻松稳定。';
      signup = '可关注本地5K/10K，暂缓半马。';
      reassess = '5K轻松完成后，进入10K验证再评估。';
    } else if (stage.key === '10k') {
      week = '安排2次轻松跑和1次稍长距离。';
      month = '完成一次舒适10K。';
      signup = '优先本地10K或小规模半马。';
      reassess = '完成10K且第二天无明显疼痛后再评估半马。';
    } else if (stage.key === 'half') {
      week = '保留一次长距离和一次力量训练。';
      month = '把最长距离稳定到12–16km。';
      signup = '可以考虑本地或周边半马。';
      reassess = '半马完赛或完成16km长距离后再评估全马。';
    } else {
      week = '选择12–16周备赛周期，不急于堆跑量。';
      month = '稳定周跑量和长距离节奏。';
      signup = '可以考虑本地或成熟全马赛事。';
      reassess = '完成一次24km以上长距离和补给演练后再确认比赛目标。';
    }

    if (risk.level === '高' && stage.key !== 'risk') {
      signup = '暂缓报名，优先处理风险。';
    }

    return {
      title: '我下一步做什么',
      summary: week,
      html: `<p><strong>本周第一步：</strong>${week}</p>
        <p><strong>未来4周目标：</strong>${month}</p>
        <p><strong>什么时候考虑报名：</strong>${signup}</p>
        <p><strong>什么时候重新评估：</strong>${reassess}</p>`,
    };
  }

  function generatePaceModule(profile, stage, risk) {
    const hasFlag = risk.level === '高' || profile.redFlag === 'yes' || profile.injury === 'injured';
    let baseDist = null;
    let baseTime = null;
    if (profile.time10k) { baseDist = 10; baseTime = profile.time10k; }
    else if (profile.time5k) { baseDist = 5; baseTime = profile.time5k; }

    if (!baseTime) {
      return {
        title: '配速与成绩参考',
        html: `<p>你还没有填写近期成绩。建议先完成一次轻松5K或10K测试，再回来获得更准确的配速参考。</p>
          <p>建议补充成绩/跑量后重新评估，报告会更贴近你的真实能力。</p>`,
      };
    }

    if (hasFlag) {
      return {
        title: '配速与成绩参考',
        html: `<p>当前存在伤病或红旗风险相关信号，<strong>不建议用成绩目标驱动训练</strong>。</p>
          <p>请先完成恢复与风险排查；身体稳定后，再根据轻松5K/10K成绩做配速参考。</p>`,
      };
    }

    const pred10 = predictRaceTime(baseDist, baseTime, 10);
    const predHalf = predictRaceTime(baseDist, baseTime, 21.0975);
    const predFull = predictRaceTime(baseDist, baseTime, 42.195);
    const pace = baseTime / baseDist;
    const easy = `${fmtPace(pace + 45)} – ${fmtPace(pace + 90)}（主观强度约3–4/10，能完整说话）`;
    const tempo = `${fmtPace(pace + 10)} – ${fmtPace(pace + 30)}（主观强度约6–7/10，略吃力但可控）`;

    let goalNote = '';
    if (profile.goal === 'sub4' && predFull && predFull > 4 * 3600) {
      goalNote = '按当前成绩外推，全马预测慢于4小时。破4更适合作为长期目标，建议先用半马成绩验证。';
    } else if (profile.goal === 'sub5' && predFull && predFull > 5 * 3600) {
      goalNote = '按当前成绩外推，全马预测慢于5小时。这不是否定你，而是提醒破5需要更完整的耐力积累。';
    }

    return {
      title: '配速与成绩参考',
      html: `<p>基于你提供的 ${baseDist === 5 ? '5K' : '10K'} 成绩（参考值，非承诺）：</p>
        <ul>
          <li>10K预测：${fmtDuration(pred10)}</li>
          <li>半马预测：${fmtDuration(predHalf)}</li>
          <li>全马预测：${fmtDuration(predFull)}</li>
          <li>轻松跑建议：${easy}</li>
          <li>节奏跑建议：${tempo}</li>
          <li>长距离建议：宁可慢一点，也不要跑成比赛。</li>
        </ul>
        ${goalNote ? `<p>${goalNote}</p>` : ''}
        <p class="ma-module-note">预测使用经验公式，仅供参考，会受天气、赛道、恢复与伤病影响。</p>`,
    };
  }

  function generateFuelModule(profile, stage) {
    const lines = [];
    if (profile.goal === '10k' || stage.key === 'start' || stage.key === '5k' || stage.key === '10k') {
      lines.push('小于约60分钟的训练通常不需要复杂补给。');
      lines.push('重点是训练前后正常吃饭、补水、睡眠。');
      lines.push('炎热天气注意补水，但不要过量饮水。');
    } else if (profile.goal === 'half' || stage.key === 'half') {
      lines.push('超过70–90分钟的长距离，可以开始练习补水和少量碳水。');
      lines.push('不要比赛当天第一次尝试能量胶。');
      lines.push('训练后补充碳水和蛋白质，并保证睡眠。');
    } else {
      lines.push('长距离训练中练习补给；可参考每小时30–60g碳水作为起点。');
      lines.push('根据天气和出汗情况补水，不要过量饮水。');
      lines.push('至少完成一次「跑鞋+衣服+补给」整套演练。');
      lines.push('赛前2–3周逐步减量，避免临时猛练。');
    }
    if (profile.recovery === 'poor') {
      lines.push('恢复偏差：先睡眠、再强度；本周不建议增加跑量。');
    }
    if (profile.dieting === 'yes') {
      lines.push('正在节食/减重：不要同时大幅减重和增加跑量；长距离日要保证能量摄入。');
    }
    return {
      title: '补给与恢复建议',
      html: `<ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul>`,
    };
  }

  function generateEvidenceBlock() {
    return {
      title: '这些建议参考了什么？',
      html: `<p>本工具参考了公开运动科学建议和跑步训练原则，包括：</p>
        <ul>
          <li>成年人有氧活动与力量训练建议</li>
          <li>运动前健康筛查中的红旗症状</li>
          <li>新手跑者跑量增长与伤病风险相关研究</li>
          <li>马拉松训练中周跑量、最长距离与伤病风险研究</li>
          <li>耐力训练以轻松强度为主、少量强度训练的原则</li>
          <li>长距离运动中的补水与碳水补给建议</li>
          <li>跑鞋防伤证据并不绝对，因此不把昂贵装备作为安全保证</li>
        </ul>
        <p><strong>免责声明：</strong>本报告不能替代医生、运动医学专家或持证教练的诊断与处方。如果出现胸痛、晕厥、持续疼痛、明显心悸、异常气短等情况，请优先寻求专业帮助。</p>`,
    };
  }

  /* =========================
   * 组装完整结果
   * ========================= */
  function buildAdvisorResult(profile) {
    const scoreObj = calculateReadinessScore(profile);
    const risk = determineRiskLevel(profile);
    const stage = determineStage(profile, scoreObj);

    // 路径微调：破4/破5但阶段未到全马
    let path = stage.path;
    if ((profile.goal === 'sub4' || profile.goal === 'sub5') && stage.key !== 'full' && stage.key !== 'risk') {
      path = '破4/破5可以作为长期目标，但近期不建议硬冲';
    }

    const race = generateRaceAdvice(profile, stage, risk);
    const train = generateTrainingAdvice(profile, stage, risk);
    const budget = generateBudgetAdvice(profile);
    const risks = generateRiskAdvice(profile, stage, risk);
    const next = generateNextSteps(profile, stage, risk);
    const stageCard = generateStageCard(stage);

    let signup = '';
    if (stage.key === 'risk') signup = '暂缓报名';
    else if (stage.key === 'start') signup = '4–8周后再考虑本地5K/公益跑';
    else if (stage.key === '5k') signup = '4–8周后再考虑本地5K/10K';
    else if (stage.key === '10k') signup = '4–8周后再考虑本地10K或半马';
    else if (stage.key === 'half') signup = '6–12周后可考虑本地/周边半马';
    else signup = '进入12–16周备赛后再确定比赛日';

    const missingHints = [];
    if (profile.missingTimes) missingHints.push('建议补充近期5K/10K成绩后重新评估');
    if (profile.missingVolume) missingHints.push('建议补充周跑量与最长距离后，判断会更准');

    return {
      profile,
      path,
      stage,
      score: scoreObj.score,
      scoreBand: scoreObj.band,
      risk,
      signup,
      cards: [stageCard, race, train, budget, risks, next],
      raceSummary: race.summary,
      trainSummary: train.summary,
      riskSummary: risks.summary,
      paceModule: generatePaceModule(profile, stage, risk),
      fuelModule: generateFuelModule(profile, stage),
      evidence: generateEvidenceBlock(),
      missingHints,
    };
  }

  /* =========================
   * 渲染
   * ========================= */
  function setStep(n) {
    currentStep = n;
    $$('.ma-step').forEach((step) => {
      const id = Number(step.dataset.step);
      const on = id === n;
      step.classList.toggle('is-active', on);
      step.hidden = !on;
    });
    const fill = $('#maProgressFill');
    if (fill) fill.style.width = `${(n / 4) * 100}%`;
  }

  function renderQuickResult(result) {
    $('#maVerdict').textContent = result.path;
    $('#maStage').textContent = result.stage.name;
    $('#maScore').textContent = `${result.score}/100`;
    const riskEl = $('#maRisk');
    riskEl.textContent = result.risk.level;
    riskEl.className = result.risk.cls;
    $('#maSignup').textContent = result.signup;
    $('#maCardRace').textContent = result.raceSummary;
    $('#maCardTrain').textContent = result.trainSummary;
    $('#maCardRisk').textContent = result.riskSummary;
  }

  function renderFullReport(result) {
    const dateEl = $('#maA4Date');
    if (dateEl) dateEl.textContent = `生成时间：${formatChinaDateTime(new Date())}`;

    const summary = $('#maA4Summary');
    if (summary) {
      summary.innerHTML = `你目前更适合：<strong>${result.path}</strong>
        <span class="ma-score-band">（准备度 ${result.score}/100 · ${result.scoreBand}）</span>`;
    }

    const tags = $('#maA4Tags');
    if (tags) {
      tags.innerHTML = `
        <span>当前阶段：${result.stage.name}</span>
        <span>准备度：${result.score}/100</span>
        <span class="${result.risk.cls}">风险：${result.risk.level}</span>
        <span>报名：${result.signup}</span>`;
    }

    const grid = $('#maReportGrid');
    grid.innerHTML = result.cards.map((c, i) => {
      const num = String(i + 1).padStart(2, '0');
      return `<section class="ma-paper-card"><h4 data-num="${num}">${c.title}</h4>${c.html}</section>`;
    }).join('');

    const modules = $('#maA4Modules');
    if (modules) {
      const hint = result.missingHints.length
        ? `<p class="ma-missing-hint">${result.missingHints.join('；')}。</p>`
        : '';
      modules.innerHTML = `
        ${hint}
        <details class="ma-fold" open>
          <summary>${result.paceModule.title}</summary>
          <div class="ma-fold-body">${result.paceModule.html}</div>
        </details>
        <details class="ma-fold">
          <summary>${result.fuelModule.title}</summary>
          <div class="ma-fold-body">${result.fuelModule.html}</div>
        </details>
        <details class="ma-fold">
          <summary>${result.evidence.title}</summary>
          <div class="ma-fold-body">${result.evidence.html}</div>
        </details>`;
    }
  }

  function showDrawer(show) {
    const drawer = $('#maReportDrawer');
    drawer.hidden = !show;
    if (show) {
      setTimeout(() => drawer.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }

  function getDownloadCss() {
    return `
:root{--sky:#B8DDF0;--cream:#FAF7F0;--paper:#FFFDF5;--navy:#214A85;--ink:#26384E;--orange:#E66A45;--teal:#5FA6A0;--yellow:#E8C86A;--muted:#6E7F8E;--danger:#D85A4A;--font-display:"STKaiti","KaiTi","PingFang SC","Microsoft YaHei",serif;--font-body:"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC",system-ui,sans-serif}
*{box-sizing:border-box}
body{margin:0;font-family:var(--font-body);color:var(--ink);line-height:1.65;background:radial-gradient(circle at 12% 8%,rgba(255,255,255,.75) 0 7%,transparent 18%),radial-gradient(circle at 80% 14%,rgba(232,200,106,.22) 0 10%,transparent 27%),linear-gradient(180deg,var(--sky) 0%,#C9E7F4 40%,var(--cream) 88%);padding:32px 16px 48px;min-height:100vh}
body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background-image:radial-gradient(rgba(33,74,133,.1) .6px,transparent .6px),radial-gradient(rgba(230,106,69,.06) .5px,transparent .5px);background-position:0 0,14px 11px;background-size:26px 26px,32px 32px;opacity:.5}
.page-title{text-align:center;margin:0 0 20px;font-size:13px;color:var(--muted);font-weight:700}
.ma-a4-sheet{width:min(794px,100%);margin:0 auto;background:linear-gradient(180deg,#FFFEFA 0%,#FAF7F0 100%);border:1px solid rgba(33,74,133,.16);border-radius:2px;box-shadow:0 1px 0 rgba(255,255,255,.8) inset,0 18px 50px rgba(38,56,78,.16),8px 8px 0 rgba(33,74,133,.04);padding:56px 58px 48px;position:relative;text-align:left}
.ma-a4-sheet::before{content:"";position:absolute;top:36px;bottom:36px;left:28px;width:1px;background:repeating-linear-gradient(180deg,rgba(230,106,69,.35) 0 6px,transparent 6px 14px)}
.ma-a4-sheet::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.12;background-image:radial-gradient(rgba(33,74,133,.2) .4px,transparent .4px);background-size:11px 11px}
.ma-a4-letterhead{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;position:relative;z-index:1;margin-bottom:14px}
.ma-a4-brand{display:flex;align-items:center;gap:12px}
.ma-a4-brand img{border-radius:50%;background:rgba(184,221,240,.35);width:44px;height:44px;object-fit:cover}
.ma-a4-org{margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--teal)}
.ma-a4-brand h2{margin:0;font-family:var(--font-display);font-size:clamp(22px,3vw,30px);color:var(--navy);line-height:1.25}
.ma-a4-meta{display:grid;gap:4px;font-size:11px;color:var(--muted);text-align:right;line-height:1.5;padding-top:4px}
.ma-a4-rule{height:2px;background:linear-gradient(90deg,var(--navy),var(--orange),transparent);margin:0 0 22px;position:relative;z-index:1}
.ma-a4-summary{position:relative;z-index:1;margin:0 0 12px;font-size:15px;color:var(--navy);line-height:1.55}
.ma-a4-summary strong{color:var(--orange);font-size:17px}
.ma-score-band{display:block;margin-top:4px;font-size:12px;color:var(--muted);font-weight:600}
.ma-a4-tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px;position:relative;z-index:1}
.ma-a4-tags span{font-size:12px;font-weight:800;color:var(--navy);background:rgba(184,221,240,.35);border:1px solid rgba(33,74,133,.12);border-radius:6px;padding:5px 10px}
.ma-a4-tags .risk-high{color:var(--danger);background:rgba(216,90,74,.1)}
.ma-a4-tags .risk-mid{color:#C47A28;background:rgba(232,160,74,.15)}
.ma-a4-tags .risk-low{color:#2E756F;background:rgba(95,166,160,.15)}
.ma-report-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 18px;margin-bottom:28px;position:relative;z-index:1}
.ma-paper-card{background:transparent;border:0;border-top:1.5px solid rgba(33,74,133,.12);border-radius:0;padding:14px 4px 10px;position:relative}
.ma-paper-card h4{margin:0 0 8px;font-size:15px;color:var(--navy);font-weight:900;display:flex;align-items:baseline;gap:8px}
.ma-paper-card h4::before{content:attr(data-num);font-family:var(--font-display);font-size:13px;color:var(--orange);font-weight:900}
.ma-paper-card p,.ma-paper-card li{margin:0 0 6px;font-size:13px;color:#445A6E;line-height:1.7}
.ma-paper-card p:last-child{margin-bottom:0}
.ma-paper-card ul{margin:0;padding-left:1.15em}
.ma-paper-card li{margin:3px 0}
.ma-a4-modules{position:relative;z-index:1;display:grid;gap:10px;margin-bottom:18px}
.ma-missing-hint{margin:0;font-size:12px;color:#8A6B20;background:rgba(232,200,106,.18);border:1px dashed rgba(230,106,69,.3);border-radius:8px;padding:10px 12px;font-weight:700}
.ma-fold{background:rgba(255,253,245,.7);border:1px solid rgba(33,74,133,.12);border-radius:8px;overflow:hidden}
.ma-fold summary{cursor:default;list-style:none;padding:12px 14px;font-size:14px;font-weight:900;color:var(--navy);background:rgba(184,221,240,.2)}
.ma-fold summary::-webkit-details-marker{display:none}
.ma-fold-body{padding:12px 14px 14px;font-size:13px;color:#445A6E;line-height:1.7}
.ma-fold-body ul{margin:6px 0;padding-left:1.15em}
.ma-fold-body li{margin:4px 0}
.ma-module-note{font-size:11px!important;color:var(--muted)!important;margin-top:8px!important}
.ma-a4-footnote{position:relative;z-index:1;margin-top:auto;padding-top:16px;border-top:1px dashed rgba(33,74,133,.2);font-size:11px;color:var(--muted);line-height:1.65}
@media (max-width:640px){.ma-a4-sheet{padding:36px 28px 32px}.ma-a4-sheet::before{left:14px}.ma-a4-letterhead{flex-direction:column}.ma-a4-meta{text-align:left}.ma-report-grid{grid-template-columns:1fr}}
@media print{body{background:#fff;padding:0}body::before,.page-title{display:none}.ma-a4-sheet{box-shadow:none;width:210mm}}
`;
  }

  function imageToDataUrl(url) {
    // file:// compatible: keep relative URL (download HTML will reference local assets folder)
    return Promise.resolve(url);
  }

  async function downloadReport(result) {
    if (!result) return;
    // 先确保网页上的 A4 内容已渲染，再克隆，保证风格一致
    renderFullReport(result);
    showDrawer(true);

    const sheet = document.getElementById('maA4Sheet');
    if (!sheet) return;

    const clone = sheet.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('details.ma-fold').forEach((d) => { d.open = true; });

    const imgs = Array.from(clone.querySelectorAll('img'));
    await Promise.all(imgs.map(async (img) => {
      const src = img.getAttribute('src');
      if (!src || src.startsWith('data:')) return;
      img.setAttribute('src', await imageToDataUrl(src));
    }));

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>我的42195公里入场报告</title>
<style>${getDownloadCss()}</style>
</head>
<body>
<p class="page-title">42.195km｜我的入场报告 · 与网页同款版式</p>
${clone.outerHTML}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '我的42195公里入场报告.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function runGenerating() {
    const profile = collectAdvisorInput();
    // 成绩格式校验（有填写才查）
    if (profile.raceTimeParse && profile.raceTimeParse.ok === false) {
      const hint = $('#maTimeHint');
      if (hint) { hint.hidden = false; hint.textContent = profile.raceTimeParse.msg; }
      return;
    }
    if (profile.time5kParse && profile.time5kParse.ok === false) {
      alert(profile.time5kParse.msg);
      return;
    }
    if (profile.time10kParse && profile.time10kParse.ok === false) {
      alert(profile.time10kParse.msg);
      return;
    }

    setStep(3);
    showDrawer(false);
    const msgs = $$('#maGenMsgs li');
    msgs.forEach((li) => li.classList.remove('is-on'));
    const pathEl = $('#maRoutePath');
    if (pathEl) {
      pathEl.classList.remove('is-drawing');
      void pathEl.getBoundingClientRect();
      pathEl.classList.add('is-drawing');
    }

    const result = buildAdvisorResult(profile);
    lastResult = result;

    let i = 0;
    const tick = () => {
      if (i < msgs.length) {
        msgs[i].classList.add('is-on');
        i += 1;
        setTimeout(tick, 300);
      } else {
        setTimeout(() => {
          renderQuickResult(result);
          renderFullReport(result);
          setStep(4);
        }, 260);
      }
    };
    setTimeout(tick, 100);
  }

  function restart() {
    $$('.ma-opt').forEach((b) => b.classList.remove('is-selected'));
    ['maRaceTime', 'maCity', 'maAge', 'maTime5k', 'maTime10k'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const gender = document.getElementById('maGender');
    if (gender) gender.value = '';
    const timeWrap = $('#maTimeWrap');
    if (timeWrap) timeWrap.hidden = true;
    const siteQ = $('#maInjurySiteQ');
    if (siteQ) siteQ.hidden = true;
    const more = $('#maMore');
    if (more) more.hidden = true;
    const toggle = $('#maToggleMore');
    if (toggle) toggle.textContent = '展开更多信息';
    const err = $('#maFormError');
    if (err) err.hidden = true;
    const hint = $('#maTimeHint');
    if (hint) hint.hidden = true;
    lastResult = null;
    showDrawer(false);
    setStep(1);
  }

  /* =========================
   * 事件
   * ========================= */
  root.addEventListener('click', (e) => {
    const opt = e.target.closest('.ma-opt');
    if (opt) {
      const q = opt.closest('.ma-q');
      const field = q && q.dataset.field;
      if (!field) return;
      const group = opt.closest('.ma-opts');
      $$('.ma-opt', group).forEach((b) => b.classList.remove('is-selected'));
      opt.classList.add('is-selected');

      if (field === 'recentRace') {
        const wrap = $('#maTimeWrap');
        wrap.hidden = !(opt.dataset.value === '5k' || opt.dataset.value === '10k');
      }
      if (field === 'injury') {
        const siteQ = $('#maInjurySiteQ');
        if (siteQ) siteQ.hidden = opt.dataset.value === 'none';
      }
      const err = $('#maFormError');
      if (err) err.hidden = true;
      return;
    }

    const btn = e.target.closest('[data-ma-action]');
    if (!btn) return;
    const action = btn.dataset.maAction;

    if (action === 'start') setStep(2);
    else if (action === 'toggle-more') {
      const more = $('#maMore');
      const open = more.hidden;
      more.hidden = !open;
      btn.textContent = open ? '收起更多信息' : '展开更多信息';
    } else if (action === 'generate') {
      const profile = collectAdvisorInput();
      const ok = REQUIRED.every((k) => !!profile[k]);
      if (!ok) {
        const err = $('#maFormError');
        if (err) err.hidden = false;
        return;
      }
      runGenerating();
    } else if (action === 'open-report') {
      if (!lastResult) return;
      renderFullReport(lastResult);
      showDrawer(true);
    } else if (action === 'collapse-report') {
      showDrawer(false);
      const phone = $('#maPhone');
      if (phone) phone.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (action === 'restart') {
      restart();
      const phone = $('#maPhone');
      if (phone) phone.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (action === 'download') {
      if (!lastResult) return;
      downloadReport(lastResult);
    }
  });

  setStep(1);
})();

/* ── Embed bridge for 完整整合版 shell ── */
(function initMarathonEmbedBridge() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('embed') !== '1') return;
  if (window.parent === window) return;

  const SOURCE = 'part-c';
  document.documentElement.classList.add('embed-mode');
  document.body.classList.add('embed-mode');

  function measureHeight() {
    const page = document.querySelector('.page');
    return Math.max(page?.scrollHeight || 0, document.body.scrollHeight, 480);
  }

  function collectAnchors() {
    return ['mobile-advisor', 'ending']
      .map((id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        return { id, top: el.getBoundingClientRect().top + window.scrollY };
      })
      .filter(Boolean);
  }

  function publish() {
    window.parent.postMessage(
      { type: 'marathon-embed', action: 'height', source: SOURCE, height: measureHeight() },
      '*',
    );
    window.parent.postMessage(
      { type: 'marathon-embed', action: 'anchors', source: SOURCE, anchors: collectAnchors() },
      '*',
    );
  }

  publish();
  window.parent.postMessage({ type: 'marathon-embed', action: 'ready', source: SOURCE }, '*');

  const ro = new ResizeObserver(publish);
  ro.observe(document.documentElement);
  const page = document.querySelector('.page');
  if (page) ro.observe(page);

  window.addEventListener('load', publish);
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (data?.type !== 'marathon-embed') return;
    if (data.action === 'viewport' && data.height) {
      document.documentElement.style.setProperty('--embed-vh', `${Number(data.height)}px`);
      requestAnimationFrame(() => requestAnimationFrame(publish));
      return;
    }
    if (data.action === 'scroll-sync' && typeof data.scrollTop === 'number') {
      window.scrollTo(0, data.scrollTop);
      return;
    }
    if (data.action === 'ping') publish();
  });
  window.setTimeout(publish, 400);
  window.setTimeout(publish, 1200);
})();
