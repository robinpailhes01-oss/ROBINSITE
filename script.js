/* ===========================================================
   ROBIN STUDIO
   Lenis smooth scroll · GSAP ScrollTrigger · Portrait parallax
   =========================================================== */

const isMobile = window.matchMedia('(max-width: 900px)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.getElementById('year').textContent = new Date().getFullYear();
document.body.classList.add('is-loading');

/* -----------------------------------------------------------
   0. LIVE TIME (Europe/Paris)
   ----------------------------------------------------------- */
function initLiveTime() {
  const el = document.getElementById('navTime');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Paris',
    hour12: false,
  });
  const update = () => { el.textContent = fmt.format(new Date()); };
  update();
  setInterval(update, 30000);
}

/* -----------------------------------------------------------
   0b. SCROLL PROGRESS
   ----------------------------------------------------------- */
function initProgress() {
  const bar = document.querySelector('.progress__bar');
  if (!bar) return;
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? (h.scrollTop / max) : 0;
    bar.style.width = (p * 100).toFixed(2) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* -----------------------------------------------------------
   1. LOADER
   ----------------------------------------------------------- */
const loader = document.querySelector('.loader');
const loaderBar = document.querySelector('.loader__bar i');
const loaderNum = document.querySelector('.loader__num');

function runLoader() {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      loaderBar.style.width = '100%';
    });
    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(100, p + Math.random() * 18);
      loaderNum.textContent = String(Math.floor(p)).padStart(2, '0');
      if (p >= 100) {
        clearInterval(tick);
        setTimeout(() => {
          loader.style.transition = 'opacity .7s ease, transform .9s cubic-bezier(.7,0,.2,1)';
          loader.style.transform = 'translateY(-100%)';
          loader.style.opacity = '0';
          loader.classList.add('is-loaded');
          setTimeout(() => {
            loader.style.display = 'none';
            document.body.classList.remove('is-loading');
            resolve();
          }, 800);
        }, 300);
      }
    }, 80);
  });
}

/* -----------------------------------------------------------
   2. LENIS SMOOTH SCROLL
   ----------------------------------------------------------- */
let lenis;
function initLenis() {
  if (reducedMotion) return;
  // Smooth scroll — easing exponentiel doux, durée légèrement plus longue
  // pour un drift "studio" très fluide sans donner l'impression de lag.
  lenis = new Lenis({
    duration: 1.55,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.6,
    syncTouch: true,
    syncTouchLerp: 0.085,
    lerp: 0.085,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  if (window.gsap && gsap.ticker) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -40, duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 5) });
    });
  });
}

/* -----------------------------------------------------------
   3. CUSTOM CURSOR (magnetic)
   ----------------------------------------------------------- */
function initCursor() {
  if (isMobile || isTouch) {
    const cursorEl = document.querySelector('.cursor');
    if (cursorEl) cursorEl.style.display = 'none';
    return;
  }
  const cursor = document.querySelector('.cursor');
  const ring = cursor.querySelector('.cursor__ring');
  const dot = cursor.querySelector('.cursor__dot');

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let dx = mx, dy = my;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
  });

  function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    dx += (mx - dx) * 0.55;
    dy += (my - dy) * 0.55;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    dot.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('[data-cursor]').forEach(el => {
    const type = el.getAttribute('data-cursor');
    el.addEventListener('mouseenter', () => {
      cursor.classList.add(`is-${type}`);
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove(`is-${type}`);
    });
  });
}

/* -----------------------------------------------------------
   4. NAV scroll state
   ----------------------------------------------------------- */
function initNav() {
  const nav = document.querySelector('.nav');
  const update = () => {
    if (window.scrollY > 60) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* -----------------------------------------------------------
   5. HERO TITLE — staggered reveal
   ----------------------------------------------------------- */
function initHeroTitle() {
  const words = document.querySelectorAll('.hero__title .word');
  if (!window.gsap) {
    words.forEach(w => w.style.transform = 'translateY(0)');
    return;
  }
  gsap.to(words, {
    y: '0%',
    duration: 1.2,
    ease: 'expo.out',
    stagger: 0.08,
    delay: 0.2
  });
}

/* -----------------------------------------------------------
   6. SCROLL REVEALS
   ----------------------------------------------------------- */
function initReveals() {
  const items = document.querySelectorAll('.js-reveal');
  if (!window.IntersectionObserver) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => io.observe(el));
}

/* -----------------------------------------------------------
   7. STICKY GALLERY
   ----------------------------------------------------------- */
function initGallery() {
  const items = document.querySelectorAll('.gallery__item');
  const slides = document.querySelectorAll('.gallery__slide');
  if (!items.length) return;

  function activate(idx) {
    items.forEach((it, i) => it.classList.toggle('is-active', i === idx));
    slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
  }

  items.forEach((it, i) => {
    it.addEventListener('mouseenter', () => activate(i));
    it.addEventListener('focusin', () => activate(i));
  });

  if (window.ScrollTrigger && !isMobile) {
    items.forEach((it, i) => {
      ScrollTrigger.create({
        trigger: it,
        start: 'top 70%',
        end: 'bottom 30%',
        onEnter: () => activate(i),
        onEnterBack: () => activate(i),
      });
    });
  }
}

/* -----------------------------------------------------------
   8. HERO PORTRAIT — parallax doux au scroll
   Le sujet émerge du fond, légère translation vers le haut
   ----------------------------------------------------------- */
function initPortrait() {
  const portrait = document.querySelector('.hero__portrait');
  if (!portrait || reducedMotion) return;

  const inner = portrait.firstElementChild;
  if (!inner) return;

  let target = 0, current = 0, mouseX = 0, mouseY = 0, mx = 0, my = 0;

  window.addEventListener('scroll', () => {
    const heroH = document.querySelector('.hero')?.offsetHeight || window.innerHeight;
    const p = Math.min(1, Math.max(0, window.scrollY / heroH));
    target = p;
    portrait.style.opacity = Math.max(0, 1 - p * 1.4);
  }, { passive: true });

  if (!isTouch) {
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  function loop() {
    current += (target - current) * 0.08;
    mx += (mouseX - mx) * 0.05;
    my += (mouseY - my) * 0.05;
    const ty = current * -60 + my * -8;
    const tx = mx * -10;
    inner.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${1.04 - current * 0.04})`;
    requestAnimationFrame(loop);
  }
  loop();
}

/* -----------------------------------------------------------
   9. SECTION TRANSITIONS — pinned displays (subtle)
   ----------------------------------------------------------- */
function initSectionFx() {
  if (!window.gsap || !window.ScrollTrigger || isMobile || reducedMotion) return;
  gsap.registerPlugin(ScrollTrigger);

  // Subtle parallax on section indices
  gsap.utils.toArray('.section__index').forEach(el => {
    gsap.fromTo(el,
      { y: 24, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      }
    );
  });

  // Marquee : vitesse constante (pas de réactivité au scroll — feel plus calme & premium)
}

/* -----------------------------------------------------------
   BOOT
   ----------------------------------------------------------- */
async function boot() {
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  initLiveTime();
  initProgress();

  await runLoader();

  initLenis();
  initNav();
  initCursor();
  initReveals();
  initHeroTitle();
  initGallery();
  initPortrait();
  initSectionFx();

  // Refresh scrolltriggers after everything settles
  setTimeout(() => {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }, 300);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
