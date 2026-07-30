/* Data globals loaded from ./js/data/*.js */
var STORY_DATA = window.STORY_DATA;
var VIDEO_TITLES = window.VIDEO_TITLES || [];
var CHAPTER1_DATA = window.CHAPTER1_DATA;
var CHAPTER2_DATA = window.CHAPTER2_DATA;
var CHAPTER2_CONTENT = window.CHAPTER2_CONTENT;
var CHINA_GEO_JSON = window.CHINA_GEO_JSON;

    
    
    
    
    
    function createCover(chapter) {
  const section = document.createElement('section');
  section.className = 'story-chapter story-chapter--cover';
  section.id = chapter.id;
  section.dataset.chapter = chapter.id;
  section.dataset.status = chapter.status;
  section.setAttribute('aria-labelledby', 'cover-title');

  section.innerHTML = `
    <div class="cover-sticky">
      <div class="cover-sky" aria-hidden="true"></div>
      <div class="cover-runners" aria-hidden="true">
        <img src="${chapter.image}" alt="">
      </div>
      <img class="cover-title-art" src="${chapter.titleArtwork}" alt="" aria-hidden="true">
      <div class="cover-copy">
        <h1 id="cover-title" class="sr-only">${chapter.headline}</h1>
      </div>
      <div class="cover-scroll" aria-hidden="true"><span>向下阅读</span><i></i></div>
    </div>
    <div class="chapter-seam" aria-hidden="true">
      <svg viewBox="0 0 1200 56" preserveAspectRatio="none"><path fill="currentColor" d="M0 28 C200 56 400 0 600 28 S1000 56 1200 20 V56 H0 Z"/></svg>
    </div>
  `;

  return section;
}

function seededRandom(seed) {
  const value = Math.sin(seed * 999.91) * 10000;
  return value - Math.floor(value);
}

function shorten(title) {
  return title.length > 34 ? `${title.slice(0, 34)}…` : title;
}

function createInformationFlow(titles) {
  const layer = document.createElement('div');
  layer.className = 'information-flow';
  layer.setAttribute('aria-hidden', 'true');

  const safeTitles = titles.length ? titles : ['马拉松'];
  const count = Math.min(180, Math.max(80, safeTitles.length));
  for (let index = 0; index < count; index += 1) {
    const pick = Math.floor(seededRandom(index + 31) * safeTitles.length);
    const item = document.createElement('span');
    item.textContent = shorten(safeTitles[pick]);
    item.style.setProperty('--y', `${Math.round(seededRandom(index + 113) * 105 - 3)}%`);
    item.style.setProperty('--size', `${(0.72 + seededRandom(index + 191) * 1.25).toFixed(2)}rem`);
    item.style.setProperty('--threshold', (0.05 + seededRandom(index + 229) * 0.74).toFixed(2));
    item.style.setProperty('--drift-y', `${Math.round(seededRandom(index + 331) * 22 - 11)}px`);
    item.style.setProperty('--duration', `${(24 + seededRandom(index + 283) * 34).toFixed(2)}s`);
    item.style.setProperty('--delay', `${(seededRandom(index + 389) * -52).toFixed(2)}s`);
    layer.append(item);
  }
  return layer;
}

function createPhoneSection(chapter, titles) {
  const section = document.createElement('section');
  section.className = 'story-chapter story-chapter--phone';
  section.id = chapter.id;
  section.dataset.chapter = chapter.id;
  section.dataset.status = chapter.status;
  section.dataset.phoneBeat = 'idle';
  section.setAttribute('aria-labelledby', 'phone-ending');

  // CAA Blue Book: 344.5 / 416.3 / 639.9 万人次 → chart coords
  const points = [
    { year: 2023, value: 344.5, x: 56, y: 118, label: '344.5万' },
    { year: 2024, value: 416.3, x: 168, y: 96, label: '416.3万' },
    { year: 2025, value: 639.9, x: 280, y: 28, label: '639.9万', peak: true },
  ];
  const lineD = points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
  const areaD = `${lineD} L280 148 L56 148 Z`;

  const sticky = document.createElement('div');
  sticky.className = 'phone-sticky';
  sticky.append(createInformationFlow(titles));
  const videoSrc = encodeURI(chapter.video || './assets/video/intro-douyin-feed.mp4');
  const posterSrc = encodeURI('./assets/images/intro-video-poster.jpg');
  sticky.insertAdjacentHTML('beforeend', `
    <div class="phone-source">来自 ${titles.length.toLocaleString()} 条高赞视频标题</div>
    <div class="phone-device" aria-label="播放马拉松短视频的手绘手机">
      <img class="phone-device-shell" src="${chapter.phoneImage}" alt="手绘马拉松主题手机">
      <video class="phone-device-video" autoplay muted loop playsinline webkit-playsinline preload="metadata" poster="${posterSrc}" aria-label="马拉松短视频">
        <source src="${videoSrc}" type="video/mp4">
      </video>
    </div>
    <div class="phone-conclusion" aria-live="polite">
      <div class="phone-beat phone-chart-beat" data-phone-chart>
        <p class="phone-conclusion-kicker">中国田径协会《2025中国马拉松赛事蓝皮书》</p>
        <div class="phone-chart-card">
          <svg viewBox="0 0 336 168" role="img" aria-label="2023至2025年马拉松参赛人次折线图">
            <defs>
              <linearGradient id="phoneChartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#E66A45" stop-opacity=".28"/>
                <stop offset="100%" stop-color="#E66A45" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <line x1="40" y1="148" x2="300" y2="148" stroke="rgba(33,74,133,.14)" stroke-width="1.5"/>
            <path class="phone-chart-area" d="${areaD}"/>
            <path class="phone-chart-line" pathLength="1" d="${lineD}"/>
            ${points.map((p, i) => `
              <circle class="phone-chart-dot${p.peak ? ' is-peak' : ''}" style="--i:${i}" cx="${p.x}" cy="${p.y}" r="${p.peak ? 6.5 : 5}"/>
              <text class="phone-chart-label${p.peak ? ' is-peak' : ''}" style="--i:${i}" x="${p.x}" y="${p.y - 14}" text-anchor="middle">${p.label}</text>
              <text class="phone-chart-year" style="--i:${i}" x="${p.x}" y="162" text-anchor="middle">${p.year}</text>
            `).join('')}
          </svg>
        </div>
        <p class="phone-conclusion-growth">三年参赛规模增长约 <b>86%</b>；2025 年全国举办赛事 594 场。<br>热度从信息流走进赛道。</p>
      </div>
      <div class="phone-beat phone-vow-beat" data-phone-vow>
        <div class="phone-vow-card">
          <p id="phone-ending">${chapter.headline}</p>
          <p>${chapter.ending}</p>
        </div>
      </div>
    </div>
  `);
  section.append(sticky);

  const chartBeat = sticky.querySelector('[data-phone-chart]');
  const lineEl = chartBeat.querySelector('.phone-chart-line');
  let chartDrawn = false;

  function drawChart() {
    if (chartDrawn) return;
    chartDrawn = true;
    // force layout then paint dash
    void lineEl.getTotalLength?.();
    requestAnimationFrame(() => chartBeat.classList.add('is-drawn'));
  }

  function resetChart() {
    chartDrawn = false;
    chartBeat.classList.remove('is-drawn');
  }

  section.phoneController = { drawChart, resetChart };

  // Ensure intro video plays when the phone enters view (observe sticky device, not the tall section)
  const videoEl = sticky.querySelector('.phone-device-video');
  const phoneDevice = sticky.querySelector('.phone-device');
  if (videoEl) {
    videoEl.muted = true;
    videoEl.defaultMuted = true;
    videoEl.setAttribute('muted', '');
    const tryPlay = () => {
      const p = videoEl.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    videoEl.addEventListener('loadeddata', tryPlay);
    videoEl.addEventListener('canplay', tryPlay);
    tryPlay();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) tryPlay();
        else if (!videoEl.paused) videoEl.pause();
      });
    }, { rootMargin: '120px 0px', threshold: 0.01 });
    io.observe(phoneDevice || sticky);
  }

  const exitSeam = document.createElement('div');
  exitSeam.className = 'chapter-seam chapter-seam--exit';
  exitSeam.setAttribute('aria-hidden', 'true');
  exitSeam.innerHTML = `<svg viewBox="0 0 1200 56" preserveAspectRatio="none"><path fill="currentColor" d="M0 18 C220 52 420 4 620 30 S1020 54 1200 16 V56 H0 Z"/></svg>`;
  section.append(exitSeam);
  return section;
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const PERSON_SYMBOL_ID = 'chapter1-person-symbol';

function createPersonSymbolLibrary() {
  const library = document.createElementNS(SVG_NAMESPACE, 'svg');
  library.classList.add('person-symbol-library');
  library.setAttribute('aria-hidden', 'true');
  library.innerHTML = `
    <symbol id="${PERSON_SYMBOL_ID}" viewBox="0 0 28 52">
      <circle cx="14" cy="7" r="5.5" />
      <path d="M8.5 14c3.4-2 7.6-2 11 0l2.4 16-4.3.7L17 47h-5l-.6-16.3-4.3-.7L8.5 14Z" />
      <path d="m8.5 17-5.8 16 4.2 1.6 5.3-13.4M19.5 17l5.8 16-4.2 1.6-5.3-13.4" />
      <path class="person-feet" d="m12.1 46.5-2.2 4.2H5.5M16.9 46.5l2.2 4.2h4.4" />
    </symbol>`;
  return library;
}

function createPersonGlyph(className = 'person-icon') {
  const person = document.createElementNS(SVG_NAMESPACE, 'svg');
  person.classList.add(className);
  person.setAttribute('viewBox', '0 0 28 52');
  person.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(SVG_NAMESPACE, 'use');
  use.setAttribute('href', `#${PERSON_SYMBOL_ID}`);
  person.append(use);
  return person;
}

function createPersonGrid(maxIcons) {
  const root = document.createElement('div');
  root.className = 'person-grid';
  root.setAttribute('role', 'img');
  const fragment = document.createDocumentFragment();
  const people = [];

  fragment.append(createPersonSymbolLibrary());

  for (let index = 0; index < maxIcons; index += 1) {
    const person = createPersonGlyph();
    person.style.setProperty('--person-delay', `${(index % 23) * 18}ms`);
    fragment.append(person);
    people.push(person);
  }
  root.append(fragment);

  function update({ total, selected = 0, mode = 'growth', label = '' }) {
    people.forEach((person, index) => {
      const visible = index < total;
      person.classList.toggle('is-visible', visible);
      person.classList.toggle('is-selected', visible && mode === 'lottery' && index < selected);
      person.classList.toggle('is-muted', visible && mode === 'lottery' && index >= selected);
    });
    root.setAttribute('aria-label', label);
  }

  return { root, update };
}

