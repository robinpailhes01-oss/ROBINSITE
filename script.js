// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu toggle (simple)
const burger = document.querySelector('.nav__burger');
const links = document.querySelector('.nav__links');
if (burger && links) {
  burger.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.display = open ? '' : 'flex';
    if (!open) {
      links.style.position = 'absolute';
      links.style.top = '60px';
      links.style.left = '0';
      links.style.right = '0';
      links.style.flexDirection = 'column';
      links.style.background = 'rgba(7,8,13,0.98)';
      links.style.padding = '24px';
      links.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
    }
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if (window.innerWidth <= 720) {
      links.style.display = '';
    }
  }));
}

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.h2, .service, .card, .quote, .stack__col, .stats__item, .about__media, .about__content, .hero__title, .hero__sub, .hero__cta, .badge, .portrait').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity .7s ease, transform .7s ease';
  io.observe(el);
});
