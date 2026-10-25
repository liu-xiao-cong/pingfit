/** A locally dated cover rotation with no network or third-party dependencies. */
const COVERS = [
  {
    id: 'whole-body',
    image: './assets/training-hero.jpg',
    eyebrow: 'YOUR PACE. YOUR PROGRESS.',
    titleLines: ['每一次认真，', '都有迹可循。'],
    subtitleLines: ['知道怎么练，记住练了什么。', '让下一次，比这一次更进一步。'],
    signature: '把今天的认真，留给未来的自己。',
  },
  {
    id: 'strength',
    image: './assets/cover-strength.jpg',
    eyebrow: 'MAKE EVERY REP COUNT',
    titleLines: ['认真完成每一组，', '看见一点点进步。'],
    subtitleLines: ['重量、次数和感受，都值得记录。', '下一次训练，有迹可循。'],
    signature: '每一组，都有自己的意义。',
  },
  {
    id: 'cardio-recovery',
    image: './assets/cover-cardio.jpg',
    eyebrow: 'MOVE. RECOVER. REPEAT.',
    titleLines: ['动起来，也慢下来。', '找到自己的节奏。'],
    subtitleLines: ['记录每一次有氧，也留意恢复。', '属于你的进步，按自己的速度发生。'],
    signature: '让运动与生活，慢慢合拍。',
  },
];

function localDayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Same local calendar day => same order. A local midnight rotates the lead cover.
 * Construct the ordinal from calendar fields, so 23/25-hour DST days are harmless.
 */
export function getDailyCovers(date = new Date()) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) throw new TypeError('封面日期无效。');
  const calendarDay = new Date(0);
  calendarDay.setUTCHours(0, 0, 0, 0);
  calendarDay.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
  const ordinal = Math.floor(calendarDay.getTime() / 86_400_000);
  const offset = ((ordinal % COVERS.length) + COVERS.length) % COVERS.length;
  return COVERS.map((_, index) => {
    const cover = COVERS[(index + offset) % COVERS.length];
    return { ...cover, titleLines: [...cover.titleLines], subtitleLines: [...cover.subtitleLines] };
  });
}

/**
 * Markup contract:
 *   .cover-slide[data-cover-index="0..N-1"]
 *   .cover-dot[data-cover-to="0..N-1"], .cover-prev, .cover-next, .cover-pause
 *   .cover-status (optional live status), [data-cover-pause-label] (optional label)
 * Current slides/dots receive .is-active. The root gets data-active-index and
 * data-autoplay-state. A coverdaychange event bubbles at the next date check.
 */