const numberFormatter = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function createCrowdGrowth(trend, maxIcons, personGrid) {
  const root = document.createElement('div');
  root.className = 'crowd-growth-summary';
  root.innerHTML = `
    <div class="crowd-year" data-crowd-year></div>
    <div class="crowd-total"><strong data-crowd-total></strong><span>万人次</span></div>
    <p data-crowd-unit></p>`;

  const maximum = Math.max(...trend.map((item) => item.totalParticipationWan));
  const unitWan = Math.max(1, Math.ceil(maximum / maxIcons));
  const yearNode = root.querySelector('[data-crowd-year]');
  const totalNode = root.querySelector('[data-crowd-total]');
  const unitNode = root.querySelector('[data-crowd-unit]');
  unitNode.textContent = `1 个小人代表 ${unitWan} 万人次`;

  function update(index) {
    const item = trend[Math.max(0, Math.min(trend.length - 1, index))];
    const count = Math.min(maxIcons, Math.ceil(item.totalParticipationWan / unitWan));
    yearNode.textContent = item.year;
    totalNode.textContent = numberFormatter.format(item.totalParticipationWan);
    personGrid.update({
      total: count,
      mode: 'growth',
      label: `${item.year}年共有${item.totalParticipationWan}万人次参与路跑，图中每个小人代表${unitWan}万人次`,
    });
  }

  return { root, update, unitWan };
}

function createCitySelector(cities, selectedId, onSelect) {
  const root = document.createElement('div');
  root.className = 'city-selector';
  root.setAttribute('aria-label', '选择马拉松城市');

  const buttons = cities.map((city) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'city-selector-button';
    button.dataset.cityId = city.id;
    button.textContent = city.city;
    button.setAttribute('aria-pressed', String(city.id === selectedId));
    button.setAttribute('aria-label', `${city.city}，推算中签率 ${city.computedRate.toFixed(2)}%`);
    button.addEventListener('click', () => onSelect(city.id));
    root.append(button);
    return button;
  });

  function update(nextId) {
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.cityId === nextId)));
  }

  return { root, update };
}

const lotteryNumberFormatter = new Intl.NumberFormat('zh-CN');

function createLotteryStats(dataQualityNote) {
  const root = document.createElement('div');
  root.className = 'lottery-stats';
  const definitions = [
    ['applicants', '报名人数'],
    ['quota', '赛事名额'],
    ['computedRate', '推算中签率'],
    ['gap', '未获得名额'],
  ];
  const values = new Map();

  definitions.forEach(([key, label]) => {
    const item = document.createElement('div');
    item.className = 'lottery-stat';
    item.dataset.key = key;
    item.innerHTML = `<span>${label}</span><strong data-stat="${key}">—</strong>`;
    root.append(item);
    values.set(key, item.querySelector('strong'));
  });

  const note = document.createElement('p');
  note.className = 'lottery-note';
  note.textContent = dataQualityNote || '';
  root.append(note);

  function update(city) {
    values.get('applicants').textContent = lotteryNumberFormatter.format(city.applicants);
    values.get('quota').textContent = lotteryNumberFormatter.format(city.quota);
    values.get('computedRate').textContent = `${city.computedRate.toFixed(2)}%`;
    values.get('computedRate').setAttribute('title', `图中标注：${city.reportedRateLabel}`);
    values.get('gap').textContent = lotteryNumberFormatter.format(city.gap);
  }

  return { root, update };
}

