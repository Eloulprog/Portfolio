/**
 * Portfolio Animations
 * Elouen Le Pendeven
 */

// ===================================
// HEADER SCROLL EFFECT
// ===================================
const initHeaderScroll = () => {
    const header = document.getElementById('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
};

const initScrollProgress = () => {
    let progressBar = document.querySelector('.scroll-progress');

    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);
    }

    const updateProgress = () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
};

// ===================================
// MOBILE MENU
// ===================================
const initMobileMenu = () => {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (!mobileMenuBtn || !mobileNav) return;

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
};

// ===================================
// MODALS
// ===================================
const initModals = () => {
    // Close modal with button
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            modal.classList.remove('active');
            setTimeout(() => {
                if (!modal.classList.contains('active')) modal.style.display = 'none';
            }, 300);
            document.body.style.overflow = '';
        });
    });

    // Close modal by clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => {
                    if (!modal.classList.contains('active')) modal.style.display = 'none';
                }, 300);
                document.body.style.overflow = '';
            }
        });
    });

    // Close modal with Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(m => {
                m.classList.remove('active');
                setTimeout(() => {
                    if (!m.classList.contains('active')) m.style.display = 'none';
                }, 300);
            });
            document.getElementById('mobileMenuBtn')?.classList.remove('active');
            document.getElementById('mobileNav')?.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
};


// ===================================
// SCROLL REVEAL ANIMATIONS
// ===================================
const initScrollReveal = () => {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active', 'revealed');

                // If it's a parent of staggered items, reveal them sequentially
                const staggerItems = entry.target.querySelectorAll('.stagger-item');
                if (staggerItems.length > 0) {
                    staggerItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('reveal-active');
                        }, index * 100);
                    });
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.reveal-on-scroll, .bento-grid, .photo-grid, .skill-card').forEach(el => {
        revealObserver.observe(el);
    });
};

const initCounters = () => {
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const num = parseInt(entry.target.textContent);
                if (!isNaN(num)) {
                    let start = 0;
                    const duration = 2000;
                    const increment = num / (duration / 16);
                    const update = () => {
                        start += increment;
                        if (start < num) {
                            entry.target.textContent = Math.floor(start) + (entry.target.textContent.includes('%') ? '%' : '+');
                            requestAnimationFrame(update);
                        } else {
                            entry.target.textContent = num + (entry.target.textContent.includes('%') ? '%' : '+');
                        }
                    };
                    update();
                }
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat-number').forEach(el => statObserver.observe(el));
};

const initMagneticButtons = () => {
    document.querySelectorAll('.btn, .nav-cta, .social-icon, .mobile-menu-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Move button (Reduced by 50%)
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;

            // Move text/icon slightly less for depth
            const inner = btn.querySelector('span, i');
            if (inner) {
                inner.style.transform = `translate(${x * 0.05}px, ${y * 0.05}px)`;
            }
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            const inner = btn.querySelector('span, i');
            if (inner) inner.style.transform = '';
        });
    });
};

const initInteractiveCards = () => {
    document.querySelectorAll('.bento-item, .carousel-item').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
};

const initProjectFilters = () => {
    const filterButtons = document.querySelectorAll('.project-filter');
    const projectCards = document.querySelectorAll('.bento-item[data-tags]');
    const projectGrid = document.querySelector('.bento-grid');
    const countTarget = document.getElementById('projectsCount');
    const countLabel = document.getElementById('projectsCountLabel');
    const emptyState = document.getElementById('projectsEmpty');

    if (!filterButtons.length || !projectCards.length) return;

    const applyFilter = (filter) => {
        let visibleCount = 0;

        projectCards.forEach((card) => {
            const tags = (card.dataset.tags || '').split(/\s+/).filter(Boolean);
            const isMatch = filter === 'all' || tags.includes(filter);

            card.classList.toggle('is-hidden', !isMatch);
            if (isMatch) visibleCount += 1;
        });

        filterButtons.forEach((button) => {
            const isActive = button.dataset.filter === filter;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        if (projectGrid) {
            projectGrid.classList.toggle('is-filtered', filter !== 'all');
        }

        if (countTarget) {
            countTarget.textContent = String(visibleCount);
        }

        if (countLabel) {
            countLabel.textContent = visibleCount > 1 ? 'projets' : 'projet';
        }

        if (emptyState) {
            emptyState.hidden = visibleCount > 0;
        }
    };

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            applyFilter(button.dataset.filter || 'all');
        });
    });

    applyFilter('all');
};

const initSectionSpy = () => {
    const trackedLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"], .mobile-nav a[href^="#"]'));
    if (!trackedLinks.length) return;

    const sections = trackedLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if (!sections.length) return;

    const setActiveLink = (id) => {
        trackedLinks.forEach((link) => {
            link.classList.toggle('is-current', link.getAttribute('href') === `#${id}`);
        });
    };

    const observer = new IntersectionObserver((entries) => {
        const visibleEntry = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
            setActiveLink(visibleEntry.target.id);
        }
    }, {
        threshold: [0.2, 0.45, 0.7],
        rootMargin: '-18% 0px -45% 0px'
    });

    sections.forEach((section) => observer.observe(section));
};

const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#' || href.length < 2) return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
};

