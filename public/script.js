// ===== إضافة حالة الاتصال =====
function setupOnlineStatus() {
    const statusElement = document.createElement('div');
    statusElement.id = 'online-status';
    statusElement.innerHTML = `<i class="fas fa-circle"></i> <span>جاري التحقق...</span>`;
    document.querySelector('.chat-header').prepend(statusElement);

    const updateStatus = () => {
        if (navigator.onLine) {
            statusElement.innerHTML = `<i class="fas fa-circle" style="color: #4ade80;"></i> <span>متصل الآن</span>`;
        } else {
            statusElement.innerHTML = `<i class="fas fa-circle" style="color: #f87171;"></i> <span>غير متصل</span>`;
        }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
}

// ===== إضافة ميزة الرد على الرسائل =====
let replyingTo = null;

function setupReplyFeature() {
    const chatMessages = document.getElementById('chat-messages');
    const messageInputContainer = document.querySelector('.message-input-container');

    chatMessages.addEventListener('click', (e) => {
        const messageElement = e.target.closest('.message');
        if (messageElement && messageElement.classList.contains('received')) {
            // إزالة أي مؤشر رد موجود مسبقاً
            const existingReply = document.getElementById('reply-indicator');
            if (existingReply) existingReply.remove();

            replyingTo = {
                sender: messageElement.querySelector('.message-sender').textContent,
                text: messageElement.querySelector('.message-text').textContent
            };

            const replyIndicator = document.createElement('div');
            replyIndicator.id = 'reply-indicator';
            replyIndicator.innerHTML = `
                <div>رد على ${replyingTo.sender}</div>
                <div>${replyingTo.text.substring(0, 30)}${replyingTo.text.length > 30 ? '...' : ''}</div>
                <button id="cancel-reply"><i class="fas fa-times"></i></button>
            `;
            messageInputContainer.prepend(replyIndicator);

            document.getElementById('cancel-reply').addEventListener('click', () => {
                replyingTo = null;
                replyIndicator.remove();
            });
        }
    });
}

// ===== إضافة إحصاءات المحادثة =====
function setupChatStats() {
    const statsBtn = document.createElement('button');
    statsBtn.className = 'stats-btn header-btn';
    statsBtn.innerHTML = '<i class="fas fa-chart-bar"></i>';
    statsBtn.title = 'إحصاءات المحادثة';
    document.querySelector('.header-actions').prepend(statsBtn);

    statsBtn.addEventListener('click', () => {
        const messages = Array.from(document.querySelectorAll('.message'));
        const userStats = {};

        messages.forEach(msg => {
            const sender = msg.querySelector('.message-sender').textContent;
            userStats[sender] = (userStats[sender] || 0) + 1;
        });

        const statsHTML = `
            <div class="stats-popup">
                <h3>إحصاءات المحادثة</h3>
                ${Object.entries(userStats).map(([user, count]) => 
                    `<div>${user}: ${count} رسالة</div>`
                ).join('')}
                <div>المجموع: ${messages.length} رسائل</div>
            </div>
        `;

        const existingPopup = document.querySelector('.stats-popup');
        if (existingPopup) existingPopup.remove();

        const popup = document.createElement('div');
        popup.innerHTML = statsHTML;
        document.body.appendChild(popup);

        setTimeout(() => popup.remove(), 5000);
    });
}

// ===== إضافة زر الإيموجي البسيط =====
function setupSimpleEmojiButton() {
    const emojiBtn = document.createElement('button');
    emojiBtn.className = 'emoji-btn';
    emojiBtn.innerHTML = '😊';
    emojiBtn.title = 'إدراج إيموجي';
    document.querySelector('.message-input-container').prepend(emojiBtn);

    const commonEmojis = ['😊', '😂', '❤️', '👍', '🙏', '🔥', '🎉', '🤔', '😍', '🥰'];
    
    emojiBtn.addEventListener('click', () => {
        const emojiContainer = document.createElement('div');
        emojiContainer.className = 'emoji-container';
        emojiContainer.innerHTML = `
            <div class="emoji-list">
                ${commonEmojis.map(emoji => 
                    `<span class="emoji-option">${emoji}</span>`
                ).join('')}
            </div>
        `;
        
        emojiBtn.parentNode.insertBefore(emojiContainer, emojiBtn.nextSibling);
        
        document.querySelectorAll('.emoji-option').forEach(emoji => {
            emoji.addEventListener('click', () => {
                const messageInput = document.getElementById('message-input');
                messageInput.value += emoji.textContent;
                messageInput.focus();
                emojiContainer.remove();
            });
        });
        
        // إغلاق عند النقر خارجها
        setTimeout(() => {
            document.addEventListener('click', function closeEmojiPicker(e) {
                if (!emojiContainer.contains(e.target)) {
                    emojiContainer.remove();
                    document.removeEventListener('click', closeEmojiPicker);
                }
            });
        });
    });
}

// ===== تهيئة جميع الميزات =====
function setupAllFeatures() {
    setupOnlineStatus();
    setupReplyFeature();
    setupSimpleEmojiButton();
    setupChatStats();
}

// تشغيل الميزات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', setupAllFeatures);