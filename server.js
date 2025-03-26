const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// تحسين مسار تخزين الرسائل ليكون في مجلد دائم
const dataDir = path.join(__dirname, 'persistent-data');
const messagesFile = path.join(dataDir, 'chat-messages.json');

// تأكد من وجود مجلد البيانات عند بدء التشغيل
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// إنشاء ملف الرسائل إذا لم يكن موجودًا
if (!fs.existsSync(messagesFile)) {
    fs.writeFileSync(messagesFile, JSON.stringify([], null, 2));
    console.log('تم إنشاء ملف الرسائل الجديد');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// دالة لإنشاء نسخة احتياطية
function createBackup() {
    const backupFile = path.join(dataDir, `messages-backup-${Date.now()}.json`);
    try {
        fs.copyFileSync(messagesFile, backupFile);
        console.log(`تم إنشاء نسخة احتياطية: ${backupFile}`);
    } catch (err) {
        console.error('فشل في إنشاء النسخة الاحتياطية:', err);
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/messages', (req, res) => {
    fs.readFile(messagesFile, 'utf8', (err, data) => {
        if (err) {
            console.error('خطأ في قراءة الرسائل:', err);
            return res.status(500).send('Error reading messages');
        }
        
        try {
            const messages = JSON.parse(data);
            res.json(messages);
        } catch (parseErr) {
            console.error('خطأ في تحليل الرسائل:', parseErr);
            res.status(500).send('Error parsing messages');
        }
    });
});

app.post('/messages', (req, res) => {
    const newMessage = req.body;
    
    if (!newMessage.sender || !newMessage.text || !newMessage.time) {
        return res.status(400).send('Invalid message format');
    }
    
    fs.readFile(messagesFile, 'utf8', (err, data) => {
        if (err) {
            console.error('خطأ في قراءة الرسائل:', err);
            return res.status(500).send('Error reading messages');
        }
        
        try {
            const messages = JSON.parse(data);
            messages.push(newMessage);
            
            fs.writeFile(messagesFile, JSON.stringify(messages, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('خطأ في حفظ الرسالة:', writeErr);
                    return res.status(500).send('Error saving message');
                }
                
                // إنشاء نسخة احتياطية بعد كل 10 رسائل جديدة
                if (messages.length % 10 === 0) {
                    createBackup();
                }
                
                res.json({ success: true });
            });
        } catch (parseErr) {
            console.error('خطأ في تحليل الرسائل:', parseErr);
            res.status(500).send('Error parsing messages');
        }
    });
});

// مسار للوضع الداكن (اختياري)
app.post('/set-theme', (req, res) => {
    res.json({ success: true });
});

// بدء الخادم
app.listen(PORT, () => {
    console.log(`الخادم يعمل على http://localhost:${PORT}`);
    createBackup(); // إنشاء نسخة احتياطية أولية
});
function cleanOldBackups() {
    try {
        const backups = fs.readdirSync(dataDir)
            .filter(file => file.startsWith('messages-backup-'))
            .sort()
            .reverse();
        
        // احتفظ بأحدث 5 نسخ واحذف الباقي
        if (backups.length > 5) {
            for (let i = 5; i < backups.length; i++) {
                fs.unlinkSync(path.join(dataDir, backups[i]));
                console.log('تم حذف النسخة القديمة:', backups[i]);
            }
        }
    } catch (err) {
        console.error('فشل في تنظيف النسخ القديمة:', err);
    }
}

// استدعاء الدالة كل 24 ساعة
setInterval(cleanOldBackups, 24 * 60 * 60 * 1000);
