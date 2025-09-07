const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname); // Logging Middleware folder
const logFileName = 'error.log';
const logFilePath = path.join(logDir, logFileName);

function logError(err, req) {
    const now = new Date();
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    if (!fs.existsSync(logFilePath)) fs.writeFileSync(logFilePath, '');

    const errorEntry = `[${now.toISOString()}] ERROR ${req.method} ${req.url} - ${err.stack}\n`;
    fs.appendFile(logFilePath, errorEntry, (fsErr) => {
        if (fsErr) console.error('Error writing log:', fsErr);
    });
}

module.exports = logError;
