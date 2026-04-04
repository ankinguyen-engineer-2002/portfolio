/* ============================================
   ARIC NGUYEN — SPACE PORTFOLIO INTERACTIONS
   ============================================ */

(function () {
    'use strict';

    // --- State ---
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let glowX = mouseX;
    let glowY = mouseY;

    // --- Elements ---
    const cursorGlow = document.getElementById('cursorGlow');
    const cursorDot = document.getElementById('cursorDot');
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    // ========================================
    // STARFIELD
    // ========================================
    const stars = [];
    const STAR_COUNT = 300;
    const shootingStars = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStars() {
        stars.length = 0;
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.8 + 0.2,
                opacity: Math.random() * 0.7 + 0.1,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinkleOffset: Math.random() * Math.PI * 2,
                parallaxFactor: Math.random() * 0.3 + 0.05,
                baseX: 0,
                baseY: 0,
                // Color temperature
                r: 180 + Math.random() * 75,
                g: 180 + Math.random() * 75,
                b: 200 + Math.random() * 55,
            });
            stars[i].baseX = stars[i].x;
            stars[i].baseY = stars[i].y;
        }
    }

    function createShootingStar() {
        if (shootingStars.length > 2) return;
        const ss = {
            x: Math.random() * canvas.width * 0.8,
            y: Math.random() * canvas.height * 0.3,
            length: 80 + Math.random() * 120,
            speed: 8 + Math.random() * 6,
            angle: (Math.PI / 6) + Math.random() * (Math.PI / 6),
            opacity: 1,
            life: 0,
            maxLife: 40 + Math.random() * 30,
        };
        shootingStars.push(ss);
    }

    // Nebula clouds
    function drawNebula() {
        const time = Date.now() * 0.0001;
        // Subtle nebula gradients
        const gradient1 = ctx.createRadialGradient(
            canvas.width * 0.2 + Math.sin(time) * 50,
            canvas.height * 0.3 + Math.cos(time) * 30,
            0,
            canvas.width * 0.2,
            canvas.height * 0.3,
            300
        );
        gradient1.addColorStop(0, 'rgba(108, 99, 255, 0.015)');
        gradient1.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient2 = ctx.createRadialGradient(
            canvas.width * 0.8 + Math.cos(time * 0.7) * 40,
            canvas.height * 0.6 + Math.sin(time * 0.7) * 40,
            0,
            canvas.width * 0.8,
            canvas.height * 0.6,
            250
        );
        gradient2.addColorStop(0, 'rgba(0, 212, 255, 0.01)');
        gradient2.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function animateStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawNebula();

        const time = Date.now();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const dx = (mouseX - centerX) / centerX;
        const dy = (mouseY - centerY) / centerY;

        // Draw stars
        for (const star of stars) {
            // Parallax based on mouse
            const px = star.baseX - dx * 30 * star.parallaxFactor;
            const py = star.baseY - dy * 30 * star.parallaxFactor;
            star.x = px;
            star.y = py;

            // Twinkle
            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.4 + 0.6;
            const alpha = star.opacity * twinkle;

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${star.r}, ${star.g}, ${star.b}, ${alpha})`;
            ctx.fill();

            // Glow for larger stars
            if (star.size > 1.2) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${star.r}, ${star.g}, ${star.b}, ${alpha * 0.08})`;
                ctx.fill();
            }
        }

        // Draw shooting stars
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            ss.life++;
            const progress = ss.life / ss.maxLife;
            ss.x += Math.cos(ss.angle) * ss.speed;
            ss.y += Math.sin(ss.angle) * ss.speed;
            ss.opacity = 1 - progress;

            const tailX = ss.x - Math.cos(ss.angle) * ss.length * (1 - progress);
            const tailY = ss.y - Math.sin(ss.angle) * ss.length * (1 - progress);

            const gradient = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(1, `rgba(200, 210, 255, ${ss.opacity * 0.8})`);

            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(ss.x, ss.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Head glow
            ctx.beginPath();
            ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${ss.opacity})`;
            ctx.fill();

            if (ss.life >= ss.maxLife) {
                shootingStars.splice(i, 1);
            }
        }

        requestAnimationFrame(animateStars);
    }

    // Random shooting stars
    setInterval(() => {
        if (Math.random() > 0.4) createShootingStar();
    }, 3000);

    resizeCanvas();
    createStars();
    animateStars();

    window.addEventListener('resize', () => {
        resizeCanvas();
        createStars();
    });

    // ========================================
    // CURSOR
    // ========================================
    function animateCursor() {
        // Smooth follow
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;

        cursorDot.style.left = cursorX + 'px';
        cursorDot.style.top = cursorY + 'px';
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';

        requestAnimationFrame(animateCursor);
    }

    if (window.innerWidth > 768) {
        animateCursor();
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Hover effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .skill-tag, .info-card, .edu-card, .contact-link, .btn');
    interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => cursorDot.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursorDot.classList.remove('hovering'));
    });

    // ========================================
    // NAV
    // ========================================
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    });

    navToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    document.querySelectorAll('.mobile-link').forEach((link) => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // ========================================
    // SCROLL REVEAL
    // ========================================
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Stagger children if category
                    const delay = entry.target.style.getPropertyValue('--cat-delay') ||
                                  entry.target.style.getPropertyValue('--item-delay') || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay * 100);
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => {
        revealObserver.observe(el);
    });

    // ========================================
    // COUNTER ANIMATION
    // ========================================
    function animateCounters() {
        document.querySelectorAll('.stat-number').forEach((counter) => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const start = Date.now();

            function update() {
                const elapsed = Date.now() - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(target * eased);

                if (target >= 1000) {
                    counter.textContent = current.toLocaleString();
                } else {
                    counter.textContent = current;
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }
            update();
        });
    }

    const statsObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // ========================================
    // SMOOTH ANCHOR SCROLL
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ========================================
    // MAGNETIC EFFECT ON BUTTONS
    // ========================================
    document.querySelectorAll('.btn').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // ========================================
    // TILT EFFECT ON CARDS
    // ========================================
    document.querySelectorAll('.edu-card, .skill-category').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ========================================
    // NAV ACTIVE LINK TRACKING
    // ========================================
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach((link) => {
                        link.style.color = link.getAttribute('href') === `#${id}`
                            ? 'var(--text-primary)'
                            : '';
                    });
                }
            });
        },
        { threshold: 0.3 }
    );

    sections.forEach((section) => sectionObserver.observe(section));

})();
