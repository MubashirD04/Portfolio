document.addEventListener('DOMContentLoaded', () => {
    setupScrollReveal();
    setupCardExpansion();
    setupTypewriter();
    console.log("Portfolio Loaded Successfully");
});

/**
 * Handles the scroll-triggered reveal animations.
 */
const setupScrollReveal = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section, .card').forEach(el => {
        el.classList.add('reveal-hidden');
        observer.observe(el);
    });
};

/**
 * Handles typewriter effect for section and hero titles
 */
const setupTypewriter = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Trigger when element is mostly in view
            if (entry.isIntersecting && !entry.target.classList.contains('typed')) {
                entry.target.classList.add('typed');
                typeText(entry.target);
            }
        });
    }, { threshold: 0.8 });

    document.querySelectorAll('.hero-title, .section-title').forEach(el => {
        el.dataset.text = el.innerText;
        el.innerText = ''; // Clear existing text immediately
        observer.observe(el);
    });

    function typeText(element) {
        const text = element.dataset.text;
        element.innerHTML = ''; 
        const promptSpan = document.createElement('span');
        promptSpan.className = 'typewriter-prompt';
        promptSpan.innerText = '> ';
        const textSpan = document.createElement('span');
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        cursor.innerText = '|';
        
        element.appendChild(promptSpan);
        element.appendChild(textSpan);
        element.appendChild(cursor);

        let i = 0;

        function typeChar() {
            if (i < text.length) {
                textSpan.textContent += text.charAt(i);
                i++;
                // Slight random variation in typing speed
                const speed = Math.random() * 50 + 50; 
                setTimeout(typeChar, speed);
            } else {
                // Keep cursor and prompt blinking for a moment, then fade them out
                setTimeout(() => { 
                    cursor.style.display = 'none'; 
                    promptSpan.style.display = 'none'; // Make the prompt disappear
                }, 2000);
            }
        }
        
        // Start typing after a short delay
        setTimeout(typeChar, 400);
    }
};

/**
 * Handles the FLIP (First, Last, Invert, Play) animation logic for project cards.
 * Uses a 'portal' strategy (moving card to body) to avoid z-index/stacking context issues.
 */
const setupCardExpansion = () => {
    let activeCard = null;
    let placeholder = null;
    let isAnimating = false;

    // Create and append the backdrop overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);

    // Bind click events to all explore buttons
    document.querySelectorAll('.explore-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (isAnimating) return;

            const card = e.target.closest('.project-card');

            if (activeCard === card) {
                closeCard(card, btn);
            } else if (!activeCard) {
                openCard(card, btn);
            }
        });
    });

    // Close active card when clicking the overlay
    overlay.addEventListener('click', () => {
        if (activeCard && !isAnimating) {
            const btn = activeCard.querySelector('.explore-btn');
            closeCard(activeCard, btn);
        }
    });

    function openCard(card, btn) {
        isAnimating = true;
        activeCard = card;

        // 1. Measure Initial State (First)
        const startRect = card.getBoundingClientRect();

        // 2. Create Placeholder to maintain grid layout stability
        placeholder = createPlaceholder(startRect);
        card.parentNode.insertBefore(placeholder, card);

        // 3. Portal: Move Card to Body (Solves stacking context issues)
        document.body.appendChild(card);

        // 4. Apply Initial Fixed Postion (Invert)
        setFixedStyles(card, startRect);

        // Force Reflow to ensure browser paints the start state
        void card.offsetWidth;

        // 5. Animate to Target State (Play)
        card.classList.add('expanded');
        btn.textContent = 'Close';
        overlay.classList.add('active');

        // Calculate flexible target dimensions
        const { width, height } = getTargetDimensions();

        // Use requestAnimationFrame for smooth animation trigger
        requestAnimationFrame(() => {
            Object.assign(card.style, {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${width}px`,
                height: `${height}px`
            });

            // Re-enable interaction after transition roughly completes
            setTimeout(() => { isAnimating = false; }, 600);
        });
    }

    function closeCard(card, btn) {
        if (!placeholder) return;
        isAnimating = true;

        // 1. Get destination coordinates (placeholder position)
        const endRect = placeholder.getBoundingClientRect();

        // 2. Start Closing State
        card.classList.remove('expanded');
        overlay.classList.remove('active');
        btn.textContent = 'Explore Case Study';

        // 3. Animate back to original position
        Object.assign(card.style, {
            transform: 'none', // Remove centering transform
            top: `${endRect.top}px`,
            left: `${endRect.left}px`,
            width: `${endRect.width}px`,
            height: `${endRect.height}px`
        });

        // 4. Cleanup after animation ends
        const onTransitionEnd = (e) => {
            // Filter out bubbling transition events from children
            if (e.target !== card) return;

            // Move card back to its original DOM position in the grid
            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.insertBefore(card, placeholder);
                placeholder.remove();
                placeholder = null;
            }

            // Clean up styles
            removeFixedStyles(card);

            activeCard = null;
            isAnimating = false;
            card.removeEventListener('transitionend', onTransitionEnd);
        };

        card.addEventListener('transitionend', onTransitionEnd);
    }

    // --- Helper Functions ---

    function createPlaceholder(rect) {
        const p = document.createElement('div');
        p.className = 'project-card project-card-placeholder';
        p.style.width = `${rect.width}px`;
        p.style.height = `${rect.height}px`;
        return p;
    }

    function setFixedStyles(card, rect) {
        card.classList.add('fixed-expanding');
        card.style.position = 'fixed';
        card.style.top = `${rect.top}px`;
        card.style.left = `${rect.left}px`;
        card.style.width = `${rect.width}px`;
        card.style.height = `${rect.height}px`;
        card.style.margin = '0';
        card.style.transform = 'translate(0, 0)'; // Important for smooth init
    }

    function removeFixedStyles(card) {
        card.classList.remove('fixed-expanding');
        // Clear all inline styles set during animation
        card.style.position = '';
        card.style.top = '';
        card.style.left = '';
        card.style.width = '';
        card.style.height = '';
        card.style.margin = '';
        card.style.transform = '';
    }

    function getTargetDimensions() {
        return {
            width: Math.min(window.innerWidth * 0.9, 900),
            height: Math.min(window.innerHeight * 0.75, 600)
        };
    }
};