export function mountCoverCarousel(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return () => {};
  const doc = root.ownerDocument;
  const view = doc.defaultView;
  const slides = [...root.querySelectorAll('.cover-slide[data-cover-index]')]
    .sort((a, b) => Number(a.dataset.coverIndex) - Number(b.dataset.coverIndex));
  if (!slides.length) return () => {};
  const dots = [...root.querySelectorAll('.cover-dot[data-cover-to]')];
  const pauseButtons = [...root.querySelectorAll('.cover-pause')];
  const status = root.querySelector('.cover-status');
  const reducedQuery = view.matchMedia?.('(prefers-reduced-motion: reduce)');
  const listeners = [];
  let disposed = false;
  let index = Number(root.dataset.activeIndex);
  if (!Number.isInteger(index) || index < 0 || index >= slides.length) index = 0;
  let manualPaused = false;
  let hovered = false;
  let focused = root.contains(doc.activeElement);
  let reducedMotion = Boolean(reducedQuery?.matches);
  let autoplayTimer = null;
  let touchStart = null;
  let dayKey = localDayKey(new Date());

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    listeners.push(() => target.removeEventListener(type, handler, options));
  };

  const pauseReason = () => reducedMotion ? 'preference'
    : manualPaused ? 'manual'
      : doc.hidden ? 'hidden'
        : focused ? 'focus'
          : hovered ? 'hover'
            : slides.length < 2 ? 'single-slide' : '';

  function updatePlayback() {
    if (disposed) return;
    view.clearTimeout(autoplayTimer);
    autoplayTimer = null;
    const reason = pauseReason();
    root.dataset.autoplayState = reason ? 'paused' : 'playing';
    root.dataset.pauseReason = reason;
    for (const button of pauseButtons) {
      const label = reducedMotion ? '仅手动切换'
        : manualPaused ? (button.dataset.playLabel || '继续轮播')
          : (button.dataset.pauseLabel || '暂停轮播');
      const labelElement = button.querySelector('[data-cover-pause-label]');
      if (labelElement) labelElement.textContent = label;
      else button.textContent = label;
      button.setAttribute('aria-label', reducedMotion ? '已开启减少动态效果，封面仅支持手动切换' : label);
      button.setAttribute('aria-pressed', String(reducedMotion || manualPaused));
      button.setAttribute('aria-disabled', String(reducedMotion || slides.length < 2));
    }
    if (!reason) {
      autoplayTimer = view.setTimeout(() => {
        if (disposed || pauseReason()) return;
        show(index + 1, false);
        updatePlayback();
      }, 6000);
    }
  }

  function show(nextIndex, announce) {
    index = ((nextIndex % slides.length) + slides.length) % slides.length;
    root.dataset.activeIndex = String(index);
    slides.forEach((slide, position) => {
      const active = position === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      // Automatic changes never move a keyboard user's focus: focus pauses playback.
      // Inactive slides must also be excluded from keyboard navigation.
      slide.inert = !active;
    });
    for (const dot of dots) {
      const active = Number(dot.dataset.coverTo) === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-current', String(active));
      dot.setAttribute('aria-pressed', String(active));
    }
    if (status) {
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', announce ? 'polite' : 'off');
      status.setAttribute('aria-atomic', 'true');
      status.textContent = `第 ${index + 1} / ${slides.length} 张`;
    }
  }

  function manualSwitch(nextIndex) {
    manualPaused = true;
    show(nextIndex, true);
    updatePlayback();
  }

  function checkDay() {
    if (disposed) return;
    const now = new Date();
    const nextDay = localDayKey(now);
    if (nextDay === dayKey) return;
    const previousDateKey = dayKey;
    dayKey = nextDay;
    root.dispatchEvent(new view.CustomEvent('coverdaychange', {
      bubbles: true,
      detail: { dateKey: nextDay, previousDateKey, covers: getDailyCovers(now) },
    }));
  }

  on(root, 'click', event => {
    const target = event.target?.closest?.('.cover-dot[data-cover-to], .cover-prev, .cover-next, .cover-pause, .cover-slide[data-cover-index]');
    if (!target || !root.contains(target)) return;
    if (target.matches('.cover-dot')) {
      event.preventDefault();
      const nextIndex = Number(target.dataset.coverTo);
      if (Number.isInteger(nextIndex) && nextIndex >= 0 && nextIndex < slides.length) manualSwitch(nextIndex);
    } else if (target.matches('.cover-prev')) {
      event.preventDefault();
      manualSwitch(index - 1);
    } else if (target.matches('.cover-next')) {
      event.preventDefault();
      manualSwitch(index + 1);
    } else if (target.matches('.cover-pause')) {
      event.preventDefault();
      if (reducedMotion || slides.length < 2) return;
      manualPaused = !manualPaused;
      // An explicit resume overrides the current control focus/hover.
      // Future pointer/focus events still pause automatically.
      if (!manualPaused) { focused = false; hovered = false; }
      updatePlayback();
    } else {
      // Clicking a cover or a link on it pauses motion without intercepting the link.
      manualPaused = true;
      updatePlayback();
    }
  });
  on(root, 'pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hovered = true;
    updatePlayback();
  }, { passive: true });
  on(root, 'pointerleave', event => {
    if (event.pointerType === 'touch') return;
    hovered = false;
    updatePlayback();
  }, { passive: true });
  on(root, 'focusin', () => { focused = true; updatePlayback(); });
  on(root, 'focusout', event => {
    focused = Boolean(event.relatedTarget && root.contains(event.relatedTarget));
    updatePlayback();
  });
  on(root, 'touchstart', event => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  on(root, 'touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.15) manualSwitch(index + (dx < 0 ? 1 : -1));
  }, { passive: true });
  on(root, 'touchcancel', () => { touchStart = null; }, { passive: true });
  on(doc, 'visibilitychange', () => { checkDay(); updatePlayback(); });
  const handlePreference = event => { reducedMotion = event.matches; updatePlayback(); };
  if (reducedQuery?.addEventListener) on(reducedQuery, 'change', handlePreference);
  else if (reducedQuery?.addListener) {
    reducedQuery.addListener(handlePreference);
    listeners.push(() => reducedQuery.removeListener(handlePreference));
  }
  const dayTimer = view.setInterval(checkDay, 60_000);
  show(index, false);
  updatePlayback();

  return () => {
    if (disposed) return;
    disposed = true;
    view.clearTimeout(autoplayTimer);
    view.clearInterval(dayTimer);
    touchStart = null;
    for (const remove of listeners) remove();
  };
}
