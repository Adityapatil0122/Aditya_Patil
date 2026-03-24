// ==========================================
// INIT — GSAP + LENIS
// ==========================================
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothTouch: false,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ==========================================
// CUSTOM CURSOR — SVG Arrow with direction rotation
// ==========================================
const cursorEl = document.getElementById('custom-cursor');
let posX = 0, posY = 0;
let lastX = 0, lastY = 0;
let currentAngle = 0;
let targetAngle = 0;

document.addEventListener('mousemove', (e) => {
    posX = e.clientX;
    posY = e.clientY;
    const dx = posX - lastX;
    const dy = posY - lastY;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        // atan2 gives angle of movement; +90 aligns upward-pointing arrow to face direction
        targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    }
    lastX = posX;
    lastY = posY;
});

(function tick() {
    let diff = targetAngle - currentAngle;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    currentAngle += diff * 0.18;
    cursorEl.style.left = (posX - 12) + 'px';
    cursorEl.style.top  = (posY - 3) + 'px';
    cursorEl.style.transform = `rotate(${currentAngle}deg)`;
    requestAnimationFrame(tick);
})();

if ('ontouchstart' in window) cursorEl.style.display = 'none';

// ==========================================
// TEXT SPLITTERS
// ==========================================
function splitChars(el) {
    const text = el.textContent;
    el.innerHTML = '';
    return [...text].map(ch => {
        const s = document.createElement('span');
        s.className = 'char';
        s.style.display = 'inline-block';
        s.textContent = ch === ' ' ? '\u00A0' : ch;
        el.appendChild(s);
        return s;
    });
}

function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = '';
    return words.map(w => {
        const s = document.createElement('span');
        s.className = 'word';
        s.style.cssText = 'display:inline-block; margin-right:0.35em;';
        s.textContent = w;
        el.appendChild(s);
        return s;
    });
}

// ==========================================
// PRELOADER
// ==========================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const tl = gsap.timeline();
    tl.to('.preloader-text', {
        opacity: 0,
        duration: 0.3,
        delay: 0.6,
        ease: 'power2.in'
    })
    .to(preloader, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power4.inOut',
        onComplete: () => {
            preloader.remove();
            animateHero();
        }
    });
});

// ==========================================
// HERO ANIMATION
// ==========================================
function animateHero() {
    // Split hero name into characters and set initial state
    const nameEl = document.querySelector('.hero-name');
    const chars = splitChars(nameEl);
    gsap.set(chars, { opacity: 0, y: 60, rotateX: -90 });
    nameEl.style.opacity = '1';

    const tl = gsap.timeline();

    tl.fromTo('.hero-greeting',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    )
    .to(chars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.7,
        stagger: 0.035,
        ease: 'back.out(1.7)'
    }, '-=0.3')
    .fromTo('.hero-title',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
        '-=0.3'
    )
    .fromTo('.hero-location',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' },
        '-=0.3'
    )
    .fromTo('.hero-cta',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.2'
    );
}

// ==========================================
// SCROLL PROGRESS BAR
// ==========================================
ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
        document.getElementById('scroll-progress').style.width =
            (self.progress * 100) + '%';
    }
});

// ==========================================
// HERO PARTICLES CANVAS
// ==========================================
function initHeroParticles() {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const isMobile = window.innerWidth <= 768;
    const COUNT = isMobile ? 18 : 45;
    let particles = [];

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.4;
            this.speedX = (Math.random() - 0.5) * 0.28;
            this.speedY = (Math.random() - 0.5) * 0.28;
            this.opacity = Math.random() * 0.22 + 0.04;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,255,0,${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < COUNT; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(200,255,0,${0.035 * (1 - dist / 130)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}
initHeroParticles();

// ==========================================
// HERO PARALLAX (GSAP ScrollTrigger — Lenis compatible)
// ==========================================
gsap.to('.hero-content', {
    y: 100,
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
    }
});

// ==========================================
// SECTION TITLE WORD-SPLIT REVEAL
// ==========================================
document.querySelectorAll('.section-title').forEach(title => {
    const words = splitWords(title);
    gsap.set(words, { opacity: 0, y: 24 });
    gsap.to(words, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: title,
            start: 'top 88%',
            toggleActions: 'play none none none',
        }
    });
});

