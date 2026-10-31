const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const { start, PORT } = require('./server');

app.userAgentFallback = app.userAgentFallback.replace(/\s*Electron\/\S+/, '');

if (!app.requestSingleInstanceLock()) { app.quit(); }

let win = null;
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

app.whenReady().then(async () => {
  try {
    await start(path.join(__dirname, 'www'));
  } catch (e) {
    dialog.showErrorBox('خريطة نطاق المكتب', 'تعذّر تشغيل التطبيق: المنفذ ' + PORT + ' مستخدم من برنامج آخر.');
    return app.quit();
  }
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    width: 1280, height: 800, show: false, autoHideMenuBar: true,
    title: 'خريطة نطاق المكتب',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.maximize();
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('http://127.0.0.1:' + PORT)) { e.preventDefault(); if (/^https?:\/\//.test(url)) shell.openExternal(url); }
  });
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
  win.loadURL('http://127.0.0.1:' + PORT + '/index.html');
  win.on('closed', () => { win = null; });
});

app.on('window-all-closed', () => app.quit());
