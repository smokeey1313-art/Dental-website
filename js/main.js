/* ═══════════════════════════════════════════════════════════
   PearlSmile Dental — main.js
   All interactive behaviour for static Netlify deployment
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── SCROLL PROGRESS BAR ── */
  const scrollBar = document.getElementById('scroll-bar');
  if (scrollBar) {
    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollBar.style.width = (window.scrollY / max * 100) + '%';
    }, { passive: true });
  }

  /* ── MOBILE HAMBURGER ── */
  const ham = document.querySelector('.ham');
  const mobMenu = document.querySelector('.mob-menu');
  if (ham && mobMenu) {
    ham.addEventListener('click', () => {
      const open = mobMenu.classList.toggle('open');
      ham.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', open);
    });
    mobMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobMenu.classList.remove('open');
        ham.classList.remove('open');
        ham.setAttribute('aria-expanded', false);
      });
    });
  }

  /* ── SCROLL REVEAL ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── STATS COUNT-UP ── */
  document.querySelectorAll('.stat-cell[data-count]').forEach(cell => {
    const target = parseInt(cell.dataset.count, 10);
    const suffix = cell.dataset.suffix || '';
    const display = cell.querySelector('.count-num');
    if (!display) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let cur = 0;
      const step = Math.ceil(target / 55);
      const t = setInterval(() => {
        cur = Math.min(cur + step, target);
        display.textContent = cur.toLocaleString();
        if (cur >= target) clearInterval(t);
      }, 22);
    }, { threshold: 0.5 });
    obs.observe(cell);
  });

  /* ── GALLERY CAROUSEL (index page) ── */
  const carouselOuter = document.querySelector('.carousel-outer');
  const carouselTrack = document.querySelector('.carousel-track');
  if (carouselOuter && carouselTrack) {
    const slides = carouselTrack.querySelectorAll('.c-slide');
    const dots = document.querySelectorAll('.c-dot');
    const counterEl = document.querySelector('.slide-counter strong:first-child');
    let current = 0;

    function goTo(n) {
      current = (n + slides.length) % slides.length;
      carouselTrack.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      if (counterEl) counterEl.textContent = current + 1;
    }

    document.querySelector('.c-arr.prev')?.addEventListener('click', () => goTo(current - 1));
    document.querySelector('.c-arr.next')?.addEventListener('click', () => goTo(current + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
    goTo(0);

    // Before/After sliders
    document.querySelectorAll('.ba-wrap').forEach(wrap => {
      const before = wrap.querySelector('.ba-before');
      const line = wrap.querySelector('.ba-line');
      const handle = wrap.querySelector('.ba-handle');
      let dragging = false;

      function setPos(clientX) {
        const rect = wrap.getBoundingClientRect();
        const pct = Math.max(0, Math.min(100, (clientX - rect.left) / rect.width * 100));
        before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        line.style.left = pct + '%';
        handle.style.left = pct + '%';
      }

      wrap.addEventListener('mousedown', e => { dragging = true; setPos(e.clientX); });
      window.addEventListener('mousemove', e => { if (dragging) setPos(e.clientX); });
      window.addEventListener('mouseup', () => { dragging = false; });
      wrap.addEventListener('touchstart', e => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
      window.addEventListener('touchmove', e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
      window.addEventListener('touchend', () => { dragging = false; });
    });
  }

  /* ── FAQ ACCORDION ── */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (q) q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ── VIDEO STORIES MODAL ── */
  const vidOverlay = document.getElementById('vid-modal');
  const vidEl = document.getElementById('vid-modal-video');
  const vidClose = document.getElementById('vid-modal-close');
  const vidName = document.getElementById('vid-modal-name');
  const vidSub = document.getElementById('vid-modal-sub');

  if (vidOverlay) {
    document.querySelectorAll('.vs-card[data-video]').forEach(card => {
      card.addEventListener('click', () => {
        vidEl.src = card.dataset.video;
        if (vidName) vidName.textContent = card.dataset.name || '';
        if (vidSub) vidSub.textContent = card.dataset.treatment || '';
        vidOverlay.classList.add('active');
        vidEl.play();
      });
    });
    const closeModal = () => {
      vidOverlay.classList.remove('active');
      vidEl.pause();
      vidEl.src = '';
    };
    vidClose?.addEventListener('click', closeModal);
    vidOverlay.addEventListener('click', e => { if (e.target === vidOverlay) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  /* ── BOOKING FORM ── */
  const bookForm = document.getElementById('book-form');
  if (bookForm) {
    bookForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = bookForm.querySelector('.btn-submit');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      const data = new FormData(bookForm);
      try {
        const res = await fetch(bookForm.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          bookForm.innerHTML = `<div style="text-align:center;padding:40px 0"><div style="font-size:2.5rem;margin-bottom:16px">🎉</div><h3 style="font-family:Cormorant Garamond,serif;font-size:1.6rem;color:#fff;margin-bottom:10px">Booking Request Received!</h3><p style="color:#7A8FAA;font-size:.9rem;line-height:1.7">Thank you! Our coordinator will call you within 2 hours to confirm your appointment.</p></div>`;
        } else { throw new Error(); }
      } catch {
        btn.textContent = 'Try Again';
        btn.disabled = false;
        alert('There was an issue submitting. Please call us directly.');
      }
    });
  }

  /* ── GUIDE DOWNLOAD FORM ── */
  const guideForm = document.getElementById('guide-form');
  const guideSuccess = document.getElementById('guide-success');
  if (guideForm) {
    guideForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = guideForm.querySelector('.gf-btn');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      const data = new FormData(guideForm);
      try {
        const res = await fetch(guideForm.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          guideForm.style.display = 'none';
          if (guideSuccess) guideSuccess.classList.add('visible');
        } else { throw new Error(); }
      } catch {
        btn.textContent = 'Send Guide →';
        btn.disabled = false;
      }
    });
  }

  /* ── WELCOME POPUP ── */
  const welcomePop = document.getElementById('popup-welcome');
  if (welcomePop) {
    const shown = sessionStorage.getItem('ps_welcome');
    if (!shown) {
      setTimeout(() => {
        welcomePop.classList.add('open');
        sessionStorage.setItem('ps_welcome', '1');
      }, 5000);
    }
    welcomePop.querySelectorAll('.pop-close, .pop-dismiss').forEach(b => {
      b.addEventListener('click', () => welcomePop.classList.remove('open'));
    });
    welcomePop.addEventListener('click', e => { if (e.target === welcomePop) welcomePop.classList.remove('open'); });
  }

  /* ── EXIT INTENT POPUP ── */
  const exitPop = document.getElementById('popup-exit');
  if (exitPop) {
    let fired = false;
    document.addEventListener('mouseleave', e => {
      if (e.clientY <= 0 && !fired) {
        fired = true;
        exitPop.classList.add('open');
      }
    });
    exitPop.querySelectorAll('.pop-close, .pop-dismiss').forEach(b => {
      b.addEventListener('click', () => exitPop.classList.remove('open'));
    });
    exitPop.addEventListener('click', e => { if (e.target === exitPop) exitPop.classList.remove('open'); });
  }

  /* ── GALLERY PAGE: LIGHTBOX ── */
  const lightbox = document.getElementById('gallery-lightbox');
  if (lightbox) {
    const lbImg = lightbox.querySelector('.lb-img');
    const lbCaption = lightbox.querySelector('.lb-caption p');
    let currentLbIndex = 0;
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item[data-src]'));

    function openLb(idx) {
      currentLbIndex = idx;
      const item = galleryItems[idx];
      lbImg.src = item.dataset.src;
      if (lbCaption) lbCaption.textContent = item.dataset.caption || '';
      lightbox.classList.add('open');
    }

    galleryItems.forEach((item, i) => item.addEventListener('click', () => openLb(i)));

    document.querySelector('.lb-close')?.addEventListener('click', () => lightbox.classList.remove('open'));
    document.querySelector('.lb-prev')?.addEventListener('click', () => openLb((currentLbIndex - 1 + galleryItems.length) % galleryItems.length));
    document.querySelector('.lb-next')?.addEventListener('click', () => openLb((currentLbIndex + 1) % galleryItems.length));
    lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('open'); });
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') lightbox.classList.remove('open');
      if (e.key === 'ArrowLeft') openLb((currentLbIndex - 1 + galleryItems.length) % galleryItems.length);
      if (e.key === 'ArrowRight') openLb((currentLbIndex + 1) % galleryItems.length);
    });
  }

  /* ── GALLERY PAGE: FILTER ── */
  document.querySelectorAll('.gf-btn-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gf-btn-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.gallery-item').forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.style.display = match ? '' : 'none';
      });
    });
  });

  /* ── ORALYN AI CHAT (simplified static version) ── */
  const orBtn = document.getElementById('oralyn-btn');
  const orWin = document.querySelector('.oralyn-win');
  const orClose = document.querySelector('.o-close');
  const orBubbles = document.getElementById('oralyn-bubbles');

  if (orBtn && orWin) {
    // Show bubbles after 3s
    setTimeout(() => {
      if (orBubbles) {
        orBubbles.classList.add('visible');
        orBubbles.querySelectorAll('.obubble-q').forEach((b, i) => {
          setTimeout(() => b.classList.add('in'), i * 200);
        });
      }
    }, 3000);

    orBtn.addEventListener('click', () => {
      const open = orWin.classList.toggle('open');
      orBtn.classList.toggle('open', open);
      if (orBubbles) orBubbles.classList.remove('visible');
    });

    orClose?.addEventListener('click', () => {
      orWin.classList.remove('open');
      orBtn.classList.remove('open');
    });

    // Quick reply bubbles
    document.querySelectorAll('.obubble-q').forEach(b => {
      b.addEventListener('click', () => {
        orWin.classList.add('open');
        orBtn.classList.add('open');
        if (orBubbles) orBubbles.classList.remove('visible');
      });
    });

    // Basic chat send
    const oInput = document.getElementById('o-input');
    const oSend = document.querySelector('.o-send');
    const oMsgs = document.querySelector('.o-msgs');

    function sendChat() {
      const val = oInput?.value.trim();
      if (!val || !oMsgs) return;
      oInput.value = '';
      const usrMsg = document.createElement('div');
      usrMsg.className = 'omsg usr';
      usrMsg.innerHTML = `<div class="o-row"><div class="o-bubble">${val}</div></div>`;
      oMsgs.appendChild(usrMsg);

      // Typing indicator
      const typing = document.createElement('div');
      typing.className = 'omsg bot otyping';
      typing.innerHTML = `<div class="o-row"><div class="o-bubble"><span class="otd"></span><span class="otd"></span><span class="otd"></span></div></div>`;
      oMsgs.appendChild(typing);
      oMsgs.scrollTop = oMsgs.scrollHeight;

      setTimeout(() => {
        typing.remove();
        const botMsg = document.createElement('div');
        botMsg.className = 'omsg bot';
        botMsg.innerHTML = `<div class="o-row"><div class="o-bubble">Thanks for your message! To book a free consultation or speak with our team directly, please call us on <strong>020 0000 0000</strong> or <a href="#book" style="color:#00DEB6">fill in our booking form</a> and we'll call you within 2 hours. 😊</div></div>`;
        oMsgs.appendChild(botMsg);
        oMsgs.scrollTop = oMsgs.scrollHeight;
      }, 1400);
    }

    oSend?.addEventListener('click', sendChat);
    oInput?.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
    document.querySelectorAll('.oqr-btn').forEach(b => {
      b.addEventListener('click', () => {
        if (oInput) oInput.value = b.textContent;
        sendChat();
      });
    });
  }

});
