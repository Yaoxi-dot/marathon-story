
/**
 * Marathon progress rail for single-document static package (file:// safe)
 * Hidden on cover/intro; appears from 中签 (lottery) onward.
 * Clicking a mark title/dot jumps to that chapter.
 */
(function () {
  const MILESTONES = [
    { id: 'stage-1', label: '中签', short: '中签', progress: 0.1, image: './assets/progress/stage-1.png', sel: '#lottery, [data-chapter="lottery"]' },
    { id: 'stage-2', label: '跨城奔赴', short: '跨城', progress: 0.26, image: './assets/progress/stage-2.png', sel: '#travel, [data-chapter="travel"]' },
    { id: 'stage-3', label: '消费', short: '消费', progress: 0.42, image: './assets/progress/stage-3.png', sel: '#spending, [data-chapter="spending"]' },
    { id: 'stage-4', label: '成绩', short: '成绩', progress: 0.58, image: './assets/progress/stage-4.png', sel: '#ch4-cover, #ch4-break, #chapter45-root' },
    { id: 'stage-5', label: '健康', short: '健康', progress: 0.76, image: './assets/progress/stage-5.png', sel: '#ch5-cover, #ch5-close' },
    { id: 'finish', label: '完成', short: '完成', progress: 0.92, image: './assets/progress/finish.png', sel: '#ending, #advisor-section' },
  ];

  const REVEAL_SEL = '#lottery, [data-chapter="lottery"], #chapter-lottery, .story-chapter--chapter1, [data-chapter="1"]';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = function () { return window.matchMedia('(max-width: 640px)').matches; };

  var railInner = document.querySelector('.marathon-rail__inner');
  var runner = document.querySelector('.marathon-rail__runner');
  var marksList = document.querySelector('.marathon-rail__marks');
  var vignette = document.querySelector('.stage-vignette');
  var vignetteImg = document.querySelector('.stage-vignette__img');
  var vignetteEyebrow = document.querySelector('.stage-vignette__eyebrow');
  var vignetteLabel = document.querySelector('.stage-vignette__text');
  var bootHint = document.querySelector('.boot-hint');
  var activeId = '';
  var scrollFrame = 0;
  var runningTimer = 0;
  var revealed = false;
  var bootShown = false;

  function showBoot(msg, ms) {
    if (!bootHint) return;
    bootHint.textContent = msg;
    bootHint.classList.add('is-visible');
    clearTimeout(showBoot._t);
    showBoot._t = setTimeout(function () { bootHint.classList.remove('is-visible'); }, ms || 2800);
  }

  function findEl(sel) {
    if (!sel) return null;
    var parts = sel.split(',');
    for (var i = 0; i < parts.length; i++) {
      var el = document.querySelector(parts[i].trim());
      if (el) return el;
    }
    return null;
  }

  function revealStartEl() {
    return findEl(REVEAL_SEL) || findEl(MILESTONES[0].sel);
  }

  function shouldRevealRail() {
    var start = revealStartEl();
    if (!start) return window.scrollY > window.innerHeight * 1.2;
    var top = start.getBoundingClientRect().top + window.scrollY;
    return window.scrollY + window.innerHeight * 0.55 >= top;
  }

  function setRailVisible(on) {
    if (on === revealed) return;
    revealed = on;
    document.body.classList.toggle('rail-revealed', on);
    if (on && !bootShown) {
      bootShown = true;
      showBoot('可点击进度条标题，跳到对应章节。');
    }
    if (!on && vignette) vignette.classList.remove('is-visible');
  }

  function totalScrollable() {
    return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  function scrollProgress() {
    var start = revealStartEl();
    if (!start) return Math.min(1, Math.max(0, window.scrollY / totalScrollable()));
    var startY = start.getBoundingClientRect().top + window.scrollY;
    var maxY = totalScrollable();
    var span = Math.max(1, maxY - startY * 0.15);
    var p = (window.scrollY - startY * 0.15) / span;
    return Math.min(1, Math.max(0, p));
  }

  function jumpToMilestone(m) {
    var el = findEl(m.sel);
    if (!el) {
      // Chapter 4/5 mount a bit later — brief retries
      var tries = 0;
      var timer = setInterval(function () {
        tries += 1;
        el = findEl(m.sel);
        if (el || tries > 12) {
          clearInterval(timer);
          if (el) scrollToEl(el);
          else showBoot('暂未找到「' + m.short + '」章节，请稍后再试。', 2200);
        }
      }, 80);
      return;
    }
    scrollToEl(el);
  }

  function scrollToEl(el) {
    var rect = el.getBoundingClientRect();
    var y = rect.top + window.pageYOffset - Math.min(72, window.innerHeight * 0.1);
    window.scrollTo({
      top: Math.max(0, y),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }

  function buildMarks() {
    if (!marksList) return;
    marksList.innerHTML = '';
    MILESTONES.forEach(function (m) {
      var li = document.createElement('li');
      li.className = 'marathon-rail__mark';
      li.dataset.id = m.id;
      if (isMobile()) {
        li.style.top = '50%';
        li.style.left = (m.progress * 100) + '%';
      } else {
        li.style.top = (m.progress * 100) + '%';
      }

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'marathon-rail__mark-hit';
      btn.setAttribute('aria-label', '跳到' + m.label);

      var dot = document.createElement('span');
      dot.className = 'marathon-rail__mark-dot';
      dot.setAttribute('aria-hidden', 'true');

      var label = document.createElement('span');
      label.className = 'marathon-rail__mark-label';
      label.textContent = m.label;

      btn.appendChild(dot);
      btn.appendChild(label);
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        jumpToMilestone(m);
      });

      li.appendChild(btn);
      marksList.appendChild(li);
    });
  }

  function updateRunner(p) {
    if (!runner || !railInner || !revealed) return;
    if (isMobile()) {
      runner.style.top = 'auto';
      runner.style.bottom = '2px';
      runner.style.left = (p * railInner.clientWidth) + 'px';
      runner.style.right = 'auto';
    } else {
      runner.style.left = 'auto';
      runner.style.right = '';
      runner.style.top = (p * railInner.clientHeight) + 'px';
    }
    if (!reduceMotion) {
      runner.classList.add('is-running');
      clearTimeout(runningTimer);
      runningTimer = setTimeout(function () { runner.classList.remove('is-running'); }, 200);
    }
  }

  function pickMilestone() {
    var mid = window.scrollY + window.innerHeight * 0.42;
    var current = MILESTONES[0];
    for (var i = 0; i < MILESTONES.length; i++) {
      var el = findEl(MILESTONES[i].sel);
      if (!el) continue;
      var top = el.getBoundingClientRect().top + window.scrollY;
      if (mid >= top - 40) current = MILESTONES[i];
    }
    return current;
  }

  function updateVignette(m) {
    if (!vignette || !m || !revealed) return;
    if (m.id !== activeId) {
      activeId = m.id;
      if (vignetteImg && vignetteImg.getAttribute('src') !== m.image) { vignetteImg.decoding = 'async'; vignetteImg.loading = 'eager'; vignetteImg.src = m.image; vignetteImg.alt = m.label; }
      if (vignetteEyebrow) vignetteEyebrow.textContent = '此刻 · 主人公';
      if (vignetteLabel) vignetteLabel.textContent = m.label;
      Array.prototype.forEach.call(document.querySelectorAll('.marathon-rail__mark'), function (el) {
        el.classList.toggle('is-active', el.dataset.id === m.id);
      });
    }
    vignette.classList.add('is-visible');
  }

  function onScroll() {
    scrollFrame = 0;
    setRailVisible(shouldRevealRail());
    if (!revealed) return;
    updateRunner(scrollProgress());
    updateVignette(pickMilestone());
  }

  function requestScrollUpdate() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(onScroll);
  }

  document.body.classList.add('has-marathon-rail');
  document.body.classList.remove('rail-revealed');
  buildMarks();
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', function () { buildMarks(); requestScrollUpdate(); });
  setTimeout(requestScrollUpdate, 200);
  // Re-bind after chapter 4/5 React mount so late anchors resolve on click
  setTimeout(buildMarks, 800);
  setTimeout(buildMarks, 2000);
})();
