const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// In-memory store (for demo purposes)
// Note: In production, you should use a database
const textStore = new Map();

// Generate a random key
function generateKey() {
    return crypto.randomBytes(4).toString('hex');
}

// Share text endpoint
app.post('/api/share', (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const key = generateKey();
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours expiry

        textStore.set(key, {
            text,
            expiresAt
        });

        res.json({ key });
    } catch (error) {
        console.error('Share error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get text endpoint
app.get('/api/get/:key', (req, res) => {
    try {
        const { key } = req.params;
        const entry = textStore.get(key);

        if (!entry) {
            return res.status(404).json({ error: 'Text not found or expired' });
        }

        // Check if expired
        if (entry.expiresAt < Date.now()) {
            textStore.delete(key);
            return res.status(404).json({ error: 'Text has expired' });
        }

        // Delete the entry after retrieval (one-time use)
        textStore.delete(key);

        res.json({ text: entry.text });
    } catch (error) {
        console.error('Get error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

// Export for Vercel
module.exports = app; 