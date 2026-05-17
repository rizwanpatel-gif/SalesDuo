'use strict';

(function () {

  
  const bar = document.getElementById('scroll-progress');
  function updateBar() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();


  const root = document.documentElement;
  const themeBtns = document.querySelectorAll('[data-theme-toggle]');
  let dark = root.getAttribute('data-theme') === 'dark';

  function applyThemeIcon() {
    const sun = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    const moon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    themeBtns.forEach(btn => {
      btn.innerHTML = dark ? sun : moon;
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  themeBtns.forEach(btn => btn.addEventListener('click', () => {
    dark = !dark;
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    applyThemeIcon();
  }));
  applyThemeIcon();

  
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.getElementById('site-nav');

  function closeNav() {
    if (!siteNav) return;
    siteNav.classList.remove('mobile-open');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation');
    }
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = siteNav.classList.toggle('mobile-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });

    siteNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

    document.addEventListener('click', (e) => {
      if (!siteNav.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
  }

 
  const revealEls = document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('revealed');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('revealed'));
  }

 
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) panel.classList.add('active');
    });

    btn.addEventListener('keydown', e => {
      const btns = Array.from(tabBtns);
      const idx = btns.indexOf(btn);
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        btns[(idx + 1) % btns.length].focus();
        btns[(idx + 1) % btns.length].click();
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        btns[(idx - 1 + btns.length) % btns.length].focus();
        btns[(idx - 1 + btns.length) % btns.length].click();
      }
    });
  });


  const pricingToggle = document.getElementById('pricing-toggle');
  const priceVals = document.querySelectorAll('.price-val');
  const pricePeriods = document.querySelectorAll('.price-period');
  const lblOnetime = document.getElementById('label-onetime');
  const lblMonthly = document.getElementById('label-monthly');
  let isMonthly = false;

  function flipPrice(el, val) {
    el.classList.add('flip-out');
    setTimeout(() => {
      el.textContent = val;
      el.classList.remove('flip-out');
      el.classList.add('flip-in');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('flip-in')));
    }, 180);
  }

  function updatePricing() {
    priceVals.forEach(el => flipPrice(el, isMonthly ? el.dataset.monthly : el.dataset.onetime));
    pricePeriods.forEach(el => setTimeout(() => {
      el.textContent = isMonthly ? el.dataset.monthly : el.dataset.onetime;
    }, 180));
    if (lblOnetime) lblOnetime.classList.toggle('active', !isMonthly);
    if (lblMonthly) lblMonthly.classList.toggle('active', isMonthly);
    if (pricingToggle) pricingToggle.setAttribute('aria-checked', String(isMonthly));
  }

  if (pricingToggle) {
    pricingToggle.addEventListener('click', () => {
      isMonthly = !isMonthly;
      updatePricing();
    });

    pricingToggle.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        isMonthly = !isMonthly;
        updatePricing();
      }
    });
  }
  updatePricing();


  const track = document.getElementById('slider-track');
  const dotsEl = document.getElementById('slider-dots');
  const prev = document.getElementById('slider-prev');
  const next = document.getElementById('slider-next');

  if (track) {
    const slides = Array.from(track.querySelectorAll('.slide'));
    const total = slides.length;
    let cur = 0;
    let timer = null;
    let touchX = 0;

    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      d.addEventListener('click', () => goTo(i));
      if (dotsEl) dotsEl.appendChild(d);
    });

    const dots = dotsEl ? Array.from(dotsEl.querySelectorAll('.dot')) : [];

    function goTo(i) {
      cur = ((i % total) + total) % total;
      track.style.transform = 'translateX(-' + (cur * 100) + '%)';
      dots.forEach((d, j) => {
        d.classList.toggle('active', j === cur);
        d.setAttribute('aria-selected', j === cur ? 'true' : 'false');
      });
    }

    function startAuto() {
      stopAuto();
      timer = setInterval(() => goTo(cur + 1), 5000);
    }

    function stopAuto() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prev) prev.addEventListener('click', () => {
      goTo(cur - 1);
      stopAuto();
      startAuto();
    });

    if (next) next.addEventListener('click', () => {
      goTo(cur + 1);
      stopAuto();
      startAuto();
    });

    const wrap = document.getElementById('testimonials-slider');
    if (wrap) {
      wrap.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') {
          goTo(cur - 1);
          stopAuto();
          startAuto();
        }
        if (e.key === 'ArrowRight') {
          goTo(cur + 1);
          stopAuto();
          startAuto();
        }
      });
    }

    track.addEventListener('touchstart', e => {
      touchX = e.touches[0].clientX;
      stopAuto();
    }, { passive: true });

    track.addEventListener('touchend', e => {
      const diff = touchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? cur + 1 : cur - 1);
      startAuto();
    }, { passive: true });

    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);

    startAuto();
  }


  const form = document.getElementById('signup-form');
  const emailInput = document.getElementById('email-input');
  const emailError = document.getElementById('email-error');

  if (form && emailInput && emailError) {
    const valid = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

    function setMsg(msg, type) {
      emailError.textContent = msg;
      emailError.className = 'form-message ' + type;
    }

    emailInput.addEventListener('input', () => {
      if (emailError.className.includes('error')) {
        setMsg(valid(emailInput.value) ? '' : 'Enter a valid email.', valid(emailInput.value) ? '' : 'error');
      }
    });

    function debounce(fn, delay) {
         let timer;
       return function (...args) {
            clearTimeout(timer);
             timer = setTimeout(() => fn.apply(this, args), delay);
                                };
      }

    form.addEventListener('submit', debounce(function(e) {
         e.preventDefault();

         const val = emailInput.value;

         if (!val.trim()) {
         setMsg('Email is required.', 'error');
         emailInput.focus();
         return;
          }

        if (!valid(val)) {
         setMsg('Enter a valid email (e.g. you@example.com).', 'error');
         emailInput.focus();
         return;
        }

        setMsg(" You're on the list! We'll be in touch.", 'success');
  
        emailInput.value = '';
        
        emailInput.disabled = true;
  
        const submitBtn = form.querySelector('button[type="submit"]');

        if (submitBtn) {

            submitBtn.disabled = true;
            submitBtn.textContent = 'Reserved ✓';

          }
          
}, 500));  

    
  }

})();