function createScissorsIllustration() {
  const root = document.createElement('div');
  root.className = 'scissors-illustration';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <svg viewBox="0 0 240 220">
      <g class="scissors-blade scissors-blade--top"><path d="M110 112C82 75 53 44 16 20c34 5 78 26 111 75Z"/></g>
      <g class="scissors-blade scissors-blade--bottom"><path d="M110 112C82 149 53 180 16 204c34-5 78-26 111-75Z"/></g>
      <path class="scissors-handle" d="M117 110c29-5 43-31 68-34 31-4 45 32 23 49-19 14-43-5-59-2 15 8 35 35 16 55-22 24-57 5-53-24 3-19 18-29 5-44Z"/>
      <circle class="scissors-pin" cx="116" cy="112" r="9"/>
    </svg>`;
  function update(expanded) { root.classList.toggle('is-open', expanded); }
  return { root, update };
}


const gapNumberFormatter = new Intl.NumberFormat('zh-CN');

function createSupplyDemandGap(supplyDemand, colors) {
  const root = document.createElement('div');
  root.className = 'supply-demand-gap';
  root.style.setProperty('--demand-color', colors.applicants);
  root.style.setProperty('--quota-color', colors.quota);
  root.style.setProperty('--gap-color', colors.gap);

  const chart = document.createElement('div');
  chart.className = 'gap-chart';
  chart.innerHTML = `
    <svg viewBox="0 0 760 390" role="img" aria-label="2024年至2025年报名需求、赛事名额及供需缺口变化">
      <path class="gap-area" data-gap-area/>
      <path class="gap-line gap-line--demand" data-demand-line/>
      <path class="gap-line gap-line--quota" data-quota-line/>
      <g class="gap-labels">
        <text x="70" y="365">2024</text><text x="650" y="365">2025</text>
        <text class="gap-demand-label" x="72" y="58">报名需求</text>
        <text class="gap-quota-label" x="72" y="282">赛事名额</text>
      </g>
      <g class="gap-end-labels" data-gap-end-labels></g>
    </svg>`;
  root.append(chart);

  const summaries = document.createElement('div');
  summaries.className = 'gap-summaries';
  root.append(summaries);
  const scissors = createScissorsIllustration();
  root.append(scissors.root);
  const growth = supplyDemand['2025'].summary;
  const growthNote = document.createElement('p');
  growthNote.className = 'gap-growth-note';
  growthNote.textContent = `需求增长 ${growth.applicantGrowthRate}% · 名额增长 ${growth.quotaGrowthRate}% · 缺口率 +${growth.gapRateChangePercentagePoints} 个百分点`;
  root.append(growthNote);

  const maxApplicants = Math.max(...Object.values(supplyDemand).map((item) => item.summary.totalApplicants));
  const yScale = (value) => 320 - (value / maxApplicants) * 260;
  const demandLine = chart.querySelector('[data-demand-line]');
  const quotaLine = chart.querySelector('[data-quota-line]');
  const gapArea = chart.querySelector('[data-gap-area]');
  const endLabels = chart.querySelector('[data-gap-end-labels]');

  function update(year) {
    const start = supplyDemand['2024'].summary;
    const end = supplyDemand[year].summary;
    const demandStartY = yScale(start.totalApplicants);
    const demandEndY = yScale(end.totalApplicants);
    const quotaStartY = yScale(start.totalQuota);
    const quotaEndY = yScale(end.totalQuota);
    demandLine.setAttribute('d', `M80 ${demandStartY} C280 ${demandStartY},460 ${demandEndY},680 ${demandEndY}`);
    quotaLine.setAttribute('d', `M80 ${quotaStartY} C280 ${quotaStartY},460 ${quotaEndY},680 ${quotaEndY}`);
    gapArea.setAttribute('d', `M80 ${demandStartY} C280 ${demandStartY},460 ${demandEndY},680 ${demandEndY} L680 ${quotaEndY} C460 ${quotaEndY},280 ${quotaStartY},80 ${quotaStartY} Z`);
    endLabels.innerHTML = `
      <text x="690" y="${demandEndY - 8}" fill="#5d9474" font-size="15" font-weight="700">${gapNumberFormatter.format(end.totalApplicants)}</text>
      <text x="690" y="${quotaEndY + 18}" fill="#5479b8" font-size="15" font-weight="700">${gapNumberFormatter.format(end.totalQuota)}</text>`;
    summaries.innerHTML = `
      <div><span>总报名需求</span><strong>${gapNumberFormatter.format(end.totalApplicants)}</strong></div>
      <div><span>赛事名额</span><strong>${gapNumberFormatter.format(end.totalQuota)}</strong></div>
      <div><span>供需缺口</span><strong>${gapNumberFormatter.format(end.totalGap)}</strong></div>
      <div><span>缺口率</span><strong>${end.gapRate.toFixed(1)}%</strong></div>`;
    root.dataset.year = year;
    scissors.update(year === '2025');
  }

  return { root, update };
}



/* ========== Ch1 helpers: 报名情境 + 100人格子 ========== */
function createRegistrationScene(citySample) {
  // 用默认城市（武汉）作情景占位，不伪造核心事实
  const applicants = citySample?.applicants ?? 135000;
  const quota = citySample?.quota ?? 12000;
  const eventName = citySample?.event ?? '热门城市马拉松';
  const root = document.createElement('div');
  root.className = 'register-scene';
  root.dataset.phase = 'idle';
  root.innerHTML = `
    <div class="register-card" role="group" aria-label="马拉松报名情境">
      <p class="register-card__eyebrow">赛事报名</p>
      <h3 class="register-card__title">${eventName}</h3>
      <div class="register-card__meta">
        <div><span>报名人数</span><strong class="is-warn" data-reg-applicants>${lotteryNumberFormatter.format(applicants)}</strong></div>
        <div><span>参赛名额</span><strong data-reg-quota>${lotteryNumberFormatter.format(quota)}</strong></div>
      </div>
      <button type="button" class="register-submit" tabindex="-1" aria-hidden="true">提交报名</button>
      <p class="register-status" data-reg-status>等待抽签结果…</p>
      <p class="register-hint">名额远少于报名人数时，站上起跑线，<br>往往先取决于一条中签短信。</p>
    </div>`;

  let timer = 0;
  function play() {
    root.dataset.phase = 'wait';
    root.querySelector('[data-reg-status]').textContent = '已提交 · 等待抽签结果…';
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      root.dataset.phase = 'result';
      root.querySelector('[data-reg-status]').textContent = '多数人，会停在「未中签」。';
    }, 900);
  }
  function reset() {
    window.clearTimeout(timer);
    root.dataset.phase = 'idle';
    root.querySelector('[data-reg-status]').textContent = '等待抽签结果…';
  }
  return { root, play, reset };
}

function createChanceGrid() {
  // 抽象 100 人格：突出约 1/10 的资格竞争（非精确人数映射）
  const wrap = document.createElement('div');
  wrap.className = 'lottery-focus';
  wrap.innerHTML = `
    <div class="lottery-focus__hero">
      <strong data-chance-rate>≈10%</strong>
      <span data-chance-line>热门赛事平均：约十人报名，一人拿到号码布</span>
    </div>
    <div class="chance-grid" role="img" aria-label="一百个报名者中约十人中签"></div>
    <p class="lottery-focus__caption">主视觉以 100 人为例示意资格竞争；下方可切换城市查看具体推算中签率。</p>`;
  const grid = wrap.querySelector('.chance-grid');
  const cells = [];
  for (let i = 0; i < 100; i += 1) {
    const cell = document.createElement('i');
    cell.className = 'chance-cell';
    cell.style.setProperty('--cell-delay', `${(i % 20) * 18}ms`);
    cell.setAttribute('aria-hidden', 'true');
    grid.append(cell);
    cells.push(cell);
  }
  function update(rate, cityLabel) {
    // computedRate 为百分比（如 10.66）→ 100 人中约几人中签
    const pick = Math.max(1, Math.min(40, Math.round(rate)));
    cells.forEach((cell, index) => cell.classList.toggle('is-in', index < pick));
    wrap.querySelector('[data-chance-rate]').textContent = `≈${rate.toFixed(0)}%`;
    wrap.querySelector('[data-chance-line]').textContent = cityLabel
      ? `${cityLabel}：约 ${pick} / 100 人拿到号码布`
      : `热门赛事平均：约 ${pick} / 100 人拿到号码布`;
    grid.classList.add('is-drawn');
  }
  function reset() {
    grid.classList.remove('is-drawn');
    cells.forEach((cell) => cell.classList.remove('is-in'));
  }
  return { root: wrap, update, reset };
}


function createChapterOutro(step) {
  const root = document.createElement('div');
  root.className = 'chapter1-outro';
  root.innerHTML = `
    <blockquote><strong>${step.title}</strong><span>${step.body}</span></blockquote>
    <div class="outro-distance"><span>${step.kicker}</span><i></i></div>`;
  root.prepend(createPersonGlyph('outro-person'));
  return root;
}







function validateChapter1Data(data) {
  const requiredArrays = ['participationTrend', 'cityLottery2025', 'storySteps'];
  if (!data || requiredArrays.some((key) => !Array.isArray(data[key]) || data[key].length === 0)) return false;
  if (!data.supplyDemand || !data.visualizationConfig) return false;
  return data.storySteps.every((step) => step.id && step.visualState && step.title);
}

function createChapter1(chapter, data) {
  const section = document.createElement('section');
  section.className = 'story-chapter story-chapter--chapter1';
  section.id = chapter.id;
  section.dataset.chapter = chapter.id;
  section.setAttribute('aria-label', '中签');

  if (!validateChapter1Data(data)) {
    section.innerHTML = `<div class="chapter1-error" role="alert"><strong>${chapter.headline}</strong><span>本章数据暂时无法加载，请稍后重试。</span></div>`;
    return section;
  }

  const config = data.visualizationConfig;
  Object.entries(config.colors).forEach(([key, value]) => section.style.setProperty(`--chapter1-${key}`, value));

  const maxIcons = config.personIcon.maxRenderedIcons;
  const personGrid = createPersonGrid(maxIcons);
  const crowdGrowth = createCrowdGrowth(data.participationTrend, maxIcons, personGrid);
  const lotteryStats = createLotteryStats(data.meta.dataQualityNote);
  const chanceGrid = createChanceGrid();
  const orderedCities = config.cityOrder.map((id) => data.cityLottery2025.find((city) => city.id === id)).filter(Boolean);
  const cityMap = new Map(orderedCities.map((city) => [city.id, city]));
  let selectedCityId = cityMap.has(config.defaultCity) ? config.defaultCity : orderedCities[0].id;

  // Step0 报名情境：用默认城市真实报名/名额作情景卡
  const registerScene = createRegistrationScene(cityMap.get(selectedCityId));

  const cityHeading = document.createElement('div');
  cityHeading.className = 'lottery-city-heading';
  const citySelector = createCitySelector(orderedCities, selectedCityId, selectCity);
  const cityPanel = document.createElement('div');
  cityPanel.className = 'lottery-panel';
  cityPanel.append(chanceGrid.root, cityHeading, citySelector.root, lotteryStats.root);

  const supplyDemand = createSupplyDemandGap(data.supplyDemand, config.colors);
  // 章节收束文案（不依赖 storySteps 里的 outro 条目）
  const outro = createChapterOutro({
    kicker: '资格门槛',
    title: '第一道门槛，不是跑完 42.195 公里，',
    body: '而是先获得一次出发的资格。'
  });

  const visual = document.createElement('div');
  visual.className = 'chapter1-visual';
  visual.innerHTML = `<div class="chapter1-paper-texture" aria-hidden="true"></div>`;

  const sharedGrid = document.createElement('div');
  sharedGrid.className = 'chapter1-shared-grid';
  sharedGrid.append(personGrid.root);

  const registerLayer = document.createElement('div');
  registerLayer.className = 'chapter1-layer chapter1-layer--register is-active';
  registerLayer.append(registerScene.root);

  const crowdLayer = document.createElement('div');
  crowdLayer.className = 'chapter1-layer chapter1-layer--crowd';
  crowdLayer.append(crowdGrowth.root);

  const lotteryLayer = document.createElement('div');
  lotteryLayer.className = 'chapter1-layer chapter1-layer--lottery';
  lotteryLayer.append(cityPanel);

  const gapLayer = document.createElement('div');
  gapLayer.className = 'chapter1-layer chapter1-layer--gap';
  gapLayer.append(supplyDemand.root);

  const outroLayer = document.createElement('div');
  outroLayer.className = 'chapter1-layer chapter1-layer--outro';
  outroLayer.append(outro);

  visual.append(sharedGrid, registerLayer, crowdLayer, lotteryLayer, gapLayer, outroLayer);

  const steps = document.createElement('div');
  steps.className = 'chapter1-steps';
  data.storySteps.forEach((step, index) => {
    const article = document.createElement('article');
    article.className = 'chapter1-step';
    article.dataset.stepIndex = String(index);
    article.dataset.visualState = step.visualState;
    article.innerHTML = `<div class="chapter1-step-copy"><p>${step.kicker}</p><h2>${step.title}</h2><span>${step.body}</span></div>`;
    steps.append(article);
  });

  const entrance = document.createElement('div');
  entrance.className = 'chapter-entrance';
  entrance.innerHTML = `
    <h1>中签</h1>
    <p class="chapter-entrance-lead is-personal">${data.meta.theme}</p>`;

  section.append(entrance, visual, steps);

  // 视觉层：0报名 1人群 2中签格 3剪刀差；outro 由 step3 后半段 progress 触发
  const layers = [registerLayer, crowdLayer, lotteryLayer, gapLayer];
  const stepNodes = Array.from(steps.children);
  let lastGapYear = null;
  let lastStepIndex = -1;
  let registerPlayed = false;

  function selectCity(id) {
    const city = cityMap.get(id);
    if (!city) return;
    selectedCityId = id;
    citySelector.update(id);
    cityHeading.innerHTML = `<strong>${city.event}</strong><span>${city.shortName} · 补充数据</span>`;
    lotteryStats.update(city);
    chanceGrid.update(city.computedRate, city.shortName);
  }

  function setStep(index, localProgress = 0) {
    const safeIndex = Math.max(0, Math.min(data.storySteps.length - 1, index));
    const entered = safeIndex !== lastStepIndex;
    lastStepIndex = safeIndex;

    // Step3 后半段切到收束画面
    const showOutro = safeIndex === 3 && localProgress > 0.58;
    layers.forEach((layer, layerIndex) => {
      const on = !showOutro && layerIndex === safeIndex;
      layer.classList.toggle('is-active', on);
    });
    outroLayer.classList.toggle('is-active', showOutro);

    // 人群小人仅在「热情上涨」步出现
    sharedGrid.classList.toggle('is-active', safeIndex === 1);
    stepNodes.forEach((step, stepIndex) => step.classList.toggle('is-current', stepIndex === safeIndex));

    if (safeIndex === 0) {
      if (entered || !registerPlayed) {
        registerPlayed = true;
        registerScene.reset();
        window.requestAnimationFrame(() => registerScene.play());
      }
    }
    if (safeIndex === 1) {
      crowdGrowth.update(Math.min(data.participationTrend.length - 1, Math.floor(localProgress * data.participationTrend.length)));
    }
    if (safeIndex === 2 && entered) {
      chanceGrid.reset();
      window.requestAnimationFrame(() => selectCity(selectedCityId));
    }
    if (safeIndex === 3 && !showOutro) {
      const year = localProgress > 0.42 ? '2025' : '2024';
      supplyDemand.update(year);
      if (year !== lastGapYear) {
        lastGapYear = year;
        const area = supplyDemand.root.querySelector('[data-gap-area]');
        if (area) {
          area.classList.remove('is-pulse');
          void area.offsetWidth;
          area.classList.add('is-pulse');
        }
      }
    }
  }

  setStep(0, 0);
  section.chapter1Controller = { setStep, stepNodes };
  return section;
}


const CHAPTER2_CITY_SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

function createEventCityNodes(cities, project, options = {}) {
  const group = document.createElementNS(CHAPTER2_CITY_SVG_NAMESPACE, 'g');
  group.classList.add('chapter2-city-layer');
  if (options.className) group.classList.add(options.className);

  const radius = options.compact ? 7 : 8;

  cities.forEach((city, index) => {
    const point = project(city.coordinates);
    const node = document.createElementNS(CHAPTER2_CITY_SVG_NAMESPACE, 'g');
    node.classList.add('chapter2-city-node');
    node.style.setProperty('--city-delay', `${index * 90}ms`);
    node.setAttribute('transform', `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);
    node.setAttribute('tabindex', '0');
    node.setAttribute('aria-label', city.name);

    const title = document.createElementNS(CHAPTER2_CITY_SVG_NAMESPACE, 'title');
    title.textContent = city.name;

    const halo = document.createElementNS(CHAPTER2_CITY_SVG_NAMESPACE, 'circle');
    halo.classList.add('chapter2-city-halo');
    halo.setAttribute('r', String(radius + 4));

    const circle = document.createElementNS(CHAPTER2_CITY_SVG_NAMESPACE, 'circle');
    circle.classList.add('chapter2-city-dot');
    circle.setAttribute('r', String(radius));

    const label = document.createElementNS(CHAPTER2_CITY_SVG_NAMESPACE, 'text');
    label.classList.add('chapter2-city-label');
    label.setAttribute('x', String(radius + 7));
    label.setAttribute('y', '4');
    label.textContent = city.name;

    node.append(title, halo, circle, label);
    group.append(node);
  });

  return group;
}


const CHAPTER2_MAP_SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

function collectCoordinates(geometry, points) {
  if (!geometry) return;
  if (geometry.type === 'Polygon') {
    geometry.coordinates.flat(1).forEach((point) => points.push(point));
  }
  if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.flat(2).forEach((point) => points.push(point));
  }
}

