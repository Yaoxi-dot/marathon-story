
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function applyChapter45EditorialCopy() {
    const scoreIntro = document.querySelector('#chapter45-root .bt-intro');
    if (scoreIntro) {
      const title = scoreIntro.querySelector('.bt-intro__chapter-title');
      const lead = scoreIntro.querySelector('.bt-intro__lead');
      if (title && title.textContent.trim() !== '成绩') title.textContent = '成绩';
      const scoreIntroLead = '跑完42.195公里之后，越来越多跑者开始追逐另一个数字。';
      if (lead && lead.textContent.trim() !== scoreIntroLead) lead.textContent = scoreIntroLead;
    }

    const scoreCover = document.querySelector('.c45-cover--score');
    if (scoreCover) {
      const title = scoreCover.querySelector('.c45-cover__titles h1');
      const lead = scoreCover.querySelector('.c45-cover__lead');
      if (title && title.textContent.trim() !== '成绩') title.textContent = '成绩';
      const scoreLead = '跑完42.195公里之后，越来越多跑者开始追逐另一个数字。';
      if (lead && lead.textContent.trim() !== scoreLead) lead.textContent = scoreLead;
    }

    const healthCover = document.querySelector('.c45-cover--health');
    if (healthCover) {
      const title = healthCover.querySelector('.c45-cover__titles h1');
      const lead = healthCover.querySelector('.c45-cover__lead');
      if (title && title.textContent.trim() !== '健康') title.textContent = '健康';
      const healthLead = '马拉松真正难的，不只是跑完，而是在成绩压力里听见身体。';
      if (lead && lead.textContent.trim() !== healthLead) lead.textContent = healthLead;
    }
  }

  function applyChapter45MarkedChanges() {
    const bridgeLink = document.querySelector('#ch4-bridge .rvs45__bridge');
    if (bridgeLink) bridgeLink.remove();

    const bridgeMid = document.querySelector('#ch4-bridge .rvs45-link:nth-of-type(2)');
    if (bridgeMid) bridgeMid.remove();

    document.querySelectorAll('#ch5-intersect .c45-module__note').forEach((note) => {
      if (!note.textContent.trim() || note.textContent.includes('交集 =')) note.remove();
    });

    const intersect = document.querySelector('#ch5-intersect .ix');
    if (intersect && !intersect.querySelector('.ix-bubble-stage')) {
      intersect.innerHTML = [
        '<div class="ix-bubble-stage" role="img" aria-label="成绩与健康关键词气泡图：成绩804，健康149，交叠部分46条">',
        '  <div class="ix-bubble ix-bubble--score"><strong>成绩</strong><span>804</span></div>',
        '  <div class="ix-bubble ix-bubble--health"><strong>健康</strong><span>149</span></div>',
        '  <div class="ix-overlap-label"><strong>46条</strong><span>交叠部分</span></div>',
        '</div>',
      ].join('');
    }

    const case195 = document.querySelector('#case-195m .e195');
    if (case195 && !case195.querySelector('.e195-event-card')) {
      case195.innerHTML = [
        '<article class="e195-event-card" aria-label="重庆马拉松终点前195米事件记录">',
        '  <div class="e195-event-card__header">',
        '    <span>案例记录</span>',
        '    <strong>终点前 195 米</strong>',
        '  </div>',
        '  <div class="e195-event-card__main">',
        '    <p class="e195-event-card__kicker">2026年重庆马拉松</p>',
        '    <p class="e195-event-card__lead">当终点几乎就在眼前，身体仍然有权说“不”。</p>',
        '    <ol class="e195-event-card__timeline">',
        '      <li><span>1月18日上午</span><p>一名选手在重庆马拉松比赛期间参赛。</p></li>',
        '      <li><span>临近终点处</span><p>跑至终点附近时突然倒地，现场医护人员第一时间急救并转运。</p></li>',
        '      <li><span>抢救无效</span><p>经全力抢救无效，不幸离世。</p></li>',
        '    </ol>',
        '  </div>',
        '  <p class="e195-event-card__note">公开通报未给出单一死因。个体风险可能受身体基础、环境与临场状态等多重因素影响。</p>',
        '  <p class="e195-event-card__source">来源：新华社、央视网援引重庆马拉松组委会通报</p>',
        '</article>',
      ].join('');
    }
  }

  function initEndingScrollytelling() {
    const ending = document.getElementById('ending');
    if (!ending) return;

    const states = [
      'review-1',
      'review-2',
      'review-3',
      'review-4',
      'review-5',
      'departure-1',
      'departure-2',
      'voice',
      'finish',
    ];
    let ticking = false;

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function updateEndingState() {
      ticking = false;
      const rect = ending.getBoundingClientRect();
      const scrollable = Math.max(1, ending.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / scrollable, 0, 1);
      const stateIndex = Math.min(states.length - 1, Math.floor(progress * states.length));
      const state = states[stateIndex];

      if (ending.dataset.endingState !== state) {
        ending.dataset.endingState = state;
      }
      ending.style.setProperty('--ending-progress', progress.toFixed(3));
      ending.style.setProperty('--ending-dark', clamp(progress * 1.25, 0, 1).toFixed(3));
      ending.style.setProperty('--ending-road-y', `${Math.round(progress * 90)}px`);
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateEndingState);
    }

    updateEndingState();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
  }

  ready(function () {
    // story.js self-executes on parse (mounts #story). chapter45.js also self-mounts #chapter45-root.
    // Advisor.js self-inits on #mobile-advisor when present.
    // Ensure chapter45 root exists before its script — scripts are ordered in index.html.
    applyChapter45EditorialCopy();
    applyChapter45MarkedChanges();
    window.setTimeout(applyChapter45EditorialCopy, 120);
    window.setTimeout(applyChapter45MarkedChanges, 120);
    window.setTimeout(applyChapter45EditorialCopy, 600);
    window.setTimeout(applyChapter45MarkedChanges, 600);

    window.setTimeout(applyChapter45EditorialCopy, 1400);
    window.setTimeout(applyChapter45MarkedChanges, 1400);
    initEndingScrollytelling();
  });
})();
