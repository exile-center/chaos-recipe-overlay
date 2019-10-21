// Vendor
const {app, BrowserWindow, ipcMain} = require('electron');
const settings = require('electron-settings');

// Constants
const DEVTOOL_OPTIONS = {mode: 'detach'};

let overlayWindow;
let settingsWindow;
let debug = process.argv[2] === 'debug';

function initSettings() {
  const setDefaultSetting = (key, value) => {
    if (settings.has(key)) return;
    settings.set(key, value);
  };

  setDefaultSetting('position', {x: 50, y: 50});
}

function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    height: 70,
    width: 515,
    x: settings.get('position.x'),
    y: settings.get('position.y'),
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  overlayWindow.loadFile('./src/ui/overlay.html');

  overlayWindow.setMenu(null);

  overlayWindow.on('closed', () => overlayWindow = null);

  overlayWindow.on('move', () => {
    const [x, y] = overlayWindow.getPosition();
    settings.set('position', {x, y});
  });

  if (debug) overlayWindow.webContents.openDevTools(DEVTOOL_OPTIONS);
}

app.on('ready', () => {
  initSettings();
  createOverlayWindow();
});

app.on('window-all-closed', () => app.quit());

app.on('activate', () => {
  if (overlayWindow) return;

  createOverlayWindow();
});

ipcMain.on('openSettings', () => {
  settingsWindow = new BrowserWindow({
    width: 400,
    height: 600,
    x: settings.get('position.x'),
    y: settings.get('position.y'),
    modal: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  settingsWindow.loadFile('./src/ui/settings.html');

  settingsWindow.setMenu(null);

  settingsWindow.on('closed', () => overlayWindow.send('forceChaosRecipeRefresh'));

  if (debug) settingsWindow.webContents.openDevTools(DEVTOOL_OPTIONS);
});