function pathFromPolygon(rings, project) {
  return rings.map((ring) => ring.map((coordinates, index) => {
    const point = project(coordinates);
    return `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }).join(' ') + ' Z').join(' ');
}

function pathFromGeometry(geometry, project) {
  if (geometry.type === 'Polygon') return pathFromPolygon(geometry.coordinates, project);
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.map((polygon) => pathFromPolygon(polygon, project)).join(' ');
  return '';
}

function createProjection(geoJson, width, height) {
  const points = [];
  geoJson.features.forEach((feature) => collectCoordinates(feature.geometry, points));
  if (!points.length) throw new Error('china.json 中没有可绘制的坐标。');

  const lonValues = points.map((point) => point[0]);
  const latValues = points.map((point) => point[1]);
  const minLon = Math.min(...lonValues);
  const maxLon = Math.max(...lonValues);
  const minLat = Math.min(...latValues);
  const maxLat = Math.max(...latValues);
  const padding = 34;
  const scale = Math.min((width - padding * 2) / (maxLon - minLon), (height - padding * 2) / (maxLat - minLat));
  const mapWidth = (maxLon - minLon) * scale;
  const mapHeight = (maxLat - minLat) * scale;
  const offsetX = (width - mapWidth) / 2;
  const offsetY = (height - mapHeight) / 2;

  return ([lon, lat]) => ({
    x: offsetX + (lon - minLon) * scale,
    y: offsetY + (maxLat - lat) * scale,
  });
}

function validateGeoJson(geoJson) {
  return geoJson?.type === 'FeatureCollection' && Array.isArray(geoJson.features) && geoJson.features.length > 0;
}

function createChinaMap(geoJson, data) {
  const root = document.createElement('div');
  root.className = 'china-map';
  root.setAttribute('aria-label', '中国马拉松跨城地图');

  if (!validateGeoJson(geoJson)) {
    root.innerHTML = '<div class="china-map__error" role="alert">中国地图数据解析失败：china.json 不是有效的 GeoJSON。</div>';
    return { root, setActiveStep() {} };
  }

  try {
    const width = 960;
    const height = 720;
    const project = createProjection(geoJson, width, height);
    const svg = document.createElementNS(CHAPTER2_MAP_SVG_NAMESPACE, 'svg');
    svg.classList.add('china-map__svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '中国省级轮廓地图');

    const provinces = document.createElementNS(CHAPTER2_MAP_SVG_NAMESPACE, 'g');
    provinces.classList.add('chapter2-provinces');
    geoJson.features.forEach((feature) => {
      const path = document.createElementNS(CHAPTER2_MAP_SVG_NAMESPACE, 'path');
      path.classList.add('chapter2-province');
      path.setAttribute('d', pathFromGeometry(feature.geometry, project));
      path.setAttribute('aria-label', feature.properties?.name || '省级轮廓');
      provinces.append(path);
    });

    const eventCities = createEventCityNodes(data.eventCities, project);

    // 示意性汇聚线：强调「多城奔赴同一场」，非城际客流真实 OD
    const hub = data.eventCities.find((c) => c.name === '上海') || data.eventCities[0];
    const hubPoint = project(hub.coordinates);
    const flows = document.createElementNS(CHAPTER2_MAP_SVG_NAMESPACE, 'g');
    flows.classList.add('chapter2-flow-layer');
    flows.setAttribute('aria-hidden', 'true');
    data.eventCities.forEach((city) => {
      if (city.name === hub.name) return;
      const p = project(city.coordinates);
      const midX = (p.x + hubPoint.x) / 2;
      const midY = Math.min(p.y, hubPoint.y) - 36;
      const path = document.createElementNS(CHAPTER2_MAP_SVG_NAMESPACE, 'path');
      path.classList.add('chapter2-flow-line');
      path.setAttribute('d', `M${p.x},${p.y} Q${midX},${midY} ${hubPoint.x},${hubPoint.y}`);
      flows.append(path);
    });

    svg.append(provinces, flows, eventCities);
    root.append(svg);

    function setActiveStep(step) {
      root.dataset.activeStep = String(step);
      root.classList.toggle('is-muted', false);
    }

    setActiveStep(0);
    return { root, setActiveStep };
  } catch (error) {
    console.error(error);
    root.innerHTML = '<div class="china-map__error" role="alert">中国地图数据解析失败：无法绘制省级轮廓。</div>';
    return { root, setActiveStep() {} };
  }
}

function createDataSource(metric) {
  const source = document.createElement('p');
  source.className = 'chapter2-source';
  source.textContent = metric.description;
  return source;
}


function createCoreDistanceMetric(metric) {
  const root = document.createElement('div');
  root.className = 'chapter2-core-metric';
  root.dataset.animated = 'false';
  root.innerHTML = `
    <div class="chapter2-core-number" aria-label="${metric.displayValue} KM">
      <strong data-count-value>0</strong>
      <span>KM</span>
    </div>
    <p class="chapter2-core-label">非本地参赛选手<br>平均参赛半径</p>
  `;
  root.append(createDataSource(metric));

  const number = root.querySelector('[data-count-value]');

  function play() {
    if (root.dataset.animated === 'true') return;
    root.dataset.animated = 'true';
    const target = Number(metric.displayValue);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      number.textContent = String(target);
      return;
    }
    const startedAt = performance.now();
    const duration = 1250;
    function tick(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      number.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else number.textContent = String(target);
    }
    requestAnimationFrame(tick);
  }

  return { root, play };
}

function formatDistance(value) {
  return Number.isInteger(value) ? String(value) : String(value.toFixed(3)).replace(/0+$/, '').replace(/\.$/, '');
}

function createDistanceComparison(coreMetric, raceDistance) {
  const ratio = coreMetric.value / raceDistance.value;
  const roundedRatio = Math.round(ratio);
  const racePercent = Math.max(8, Math.min(100, (raceDistance.value / coreMetric.value) * 100));

  const root = document.createElement('div');
  root.className = 'chapter2-distance-comparison';
  root.innerHTML = `
    <div class="chapter2-distance-bars" aria-label="42.195 KM 与 516 KM 距离对比">
      <div class="chapter2-distance-row chapter2-distance-row--race">
        <strong>${formatDistance(raceDistance.value)} KM</strong>
        <span>${raceDistance.label}</span>
        <i style="--bar-width: ${racePercent.toFixed(2)}%"></i>
      </div>
      <div class="chapter2-distance-row chapter2-distance-row--travel">
        <strong>${coreMetric.displayValue} KM</strong>
        <span>非本地跑者平均参赛半径</span>
        <i style="--bar-width: 100%"></i>
      </div>
    </div>
      <p class="chapter2-ratio">抵达起跑线的距离，约是比赛本身的${roundedRatio}倍。</p>
    <div class="chapter2-ending">
      <p>42.195公里的比赛之前，</p>
      <p>很多人平均要先跨越516公里。</p>
      <strong>真正的比赛，<br>从出发那一刻，<br>就已经开始了。</strong>
      <em>10 KM</em>
    </div>
  `;

  function play() {
    root.classList.remove('is-drawn');
    void root.offsetWidth;
    root.classList.add('is-drawn');
  }

  return { root, ratio, play };
}

function createStoryStep(step, index) {
  const article = document.createElement('article');
  article.className = 'chapter2-step';
  article.dataset.stepIndex = String(index);

  const paragraphs = step.body.map((line) => `<p>${line}</p>`).join('');

  article.innerHTML = `
    <div class="chapter2-step-card">
      <p class="chapter2-step-kicker">${step.kicker}</p>
      <h2>${step.title}</h2>
      <div class="chapter2-step-body">${paragraphs}</div>
    </div>
  `;

  if (step.content) article.querySelector('.chapter2-step-card').append(step.content);

  return article;
}




function createChapter2Story(data) {
  const ratio = Math.round(data.coreMetric.value / data.raceDistance.value);
  const steps = [
    {
      kicker: '空间门槛',
      title: '拿到名额，只是开始。',
      body: [
        '很多时候，真正的比赛，不在家门口。',
        '热门马拉松集中在少数城市——',
        '机会，往往在别处。'
      ]
    },
    {
      kicker: `${data.coreMetric.year} · 蓝皮书`,
      title: '为了跑一场比赛，先跨越几百公里。',
      body: [
        `非本地参赛选手平均参赛半径达 ${data.coreMetric.displayValue} 公里，`,
        `约是赛程 ${formatDistance(data.raceDistance.value)} 公里的 ${ratio} 倍。`,
        '在跑完 42.195 公里之前，他们平均要先跨越这一段路。'
      ]
    },
    {
      kicker: '奔赴的过程',
      title: '很多人跑完 42 公里之前，已经先出发了一整程。',
      body: [
        '从出发、领物、住宿，到清晨站上起跑线，',
        '比赛常常从前一天甚至更早就开始了。',
        '这里讲的是时间与精力，不是账单。'
      ]
    },
    {
      kicker: '全国奔赴',
      title: '在跑完 42.195 公里之前，他们已经先奔赴了很远。',
      body: [
        '有人不是为了旅行而出发，',
        '而是为了拥有一次站上起跑线的机会。',
        '而跨出这几百公里之后，真正的账单，才刚刚开始。'
      ]
    }
  ];

  const root = document.createElement('div');
  root.className = 'chapter2-steps';
  steps.forEach((step, index) => root.append(createStoryStep(step, index)));
  return { root, stepNodes: Array.from(root.children) };
}

function createJourneyItinerary() {
  // 结构占位：跨城参赛的常见时间节奏（非消费数据）
  const root = document.createElement('div');
  root.className = 'journey-itinerary';
  root.innerHTML = `
    <div class="itinerary-board" data-itinerary>
      <p class="itinerary-board__kicker">一场比赛的前后</p>
      <h3 class="itinerary-board__title">跨城，往往意味着一整段行程</h3>
      <div class="itinerary-track">
        <div class="itinerary-stop"><strong>周五晚 · 出发</strong><span>离开本地，赶往赛事城市</span></div>
        <div class="itinerary-stop"><strong>周六 · 到达 / 领物</strong><span>安顿、领取参赛物资</span></div>
        <div class="itinerary-stop" data-accent="true"><strong>周日 · 清晨起跑</strong><span>真正站上 42.195 公里的起点</span></div>
        <div class="itinerary-stop"><strong>赛后 · 返程</strong><span>带着完赛（或未完赛）的身体回家</span></div>
      </div>
      <p class="itinerary-note">流程为常见跨城节奏示意，因人而异；金额与装备成本见下一章。</p>
    </div>`;
  function play() {
    root.querySelector('[data-itinerary]')?.classList.add('is-drawn');
  }
  return { root, play };
}

function createConvergeBoard(metric) {
  const root = document.createElement('div');
  root.className = 'journey-converge';
  root.innerHTML = `
    <div class="converge-board">
      <p class="converge-board__num">${metric.displayValue}</p>
      <p class="converge-board__unit">KM · 平均参赛半径</p>
      <p class="converge-board__lead">为了这一场比赛，很多人提前几百公里出发。</p>
      <p class="converge-board__bridge">而跨出这几百公里之后，<br>真正的账单，才刚刚开始。</p>
    </div>`;
  return { root };
}

function validateChapter2Data(data) {
  return Boolean(
    data?.chapter &&
    data?.coreMetric &&
    data?.raceDistance &&
    Array.isArray(data.eventCities) &&
    data.eventCities.length > 0
  );
}

function createChapter2(chapter, data, chinaGeoJson) {
  const section = document.createElement('section');
  section.className = 'story-chapter story-chapter--chapter2';
  section.id = chapter.id;
  section.dataset.chapter = chapter.id;
  section.setAttribute('aria-label', data?.chapter?.title || chapter.headline);

  if (!validateChapter2Data(data)) {
    section.innerHTML = `<div class="chapter2-error" role="alert"><strong>${chapter.headline}</strong><span>第二章数据暂时无法加载。</span></div>`;
    return section;
  }

  const map = createChinaMap(chinaGeoJson, data);
  const story = createChapter2Story(data);
  const itinerary = createJourneyItinerary();
  const converge = createConvergeBoard(data.coreMetric);

  const gauge = document.createElement('div');
  gauge.className = 'journey-gauge';
  const maxKm = 600;
  const travelAngle = -180 + (data.coreMetric.displayValue / maxKm) * 180;
  gauge.innerHTML = `
    <div class="journey-gauge-card">
      <div class="jg-dial" aria-hidden="true">
        <svg viewBox="0 0 280 160">
          <path d="M20 140 A120 120 0 0 1 260 140" fill="none" stroke="rgba(33,74,133,.12)" stroke-width="18" stroke-linecap="round"/>
          <path d="M20 140 A120 120 0 0 1 260 140" fill="none" stroke="#E66A45" stroke-width="18" stroke-linecap="round"
            stroke-dasharray="0 999" data-jg-arc />
          <g class="jg-needle" data-jg-needle transform="rotate(-180 140 140)">
            <line x1="140" y1="140" x2="140" y2="62" stroke="#214A85" stroke-width="3" stroke-linecap="round"/>
            <circle cx="140" cy="140" r="5" fill="#E66A45" stroke="#fff" stroke-width="2"/>
          </g>
          <text x="20" y="158" fill="#839095" font-size="11">0</text>
          <text x="248" y="158" fill="#839095" font-size="11">600</text>
        </svg>
      </div>
      <p class="jg-value"><span data-jg-num>0</span><span class="jg-unit">KM</span></p>
      <p class="jg-caption">${data.coreMetric.year} · 非本地参赛选手平均参赛半径</p>
      <span class="jg-mark-race">赛程仅 ${formatDistance(data.raceDistance.value)} KM</span>
    </div>`;

  const mapCaption = document.createElement('p');
  mapCaption.className = 'chapter2-map-caption';
  mapCaption.textContent = '';
  mapCaption.hidden = true;

  const sticky = document.createElement('div');
  sticky.className = 'chapter2-sticky';
  sticky.dataset.step = '0';
  sticky.append(map.root, gauge, itinerary.root, converge.root, mapCaption);

  const entrance = document.createElement('div');
  entrance.className = 'chapter-entrance';
  entrance.innerHTML = `
    <h1>跨城奔赴</h1>
    <p class="chapter-entrance-lead is-personal">${data.chapter.subtitle}</p>`;

  section.append(entrance, sticky, story.root);

  const needle = gauge.querySelector('[data-jg-needle]');
  const arc = gauge.querySelector('[data-jg-arc]');
  const num = gauge.querySelector('[data-jg-num]');
  const arcLen = Math.PI * 120;
  let gaugePlayed = false;

  function playGauge() {
    if (gaugePlayed) {
      needle.setAttribute('transform', `rotate(${travelAngle} 140 140)`);
      num.textContent = String(data.coreMetric.displayValue);
      return;
    }
    gaugePlayed = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      needle.setAttribute('transform', `rotate(${travelAngle} 140 140)`);
      num.textContent = String(data.coreMetric.displayValue);
      arc.setAttribute('stroke-dasharray', `${(data.coreMetric.displayValue / maxKm) * arcLen} 999`);
      return;
    }
    const started = performance.now();
    const duration = 1300;
    function tick(now) {
      const p = Math.min(1, (now - started) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      const ang = -180 + e * (data.coreMetric.displayValue / maxKm) * 180;
      needle.setAttribute('transform', `rotate(${ang} 140 140)`);
      num.textContent = String(Math.round(data.coreMetric.displayValue * e));
      arc.setAttribute('stroke-dasharray', `${e * (data.coreMetric.displayValue / maxKm) * arcLen} 999`);
      if (p < 1) requestAnimationFrame(tick);
      else num.textContent = String(data.coreMetric.displayValue);
    }
    requestAnimationFrame(tick);
  }

  function setStep(index) {
    const safeIndex = Math.max(0, Math.min(3, index));
    map.setActiveStep(safeIndex);
    sticky.dataset.step = String(safeIndex);
    story.stepNodes.forEach((step, stepIndex) => step.classList.toggle('is-current', stepIndex === safeIndex));
    if (safeIndex === 1) playGauge();
    if (safeIndex === 2) itinerary.play();
  }

  setStep(0);
  section.chapter2Controller = { setStep, stepNodes: story.stepNodes };
  return section;
}




/* ========== Chapter 2 rewrite: cross-city scrollytelling from JSON ========== */
function chapter2Escape(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

function getChapter2Content() {
  return CHAPTER2_CONTENT || null;
}

function getChapter2Beats(content) {
  return Array.isArray(content?.beats)
    ? [...content.beats].sort((a, b) => Number(a.order) - Number(b.order))
    : [];
}

function renderChapter2SourceNote(source) {
  const lines = Array.isArray(source) ? source : [source].filter(Boolean);
  return `<div class="c2-source">${lines.map((line) => `<p>${chapter2Escape(line)}</p>`).join('')}</div>`;
}

function renderChapter2DataPoints(points) {
  if (!Array.isArray(points) || !points.length) return '';
  return `<dl class="c2-data-points">${points.map((point) => `
    <div>
      <dt>${chapter2Escape(point.label)}</dt>
      <dd>${chapter2Escape(point.value)}</dd>
    </div>`).join('')}</dl>`;
}

function createChapter2BeatArticle(beat) {
  const article = document.createElement('article');
  article.className = 'c2-beat';
  article.dataset.order = String(beat.order);
  article.innerHTML = `
    <p class="c2-beat__kicker">${chapter2Escape(beat.title)}</p>
    <h2>${chapter2Escape(beat.headline_number || beat.title)}</h2>
    <p class="c2-beat__subtitle">${chapter2Escape(beat.subtitle || '')}</p>
    <div class="c2-beat__copy">
      <p>${chapter2Escape(beat.copy)}</p>
      <p>${chapter2Escape(beat.supporting_copy)}</p>
    </div>
    ${renderChapter2DataPoints(beat.data_points)}
    ${renderChapter2SourceNote(beat.source)}
  `;
  return article;
}

function getFeatureProvinceName(feature) {
  return String(feature?.properties?.name || '').replace(/省|市|自治区|特别行政区|壮族|回族|维吾尔/g, '');
}

function createChapter2ProvinceMap(geoJson, content) {
  const root = document.createElement('div');
  root.className = 'c2-map-stage';

  if (!validateGeoJson(geoJson)) {
    root.innerHTML = '<div class="china-map__error" role="alert">中国地图数据解析失败。</div>';
    return { root, setMode() {} };
  }

  const width = 960;
  const height = 720;
  const project = createProjection(geoJson, width, height);
  const svg = document.createElementNS(CHAPTER2_MAP_SVG_NAMESPACE, 'svg');
  svg.classList.add('c2-map');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', '中国马拉松赛事空间分布示意地图，包含台湾');

  const heatmap = content?.beats?.find((beat) => beat.order === 2)?.heatmap_data || {};
  const supplyTop3 = heatmap.race_supply_top3 || [];
  const highTier = new Set((heatmap.high_tier_race_concentration_provinces || []).map(String));
  const runnerTop3 = new Set((heatmap.runner_origin_top3_provinces || []).map(String));
  const maxRaces = Math.max(1, ...supplyTop3.map((item) => Number(item.races_2025) || 0));

  const provinceLayer = document.createElementNS(CHAPTER2_MAP_SVG_NAMESPACE, 'g');
  provinceLayer.classList.add('c2-map__provinces');
  const nodeLayer = document.createElementNS(CHAPTER2_MAP_SVG_NAMESPACE, 'g');
  nodeLayer.classList.add('c2-map__nodes');

  geoJson.features.forEach((feature) => {
    const fullName = feature.properties?.name || '';
    const shortName = getFeatureProvinceName(feature);
    const matchedSupply = supplyTop3.find((item) => fullName.includes(item.province) || shortName.includes(item.province));
    const isHighTier = Array.from(highTier).some((name) => fullName.includes(name) || shortName.includes(name));
    const isRunnerTop = Array.from(runnerTop3).some((name) => fullName.includes(name) || shortName.includes(name));
    const isTaiwan = fullName.includes('台湾');
    const path = document.createElementNS(CHAPTER2_MAP_SVG_NAMESPACE, 'path');
    path.classList.add('c2-province');
    if (matchedSupply) path.classList.add('is-supply-top');
    if (isHighTier) path.classList.add('is-high-tier');
    if (isRunnerTop) path.classList.add('is-runner-top');
    if (isTaiwan) path.classList.add('is-taiwan');
    path.dataset.province = fullName;
    path.style.setProperty('--heat', String(((matchedSupply?.races_2025 || 0) / maxRaces).toFixed(3)));
    path.setAttribute('d', pathFromGeometry(feature.geometry, project));
    path.setAttribute('aria-label', fullName);
    provinceLayer.append(path);

    if (matchedSupply || isHighTier || isRunnerTop) {
      const points = [];
      collectCoordinates(feature.geometry, points);
      if (points.length) {
        const projected = points.map(project);
        const cx = projected.reduce((sum, point) => sum + point.x, 0) / projected.length;
        const cy = projected.reduce((sum, point) => sum + point.y, 0) / projected.length;
        const node = document.createElementNS(CHAPTER2_MAP_SVG_NAMESPACE, 'g');
        node.classList.add('c2-province-node');
        node.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)})`);
        node.innerHTML = `
          <circle r="${matchedSupply ? 8 : 5}"></circle>
          <text x="12" y="4">${chapter2Escape(shortName)}</text>
        `;
        nodeLayer.append(node);
      }
    }
  });

  const radiusLayer = document.createElementNS(CHAPTER2_MAP_SVG_NAMESPACE, 'g');
  radiusLayer.classList.add('c2-radius-layer');
  radiusLayer.innerHTML = `
    <circle class="c2-radius-ring" cx="610" cy="390" r="0"></circle>
    <text class="c2-radius-label" x="620" y="320">516.076 KM</text>
  `;

  svg.append(provinceLayer, radiusLayer, nodeLayer);
  root.append(svg);
  const legend = document.createElement('div');
  legend.className = 'c2-map-legend';
  legend.innerHTML = `
    <span><i class="is-supply"></i>办赛场次前三</span>
    <span><i class="is-high"></i>高水平赛事集中省份</span>
    <span><i class="is-runner"></i>完赛跑者分布前三</span>
  `;
  root.append(legend);

  function setMode(order) {
    root.dataset.mode = order === 2 ? 'heat' : 'trek';
  }

  setMode(1);
  return { root, setMode };
}

