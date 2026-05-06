/**
 * Portfolio JavaScript
 * Refactored for modularity, performance, and modern standards.
 */

class Portfolio {
    constructor() {
        this.isAnimating = false;
        this.activeCard = null;
        this.placeholder = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupTheme();
            this.setupScrollReveal();
            this.setupCardExpansion();
            this.setupTypewriter();
            this.setupMobileMenu();
            this.chatbot = new Chatbot();
            console.log("Portfolio Initialized");
        });
    }

    /**
     * Handles dark/light theme switching with persistence.
     */
    setupTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        this.updateThemeIcon(themeToggle, currentTheme);

        themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            this.updateThemeIcon(themeToggle, theme);
        });
    }

    updateThemeIcon(btn, theme) {
        const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        const label = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        btn.innerHTML = `${theme === 'dark' ? sunIcon : moonIcon} <span>${label}</span>`;
    }

    /**
     * Mobile navigation menu logic.
     */
    setupMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('nav-links');
        const links = document.querySelectorAll('.nav-links a');

        if (!hamburger || !navLinks) return;

        const toggleMenu = () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        };

        hamburger.addEventListener('click', toggleMenu);

        links.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    /**
     * Scroll-triggered reveal animations.
     */
    setupScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('section, .card').forEach(el => {
            el.classList.add('reveal-hidden');
            observer.observe(el);
        });
    }

    /**
     * Typewriter effect for titles.
     */
    setupTypewriter() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('typed')) {
                    entry.target.classList.add('typed');
                    this.typeText(entry.target);
                }
            });
        }, { threshold: 0.8 });

        document.querySelectorAll('.hero-title, .section-title').forEach(el => {
            el.dataset.text = el.innerText;
            el.innerText = '';
            observer.observe(el);
        });
    }

    typeText(element) {
        const text = element.dataset.text;
        element.innerHTML = '';
        const promptSpan = Object.assign(document.createElement('span'), { className: 'typewriter-prompt', innerText: '> ' });
        const textSpan = document.createElement('span');
        const cursor = Object.assign(document.createElement('span'), { className: 'typewriter-cursor', innerText: '|' });
        
        element.append(promptSpan, textSpan, cursor);

        let i = 0;
        const typeChar = () => {
            if (i < text.length) {
                textSpan.textContent += text.charAt(i++);
                setTimeout(typeChar, Math.random() * 30 + 30);
            } else {
                setTimeout(() => { 
                    cursor.style.display = 'none'; 
                    promptSpan.style.opacity = '0';
                    promptSpan.style.transition = 'opacity 0.5s ease';
                }, 1000);
            }
        };
        setTimeout(typeChar, 400);
    }

    /**
     * Resilient Card Expansion Logic
     */
    setupCardExpansion() {
        const overlay = Object.assign(document.createElement('div'), { className: 'modal-overlay' });
        document.body.appendChild(overlay);

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.explore-btn');
            if (btn) {
                const card = btn.closest('.project-card');
                if (this.isAnimating) return;
                this.activeCard === card ? this.closeCard(card, btn) : this.openCard(card, btn, overlay);
                return;
            }

            if (this.activeCard && !this.isAnimating && (e.target === overlay || e.target.closest('.modal-overlay'))) {
                this.closeCard(this.activeCard, this.activeCard.querySelector('.explore-btn'));
            }
        });
    }

    openCard(card, btn, overlay) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.activeCard = card;

        // 1. First State
        const rect = card.getBoundingClientRect();
        
        // 2. Create Placeholder
        this.placeholder = Object.assign(document.createElement('div'), {
            className: 'project-card project-card-placeholder',
            style: `width: ${rect.width}px; height: ${rect.height}px;`
        });
        card.parentNode.insertBefore(this.placeholder, card);

        // 3. Setup Portal
        Object.assign(card.style, {
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            margin: '0',
            zIndex: '3000'
        });
        card.classList.add('fixed-expanding');
        document.body.appendChild(card);

        // 4. Trigger Animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const { width, height } = this.getTargetDimensions();
                overlay.classList.add('active');
                card.classList.add('expanded');
                btn.textContent = 'Close';
                document.body.style.overflow = 'hidden';

                Object.assign(card.style, {
                    top: `${(window.innerHeight - height) / 2}px`,
                    left: `${(window.innerWidth - width) / 2}px`,
                    width: `${width}px`,
                    height: `${height}px`
                });

                setTimeout(() => { this.isAnimating = false; }, 600);
            });
        });
    }

    closeCard(card, btn) {
        if (!this.placeholder || this.isAnimating) return;
        this.isAnimating = true;

        const rect = this.placeholder.getBoundingClientRect();
        const overlay = document.querySelector('.modal-overlay');

        card.classList.remove('expanded');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        btn.textContent = 'Explore Case Study';

        Object.assign(card.style, {
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`
        });

        const cleanup = () => {
            if (!this.placeholder) return;
            this.placeholder.parentNode.insertBefore(card, this.placeholder);
            this.placeholder.remove();
            this.placeholder = null;
            
            card.classList.remove('fixed-expanding');
            Object.assign(card.style, {
                position: '', top: '', left: '', width: '', height: '', margin: '', zIndex: ''
            });
            
            this.activeCard = null;
            this.isAnimating = false;
        };

        // Use a timeout as a primary mechanism instead of transitionend for better reliability
        setTimeout(cleanup, 600);
    }

    getTargetDimensions() {
        const isMobile = window.innerWidth <= 768;
        const w = window.innerWidth;
        const h = window.innerHeight;
        return {
            width: isMobile ? w * 0.95 : Math.min(w * 0.9, 1100),
            height: isMobile ? h * 0.9 : Math.min(h * 0.85, 800)
        };
    }
}

/**
 * Chatbot Module
 */
class Chatbot {
    constructor() {
        this.apiUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
            ? "http://localhost:3000/api/chat"
            : "https://portfolio-backend-smoky-seven.vercel.app/api/chat";
        
        this.elements = {
            toggle: document.getElementById("chat-toggle"),
            box: document.getElementById("chat-box"),
            close: document.getElementById("chat-close"),
            input: document.getElementById("chat-input"),
            send: document.getElementById("chat-send"),
            messages: document.getElementById("chat-messages")
        };

        if (this.elements.toggle) this.init();
    }

    init() {
        this.elements.toggle.addEventListener("click", () => this.toggleChat());
        this.elements.close.addEventListener("click", () => this.toggleChat(false));
        this.elements.send.addEventListener("click", () => this.sendMessage());
        this.elements.input.addEventListener("keydown", (e) => e.key === "Enter" && this.sendMessage());

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => this.handleViewportResize());
        }
    }

    toggleChat(force) {
        const isVisible = force !== undefined ? force : this.elements.box.style.display !== "flex";
        this.elements.box.style.display = isVisible ? "flex" : "none";
        if (isVisible) this.elements.input.focus();
    }

    handleViewportResize() {
        if (window.innerWidth <= 480 && this.elements.box.style.display === "flex") {
            const offset = window.innerHeight - window.visualViewport.height;
            this.elements.box.style.bottom = `${offset}px`;
            this.elements.box.style.height = `${window.visualViewport.height}px`;
        }
    }

    async sendMessage() {
        const text = this.elements.input.value.trim();
        if (!text || this.elements.send.disabled) return;

        this.appendMessage("user", text);
        this.elements.input.value = "";
        this.setLoading(true);

        const typingId = this.appendMessage("bot", "Thinking", true);

        try {
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "API Error");
            this.updateMessage(typingId, data.reply);
        } catch (error) {
            this.updateMessage(typingId, "I'm having trouble connecting. Please try again later!");
            console.error("Chat Error:", error);
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        this.elements.input.disabled = loading;
        this.elements.send.disabled = loading;
        this.elements.send.style.opacity = loading ? "0.5" : "1";
    }

    appendMessage(sender, text, isTyping = false) {
        const id = Date.now();
        const div = Object.assign(document.createElement("div"), {
            id: `msg-${id}`,
            className: `message ${sender}-message ${isTyping ? 'message-typing' : ''}`
        });
        div.innerHTML = `<strong>${sender === 'user' ? 'You' : 'Assistant'}:</strong> ${text.replace(/\n/g, '<br>')}`;
        this.elements.messages.appendChild(div);
        this.scrollToBottom();
        return id;
    }

    updateMessage(id, text) {
        const div = document.getElementById(`msg-${id}`);
        if (div) {
            div.innerHTML = `<strong>Assistant:</strong> ${text.replace(/\n/g, '<br>')}`;
            div.classList.remove('message-typing');
            this.scrollToBottom();
        }
    }

    scrollToBottom() {
        this.elements.messages.scrollTo({ top: this.elements.messages.scrollHeight, behavior: 'smooth' });
    }
}

// Initialize the Portfolio
new Portfolio();