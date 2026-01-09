const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse URL-encoded bodies (mimicking php forms)
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' directory
app.use(express.static('public'));

// 1. Root Endpoint (Default/Wildcard)
app.get('/', (req, res) => {
    // Mimics the generic "Default Page" or empty response
    res.send('<html><body>Default Page</body></html>');
});

// 2. /check Endpoint (Debug/Info Disclosure)
app.get('/check', (req, res) => {
    // Mimics the "Mode 3 Not Implemented" message found
    res.send('<html><body><h1>Mode 3 Not Implemented</h1></body></html>');
});

// 3. /click Endpoint (Open Redirect/TDS Router)
app.get('/click', (req, res) => {
    const { url, dest } = req.query;
    console.log(`[TRACKING] /click hit with params:`, req.query);

    // Logic: If malicious params exist, redirect there. Else fallback to Google.
    if (url) {
        res.redirect(url);
    } else if (dest) {
        res.redirect(dest);
    } else {
        // Fallback observed during verification
        res.redirect('https://www.google.com');
    }
});

// 4. /front Endpoint (Redirects to root)
app.get('/front', (req, res) => {
    res.redirect('/');
});

// 5. /pixel Endpoint (Tracking Pixel)
app.get('/pixel', (req, res) => {
    // Mimics a 301 redirect to a pixel or image resource
    res.redirect(301, 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png');
});

// 6. /report Endpoint (Phishing/Fake Abuse Form)
app.get('/report', (req, res) => {
    // If email param is present, it means form was "submitted" -> redirect
    if (req.query.email) {
        console.log(`[PHISHING] Captured Email: ${req.query.email}`);
        res.redirect('https://www.google.com');
    } else {
        // Serve the fake form HTML
        res.sendFile(path.join(__dirname, 'public', 'report.html'));
    }
});

app.listen(PORT, () => {
    console.log(`[MAL-SIM] Express Server running at http://localhost:${PORT}`);
    console.log(`[MAL-SIM] Simulating jnmbmw.hottview.net logic`);
});
