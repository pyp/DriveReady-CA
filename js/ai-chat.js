// AI Chat Tab Functionality
class AIChatTab {
    constructor() {
        this.chatTab = document.getElementById('ai-chat-tab');
        this.toggleBtn = document.getElementById('ai-chat-toggle');
        this.closeBtn = document.getElementById('chat-close-btn');
        this.chatInput = document.getElementById('ai-chat-input');
        this.sendBtn = document.getElementById('ai-send-btn');
        this.messagesContainer = document.getElementById('ai-chat-messages');
        this.typingIndicator = document.getElementById('ai-typing-indicator');
        
        this.isOpen = false;
        this.isMinimized = false;
        
        this.chatHistory = [];
        this.isTyping = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadChatHistory();
        this.autoResizeTextarea();
    }
    
    setupEventListeners() {
        // Toggle chat tab
        this.toggleBtn.addEventListener('click', () => this.toggleChatTab());
        
        
        // Close chat tab
        this.closeBtn.addEventListener('click', () => this.closeChatTab());
        
        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Input validation
        this.chatInput.addEventListener('input', () => {
            this.updateSendButton();
            this.autoResizeTextarea();
        });
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.chatTab.contains(e.target) && !this.toggleBtn.contains(e.target)) {
                this.closeChatTab();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.toggleChatTab();
            }
        });
    }
    
    toggleChatTab() {
        if (this.isOpen) {
            this.closeChatTab();
        } else {
            this.openChatTab();
        }
    }
    
    openChatTab() {
        this.chatTab.classList.add('open');
        this.toggleBtn.classList.add('hidden');
        this.isOpen = true;
        
        // Show welcome popup only once per session
        this.showWelcomePopupOnce();
        
        // Focus on input
        setTimeout(() => {
            this.chatInput.focus();
        }, 300);
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    closeChatTab() {
        this.chatTab.classList.remove('open');
        this.toggleBtn.classList.remove('hidden');
        this.isOpen = false;
        this.isMinimized = false;
        this.chatTab.classList.remove('minimized');
        
        // Remove welcome popup if it exists
        this.removeWelcomePopup();
    }
    
    showWelcomePopupOnce() {
        // Check if welcome popup has already been shown this session
        const hasShownWelcome = sessionStorage.getItem('chat-welcome-shown');
        if (hasShownWelcome) {
            return; // Don't show again
        }
        
        // Mark as shown for this session
        sessionStorage.setItem('chat-welcome-shown', 'true');
        
        // Remove existing popup if any
        this.removeWelcomePopup();
        
        // Create welcome popup
        const popup = document.createElement('div');
        popup.className = 'chat-welcome-popup';
        popup.innerHTML = `
            <div class="chat-welcome-avatar">
                <i class="fa-solid fa-user-tie"></i>
            </div>
            <div class="chat-welcome-text">
                <h4>Howdy there, future driver!</h4>
                <p>I'm Officer Bob, your traffic safety guide. Ask me anything about driving rules, lessons, or safety tips!</p>
            </div>
        `;
        
        // Add to chat tab content
        this.chatTab.querySelector('.chat-tab-content').appendChild(popup);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            this.removeWelcomePopup();
        }, 4000);
    }
    
    showWelcomePopup() {
        // Remove existing popup if any
        this.removeWelcomePopup();
        
        // Create welcome popup
        const popup = document.createElement('div');
        popup.className = 'chat-welcome-popup';
        popup.innerHTML = `
            <div class="chat-welcome-avatar">
                <i class="fa-solid fa-user-tie"></i>
            </div>
            <div class="chat-welcome-text">
                <h4>Howdy there, future driver!</h4>
                <p>I'm Officer Bob, your traffic safety guide. Ask me anything about driving rules, lessons, or safety tips!</p>
            </div>
        `;
        
        // Add to chat tab content
        this.chatTab.querySelector('.chat-tab-content').appendChild(popup);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            this.removeWelcomePopup();
        }, 4000);
    }
    
    removeWelcomePopup() {
        const existingPopup = this.chatTab.querySelector('.chat-welcome-popup');
        if (existingPopup) {
            existingPopup.remove();
        }
    }
    
    
    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        this.updateSendButton();
        this.autoResizeTextarea();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate AI response (replace with actual AI API call)
        setTimeout(() => {
            this.hideTypingIndicator();
            this.generateAIResponse(message);
        }, 1000 + Math.random() * 2000);
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'ai-message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-user-tie"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'ai-message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Save to history
        this.chatHistory.push({ content, sender, timestamp: Date.now() });
        this.saveChatHistory();
    }
    
    generateAIResponse(userMessage) {
        // Officer Bob's responses - replace with actual AI API integration
        const responses = [
            "Well, well! That's a mighty fine question there, partner! Let me help you navigate through that driving concept.",
            "Howdy! I've been patrolling these roads for years, and I can definitely help you understand that traffic rule better.",
            "Great question, future driver! Safety first - that's what I always say. Let me break this down for you.",
            "Well, I'll be! That's exactly the kind of thinking that makes a safe driver. Let me share some wisdom with you.",
            "Howdy there! I can see you're really thinking about road safety. That's what I like to see! Let me help you out.",
            "Well, partner, that's a question I hear a lot on the job. Let me give you the lowdown on that driving rule.",
            "Howdy! I've seen this situation many times during my patrols. Here's what you need to know about that.",
            "Great thinking, future driver! That's the kind of question that shows you're taking this seriously. Let me help!"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.addMessage(randomResponse, 'assistant');
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
    }
    
    updateSendButton() {
        const hasText = this.chatInput.value.trim().length > 0;
        this.sendBtn.disabled = !hasText || this.isTyping;
    }
    
    autoResizeTextarea() {
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }
    
    saveChatHistory() {
        try {
            localStorage.setItem('ai-chat-history', JSON.stringify(this.chatHistory));
        } catch (error) {
            console.warn('Could not save chat history:', error);
        }
    }
    
    loadChatHistory() {
        try {
            const saved = localStorage.getItem('ai-chat-history');
            if (saved) {
                this.chatHistory = JSON.parse(saved);
                this.renderChatHistory();
            }
        } catch (error) {
            console.warn('Could not load chat history:', error);
            this.chatHistory = [];
        }
    }
    
    renderChatHistory() {
        // Clear existing messages (except welcome message)
        const existingMessages = this.messagesContainer.querySelectorAll('.ai-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Render saved messages
        this.chatHistory.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `ai-message ${msg.sender}`;
            
            const avatar = document.createElement('div');
            avatar.className = 'ai-message-avatar';
            avatar.innerHTML = msg.sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-user-tie"></i>';
            
            const messageContent = document.createElement('div');
            messageContent.className = 'ai-message-content';
            messageContent.textContent = msg.content;
            
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContent);
            
            this.messagesContainer.appendChild(messageDiv);
        });
        
        this.scrollToBottom();
    }
    
    clearChatHistory() {
        this.chatHistory = [];
        this.saveChatHistory();
        this.renderChatHistory();
    }
    
    // Method to integrate with actual AI API
    async callAIAPI(message) {
        try {
            // Replace this with your actual AI API endpoint
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    message: message,
                    context: {
                        lessons: window.lessons || [],
                        tests: window.tests || [],
                        userProgress: this.getUserProgress()
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error('AI API request failed');
            }
            
            const data = await response.json();
            return data.response;
            
        } catch (error) {
            console.error('AI API Error:', error);
            return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
        }
    }
    
    getUserProgress() {
        // Get user progress data from dashboard
        return {
            completedLessons: document.querySelectorAll('.lesson-card.completed').length,
            totalLessons: 63,
            completedTests: document.querySelectorAll('.test-card.completed').length,
            averageScore: this.calculateAverageScore()
        };
    }
    
    calculateAverageScore() {
        const scoreElements = document.querySelectorAll('.test-score');
        if (scoreElements.length === 0) return 0;
        
        const scores = Array.from(scoreElements).map(el => {
            const score = el.textContent.match(/\d+/);
            return score ? parseInt(score[0]) : 0;
        });
        
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }
}

// Initialize AI Chat Tab when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiChatTab = new AIChatTab();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIChatTab;
}