const initFloatingIcons = () => {
    document.querySelectorAll('.software-icon-wrapper img').forEach((icon, i) => {
        icon.style.animation = `float ${3 + (i % 3)}s ease-in-out infinite alternate`;
        icon.style.animationDelay = `${(i % 5) * 0.2}s`;
    });
};

const initLightbox = () => {
    const lightbox = document.getElementById('modal-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxVid = document.getElementById('lightbox-video');
    const lightboxAnalysis = document.getElementById('lightbox-analysis');

    if (!lightbox || !lightboxImg) return;

    const handleLightboxOpen = (trigger) => {
        const img = trigger.querySelector('img');
        const video = trigger.dataset.video;
        const analysis = trigger.dataset.analysis;

        if (analysis && lightboxAnalysis) {
            lightboxAnalysis.textContent = analysis;
        }

        if (video && lightboxVid) {
            lightboxImg.style.display = 'none';
            lightboxVid.style.display = 'block';
            lightboxVid.src = video;
            lightboxVid.play();
        } else if (img) {
            if (lightboxVid) {
                lightboxVid.style.display = 'none';
                lightboxVid.pause();
            }
            lightboxImg.style.display = 'block';
            lightboxImg.src = img.src;
        }
        lightbox.style.display = 'flex';
        setTimeout(() => {
            lightbox.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden';

        // Focus close button
        const closeBtn = lightbox.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    };

    document.querySelectorAll('.js-lightbox-trigger').forEach(trigger => {
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.setAttribute('aria-controls', 'modal-lightbox');

        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            handleLightboxOpen(trigger);
        });

        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLightboxOpen(trigger);
            }
        });
    });

    // The closing logic is already handled by initModals() above for all .modal-close buttons.
    // However, if we need specific lightbox pausing logic:
    const closeBtn = lightbox.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (lightboxVid) lightboxVid.pause();
        });
    }

    // Also stop video if clicking outside (handled by initModals, we just add the pause)
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox && lightboxVid) {
            lightboxVid.pause();
        }
    });
};

const initCarousel = () => {
    const carousel = document.getElementById('photo-carousel');
    const track = carousel?.querySelector('.carousel-track');
    const items = track?.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const dotsContainer = document.querySelector('.carousel-pagination');
    const progressBlock = document.querySelector('.carousel-progress-bar');
    const autoplayToggle = document.getElementById('autoplay-toggle');

    if (!carousel || !track || !items.length) return;

    let currentIndex = 0;
    let autoplayInterval;
    let isAutoplay = true;

    // Create dots
    items.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer?.appendChild(dot);
    });

    const dots = dotsContainer?.querySelectorAll('.carousel-dot');

    const updateCarousel = () => {
        const itemWidth = items[0].getBoundingClientRect().width;
        const gap = parseInt(window.getComputedStyle(track).gap) || 0;
        track.style.transform = `translateX(-${currentIndex * (itemWidth + gap)}px)`;

        // Update dots
        dots?.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });

        // Update progress bar
        if (progressBlock) {
            const progress = ((currentIndex + 1) / items.length) * 100;
            progressBlock.style.width = `${progress}%`;
        }
    };

    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % items.length;
        updateCarousel();
    };

    const prevSlide = () => {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateCarousel();
    };

    const goToSlide = (index) => {
        currentIndex = index;
        updateCarousel();
        if (isAutoplay) resetAutoplay();
    };

    const startAutoplay = () => {
        autoplayInterval = setInterval(nextSlide, 5000);
        carousel.classList.add('is-autoplay');
    };

    const stopAutoplay = () => {
        clearInterval(autoplayInterval);
        carousel.classList.remove('is-autoplay');
    };

    const resetAutoplay = () => {
        stopAutoplay();
        startAutoplay();
    };

    nextBtn?.addEventListener('click', () => {
        nextSlide();
        if (isAutoplay) resetAutoplay();
    });

    prevBtn?.addEventListener('click', () => {
        prevSlide();
        if (isAutoplay) resetAutoplay();
    });

    autoplayToggle?.addEventListener('click', () => {
        isAutoplay = !isAutoplay;
        const icon = autoplayToggle.querySelector('i');
        if (isAutoplay) {
            startAutoplay();
            icon.classList.replace('fa-play', 'fa-pause');
            autoplayToggle.setAttribute('aria-pressed', 'true');
        } else {
            stopAutoplay();
            icon.classList.replace('fa-pause', 'fa-play');
            autoplayToggle.setAttribute('aria-pressed', 'false');
        }
    });

    // Touch support (Simple)
    let startX = 0;
    carousel.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    carousel.addEventListener('touchend', e => {
        const endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) nextSlide();
        else if (endX - startX > 50) prevSlide();
        if (isAutoplay) resetAutoplay();
    });

    // Init state
    updateCarousel();
    if (isAutoplay) startAutoplay();

    // Listen for resize to update width
    window.addEventListener('resize', updateCarousel);
};

// ===================================
// INITIALIZE ALL ANIMATIONS
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initHeaderScroll();
    initMobileMenu();
    initModals();
    initSmoothScroll();
    initScrollReveal();
    initProjectFilters();
    initSectionSpy();
    initCounters();
    initMagneticButtons();
    initInteractiveCards();
    initFloatingIcons();
    initLightbox();
    initCarousel();
});
