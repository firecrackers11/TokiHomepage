const body = document.body;
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const languageButton = document.querySelector('[data-language-toggle]');
const languageLabel = document.querySelector('[data-language-label]');

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

const setLanguage = (language) => {
  body.dataset.language = language;
  document.documentElement.lang = language;
  languageLabel.textContent = language === 'ko' ? 'EN' : 'KO';
  languageButton.setAttribute('aria-label', language === 'ko' ? 'Switch to English' : '한국어로 전환');
  localStorage.setItem('tokisystems-language', language);
};

setLanguage(localStorage.getItem('tokisystems-language') === 'en' ? 'en' : 'ko');
languageButton?.addEventListener('click', () => setLanguage(body.dataset.language === 'ko' ? 'en' : 'ko'));

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const tokiezCarousel = document.querySelector('[data-tokiez-carousel]');
const tokiezTrack = document.querySelector('[data-tokiez-track]');
const tokiezSlides = document.querySelectorAll('[data-tokiez-slide]');
const tokiezDots = document.querySelectorAll('[data-tokiez-dot]');
const tokiezCurrent = document.querySelector('[data-tokiez-current]');
const tokiezPrev = document.querySelector('[data-tokiez-prev]');
const tokiezNext = document.querySelector('[data-tokiez-next]');

if (tokiezCarousel && tokiezTrack && tokiezSlides.length && tokiezDots.length) {
  const slideCount = tokiezSlides.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeIndex = 0;
  let autoplayTimer;
  let touchStartX = null;

  const goTo = (index) => {
    activeIndex = (index + slideCount) % slideCount;
    tokiezTrack.style.transform = `translateX(-${activeIndex * 100}%)`;
    tokiezSlides.forEach((slide, i) => {
      const active = i === activeIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    tokiezDots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === activeIndex);
      dot.setAttribute('aria-selected', String(i === activeIndex));
    });
    if (tokiezCurrent) tokiezCurrent.textContent = String(activeIndex + 1).padStart(2, '0');
  };

  const stopAutoplay = () => clearInterval(autoplayTimer);
  const startAutoplay = () => {
    stopAutoplay();
    if (!reduceMotion) autoplayTimer = setInterval(() => goTo(activeIndex + 1), 5500);
  };
  const moveAndRestart = (step) => { goTo(activeIndex + step); startAutoplay(); };

  tokiezDots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startAutoplay(); }));
  tokiezPrev?.addEventListener('click', () => moveAndRestart(-1));
  tokiezNext?.addEventListener('click', () => moveAndRestart(1));
  tokiezCarousel.addEventListener('mouseenter', stopAutoplay);
  tokiezCarousel.addEventListener('mouseleave', startAutoplay);
  tokiezCarousel.addEventListener('focusin', stopAutoplay);
  tokiezCarousel.addEventListener('focusout', startAutoplay);
  tokiezCarousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') moveAndRestart(-1);
    if (event.key === 'ArrowRight') moveAndRestart(1);
  });
  tokiezCarousel.addEventListener('touchstart', (event) => { touchStartX = event.touches[0].clientX; }, { passive: true });
  tokiezCarousel.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 45) moveAndRestart(deltaX < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive: true });

  goTo(0);
  startAutoplay();
}