function createChapter2TemporalChart(beat) {
  const root = document.createElement('div');
  root.className = 'c2-month-chart';
  const rows = [];
  (beat.data_points || []).forEach((point) => {
    const text = `${point.label} ${point.value}`;
    const matches = [...text.matchAll(/(\d{1,2})月\s*(\d+)场(?:\(?占?([\d.]+)%\)?)?/g)];
    matches.forEach((match) => rows.push({
      month: Number(match[1]),
      count: Number(match[2]),
      percent: match[3] ? Number(match[3]) : null,
    }));
  });
  rows.sort((a, b) => a.month - b.month);
  const max = Math.max(1, ...rows.map((row) => row.count));
  root.innerHTML = `
    <div class="c2-chart-head">
      <strong>${chapter2Escape(beat.headline_number)}</strong>
      <span>${chapter2Escape(beat.subtitle)}</span>
    </div>
    <div class="c2-month-bars" role="img" aria-label="赛事高峰月份柱状图">
      ${rows.map((row) => `
        <div class="c2-month-bar" style="--bar:${(row.count / max).toFixed(3)}">
          <i></i>
          <strong>${row.month}月</strong>
          <span>${row.count}场${row.percent == null ? '' : ` · ${row.percent}%`}</span>
        </div>
      `).join('')}
    </div>
  `;
  return root;
}

