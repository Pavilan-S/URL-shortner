const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { customAlphabet } = require('nanoid');
const logger = require('../Logging Middleware/logger');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(logger);

const PORT = 5000;
const nanoid = customAlphabet('1234567890abcdef', 5);
const filePath = path.join(__dirname, 'data/urls.json');

app.post('/shorten', async (req, res, next) => {
    try {
        let { url, validity, shortcode } = req.body;
        if (!url) throw new Error("url is required");
        const validityMinutes = validity || 30;
        if (!/^https?:\/\//i.test(url)) url = 'http://' + url;

        let urls = [];
        if (fs.existsSync(filePath)) urls = JSON.parse(fs.readFileSync(filePath));

        let finalCode = shortcode || nanoid();
        while (urls.find(u => u.returnUrl.endsWith(finalCode))) finalCode = nanoid();

        const returnUrl = `http://localhost:${PORT}/${finalCode}`;
        const expiryDate = new Date(Date.now() + validityMinutes * 60000);

        urls.push({ returnUrl, url, expiryDate: expiryDate.toISOString() });
        fs.writeFileSync(filePath, JSON.stringify(urls, null, 2));

        res.json({ shortLink: returnUrl, expiry: expiryDate.toISOString() });
    } catch (err) {
        next(err);
    }
});

app.get('/:shortcode', async (req, res, next) => {
    try {
        const { shortcode } = req.params;
        if (!fs.existsSync(filePath)) return res.status(404).send('Shortcode not found');

        const urls = JSON.parse(fs.readFileSync(filePath));
        const url = urls.find(u => u.returnUrl.endsWith(shortcode));
        if (!url) return res.status(404).send('Shortcode not found');

        const now = new Date();
        if (now > new Date(url.expiryDate)) return res.status(410).send('Link expired');

        res.redirect(url.url);
    } catch (err) {
        next(err);
    }
});

app.use((err, req, res, next) => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const logFilePath = path.join(__dirname, `../server-${date}.log`);
    const errorEntry = `[${now.toISOString()}] ERROR ${req.method} ${req.url} - ${err.stack}\n`;
    fs.appendFile(logFilePath, errorEntry, (fsErr) => { if (fsErr) console.error('Error writing log:', fsErr); });
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
