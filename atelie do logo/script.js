// ============================
// script.js - Interações premium para Ateliê do Lobo
// Requer: <canvas class="particles-canvas"></canvas> opcional no #hero
// ============================

// ======= Helper utils =======
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function throttle(fn, wait = 16) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn(...args);
    }
  };
}

// ============================
// DOMContentLoaded - inicializa efeitos
// ============================
document.addEventListener('DOMContentLoaded', () => {
  reduceMotionRespect();
  initParticles();
  heroEntrance();
  initSmoothScroll();
  initScrollReveal();
  initCardTilt();
  initPortfolioLightbox();
  initFormEnhancements();
  initParallax();
  initWhatsAppFloat();
});

// ===================================================================
// 1) RESPECT USER MOTION PREFERENCE
// ===================================================================
function reduceMotionRespect() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const canvas = $('.particles-canvas');
    if (canvas) canvas.style.display = 'none';
    document.documentElement.style.scrollBehavior = 'auto';
  }
}

// ===================================================================
// 2) SMOOTH SCROLL
// ===================================================================
function initSmoothScroll() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href === '#' || href === '#!') return;
    const target = $(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ===================================================================
// 3) HERO ENTRANCE (typed-like) + subtitle fade
// ===================================================================
function heroEntrance() {
  const hero = $('#hero');
  if (!hero) return;
  const headline = hero.querySelector('h2');
  const sub = hero.querySelector('p');
  if (!headline) return;

  const text = headline.textContent.trim();
  headline.textContent = '';

  text.split('').forEach(ch => {
    const span = document.createElement('span');
    span.textContent = ch;
    span.style.opacity = 0;
    span.style.display = 'inline-block';
    span.style.transform = 'translateY(8px)';
    span.style.transition = 'opacity .35s ease, transform .45s cubic-bezier(.2,.8,.2,1)';
    headline.appendChild(span);
  });

  Array.from(headline.children).forEach((s, i) => {
    setTimeout(() => {
      s.style.opacity = '1';
      s.style.transform = 'translateY(0)';
    }, 45 * i);
  });

  setTimeout(() => {
    if (sub) sub.classList.add('visible');
    const heroBtn = hero.querySelector('.btn');
    if (heroBtn) heroBtn.classList.add('visible');
  }, 45 * headline.children.length + 200);
}

// ===================================================================
// 4) PARTICLES GOLD (canvas)
// ===================================================================
function initParticles() {
  const hero = $('#hero');
  if (!hero) return;
  let canvas = $('.particles-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'particles-canvas';
    Object.assign(canvas.style, {
      position: 'absolute', left: 0, top: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0
    });
    hero.style.position = 'relative';
    hero.insertBefore(canvas, hero.firstChild);
  }

  const ctx = canvas.getContext('2d');
  let W, H, DPR;
  const particles = [];
  const maxParticles = 36;

  function resize() {
    DPR = window.devicePixelRatio || 1;
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', throttle(resize, 120));

  function spawn() {
    if (particles.length >= maxParticles) return;
    const size = 2 + Math.random() * 6;
    particles.push({
      x: Math.random() * W,
      y: H + Math.random() * 80,
      vx: (Math.random() - 0.5) * 0.35,
      vy: - (0.2 + Math.random() * 0.8),
      life: 80 + Math.random() * 120,
      size,
      alpha: 0
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
      p.alpha = Math.min(1, p.alpha + 0.01);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      g.addColorStop(0, `rgba(212,175,55,${0.95*p.alpha})`);
      g.addColorStop(0.5, `rgba(212,175,55,${0.25*p.alpha})`);
      g.addColorStop(1, `rgba(212,175,55,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      if (p.life <= 0 || p.y < -40) particles.splice(i,1);
    });
    if (Math.random() < 0.45) spawn();
    requestAnimationFrame(draw);
  }
  draw();
}

// ===================================================================
// 5) PARALLAX HERO BACKGROUND
// ===================================================================
function initParallax() {
  const hero = $('#hero');
  if (!hero) return;
  const maxShift = 40;
  window.addEventListener('scroll', throttle(() => {
    const rect = hero.getBoundingClientRect();
    const winH = window.innerHeight;
    if (rect.bottom > 0 && rect.top < winH) {
      const percent = (winH - rect.top) / (winH + rect.height);
      const shift = (percent - 0.5) * maxShift;
      hero.style.backgroundPosition = `center ${50 + shift}%`;
    }
  }, 16));
}

// ===================================================================
// 6) SCROLL-REVEAL
// ===================================================================
function initScrollReveal() {
  const items = $$('section, .card, #portfolio img, #depoimentos blockquote');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(14px)';
    el.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.2,.8,.2,1)';
    io.observe(el);
  });
}

// ===================================================================
// 7) CARD TILT (hover)
 // ===================================================================
function initCardTilt() {
  const cards = $$('.card');
  cards.forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.addEventListener('pointermove', throttle(e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * 6;
      const ry = (px - 0.5) * -10;
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      card.style.boxShadow = `${-ry}px ${rx}px 30px rgba(17,17,17,0.08)`;
    }, 12));
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

// ===================================================================
// 8) PORTFOLIO LIGHTBOX
// ===================================================================
function initPortfolioLightbox() {
  const galleryImgs = $$('#portfolio img');
  if (!galleryImgs.length) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  Object.assign(lightbox.style, {
    position: 'fixed', inset: 0, display: 'none', placeItems: 'center',
    background: 'rgba(0,0,0,0.8)', zIndex: 9999, padding: '30px'
  });
  const inner = document.createElement('div');
  inner.style.cssText = 'max-width:1100px;width:100%;text-align:center;';
  const img = document.createElement('img');
  Object.assign(img.style, {
    maxWidth: '100%', border: '4px solid rgba(212,175,55,0.95)', borderRadius: '10px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
  });
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Fechar';
  closeBtn.style.cssText = 'margin-top:18px;padding:10px 18px;border-radius:8px;border:0;background:#d4af37;color:#111;font-weight:700;cursor:pointer;';
  inner.appendChild(img);
  inner.appendChild(closeBtn);
  lightbox.appendChild(inner);
  document.body.appendChild(lightbox);

  galleryImgs.forEach(g => {
    g.style.cursor = 'zoom-in';
    g.addEventListener('click', () => {
      img.src = g.src;
      lightbox.style.display = 'grid';
      setTimeout(() => lightbox.style.opacity = '1', 20);
    });
  });
  function closeLB() {
    lightbox.style.opacity = '0';
    setTimeout(() => lightbox.style.display = 'none', 220);
  }
  lightbox.addEventListener('click', e => { if(e.target === lightbox) closeLB(); });
  closeBtn.addEventListener('click', closeLB);
}

// ===================================================================
// 9) FORM ENHANCEMENTS
// ===================================================================
function initFormEnhancements() {
  const form = $('form');
  if (!form) return;

  const fields = {
    nome: form.querySelector('[name="nome"]'),
    email: form.querySelector('[name="email"]'),
    telefone: form.querySelector('[name="telefone"]'),
    mensagem: form.querySelector('[name="mensagem"]')
  };
  const submitBtn = form.querySelector('button[type="submit"]');
  const draftKey = 'atelie_orcamento_draft_v1';

  // Restore draft
  const saved = localStorage.getItem(draftKey);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      Object.keys(fields).forEach(k => { if(data[k]) fields[k].value = data[k]; });
    } catch(e){}
  }

  // Save draft
  let timer;
  form.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const data = {};
      Object.keys(fields).forEach(k => data[k] = fields[k].value || '');
      localStorage.setItem(draftKey, JSON.stringify(data));
    }, 600);
  });

  // Validation & submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!fields.nome.value.trim()) return shake(fields.nome, 'Informe seu nome.');
    if (!validateEmail(fields.email.value)) return shake(fields.email, 'E-mail inválido.');
    if (!fields.telefone.value.trim()) return shake(fields.telefone, 'Informe um telefone/WhatsApp.');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    setTimeout(() => {
      submitBtn.textContent = 'Enviado ✓';
      submitBtn.style.background = '#b9972d';
      localStorage.removeItem(draftKey);
      showModalSuccess();
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Pedido';
        submitBtn.style.background = '';
        form.reset();
      }, 1800);
    }, 900);
  });

  function shake(el, msg) {
    el.focus();
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 600);
    const tip = document.createElement('div');
    tip.className = 'inline-tip';
    tip.textContent = msg;
    tip.style.cssText = 'position:absolute;background:#111;color:#fff;padding:8px 10px;border-radius:6px;font-size:0.9rem;transform:translateY(-110%)';
    const rect = el.getBoundingClientRect();
    tip.style.left = rect.left + window.scrollX + 'px';
    tip.style.top = rect.top + window.scrollY - 10 + 'px';
    document.body.appendChild(tip);
    setTimeout(() => tip.remove(), 2200);
  }

  function validateEmail(v){ return /\S+@\S+\.\S+/.test(v); }

  function showModalSuccess() {
    let modal = $('.modal-success');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal-success';
      Object.assign(modal.style, { position: 'fixed', inset: 0, display:'grid', placeItems:'center', background:'rgba(0,0,0,0.5)', zIndex:99999, opacity:0 });
      const card = document.createElement('div');
      card.style.cssText = 'background:#fff;padding:28px;border-radius:12px;max-width:520px;text-align:center;box-shadow:0 30px 60px rgba(0,0,0,0.25)';
      const h = document.createElement('h3'); h.textContent='Pedido enviado com sucesso!'; h.style.color='#111';
      const p = document.createElement('p'); p.textContent='Obrigado! Em até 24h responderemos com seu orçamento.'; p.style.color='#444';
      const ok = document.createElement('button'); ok.textContent='Fechar';
      ok.style.cssText='margin-top:18px;padding:10px 18px;border-radius:8px;border:0;background:#d4af37;color:#111;font-weight:700;cursor:pointer;';
      ok.addEventListener('click', close);
      card.append(h,p,ok);
      modal.appendChild(card);
      document.body.appendChild(modal);
      setTimeout(()=>modal.style.opacity='1',20);
    } else {
      modal.style.display='grid';
      setTimeout(()=>modal.style.opacity='1',20);
    }
    function close(){ modal.style.opacity='0'; setTimeout(()=>modal.style.display='none',240); }
  }
}

// ===================================================================
// 10) WhatsApp flutuante
// ===================================================================
function initWhatsAppFloat() {
  const whatsapp = document.querySelector('.whatsapp-float');
  if (!whatsapp) return;
  whatsapp.style.opacity = 0;
  whatsapp.style.transform = 'translateY(100px)';
  setTimeout(() => {
    whatsapp.style.transition = 'all 0.6s ease-out';
    whatsapp.style.opacity = 1;
    whatsapp.style.transform = 'translateY(0)';
  }, 800);
}

// ===================================================================
// 11) Utility animation
// ===================================================================
function shake(el){ el.classList.add('shake'); setTimeout(()=>el.classList.remove('shake'),700); }

// ===================================================================
// 12) Global smooth scroll links & on-scroll reveal
// ===================================================================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    document.querySelector(link.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
  });
});

const animatedElements = $$('.reveal');
const revealOnScroll = () => {
  const winH = window.innerHeight;
  animatedElements.forEach(el => {
    const pos = el.getBoundingClientRect().top;
    if(pos < winH - 100) el.classList.add('active');
  });
};
window.addEventListener('scroll', revealOnScroll);
revealOnScroll();

// ===================================================================
// 13) Hero parallax (alternative)
window.addEventListener('scroll', () => {
  const hero = $('#hero');
  if(hero) hero.style.backgroundPositionY = window.scrollY * 0.5 + 'px';
});

// ===================================================================
// 14) Button hover particles (CSS vars)
// ===================================================================
$$('.btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty('--x', `${e.clientX - rect.left}px`);
    btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });
});