function createChapter2BillVisual(beat) {
  const root = document.createElement('div');
  root.className = 'c2-bill';
  const points = beat.data_points || [];
  root.innerHTML = `
    <div class="c2-bill__paper">
      <p class="c2-bill__store">跨城参赛账单</p>
      <h3>${chapter2Escape(beat.headline_number)}</h3>
      <p>${chapter2Escape(beat.subtitle)}</p>
      <ol>
        ${points.map((point) => `<li><span>${chapter2Escape(point.label)}</span><strong>${chapter2Escape(point.value)}</strong></li>`).join('')}
      </ol>
    </div>
  `;
  return root;
}

function createChapter2VisualStage(content, geoJson, beats) {
  const root = document.createElement('div');
  root.className = 'c2-visual-stage';
  const map = createChapter2ProvinceMap(geoJson, content);
  const temporal = createChapter2TemporalChart(beats.find((beat) => beat.order === 3) || {});
  const bill = createChapter2BillVisual(beats.find((beat) => beat.order === 4) || {});
  temporal.dataset.visual = '3';
  bill.dataset.visual = '4';
  root.append(map.root, temporal, bill);

  function setBeat(order) {
    root.dataset.activeBeat = String(order);
    map.setMode(order);
    temporal.classList.toggle('is-active', order === 3);
    bill.classList.toggle('is-active', order === 4);
    if (order === 3) temporal.classList.add('has-played');
    if (order === 4) bill.classList.add('has-played');
  }

  return { root, setBeat };
}

function validateChapter2Content(content) {
  return Boolean(content?.core_stat && getChapter2Beats(content).length === 4);
}

function createChapter2(chapter, data, chinaGeoJson) {
  const content = getChapter2Content();
  const beats = getChapter2Beats(content);
  const section = document.createElement('section');
  section.className = 'story-chapter story-chapter--chapter2 c2-rewrite';
  section.id = chapter.id;
  section.dataset.chapter = chapter.id;
  section.setAttribute('aria-label', content?.chapter || '跨城参赛');

  if (!validateChapter2Content(content)) {
    section.innerHTML = `<div class="chapter2-error" role="alert"><strong>跨城奔赴</strong><span>第二章数据暂时无法加载。</span></div>`;
    return section;
  }

  const visual = createChapter2VisualStage(content, chinaGeoJson, beats);
  const beatList = document.createElement('div');
  beatList.className = 'c2-beats';
  beats.forEach((beat) => beatList.append(createChapter2BeatArticle(beat)));

  const head = document.createElement('header');
  head.className = 'c2-head';
  head.innerHTML = `
    <h1>跨城奔赴</h1>
    <p>${chapter2Escape(beats[0]?.copy || content.core_stat.label)}</p>
  `;

  const shell = document.createElement('div');
  shell.className = 'c2-shell';
  shell.append(head, visual.root, beatList);
  section.append(shell);

  const stepNodes = Array.from(beatList.children);
  const played = new Set();
  function setStep(index) {
    const safeIndex = Math.max(0, Math.min(stepNodes.length - 1, index));
    const beat = beats[safeIndex];
    stepNodes.forEach((node, nodeIndex) => node.classList.toggle('is-current', nodeIndex === safeIndex));
    section.dataset.activeBeat = String(beat.order);
    visual.setBeat(beat.order);
    if (!played.has(beat.order)) {
      played.add(beat.order);
      section.classList.add(`has-played-${beat.order}`);
    }
  }

  setStep(0);
  section.chapter2Controller = { setStep, stepNodes };
  return section;
}

function initChapter3() {

      const ICON = "./assets/chapter3/receipt-icons";

      const HARD_ITEMS = [
        { icon: "hard-shoes.png", name: "跑鞋", note: "性价比→碳板款", price: "¥300 – 3,000+" },
        { icon: "hard-apparel.png", name: "运动服", note: "速干衣 / 背心 / 压缩裤", price: "¥100 – 800" },
        { icon: "hard-watch.png", name: "手表 / 手环", note: "高驰 · 佳明 · 苹果等", price: "¥1,000 – 5,000" },
        { icon: "hard-fuel.png", name: "补给", note: "能量胶 / 盐丸 · 单场", price: "¥50 – 150" },
        { icon: "hard-belt.png", name: "腰包 / 号码带", note: "基础款 → 品牌款", price: "¥30 – 200" },
        { icon: "hard-bottle.png", name: "水壶 / 软水壶", note: "手持壶 · 软水壶", price: "¥50 – 300" },
        { icon: "hard-sunscreen.png", name: "防晒用品", note: "防晒霜 / 冰袖", price: "¥30 – 200" },
        { icon: "hard-balm.png", name: "防摩擦膏", note: "凡士林 · BodyGlide", price: "¥20 – 80" },
      ];

      const SOFT_ITEMS = [
        { icon: "soft-money.png", name: "赛事报名费", note: "普通全马 / 半马", price: "¥150 – 220" },
        { icon: "soft-entry.png", name: "公益 / 慈善名额", note: "免抽签直通", price: "¥500 – 3,000" },
        { icon: "soft-camp.png", name: "训练营", note: "单节课 · 含场地指导", price: "¥280 – 500" },
        { icon: "soft-coach.png", name: "私教一对一", note: "按小时计费", price: "¥400 – 800/时" },
        { icon: "soft-gait.png", name: "跑姿分析", note: "高速摄像 + 生物力学", price: "¥200 – 800/次" },
        { icon: "soft-rehab.png", name: "运动康复", note: "评估 / 理疗 / 按摩", price: "¥300 – 1,000/次" },
        { icon: "soft-pacer.png", name: "配速员（私兔）", note: "全程陪同 · 按场次", price: "¥1,000起/场" },
      ];

      function renderList(el, items) {
        el.innerHTML = items.map(function (it) {
          return (
            '<div class="receipt-item">' +
              '<div class="item-icon"><img src="' + ICON + '/' + it.icon + '" alt="' + it.name + '" loading="lazy" /></div>' +
              '<div class="item-name">' + it.name + '<small>' + it.note + '</small></div>' +
              '<div class="item-price">' + it.price + '</div>' +
            '</div>'
          );
        }).join("");
      }

      renderList(document.getElementById("hardList"), HARD_ITEMS);
      renderList(document.getElementById("softList"), SOFT_ITEMS);

      function bindStation(stationId, btnId, receiptId) {
        const station = document.getElementById(stationId);
        const btn = document.getElementById(btnId);
        const receipt = document.getElementById(receiptId);
        const cta = btn.querySelector("[data-cta]");

        function setOpen(open) {
          station.classList.toggle("is-open", open);
          btn.setAttribute("aria-expanded", open ? "true" : "false");
          receipt.setAttribute("aria-hidden", open ? "false" : "true");
          cta.textContent = open ? "点击收回 ↑" : "点击打印 →";
        }

        btn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!station.classList.contains("is-open"));
        });
      }

      bindStation("hardStation", "hardBtn", "hardReceipt");
      bindStation("softStation", "softBtn", "softReceipt");

      /* ---- 3.3 tiers ---- */
      const TIERS = {
        minimal: {
          name: "极简入门档",
          range: "¥300 – 800",
          note: "日常跑鞋或入门款 + 手机 APP 记时 + 本地参赛，不请私教、不跨省。",
          items: [
            { icon: "hard-shoes.png", name: "入门跑鞋", note: "日常 / 入门缓震", price: 350 },
            { icon: "hard-apparel.png", name: "基础运动服", note: "速干 T + 短裤", price: 120 },
            { icon: "soft-money.png", name: "本地赛事报名", note: "半马 / 健康跑", price: 180 },
            { icon: "hard-fuel.png", name: "基础补给", note: "胶 / 盐丸少量", price: 50 },
            { icon: "hard-sunscreen.png", name: "防晒", note: "防晒霜或冰袖", price: 40 },
          ],
        },
        comfort: {
          name: "舒适常规档",
          range: "¥1,200 – 3,000",
          note: "性价比跑鞋 + 基础运动手表 + 本地 / 邻近城市参赛 + 基础补给。",
          items: [
            { icon: "hard-shoes.png", name: "性价比跑鞋", note: "主流训练款", price: 650 },
            { icon: "hard-apparel.png", name: "运动服", note: "速干套装", price: 280 },
            { icon: "hard-watch.png", name: "基础运动手表", note: "入门 GPS 表", price: 1200 },
            { icon: "hard-belt.png", name: "腰包", note: "号码带 / 腰包", price: 80 },
            { icon: "hard-bottle.png", name: "水壶", note: "手持壶", price: 90 },
            { icon: "hard-fuel.png", name: "单场补给", note: "胶 + 盐丸", price: 90 },
            { icon: "soft-money.png", name: "赛事报名费", note: "本地 / 邻近城市", price: 200 },
          ],
        },
        advance: {
          name: "品质进阶档",
          range: "¥3,500 – 8,000",
          note: "主流碳板跑鞋 + 中高端手表 + 短期训练营 + 跨省参赛 + 基础康复。",
          items: [
            { icon: "hard-shoes.png", name: "主流碳板跑鞋", note: "竞赛训练两用", price: 1800 },
            { icon: "hard-apparel.png", name: "进阶运动服", note: "压缩 / 速干", price: 420 },
            { icon: "hard-watch.png", name: "中高端手表", note: "Pace 级运动表", price: 2300 },
            { icon: "hard-fuel.png", name: "补给套装", note: "单场用量", price: 120 },
            { icon: "soft-money.png", name: "跨省赛事报名", note: "含常规报名", price: 220 },
            { icon: "soft-camp.png", name: "短期训练营", note: "按次 / 按周", price: 400 },
            { icon: "soft-rehab.png", name: "基础康复", note: "评估 / 按摩", price: 500 },
          ],
        },
        fever: {
          name: "发烧顶配档",
          range: "¥15,000 – 30,000+",
          note: "全套顶级碳板鞋 + 顶配手表 + 私教 + 康复 + 私兔 + 慈善名额。",
          items: [
            { icon: "hard-shoes.png", name: "顶级碳板跑鞋", note: "竞赛顶配", price: 2800 },
            { icon: "hard-apparel.png", name: "高端运动服", note: "品牌套装", price: 800 },
            { icon: "hard-watch.png", name: "顶配运动手表", note: "旗舰款", price: 5000 },
            { icon: "hard-fuel.png", name: "全套补给", note: "胶 + 盐丸 + 电解质", price: 150 },
            { icon: "soft-entry.png", name: "慈善直通名额", note: "免抽签", price: 2000 },
            { icon: "soft-coach.png", name: "私教指导", note: "约 4 小时合计", price: 2400 },
            { icon: "soft-rehab.png", name: "运动康复", note: "多次理疗", price: 1000 },
            { icon: "soft-pacer.png", name: "配速员（私兔）", note: "全程陪同", price: 1500 },
            { icon: "soft-gait.png", name: "跑姿分析", note: "生物力学解读", price: 600 },
          ],
        },
      };

      const tierPopup = document.getElementById("tierPopup");
      const tierPopupTitle = document.getElementById("tierPopupTitle");
      const tierPopupClose = document.getElementById("tierPopupClose");
      const pyramidPanel = document.getElementById("pyramidPanel");
      const cuteCalc = document.getElementById("cuteCalc");
      const calcTierName = document.getElementById("calcTierName");
      const calcMoney = document.getElementById("calcMoney");
      const calcIdleHint = document.getElementById("calcIdleHint");
      const pyrGuide = document.getElementById("pyrGuide");
      const calcList = document.getElementById("calcList");
      const calcNote = document.getElementById("calcNote");
      const tierPopupTotal = document.getElementById("tierPopupTotal");
      const tiers = Array.from(document.querySelectorAll(".pyr-tier"));
      function formatYen(n) {
        return "¥" + n.toLocaleString("zh-CN");
      }

      function closePopup() {
        tierPopup.classList.remove("is-open");
        tierPopup.setAttribute("aria-hidden", "true");
      }

      function openPopup() {
        tierPopup.classList.add("is-open");
        tierPopup.setAttribute("aria-hidden", "false");
      }

      function selectTier(key) {
        const data = TIERS[key];
        if (!data) return;

        tiers.forEach(function (el) {
          const on = el.getAttribute("data-tier") === key;
          el.classList.toggle("is-active", on);
          el.setAttribute("aria-selected", on ? "true" : "false");
        });

        pyramidPanel.classList.add("has-selected");
        cuteCalc.classList.add("has-value");
        calcTierName.textContent = data.name;
        calcMoney.textContent = data.range;
        calcIdleHint.textContent = "已选「" + data.name + "」· 弹窗为完整物品清单";
        if (pyrGuide) {
          pyrGuide.querySelector("span:last-child").textContent = "已选档位 · 可再点其他层切换";
        }

        tierPopupTitle.textContent = data.name + " · 清单";
        calcNote.textContent = data.note;
        if (tierPopupTotal) tierPopupTotal.textContent = data.range;

        calcList.innerHTML = data.items.map(function (it) {
          return (
            '<div class="calc-item">' +
              '<div class="item-icon"><img src="' + ICON + '/' + it.icon + '" alt="' + it.name + '" /></div>' +
              '<div class="item-name">' + it.name + '<small>' + it.note + '</small></div>' +
              '<div class="item-price">' + formatYen(it.price) + '</div>' +
            '</div>'
          );
        }).join("");

        void calcList.offsetWidth;
        openPopup();
      }

      tiers.forEach(function (el) {
        el.addEventListener("click", function () {
          selectTier(el.getAttribute("data-tier"));
        });
        el.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectTier(el.getAttribute("data-tier"));
          }
        });
      });

      tierPopupClose.addEventListener("click", closePopup);
      tierPopup.querySelectorAll("[data-close-popup]").forEach(function (el) {
        el.addEventListener("click", closePopup);
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && tierPopup.classList.contains("is-open")) {
          closePopup();
        }
      });
    
}


