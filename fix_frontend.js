const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, 'rvs_escolar.html');
let html = fs.readFileSync(srcFile, 'utf8');

const styleRegex = /<style>([\s\S]*?)<\/style>/i;
const styleMatch = html.match(styleRegex);
if (styleMatch) {
    fs.writeFileSync(path.join(__dirname, 'css', 'style.css'), styleMatch[1].trim(), 'utf8');
    html = html.replace(styleRegex, '<link rel="stylesheet" href="css/style.css">');
    console.log('CSS extracted and updated.');
}

const scriptRegex = /<script>([\s\S]*?)<\/script>/i;
const scriptMatch = html.match(scriptRegex);
if (scriptMatch) {
    fs.writeFileSync(path.join(__dirname, 'js', 'app.js'), scriptMatch[1].trim(), 'utf8');
    html = html.replace(scriptRegex, '');
    html = html.replace(/<\/body>/i, '<script src="js/app.js"></script>\n</body>');
    console.log('JS extracted and updated.');
}

const imgRegex = /<img src="data:image\/[^;]+;base64,([^"]+)"([^>]*)>/i;
const imgMatch = html.match(imgRegex);
if (imgMatch) {
    const base64Data = imgMatch[1];
    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir);
    }
    fs.writeFileSync(path.join(assetsDir, 'logo.png'), Buffer.from(base64Data, 'base64'));
    html = html.replace(imgRegex, '<img src="assets/logo.png" alt="RVS Logo" class="login-logo-icon">');
    console.log('Logo extracted and updated.');
}

const indexFile = path.join(__dirname, 'index.html');
fs.writeFileSync(indexFile, html, 'utf8');
fs.unlinkSync(srcFile);
console.log('Renamed rvs_escolar.html to index.html.');
