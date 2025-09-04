const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'server.log');

const logger = (req, res, next) => {
  const now = new Date();
  const originalSend = res.send.bind(res);
  const originalJson = res.json.bind(res);
  const originalRedirect = res.redirect.bind(res);

  res.send = (body) => {
    let shortLink = res.locals.shortLink || (body && typeof body === 'string' ? body : '');
    const logEntry = `[${now.toISOString()}] ${req.method} ${req.url} - Body: ${JSON.stringify(req.body)} - Shortened URL: ${shortLink} - Status: ${res.statusCode}\n`;
    fs.appendFile(logFilePath, logEntry, (err) => { if (err) console.error('Error writing log:', err); });
    return originalSend(body);
  };

  res.json = (body) => {
    let shortLink = body?.shortLink || res.locals.shortLink || '';
    const logEntry = `[${now.toISOString()}] ${req.method} ${req.url} - Body: ${JSON.stringify(req.body)} - Shortened URL: ${shortLink} - Status: ${res.statusCode}\n`;
    fs.appendFile(logFilePath, logEntry, (err) => { if (err) console.error('Error writing log:', err); });
    return originalJson(body);
  };

  res.redirect = (url) => {
    const logEntry = `[${now.toISOString()}] ${req.method} ${req.url} - Body: ${JSON.stringify(req.body)} - Redirected to: ${url}\n`;
    fs.appendFile(logFilePath, logEntry, (err) => { if (err) console.error('Error writing log:', err); });
    return originalRedirect(url);
  };

  next();
};

module.exports = logger;
