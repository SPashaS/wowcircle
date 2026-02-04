(() => {
  const root = document.querySelector('.js-features');
  if (!root) return;

  const viewport = root.querySelector('.features__viewport');
  const track = root.querySelector('.features__track');
  const originalSlides = Array.from(root.querySelectorAll('.features__slide'));

  // 1) делаем loop: дублируем все слайды 2 раза
  // итог: [оригинал][копия][копия]
  const clones1 = originalSlides.map((s) => s.cloneNode(true));
  const clones2 = originalSlides.map((s) => s.cloneNode(true));
  clones1.forEach((n) => track.appendChild(n));
  clones2.forEach((n) => track.appendChild(n));

  let slides = Array.from(root.querySelectorAll('.features__slide'));

  // параметры
  const speed = 35; // px/sec — увеличь до 50-70 если надо быстрее
  let x = 0; // translateX
  let raf = 0;
  let last = performance.now();

  // для loop логика: длина одного "набора" слайдов
  let setWidth = 0;

  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (prefersReduced) return;

  function measureSetWidth() {
    // ширина только первого набора (оригинальных)
    const first = slides[0];
    const lastOrig = slides[originalSlides.length - 1];

    const r1 = first.getBoundingClientRect();
    const r2 = lastOrig.getBoundingClientRect();

    // gap берём из computed style
    const gap = parseFloat(getComputedStyle(track).gap || '0');
    setWidth = r2.left - r1.left + r2.width + gap;

    // стартуем так, чтобы мы были в середине (на втором наборе), тогда loop незаметнее
    x = -setWidth; // начинаем с “копии 1”
    track.style.transform = `translate3d(${x}px,0,0)`;
  }

  function setActiveByCenter() {
    // активный — тот, чья середина ближе всего к центру viewport
    const vp = viewport.getBoundingClientRect();
    const center = vp.left + vp.width / 2;

    let bestIdx = 0;
    let bestDist = Infinity;

    slides.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = Math.abs(center - c);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });

    slides.forEach((s, i) => s.classList.toggle('is-active', i === bestIdx));
  }

  function tick(now) {
    const dt = (now - last) / 1000;
    last = now;

    x -= speed * dt;
    // когда уехали дальше, возвращаемся на один набор назад (незаметно)
    if (x <= -setWidth * 2) x += setWidth;

    track.style.transform = `translate3d(${x}px,0,0)`;
    setActiveByCenter();

    raf = requestAnimationFrame(tick);
  }

  function start() {
    cancelAnimationFrame(raf);
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    cancelAnimationFrame(raf);
  }

  // 2) drag / swipe
  let isDown = false;
  let startX = 0;
  let startTranslate = 0;

  const getClientX = (e) => ('touches' in e ? e.touches[0].clientX : e.clientX);

  function onDown(e) {
    isDown = true;
    startX = getClientX(e);
    startTranslate = x;
    stop();
  }

  function onMove(e) {
    if (!isDown) return;
    const cx = getClientX(e);
    const dx = cx - startX;
    x = startTranslate + dx;
    track.style.transform = `translate3d(${x}px,0,0)`;
    setActiveByCenter();
  }

  function onUp() {
    if (!isDown) return;
    isDown = false;

    // нормализуем в диапазон loop
    // держим x в [ -2*setWidth, 0 ) относительно нашего старта
    while (x > -setWidth) x -= setWidth;
    while (x <= -setWidth * 2) x += setWidth;

    start();
  }

  viewport.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);

  viewport.addEventListener('touchstart', onDown, { passive: true });
  viewport.addEventListener('touchmove', onMove, { passive: true });
  viewport.addEventListener('touchend', onUp, { passive: true });

  // pause on hover (приятно на десктопе)
  viewport.addEventListener('mouseenter', stop);
  viewport.addEventListener('mouseleave', () => {
    if (!isDown) start();
  });

  // init
  requestAnimationFrame(() => {
    // важно: измеряем после layout
    measureSetWidth();
    setActiveByCenter();
    start();
  });

  window.addEventListener('resize', () => {
    measureSetWidth();
    setActiveByCenter();
  });
})();

(() => {
  const root = document.querySelector('.mods');
  if (!root) return;

  const orbit = root.querySelector('.js-mods-orbit');
  const items = [...root.querySelectorAll('.js-mods-item')];

  const subtitle = root.querySelector('.js-mods-subtitle');
  const desc = root.querySelector('.js-mods-desc');

  const prev = root.querySelector('.js-prev');
  const next = root.querySelector('.js-next');

  if (!orbit || items.length === 0) return;

  // ✅ индексы (не нужны --i в HTML)
  items.forEach((el, i) => el.style.setProperty('--i', String(i)));

  // ✅ count
  orbit.style.setProperty('--count', String(items.length));

  let active = 0;

  // ✅ динамический радиус от количества слайдов + размера кружка
  const computeRadius = () => {
    const n = items.length;

    const portalW = items[0].getBoundingClientRect().width || 190; // диаметр
    const gap = 0.2; // зазор между кружками
    const k = 1.15; // "прячем часть" — больше => видно меньше

    // минимальный радиус чтобы кружки не пересекались
    const rMin = (portalW + gap) / (2 * Math.sin(Math.PI / n));

    // радиус под "видно 2-3"
    const r = Math.max(320, Math.min(900, rMin * k));

    orbit.style.setProperty('--radius', `${Math.round(r)}px`);
  };

  const setActive = (i) => {
    active = (i + items.length) % items.length;

    items.forEach((el, idx) =>
      el.classList.toggle('is-active', idx === active)
    );

    const step = 360 / items.length;
    orbit.style.setProperty('--rot', `${-active * step}deg`);

    subtitle.textContent = items[active].dataset.title || '';
    desc.textContent = items[active].dataset.desc || '';
  };

  // клики по кружкам
  items.forEach((el, i) => el.addEventListener('click', () => setActive(i)));

  prev?.addEventListener('click', () => setActive(active - 1));
  next?.addEventListener('click', () => setActive(active + 1));

  computeRadius();
  window.addEventListener('resize', computeRadius);

  setActive(0);
})();

