/**
 * Portfolio JavaScript
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
            this.setupTypewriter();
            this.setupAccordion();
            this.setupMobileMenu();
            this.setupScrollIndicator();
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

        const logoImg = document.querySelector('.logo-img');
        if (logoImg) {
            logoImg.src = theme === 'dark' ? 'assets/favicon(bright).png' : 'assets/favicon.png';
        }
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
        };

        hamburger.addEventListener('click', toggleMenu);

        links.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
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
     * Hide scroll indicator on scroll
     */
    setupScrollIndicator() {
        const scrollInd = document.querySelector('.scroll-indicator');
        if (!scrollInd) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                scrollInd.classList.add('hidden-on-scroll');
            } else {
                scrollInd.classList.remove('hidden-on-scroll');
            }
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

        document.querySelectorAll('.hero-title, .section-title, .about-heading').forEach(el => {
            el.dataset.text = el.innerText;
            el.innerText = '';
            observer.observe(el);
        });
    }

    typeText(element) {
        const text = element.dataset.text;
        element.innerHTML = '';
        
        // Create a wrapper to keep things grouped and centered
        const wrapper = document.createElement('span');
        wrapper.style.display = 'inline-flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';

        const promptSpan = Object.assign(document.createElement('span'), { 
            className: 'typewriter-prompt', 
            innerText: '> ' 
        });
        const textSpan = document.createElement('span');
        const cursor = Object.assign(document.createElement('span'), { 
            className: 'typewriter-cursor', 
            innerText: '|' 
        });
        
        wrapper.append(promptSpan, textSpan, cursor);
        element.append(wrapper);

        let i = 0;
        const typeChar = () => {
            if (i < text.length) {
                textSpan.textContent += text.charAt(i++);
                setTimeout(typeChar, Math.random() * 30 + 30);
            } else {
                setTimeout(() => { 
                    cursor.style.display = 'none'; 
                    
                    // Smoothly collapse the prompt width to 0 so the header snaps perfectly to dead center
                    promptSpan.style.transition = 'opacity 0.3s ease, width 0.3s ease';
                    promptSpan.style.display = 'inline-block';
                    promptSpan.style.overflow = 'hidden';
                    promptSpan.style.whiteSpace = 'nowrap';
                    promptSpan.style.width = '1.5rem'; // Give it its starting approximate width
                    
                    requestAnimationFrame(() => {
                        promptSpan.style.width = '0px';
                        promptSpan.style.opacity = '0';
                    });
                    
                    setTimeout(() => {
                        promptSpan.remove();
                        if (element.classList.contains('hero-title')) {
                            const subtitle = document.querySelector('.hero-subtitle');
                            if (subtitle) subtitle.classList.add('fade-in');
                            const scrollInd = document.querySelector('.scroll-indicator');
                            if (scrollInd) scrollInd.classList.add('fade-in');
                        }
                    }, 300);
                }, 1000);
            }
        };
        setTimeout(typeChar, 180);
    }

    /**
     * Accordion Logic for Projects
     */
    setupAccordion() {
        const projects = document.querySelectorAll('.project-card');
        projects.forEach((card, index) => {
            const header = card.querySelector('.accordion-header');
            if (header) {
                header.addEventListener('click', () => {
                    const isActive = card.classList.contains('active');
                    // Close all
                    projects.forEach(p => p.classList.remove('active'));
                    // Open if it wasn't active
                    if (!isActive) {
                        card.classList.add('active');
                    }
                });
            }
            
            // Open first by default
            if (index === 0) {
                card.classList.add('active');
            }
        });
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