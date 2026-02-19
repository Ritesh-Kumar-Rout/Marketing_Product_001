/**
 * HYDRA Cinematic Landing Page Engine
 * Manages Scroll Sequences, Reveal Animations, and Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const frameCount = 240;
    const canvas = document.getElementById('scroll-canvas');
    const ctx = canvas.getContext('2d');
    const imgFolder = 'frames';
    const images = [];
    const airship = { frame: 0 };

    // --- Preloading System ---
    const preloadImages = () => {
        let loadedCount = 0;
        const loaderBar = document.getElementById('loader-bar');
        const loaderText = document.getElementById('loader-text');
        const loader = document.getElementById('loader');

        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            const frameIndex = i.toString().padStart(3, '0');
            img.src = `${imgFolder}/frame-${frameIndex}.jpg`;
            img.onload = () => {
                loadedCount++;
                const progress = Math.floor((loadedCount / frameCount) * 100);
                loaderBar.style.width = `${progress}%`;
                loaderText.innerText = `${progress}% INITIALIZING EXPERIENCE`;

                if (loadedCount === frameCount) {
                    setTimeout(() => {
                        loader.classList.add('hidden');
                        initScrollAnimations();
                    }, 1000);
                }
            };
            images.push(img);
        }
    };

    // --- Canvas Rendering Engine ---
    const updateCanvas = (index) => {
        if (!images[index]) return;

        // Handle responsive canvas sizing
        const img = images[index];
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            drawWidth = canvas.height * imgRatio;
            drawHeight = canvas.height;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const resizeCanvas = () => {
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        updateCanvas(Math.floor(airship.frame));
    };

    // --- Scroll Magic ---
    const initScrollAnimations = () => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const heroHeight = document.getElementById('hero').offsetHeight;
            const maxScrollTop = heroHeight - window.innerHeight;

            // Map scroll to frames (0.0 to 1.0)
            const scrollFraction = Math.min(Math.max(scrollTop / maxScrollTop, 0), 1);
            const frameIndex = Math.min(
                frameCount - 1,
                Math.floor(scrollFraction * frameCount)
            );

            airship.frame = frameIndex;
            requestAnimationFrame(() => updateCanvas(frameIndex));

            // Hero Content Transition
            const heroContent = document.querySelector('.hero-content');
            if (scrollFraction > 0.8) {
                heroContent.style.opacity = Math.max(0, 1 - (scrollFraction - 0.8) * 10);
            } else {
                heroContent.style.opacity = 1;
            }
        });

        initRevealObserver();
        initCounters();
        initMagneticButtons();
    };

    // --- Interaction Subsystems ---

    // 1. Reveal on Scroll (Intersection Observer)
    const initRevealObserver = () => {
        const observerOptions = {
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Stop observing once visible if needed
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('[data-scroll]').forEach(el => observer.observe(el));
    };

    // 2. Numerical Counters
    const initCounters = () => {
        const counters = document.querySelectorAll('.counter');
        const speed = 200;

        const startCounter = (el) => {
            const target = +el.getAttribute('data-target');
            const count = +el.innerText;
            const inc = target / speed;

            if (count < target) {
                el.innerText = Math.ceil(count + inc);
                setTimeout(() => startCounter(el), 1);
            } else {
                el.innerText = target;
            }
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 1 });

        counters.forEach(c => counterObserver.observe(c));
    };

    // 3. Magnetic Buttons
    const initMagneticButtons = () => {
        const btns = document.querySelectorAll('.magnetic');

        btns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = `translate(0px, 0px)`;
            });
        });
    };

    // Start everything
    preloadImages();
});
