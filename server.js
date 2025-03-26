const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// إنشاء ملف messages.json إذا لم يكن موجودًا
const messagesFile = path.join('/var/data', 'chat-app-messages.json');

if (!fs.existsSync(messagesFile)) {
    fs.writeFileSync(messagesFile, JSON.stringify([], null, 2));
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/messages', (req, res) => {
    fs.readFile(messagesFile, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading messages');
        }
        
        try {
            const messages = JSON.parse(data);
            res.json(messages);
        } catch (parseErr) {
            console.error(parseErr);
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
            console.error(err);
            return res.status(500).send('Error reading messages');
        }
        
        try {
            const messages = JSON.parse(data);
            messages.push(newMessage);
            
            fs.writeFile(messagesFile, JSON.stringify(messages, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error(writeErr);
                    return res.status(500).send('Error saving message');
                }
                
                res.json({ success: true });
            });
        } catch (parseErr) {
            console.error(parseErr);
            res.status(500).send('Error parsing messages');
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// ... (الكود السابق)

// إضافة مسار للوضع الداكن (اختياري)
app.post('/set-theme', (req, res) => {
    // هذه للتوضيح فقط، لا يوجد تخزين فعلي
    res.json({ success: true });
});
