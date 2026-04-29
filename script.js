/* ===========================================================
   ROBIN STUDIO
   Lenis smooth scroll · GSAP ScrollTrigger · Three.js hero
   =========================================================== */

const isMobile = window.matchMedia('(max-width: 900px)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.getElementById('year').textContent = new Date().getFullYear();

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
  if (isMobile) return;
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
   8. THREE.JS HERO SCENE
   Une sphère "ink" avec subtle iridescence, lente, élégante
   ----------------------------------------------------------- */
function initThree() {
  if (!window.THREE) return;

  const canvas = document.getElementById('scene');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    35,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 6);

  // Lights — chiaroscuro "studio" feel, éclairage plus chaud et plus haut
  const key = new THREE.DirectionalLight(0xfff0d6, 1.85);
  key.position.set(3, 4, 5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xe3c9a4, 1.5);
  rim.position.set(-4, -2, -3);
  scene.add(rim);

  const fill = new THREE.AmbientLight(0x4a4136, 0.85);
  scene.add(fill);

  // Material — warm ink chrome avec teinte champagne
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x1f1d1a,
    metalness: 0.92,
    roughness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.18,
    envMapIntensity: 1.0,
  });

  // High-poly icosahedron for smooth deformation
  const geometry = new THREE.IcosahedronGeometry(1.45, 64);
  const positionAttr = geometry.attributes.position;
  const basePositions = new Float32Array(positionAttr.array);

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Simple noise-ish vertex displacement
  function pseudoNoise(x, y, z, t) {
    return (
      Math.sin(x * 1.3 + t * 0.6) * 0.18 +
      Math.cos(y * 1.6 - t * 0.7) * 0.16 +
      Math.sin(z * 1.1 + t * 0.5) * 0.14 +
      Math.sin((x + y + z) * 0.8 + t * 0.4) * 0.10
    );
  }

  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', resize);

  let scrollProgress = 0;
  if (window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => { scrollProgress = self.progress; }
    });
  }

  const clock = new THREE.Clock();
  function tick() {
    const t = clock.getElapsedTime();

    // Vertex displacement — keeps the sphere "alive"
    const arr = positionAttr.array;
    const amp = 0.08 + 0.04 * Math.sin(t * 0.4);
    for (let i = 0; i < arr.length; i += 3) {
      const ox = basePositions[i];
      const oy = basePositions[i + 1];
      const oz = basePositions[i + 2];
      const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
      const nx = ox / len, ny = oy / len, nz = oz / len;
      const d = pseudoNoise(ox, oy, oz, t) * amp;
      arr[i]     = ox + nx * d;
      arr[i + 1] = oy + ny * d;
      arr[i + 2] = oz + nz * d;
    }
    positionAttr.needsUpdate = true;
    geometry.computeVertexNormals();

    // Smooth rotation + subtle mouse parallax
    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;
    mesh.rotation.y = t * 0.12 + targetX * 0.4;
    mesh.rotation.x = Math.sin(t * 0.08) * 0.15 + targetY * 0.25;

    // Camera moves on scroll: pulls back & slightly up
    camera.position.z = 6 + scrollProgress * 2.4;
    camera.position.y = -scrollProgress * 1.2;
    mesh.position.x = 1.6 + scrollProgress * 0.4; // lean to the right behind the title
    camera.lookAt(mesh.position.x * 0.6, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  // Initial sizing
  requestAnimationFrame(() => {
    resize();
    tick();
  });
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

  // Marquee speed reactive to scroll velocity
  const tracks = document.querySelectorAll('.marquee__track');
  tracks.forEach(track => {
    let baseDur = parseFloat(getComputedStyle(track).animationDuration) || 30;
    let v = 0;
    let last = window.scrollY;
    window.addEventListener('scroll', () => {
      const cur = window.scrollY;
      v = Math.min(2.6, Math.max(0.4, Math.abs(cur - last) / 14));
      last = cur;
      track.style.animationDuration = (baseDur / v) + 's';
    }, { passive: true });
  });
}

/* -----------------------------------------------------------
   BOOT
   ----------------------------------------------------------- */
async function boot() {
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  await runLoader();

  initLenis();
  initNav();
  initCursor();
  initReveals();
  initHeroTitle();
  initGallery();
  initThree();
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
