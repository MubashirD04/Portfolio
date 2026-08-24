export class Chatbot {
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
        this.renderMessageBody(div, sender === 'user' ? 'You' : 'Assistant', text);
        this.elements.messages.appendChild(div);
        this.scrollToBottom();
        return id;
    }

    updateMessage(id, text) {
        const div = document.getElementById(`msg-${id}`);
        if (div) {
            this.renderMessageBody(div, 'Assistant', text);
            div.classList.remove('message-typing');
            this.scrollToBottom();
        }
    }

    renderMessageBody(div, label, text) {
        div.replaceChildren();
        const strong = Object.assign(document.createElement("strong"), { textContent: `${label}:` });
        div.append(strong, " ");
        text.split("\n").forEach((line, i) => {
            if (i > 0) div.append(document.createElement("br"));
            div.append(document.createTextNode(line));
        });
    }

    scrollToBottom() {
        this.elements.messages.scrollTo({ top: this.elements.messages.scrollHeight, behavior: 'smooth' });
    }
}

export function initChatbot() {
    if (document.getElementById("chat-toggle")) {
        new Chatbot();
    }
}