function createChapter3(chapter) {
  const section = document.createElement('section');
  section.className = 'story-chapter story-chapter--chapter3';
  section.id = chapter.id;
  section.dataset.chapter = chapter.id;
  section.dataset.status = chapter.status;
  section.setAttribute('aria-labelledby', 'chapter3-title');
  section.innerHTML = `
    <div class="chapter3-surface">
      <div class="page">

    <header class="chapter-head">
      <h1 id="chapter3-title">消费</h1>
      <p class="lead">跑一场马拉松要花多少钱？先拆开硬装与软装，再看消费档位会把账单推到哪一层。</p>
    </header>

    <div class="section-block" id="section-31-32">
      <div class="section-block-head">
        <h2 class="section-block-title">先拉一张<em>清单</em></h2>
        <p class="section-block-lead">左边硬装、右边软装。点打印机，小票从出纸口拉出来。</p>
      </div>

    <div class="bill-grid">
      <section class="station hard" id="hardStation" data-side="hard">
        <div class="station-label">
          <h3>硬装清单</h3>
        </div>

        <div class="printer">
          <button class="printer-body" type="button" aria-expanded="false" aria-controls="hardReceipt" id="hardBtn">
            <div class="printer-top">
              <div class="printer-title"><i>硬</i>装备小票机</div>
              <div class="printer-cta" data-cta>点击打印 →</div>
            </div>
            <div class="printer-lights" aria-hidden="true"><span></span><span></span><span></span></div>
            <div class="slot" aria-hidden="true"></div>
          </button>

          <div class="receipt-stage" id="hardStage">
            <article class="receipt" id="hardReceipt" aria-hidden="true">
              <div class="receipt-head">
                <div class="status"><span class="check">✓</span> 清单已打印</div>
                <div class="receipt-store">马拉松 · 硬装清单</div>
                <div class="meta">PRICE RANGE · CNY · MARKET REF.</div>
              </div>
              <div class="receipt-list" id="hardList"></div>
              <div class="receipt-sum">
                <div class="sum-row"><span>常见入门区间</span><span>¥580 – 2,500</span></div>
                <div class="sum-row"><span>品质进阶区间</span><span>¥3,000 – 8,000+</span></div>
                <div class="sum-row total"><span>硬装合计参考</span><b>¥580 – 10,730+</b></div>
              </div>
            </article>
          </div>
        </div>
        <div class="hint-bar">
          <span class="closed-hint">点上方打印机，拉出硬装小票</span>
          <span class="open-hint">再点一次可收回小票</span>
        </div>
      </section>

      <section class="station soft" id="softStation" data-side="soft">
        <div class="station-label">
          <h3>软装清单</h3>
        </div>

        <div class="printer">
          <button class="printer-body" type="button" aria-expanded="false" aria-controls="softReceipt" id="softBtn">
            <div class="printer-top">
              <div class="printer-title"><i>软</i>服务小票机</div>
              <div class="printer-cta" data-cta>点击打印 →</div>
            </div>
            <div class="printer-lights" aria-hidden="true"><span></span><span></span><span></span></div>
            <div class="slot" aria-hidden="true"></div>
          </button>

          <div class="receipt-stage" id="softStage">
            <article class="receipt" id="softReceipt" aria-hidden="true">
              <div class="receipt-head">
                <div class="status"><span class="check">✓</span> 清单已打印</div>
                <div class="receipt-store">马拉松 · 软装清单</div>
                <div class="meta">SERVICE FEE · CNY · MARKET REF.</div>
              </div>
              <div class="receipt-list" id="softList"></div>
              <div class="receipt-sum">
                <div class="sum-row"><span>常规参赛（含报名）</span><span>¥150 – 220</span></div>
                <div class="sum-row"><span>若含私教+康复+私兔</span><span>¥2,000 – 6,000+</span></div>
                <div class="sum-row total"><span>软装合计参考</span><b>¥150 – 7,320+</b></div>
              </div>
            </article>
          </div>
        </div>
        <div class="hint-bar">
          <span class="closed-hint">点上方打印机，拉出软装小票</span>
          <span class="open-hint">再点一次可收回小票</span>
        </div>
      </section>
    </div>
    </div>

    <!-- 3.3 -->
    <section class="section-33 section-block" id="section-33">
      <div class="section-33-head section-block-head">
        <h2 class="section-block-title">装备价格<em>金字塔</em></h2>
        <p class="section-block-lead">点选左边任意一层，弹出该档完整清单；右边计算器屏幕显示参考花费区间。</p>
      </div>

      <div class="pyramid-calc">
        <div class="pyramid-panel" id="pyramidPanel">
          <h3 class="panel-title">消费层级</h3>

          <div class="pyr-guide" id="pyrGuide" aria-hidden="false">
            <span class="guide-hand" aria-hidden="true">↓</span>
            <span>点金字塔任意一层，查看该档清单</span>
          </div>

          <div class="pyramid-stage">
            <svg class="pyramid-svg" viewBox="0 0 420 460" role="listbox" aria-label="消费档位金字塔" id="pyramidSvg">
              <defs>
                <filter id="paperGrain" x="-12%" y="-12%" width="124%" height="124%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" result="noise"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0.13  0 0 0 0 0.29  0 0 0 0 0.52  0 0 0 .16 0" in="noise" result="mono"/>
                  <feBlend in="SourceGraphic" in2="mono" mode="multiply"/>
                </filter>
                <filter id="wobble" x="-6%" y="-6%" width="112%" height="112%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="2" seed="5" result="n"/>
                  <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>
                </filter>
                <filter id="pyrGlow">
                  <feDropShadow dx="0" dy="3" stdDeviation="2.8" flood-color="#214A85" flood-opacity=".3"/>
                </filter>
                <linearGradient id="gFeverF" x1="0" y1="0" x2=".2" y2="1">
                  <stop offset="0%" stop-color="#F6C2A0"/><stop offset="40%" stop-color="#E66A45"/><stop offset="100%" stop-color="#D04E2C"/>
                </linearGradient>
                <linearGradient id="gFeverS" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#C44E2F"/><stop offset="100%" stop-color="#8F3218"/>
                </linearGradient>
                <linearGradient id="gAdvF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#F2F9FC"/><stop offset="35%" stop-color="#B8DDF0"/><stop offset="100%" stop-color="#7EBFDB"/>
                </linearGradient>
                <linearGradient id="gAdvS" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#6AADCB"/><stop offset="100%" stop-color="#3D7FA0"/>
                </linearGradient>
                <linearGradient id="gComF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#9BBFE0"/><stop offset="45%" stop-color="#4A7FB8"/><stop offset="100%" stop-color="#2E5F96"/>
                </linearGradient>
                <linearGradient id="gComS" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#275682"/><stop offset="100%" stop-color="#163A62"/>
                </linearGradient>
                <linearGradient id="gMinF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#4A6FA0"/><stop offset="50%" stop-color="#214A85"/><stop offset="100%" stop-color="#163568"/>
                </linearGradient>
                <linearGradient id="gMinS" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#16325C"/><stop offset="100%" stop-color="#0B1A30"/>
                </linearGradient>
                <linearGradient id="gTopFace" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(255,255,255,.35)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/>
                </linearGradient>
              </defs>

              <ellipse cx="200" cy="438" rx="168" ry="14" fill="rgba(33,74,133,.1)"/>

              <g filter="url(#wobble)">
                <!-- base · 极简 -->
                <g class="pyr-tier" data-tier="minimal" tabindex="0" role="option" aria-selected="false">
                  <polygon class="pyr-side" points="318,300 372,328 400,418 346,390" fill="url(#gMinS)" stroke="#0B1A30" stroke-width="2" stroke-linejoin="round"/>
                  <polygon class="pyr-front" points="42,300 318,300 346,390 14,390" fill="url(#gMinF)" stroke="#122744" stroke-width="2.2" stroke-linejoin="round" filter="url(#paperGrain)"/>
                  <polygon points="42,300 318,300 346,314 70,314" fill="url(#gTopFace)" opacity=".55" pointer-events="none"/>
                  <text class="pyr-onface pyr-onface-title" x="180" y="336" fill="#FAF7F0">极简入门档</text>
                  <text class="pyr-onface-sub" x="180" y="354" fill="rgba(250,247,240,.85)">本地参赛 · 基础装备</text>
                  <text class="pyr-click-hint" x="180" y="372" fill="rgba(232,200,106,.9)">点击查看清单</text>
                </g>

                <!-- 舒适 -->
                <g class="pyr-tier" data-tier="comfort" tabindex="0" role="option" aria-selected="false">
                  <polygon class="pyr-side" points="286,214 340,242 362,308 308,280" fill="url(#gComS)" stroke="#163A62" stroke-width="2" stroke-linejoin="round"/>
                  <polygon class="pyr-front" points="82,214 286,214 308,280 58,280" fill="url(#gComF)" stroke="#1A3A68" stroke-width="2.2" stroke-linejoin="round" filter="url(#paperGrain)"/>
                  <polygon points="82,214 286,214 308,226 100,226" fill="url(#gTopFace)" opacity=".5" pointer-events="none"/>
                  <text class="pyr-onface pyr-onface-title" x="182" y="242" fill="#FAF7F0">舒适常规档</text>
                  <text class="pyr-onface-sub" x="182" y="258" fill="rgba(250,247,240,.88)">性价比鞋表 · 邻近参赛</text>
                  <text class="pyr-click-hint" x="182" y="272" fill="rgba(232,200,106,.9)">点击查看清单</text>
                </g>

                <!-- 进阶 -->
                <g class="pyr-tier" data-tier="advance" tabindex="0" role="option" aria-selected="false">
                  <polygon class="pyr-side" points="254,128 308,156 330,222 276,194" fill="url(#gAdvS)" stroke="#3D7A96" stroke-width="2" stroke-linejoin="round"/>
                  <polygon class="pyr-front" points="122,128 254,128 276,194 100,194" fill="url(#gAdvF)" stroke="#5A9BB8" stroke-width="2.1" stroke-linejoin="round" filter="url(#paperGrain)"/>
                  <polygon points="122,128 254,128 276,140 140,140" fill="url(#gTopFace)" opacity=".55" pointer-events="none"/>
                  <text class="pyr-onface pyr-onface-title" x="188" y="156" fill="#214A85">品质进阶档</text>
                  <text class="pyr-onface-sub" x="188" y="172" fill="rgba(33,74,133,.75)">碳板鞋 · 训练营 · 康复</text>
                  <text class="pyr-click-hint" x="188" y="186" fill="rgba(33,74,133,.55)">点击查看清单</text>
                </g>

                <!-- tip · 发烧 -->
                <g class="pyr-tier" data-tier="fever" tabindex="0" role="option" aria-selected="false">
                  <polygon class="pyr-side" points="222,58 276,86 298,136 244,108" fill="url(#gFeverS)" stroke="#8F3218" stroke-width="2" stroke-linejoin="round"/>
                  <polygon class="pyr-front" points="210,28 222,58 244,108 164,108 188,58" fill="url(#gFeverF)" stroke="#B84328" stroke-width="2.1" stroke-linejoin="round" filter="url(#paperGrain)"/>
                  <path d="M198,52 L210,34 L226,70" fill="none" stroke="rgba(255,253,245,.5)" stroke-width="1.6" stroke-linejoin="round" pointer-events="none"/>
                  <text class="pyr-onface pyr-onface-title" x="204" y="78" fill="#FFFDF8">发烧顶配档</text>
                  <text class="pyr-onface-sub" x="204" y="94" fill="rgba(255,253,245,.9)">私教 · 私兔 · 慈善名额</text>
                </g>
              </g>
            </svg>

            <div class="tier-popup" id="tierPopup" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="tierPopupTitle">
              <div class="tier-popup-backdrop" data-close-popup tabindex="-1"></div>
              <div class="tier-popup-sheet">
                <button type="button" class="tier-popup-close" id="tierPopupClose" aria-label="关闭">×</button>
                <div class="tier-popup-head">
                  <strong id="tierPopupTitle">档位清单</strong>
                  <em>ITEM LIST</em>
                </div>
                <div class="tier-popup-list" id="calcList"></div>
                <div class="tier-popup-total">
                  <span>总花费参考</span>
                  <b id="tierPopupTotal">¥ —</b>
                </div>
                <p class="tier-popup-note" id="calcNote"></p>
              </div>
            </div>
          </div>
        </div>

        <div class="calc-panel" id="calcPanel">
          <h3 class="panel-title">计算器</h3>

          <div class="calc-align-spacer" aria-hidden="true"></div>

          <div class="cute-calc" id="cuteCalc">
            <img class="cute-calc-img" src="./assets/chapter3/calculator-cute-blank.png" alt="手绘计算器" width="280" height="292" />
            <div class="calc-screen-overlay">
              <div class="calc-screen-label">TOTAL</div>
              <p class="calc-idle-face-msg" id="calcIdleFace">点左边层级<br>算出花费</p>
              <p class="calc-screen-tier" id="calcTierName"></p>
              <div class="calc-screen-money" id="calcMoney"></div>
            </div>
          </div>
          <p class="calc-hint" id="calcIdleHint">选一层金字塔，屏幕会显示该档参考花费区间。</p>
        </div>
      </div>
    </section>

      </div>
    </div>
  `;
  queueMicrotask(() => initChapter3());
  return section;
}

