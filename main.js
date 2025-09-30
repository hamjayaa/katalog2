// main.js

gsap.registerPlugin(ScrollTrigger);

// --- HERO SECTION ANIMATIONS ---
function setupHeroAnimations() {
    const titleWrapper = document.querySelector("#heroTitleWrapper");
    const scrollCueBtn = document.querySelector("#scrollCue");
    const heroPin = document.querySelector("#hero-pin");
    const mumtasText = document.querySelector("#mumtas-bg");
    const heroContent = document.querySelector(".hero-title-content");
    const photoCards = gsap.utils.toArray(".product-photo-card");
    
    // Floating text effect
    if (titleWrapper) gsap.to(titleWrapper, { y: 5, ease: "sine.inOut", repeat: -1, yoyo: true, duration: 4 });
    if (scrollCueBtn) gsap.to(scrollCueBtn, { y: 10, ease: "power1.inOut", repeat: -1, yoyo: true, duration: 0.8 });
    if (titleWrapper) gsap.fromTo(titleWrapper, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" });

    // Scroll-based pinning and animations
    if (heroPin) {
        const scrollDuration = heroPin.offsetHeight * 1.8;
        const tl = gsap.timeline({
            scrollTrigger: { trigger: heroPin, start: "top top", end: `+=${scrollDuration}`, scrub: 1, pin: true }
        });
        tl.to(mumtasText, { rotateX: 0, filter: 'blur(0px)', opacity: 0.8, ease: "power1.out" }, 0)
          .to(photoCards, { y: 0, opacity: 1, stagger: { each: 0.15, from: "random" }, duration: 0.5, ease: "back.out(1.2)" }, 0.1)
          .to(photoCards, { y: -50, opacity: 0, stagger: 0.05, duration: 0.3, ease: "power1.in" }, 0.7)
          .to(heroContent, { y: -150, opacity: 0, duration: 0.4, ease: "power2.in" }, 0.6);
    }
}

// --- HORIZONTAL CARDS SECTION (SCROLL & EXPAND) ---
function setupCardFeatures() {
    const featureSection = document.getElementById('features-section');
    const scrollContainer = document.getElementById('card-scroll-container');
    const closeBtn = document.getElementById('close-card-btn');
    const navArrows = document.getElementById('nav-arrows');
    const prevBtn = document.getElementById('btnPrev');
    const nextBtn = document.getElementById('btnNext');

    if (!featureSection || !scrollContainer) return;
    
    const cardWrappers = Array.from(scrollContainer.children).filter(el => el.classList.contains('flex-shrink-0') && !el.classList.contains('h-1'));
    const originalWidthData = new Map();

    function getOriginalWidth(cardElement) {
        if (originalWidthData.has(cardElement)) return originalWidthData.get(cardElement);
        const widthPx = cardElement.getBoundingClientRect().width;
        originalWidthData.set(cardElement, widthPx);
        return widthPx;
    }

    function openCard(cardElement) {
        if (featureSection.classList.contains('is-card-open')) return;
        featureSection.classList.add('is-card-open');
        cardElement.classList.add('is-selected');
        
        const cardDetail = cardElement.querySelector('.product-card-detail');
        gsap.to(navArrows, { opacity: 0, duration: 0.3, pointerEvents: 'none' });

        const targetWidth = scrollContainer.getBoundingClientRect().width * 0.7;
        
        gsap.timeline({ defaults: { duration: 0.7, ease: "power2.inOut" } })
            .to(cardElement, { width: targetWidth, zIndex: 20 }, 'start')
            .add(() => cardDetail.classList.add('is-expanded'), 'start+=0.3');
        
        cardWrappers.forEach(other => { if (other !== cardElement) other.classList.add('is-disabled'); });
    }

    function closeCard(cardElement) {
        if (!cardElement || !featureSection.classList.contains('is-card-open')) return;
        const originalWidth = getOriginalWidth(cardElement);
        const cardDetail = cardElement.querySelector('.product-card-detail');
        cardDetail.classList.remove('is-expanded');
        
        gsap.timeline({
            defaults: { duration: 0.7, ease: "power2.inOut" },
            onComplete: () => {
                featureSection.classList.remove('is-card-open');
                cardElement.classList.remove('is-selected');
                cardElement.style.zIndex = '';
                cardElement.style.width = '';
                gsap.to(navArrows, { opacity: 1, duration: 0.3, pointerEvents: 'all' });
                updateArrows();
            }
        }).to(cardElement, { width: originalWidth }, 'start');

        cardWrappers.forEach(other => other.classList.remove('is-disabled'));
    }

    cardWrappers.forEach(card => {
        getOriginalWidth(card);
        card.addEventListener('click', () => {
            if (featureSection.classList.contains('is-card-open') && card.classList.contains('is-selected')) {
                closeCard(card);
            } else if (!featureSection.classList.contains('is-card-open')) {
                openCard(card);
            }
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', () => {
        const selectedCard = document.querySelector('.flex-shrink-0.is-selected');
        closeCard(selectedCard);
    });

    window.addEventListener('resize', () => {
        originalWidthData.clear();
        cardWrappers.forEach(card => getOriginalWidth(card));
    });

    // Scrolling logic
    const getGapPx = () => parseFloat(getComputedStyle(scrollContainer).gap || '24');
    
    function scrollByCard(direction) {
        if (featureSection.classList.contains('is-card-open')) return;
        const cardWidth = cardWrappers[0].getBoundingClientRect().width;
        const step = cardWidth + getGapPx();
        scrollContainer.scrollBy({ left: direction * step, behavior: 'smooth' });
    }

    function updateArrows() {
        const atStart = scrollContainer.scrollLeft <= 10;
        const atEnd = scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 10;
        prevBtn.classList.toggle('is-disabled', atStart);
        nextBtn.classList.toggle('is-disabled', atEnd);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => scrollByCard(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollByCard(1));
    scrollContainer.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
}

// --- STICKY STACKING SECTION ANIMATION ---
function setupNewStackingAnimation() {
    const section = document.getElementById("new-stacking-section");
    if (!section) return;

    const slides = gsap.utils.toArray(".stacking-product-slide");
    if (slides.length === 0) return;
    
    const totalSlides = slides.length;
    const scrollPerSlide = 1000;
    const totalScrollHeight = (totalSlides - 1) * scrollPerSlide;
    
    section.style.height = `${totalScrollHeight + window.innerHeight}px`;
    
    ScrollTrigger.create({
        trigger: section,
        pin: true,
        scrub: 1,
        start: "top top",
        end: `+=${totalScrollHeight}`,
    });

    slides.forEach((slide, i) => {
        const view = slide.querySelector('.stacking-product-card-view');
        const startPos = i * scrollPerSlide;
        const endPos = (i + 1) * scrollPerSlide;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: `top+=${startPos} top`,
                end: `top+=${endPos} top`,
                scrub: true,
            }
        });

        if (i > 0) {
            tl.fromTo(view, 
                { y: "100vh", scale: 0.9 }, 
                { y: "0vh", scale: 1, ease: "power1.inOut" }
            );
        } else {
             gsap.fromTo(view, 
                { y: "100vh", scale: 0.9 }, 
                { 
                    y: "0vh", scale: 1, ease: "power1.inOut",
                    scrollTrigger: {
                        trigger: section,
                        start: `top top`,
                        end: `top+=${scrollPerSlide/2} top`,
                        scrub: true
                    }
                }
            );
        }

        if (i < totalSlides - 1) {
            tl.to(view, {
                scale: 0.9,
                y: "-10vh",
                ease: "power1.inOut",
            }, ">");
        }
    });
}

// --- TESTIMONIALS CAROUSEL ---
function setupTestimonialsCarousel() {
    const inner = document.getElementById('tsInner');
    const btnPrev = document.getElementById('tsPrev');
    const btnNext = document.getElementById('tsNext');
    const dotsWrap = document.getElementById('tsDots');

    if (!inner) return;
    const cards = Array.from(inner.children);
    if (cards.length === 0) return;

    let index = 0;
    let autoplay = null;

    const getVisibleCount = () => window.innerWidth >= 768 ? 2 : 1;
    const getPageCount = () => Math.ceil(cards.length / getVisibleCount());

    function goTo(i) {
        const pageCount = getPageCount();
        index = (i + pageCount) % pageCount;

        const visibleCount = getVisibleCount();
        const cardWidth = cards[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(inner).gap);
        const offset = -index * ((cardWidth + gap) * visibleCount);
        
        gsap.to(inner, { x: offset, duration: 0.5, ease: 'power2.out' });
        updateUI();
    }

    function updateUI() {
        // Update dots
        Array.from(dotsWrap.children).forEach((dot, i) => {
            dot.setAttribute('aria-current', i === index);
        });

        // Update nav buttons
        const pageCount = getPageCount();
        btnPrev.classList.toggle('is-disabled', index === 0);
        btnNext.classList.toggle('is-disabled', index === pageCount - 1);
    }
    
    function createDots() {
        dotsWrap.innerHTML = '';
        const pageCount = getPageCount();
        for (let i = 0; i < pageCount; i++) {
            const b = document.createElement('button');
            b.className = 'w-2.5 h-2.5 rounded-full bg-clean-border aria-[current=true]:bg-clean-text transition';
            b.setAttribute('aria-label', `Go to slide ${i + 1}`);
            b.onclick = () => {
                goTo(i);
                resetAutoplay();
            };
            dotsWrap.appendChild(b);
        }
    }

    const resetAutoplay = () => {
        clearInterval(autoplay);
        autoplay = setInterval(() => goTo(index + 1), 5000);
    };

    function init() {
        createDots();
        goTo(0);
        resetAutoplay();
    }

    btnPrev.addEventListener('click', () => { goTo(index - 1); resetAutoplay(); });
    btnNext.addEventListener('click', () => { goTo(index + 1); resetAutoplay(); });
    
    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
             // Reset to first slide to avoid layout issues
            goTo(0);
            createDots();
            updateUI();
        }, 250);
    });

    init();
}

// --- RUN ALL FUNCTIONS ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    setupHeroAnimations();
    setupCardFeatures();
    setupNewStackingAnimation();
    setupTestimonialsCarousel();
});
