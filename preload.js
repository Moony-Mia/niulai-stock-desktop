const path = require('path');

// 把精灵图绝对路径提前注入渲染进程，避免 Electron file:// 下相对路径解析不准导致牛出不来
const spritePath = path.join(__dirname, 'spritesheet.webp').replace(/\\/g, '/');
window.__SPRITE_URL = 'file://' + spritePath;
window.__PET_DIR = __dirname;