// ==========================================
// SCROLL REVEALS (replaces IntersectionObserver)
// ==========================================
gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none',
            }
        }
    );
});

// ==========================================
// HORIZONTAL SCROLL PROJECTS (desktop only)
// ==========================================
function initHorizontalScroll() {
    if (window.innerWidth <= 768) return;
    const wrapper = document.querySelector('.projects-h-wrapper');
    const track = document.querySelector('.projects-h-track');
    if (!wrapper || !track) return;

    const scrollDist = track.scrollWidth - wrapper.offsetWidth;
    if (scrollDist <= 0) return;

    gsap.to(track, {
        x: -scrollDist,
        ease: 'none',
        scrollTrigger: {
            trigger: wrapper,
            start: 'top top',
            end: () => `+=${scrollDist}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
        }
    });
}
initHorizontalScroll();

// ==========================================
// MOBILE HAMBURGER MENU
// ==========================================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    if (mobileMenu.classList.contains('active')) {
        lenis.stop();
    } else {
        lenis.start();
    }
});

document.querySelectorAll('.mobile-menu-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        lenis.start();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) lenis.scrollTo(target, { offset: -80 });
    });
});

// ==========================================
// NAVIGATION
// ==========================================
const nav = document.querySelector('.nav');

// Scrolled border via Lenis
lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('scrolled', scroll > 50);
});

// Active nav highlight
const navSections = ['about', 'experience', 'projects', 'education', 'contact'];
navSections.forEach(id => {
    const section = document.getElementById(id);
    if (!section) return;
    ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveNav(id),
        onEnterBack: () => setActiveNav(id),
    });
});

function setActiveNav(id) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) link.classList.add('active');
}

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) lenis.scrollTo(target, { offset: -80 });
    });
});

// ==========================================
// MAGNETIC EFFECT (desktop only)
// ==========================================
if (!('ontouchstart' in window)) document.querySelectorAll('.btn, .contact-link, .nav-link, .footer-icon').forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const strength = el.classList.contains('nav-link') ? 0.22 : 0.15;
        gsap.to(el, {
            x: x * strength,
            y: y * strength,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true,
        });
    });

    el.addEventListener('mouseleave', () => {
        gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'back.out(2)',
            overwrite: true,
        });
    });
});

// ==========================================
// RESUME OUTDATED BADGE
// ==========================================
(function checkResumeAge() {
    const btn = document.querySelector('.btn-resume');
    if (!btn) return;
    const diffDays = (Date.now() - new Date(btn.dataset.uploadDate)) / 86400000;
    if (diffDays > 30) {
        document.getElementById('resume-badge').style.display = 'inline-block';
    }
})();

// ==========================================
// KONAMI CODE EASTER EGG
// ==========================================
const konamiCode = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
    'KeyB','KeyA'
];
let konamiIdx = 0;

document.addEventListener('keydown', (e) => {
    if (e.code === konamiCode[konamiIdx]) {
        konamiIdx++;
        if (konamiIdx === konamiCode.length) {
            konamiIdx = 0;
            triggerEasterEgg();
        }
    } else {
        konamiIdx = 0;
    }
});

function triggerEasterEgg() {
    for (let i = 0; i < 90; i++) {
        const c = document.createElement('div');
        const accent = Math.random() > 0.35;
        c.style.cssText = `
            position:fixed;
            top:-12px;
            left:${Math.random() * 100}vw;
            width:${Math.random() * 9 + 3}px;
            height:${Math.random() * 9 + 3}px;
            background:${accent ? '#c8ff00' : '#e8e8e8'};
            z-index:99999;
            pointer-events:none;
            border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        `;
        document.body.appendChild(c);
        gsap.to(c, {
            y: window.innerHeight + 50,
            x: (Math.random() - 0.5) * 350,
            rotation: Math.random() * 720,
            opacity: 0,
            duration: Math.random() * 2 + 1.5,
            ease: 'power1.in',
            onComplete: () => c.remove(),
        });
    }
}