(() => {
  const root = document.querySelector('.js-stages');
  if (!root) return;

  const dataEls = [...root.querySelectorAll('.js-data .js-stage')];
  const stepsBox = root.querySelector('.js-steps');
  const img = root.querySelector('.stages__img');
  const caption = root.querySelector('.js-caption');

  if (!stepsBox || !img || !caption || dataEls.length === 0) return;

  const stages = dataEls.map((el) => ({
    text: el.dataset.text || '',
    img: el.dataset.img || '',
  }));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let active = 0;
  let changeT = null;

  const renderSteps = () => {
    stepsBox.innerHTML = '';

    stages.forEach((s, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'stage-step' + (idx === active ? ' is-active' : '');
      btn.dataset.index = String(idx);

      btn.innerHTML = `
        <span class="stage-step__inner">
          <span class="stage-step__text">${s.text}</span>
        </span>
      `;

      stepsBox.appendChild(btn);
    });
  };

  const setMedia = (idx, withFade = true) => {
    const s = stages[idx];
    caption.textContent = s.text;

    if (!withFade || reduceMotion.matches) {
      img.style.backgroundImage = `url("${s.img}")`;
      return;
    }

    // простой фейд: уводим в прозрачность, меняем картинку, возвращаем
    img.classList.add('is-changing');
    window.clearTimeout(changeT);

    changeT = window.setTimeout(() => {
      img.style.backgroundImage = `url("${s.img}")`;
      img.classList.remove('is-changing');
    }, 180);
  };

  const setActive = (idx) => {
    const next = Math.max(0, Math.min(idx, stages.length - 1));
    if (next === active) return;

    active = next;

    // обновляем активную кнопку
    stepsBox.querySelectorAll('.stage-step').forEach((b) => {
      b.classList.toggle('is-active', Number(b.dataset.index) === active);
    });

    setMedia(active, true);
  };

  // делегирование клика
  stepsBox.addEventListener('click', (e) => {
    const btn = e.target.closest('.stage-step');
    if (!btn || !stepsBox.contains(btn)) return;
    setActive(Number(btn.dataset.index));
  });

  // init
  renderSteps();
  setMedia(active, false);
})();

(() => {
  const viewport = document.querySelector('.js-df-viewport');
  if (!viewport) return;

  const track = viewport.querySelector('.df__track');
  if (!track) return;

  // wheel -> horizontal
  track.addEventListener(
    'wheel',
    (e) => {
      // если вертикальная прокрутка сильнее — не мешаем
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      track.scrollLeft += e.deltaY;
    },
    { passive: false }
  );

  // drag (mouse)
  let isDown = false;
  let startX = 0;
  let startLeft = 0;

  track.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX;
    startLeft = track.scrollLeft;
    track.classList.add('is-dragging');
  });

  window.addEventListener('mouseup', () => {
    isDown = false;
    track.classList.remove('is-dragging');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const dx = e.pageX - startX;
    track.scrollLeft = startLeft - dx;
  });
})();

(() => {
  const root = document.querySelector('.js-raids');
  if (!root) return;

  const dataEls = [...root.querySelectorAll('.js-raids-data .js-raid')];
  const stepsBox = root.querySelector('.js-raids-steps');

  const imgA = root.querySelector('.js-raids-img-a');
  const imgB = root.querySelector('.js-raids-img-b');

  const descEl = root.querySelector('.js-raids-desc');

  if (!stepsBox || !imgA || !imgB || !descEl || dataEls.length === 0) return;

  const raids = dataEls.map((el) => ({
    name: el.dataset.name || '',
    meta: el.dataset.meta || '',
    desc: el.dataset.desc || '',
    img: el.dataset.img || '',
  }));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let active = 0;
  let showA = true;

  stepsBox.innerHTML = raids
    .map(
      (r, idx) => `
    <button type="button" class="raid-step${
      idx === 0 ? ' is-active' : ''
    }" data-index="${idx}">
      <span class="raid-step__inner">
        <span class="raid-step__name">${r.name}</span>
        <span class="raid-step__meta">${r.meta}</span>
      </span>
    </button>
  `
    )
    .join('');

  const setText = (idx) => {
    descEl.textContent = raids[idx].desc;
  };

  const setImage = (idx) => {
    const url = `url("${raids[idx].img}")`;

    if (reduceMotion.matches) {
      imgA.style.backgroundImage = url;
      imgA.classList.add('is-show');
      imgB.classList.remove('is-show');
      return;
    }

    const front = showA ? imgA : imgB;
    const back = showA ? imgB : imgA;

    back.style.backgroundImage = url;
    back.classList.add('is-show');
    front.classList.remove('is-show');

    showA = !showA;
  };

  const setActive = (idx) => {
    const next = Math.max(0, Math.min(idx, raids.length - 1));
    if (next === active) return;

    active = next;

    stepsBox.querySelectorAll('.raid-step').forEach((b) => {
      b.classList.toggle('is-active', Number(b.dataset.index) === active);
    });

    setText(active);
    setImage(active);
  };

  stepsBox.addEventListener('click', (e) => {
    const btn = e.target.closest('.raid-step');
    if (!btn || !stepsBox.contains(btn)) return;
    setActive(Number(btn.dataset.index));
  });

  // init
  setText(active);
  imgA.style.backgroundImage = `url("${raids[0].img}")`;
  imgA.classList.add('is-show');
  imgB.classList.remove('is-show');
})();