function createChapterShell(chapter, videoTitles = [], chapter1Data = null, chapter2Data = null, chinaGeoJson = null) {
  if (chapter.id === 'cover') return createCover(chapter);
  if (chapter.id === 'discovery') return createPhoneSection(chapter, videoTitles);
  if (chapter.id === 'lottery') return createChapter1(chapter, chapter1Data);
  if (chapter.id === 'travel') return createChapter2(chapter, chapter2Data, chinaGeoJson);
  if (chapter.id === 'spending') return createChapter3(chapter);

  const section = document.createElement('section');
  section.className = `story-chapter story-chapter--${chapter.id}`;
  section.id = chapter.id;
  section.dataset.chapter = chapter.id;
  section.dataset.status = chapter.status;
  section.setAttribute('aria-labelledby', `${chapter.id}-title`);

  section.innerHTML = `
    <div class="chapter-inner">
      <p class="chapter-label">${chapter.order.toString().padStart(2, '0')} · ${chapter.label}</p>
      <h1 id="${chapter.id}-title">${chapter.headline}</h1>
      <p class="chapter-status">${chapter.status}</p>
    </div>
  `;

  return section;
}

function observeStorySections(root) {
  const sections = root.querySelectorAll('[data-chapter]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-in-view', entry.isIntersecting));
    },
    { threshold: 0.32 }
  );

  sections.forEach((section) => observer.observe(section));
  const cover = root.querySelector('.story-chapter--cover');

  function updateCover() {
    if (!cover) return;
    const progress = Math.min(1, Math.max(0, -cover.getBoundingClientRect().top / window.innerHeight));
    cover.style.setProperty('--cover-progress', progress.toFixed(3));
  }

  updateCover();
  window.addEventListener('scroll', updateCover, { passive: true });

  const phoneSection = root.querySelector('.story-chapter--phone');
  function updatePhone() {
    if (!phoneSection) return;
    const bounds = phoneSection.getBoundingClientRect();
    const scrollableDistance = Math.max(1, bounds.height - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -bounds.top / scrollableDistance));
    phoneSection.style.setProperty('--phone-progress', progress.toFixed(3));

    let beat = 'idle';
    if (progress >= 0.84) beat = 'vow';
    else if (progress >= 0.55) beat = 'chart';
    phoneSection.dataset.phoneBeat = beat;
    phoneSection.classList.toggle('is-settling', beat !== 'idle');

    const ctrl = phoneSection.phoneController;
    if (ctrl) {
      if (beat === 'chart') ctrl.drawChart();
      if (beat === 'idle' && progress < 0.45) ctrl.resetChart();
    }
  }
  updatePhone();
  window.addEventListener('scroll', updatePhone, { passive: true });

  const chapter1 = root.querySelector('.story-chapter--chapter1');
  let chapter1Frame = 0;
  function updateChapter1() {
    chapter1Frame = 0;
    const controller = chapter1?.chapter1Controller;
    if (!controller) return;
    const marker = window.innerHeight * 0.55;
    let activeIndex = 0;
    let progress = 0;
    controller.stepNodes.forEach((step, index) => {
      const bounds = step.getBoundingClientRect();
      if (bounds.top <= marker) {
        activeIndex = index;
        progress = Math.min(1, Math.max(0, (marker - bounds.top) / Math.max(1, bounds.height)));
      }
    });
    controller.setStep(activeIndex, progress);
  }
  function requestChapter1Update() {
    if (!chapter1Frame) chapter1Frame = requestAnimationFrame(updateChapter1);
  }
  updateChapter1();
  window.addEventListener('scroll', requestChapter1Update, { passive: true });

  const chapter2 = root.querySelector('.story-chapter--chapter2');
  let chapter2Frame = 0;
  function updateChapter2() {
    chapter2Frame = 0;
    const controller = chapter2?.chapter2Controller;
    if (!controller) return;
    const marker = window.innerHeight * 0.55;
    let activeIndex = 0;
    let closestDistance = Infinity;
    controller.stepNodes.forEach((step, index) => {
      const bounds = step.getBoundingClientRect();
      const stepCenter = bounds.top + bounds.height / 2;
      const distance = Math.abs(stepCenter - marker);
      if (distance < closestDistance) {
        closestDistance = distance;
        activeIndex = index;
      }
    });
    controller.setStep(activeIndex);
  }
  function requestChapter2Update() {
    if (!chapter2Frame) chapter2Frame = requestAnimationFrame(updateChapter2);
  }
  updateChapter2();
  window.addEventListener('scroll', requestChapter2Update, { passive: true });
}

    const storyRoot = document.querySelector('#story');
    document.title = STORY_DATA.project.title;
    const READY_CHAPTERS = new Set(['cover', 'discovery', 'lottery', 'travel', 'spending']);

    // Keep first paint on the cover; avoid browser restoring a mid-page scroll into 入场报告
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
    window.scrollTo(0, 0);

    storyRoot.replaceChildren(...STORY_DATA.chapters.filter((c) => READY_CHAPTERS.has(c.id)).map((chapter) => createChapterShell(chapter, VIDEO_TITLES, CHAPTER1_DATA, CHAPTER2_DATA, CHINA_GEO_JSON)));
    observeStorySections(storyRoot);

    document.documentElement.classList.remove('is-booting');
    document.documentElement.classList.add('is-story-ready');

    function refreshPhoneTitles(titles) {
      const phoneSection = storyRoot.querySelector('.story-chapter--phone');
      if (!phoneSection || !Array.isArray(titles) || !titles.length) return;
      const sticky = phoneSection.querySelector('.phone-sticky');
      if (!sticky) return;
      const oldFlow = sticky.querySelector('.information-flow');
      if (oldFlow) oldFlow.replaceWith(createInformationFlow(titles));
      else sticky.prepend(createInformationFlow(titles));
      const source = sticky.querySelector('.phone-source');
      if (source) source.textContent = `来自 ${titles.length.toLocaleString()} 条高赞视频标题`;
    }

    function loadScriptOnce(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-dynamic-src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.dataset.dynamicSrc = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load ' + src));
        document.body.appendChild(s);
      });
    }

    // Load ~1MB title corpus after first paint / idle time
    const scheduleIdle = window.requestIdleCallback
      ? (cb) => window.requestIdleCallback(cb, { timeout: 1800 })
      : (cb) => window.setTimeout(cb, 400);
    scheduleIdle(() => {
      loadScriptOnce('./js/data/video-titles.js')
        .then(() => {
          VIDEO_TITLES = window.VIDEO_TITLES || VIDEO_TITLES || [];
          refreshPhoneTitles(VIDEO_TITLES);
        })
        .catch(() => {});
    });


