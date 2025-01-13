const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const https = require('https');
const isDev = process.env.NODE_ENV === 'development';

let controlPanel;
let browserWindow;
let serverProcess;
let serverRunning = false;
let updateCheckInterval;
let pendingUpdate = null;
let updatePostponeCount = 0;
const MAX_POSTPONE_COUNT = 3; // Maximum times a user can postpone an update

// Store server state
function saveServerState(state) {
  const statePath = path.join(app.getPath('userData'), 'server-state.json');
  fs.writeFileSync(statePath, JSON.stringify({ running: state }));
}

function loadServerState() {
  const statePath = path.join(app.getPath('userData'), 'server-state.json');
  try {
    if (fs.existsSync(statePath)) {
      const state = JSON.parse(fs.readFileSync(statePath));
      return state.running;
    }
  } catch (err) {
    console.error('Error loading server state:', err);
  }
  return false;
}

// Store update state
function saveUpdateState(state) {
  const statePath = path.join(app.getPath('userData'), 'update-state.json');
  fs.writeFileSync(statePath, JSON.stringify(state));
}

function loadUpdateState() {
  const statePath = path.join(app.getPath('userData'), 'update-state.json');
  try {
    if (fs.existsSync(statePath)) {
      return JSON.parse(fs.readFileSync(statePath));
    }
  } catch (err) {
    console.error('Error loading update state:', err);
  }
  return { postponeCount: 0, lastPostponeTime: null };
}

// Error logging setup
function logError(error) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${error}\n`;
  const logPath = isDev 
    ? path.join(__dirname, '../errorlog.txt')
    : path.join(app.getPath('userData'), 'errorlog.txt');

  fs.appendFile(logPath, logMessage, (err) => {
    if (err) console.error('Failed to write to error log:', err);
  });
}

function getAppPath() {
  if (isDev) {
    return path.join(__dirname, '..');
  } else {
    return app.getAppPath();
  }
}

// Update checking
function checkForUpdates() {
  return new Promise((resolve, reject) => {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    
    const options = {
      hostname: 'api.github.com',
      path: '/repos/J5PH-Dev/J5Pharmacy-Backend/releases/latest',
      headers: {
        'User-Agent': 'J5-PMS-Updater',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode === 404) {
            throw new Error('Repository not found or no releases available');
          }
          if (res.statusCode === 401) {
            logError('GitHub token has expired or is invalid. Please update the token in .env file');
            throw new Error('GitHub token has expired. Please contact system administrator to update the token.');
          }
          if (res.statusCode === 403) {
            const resetTime = new Date(res.headers['x-ratelimit-reset'] * 1000);
            throw new Error(`API rate limit exceeded. Resets at ${resetTime.toLocaleString()}`);
          }
          
          const release = JSON.parse(data);
          const currentVersion = app.getVersion();
          const latestVersion = release.tag_name.replace('v', '');
          
          // Parse criticality from release notes
          const isCritical = release.body?.toLowerCase().includes('#critical');
          
          resolve({
            hasUpdate: currentVersion < latestVersion,
            currentVersion,
            latestVersion,
            downloadUrl: release.assets[0]?.browser_download_url,
            releaseNotes: release.body || 'No release notes available',
            releaseName: release.name || `Version ${latestVersion}`,
            releaseDate: new Date(release.published_at).toLocaleDateString(),
            isCritical: isCritical
          });
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function createControlPanel() {
  controlPanel = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: 'PMS Backend Support'
  });

  controlPanel.loadFile(path.join(__dirname, 'controlPanel.html'));

  if (isDev) {
    controlPanel.webContents.openDevTools();
  }

  controlPanel.on('closed', () => {
    stopServer();
    if (browserWindow) {
      browserWindow.close();
    }
    controlPanel = null;
  });

  // Check if server was running before reload
  if (loadServerState()) {
    startServer();
  }
}

function createBrowserWindow() {
  browserWindow = new BrowserWindow({
    width: 1280,
    height: 1024,
    webPreferences: {
      nodeIntegration: false
    },
    show: false
  });

  browserWindow.loadURL('https://pms.j5pharmacy.com');
  browserWindow.maximize();

  browserWindow.on('closed', () => {
    browserWindow = null;
  });
}

function getServerPath() {
  return path.join(getAppPath(), 'server.js');
}

function startServer() {
  if (serverProcess) return;

  const serverPath = getServerPath();
  console.log('Starting server from:', serverPath);
  
  const serverDir = path.dirname(serverPath);
  console.log('Server directory:', serverDir);
  
  // Ensure all required files exist
  const requiredFiles = ['server.js', 'package.json', '.env'];
  for (const file of requiredFiles) {
    const filePath = path.join(serverDir, file);
    console.log('Checking file:', filePath);
    if (!fs.existsSync(filePath)) {
      const error = `Required file not found: ${file}`;
      logError(error);
      if (controlPanel) {
        controlPanel.webContents.send('server:log', `Error: ${error}`);
      }
      return;
    }
  }
  
  serverProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: serverDir,
    env: {
      ...process.env,
      NODE_ENV: isDev ? 'development' : 'production',
      PATH: process.env.PATH
    }
  });

  serverProcess.stdout.on('data', (data) => {
    const logMessage = `Server: ${data}`;
    if (controlPanel) {
      controlPanel.webContents.send('server:log', logMessage);
    }
    console.log(logMessage);
    
    if (data.includes('Server is running')) {
      serverRunning = true;
      saveServerState(true);
      if (controlPanel) {
        controlPanel.webContents.send('server:started');
      }
    }
  });

  serverProcess.stderr.on('data', (data) => {
    const errorMessage = `Server Error: ${data}`;
    if (controlPanel) {
      controlPanel.webContents.send('server:log', errorMessage);
    }
    console.error(errorMessage);
    logError(errorMessage);
  });

  serverProcess.on('error', (error) => {
    const errorMessage = `Process Error: ${error.message}`;
    if (controlPanel) {
      controlPanel.webContents.send('server:log', errorMessage);
    }
    console.error(errorMessage);
    logError(errorMessage);
  });

  serverProcess.on('close', (code) => {
    const message = `Server process exited with code ${code}`;
    serverRunning = false;
    if (controlPanel) {
      controlPanel.webContents.send('server:stopped');
      controlPanel.webContents.send('server:log', message);
    }
    if (code !== 0) {
      logError(message);
    }
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
    serverRunning = false;
    saveServerState(false);
  }
}

// Debug function to list directory contents
function listDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    console.log(`Contents of ${dir}:`, files);
    if (controlPanel) {
      controlPanel.webContents.send('server:log', `Contents of ${dir}: ${files.join(', ')}`);
    }
  } catch (err) {
    console.error(`Error listing directory ${dir}:`, err);
    if (controlPanel) {
      controlPanel.webContents.send('server:log', `Error listing directory ${dir}: ${err.message}`);
    }
  }
}

// Start automatic update checking
function startAutoUpdateCheck() {
  // Load previous update state
  const updateState = loadUpdateState();
  updatePostponeCount = updateState.postponeCount || 0;

  // Check for updates every 30 minutes
  const CHECK_INTERVAL = 30 * 60 * 1000;
  
  // Initial check on startup (after a 30-second delay)
  setTimeout(async () => {
    await checkForUpdatesAndNotify();
  }, 30000);

  // Set up periodic checks
  updateCheckInterval = setInterval(async () => {
    await checkForUpdatesAndNotify();
  }, CHECK_INTERVAL);
}

// Stop automatic update checking
function stopAutoUpdateCheck() {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }
}

// Check for updates and notify if available
async function checkForUpdatesAndNotify() {
  try {
    const updateInfo = await checkForUpdates();
    if (controlPanel && updateInfo.hasUpdate) {
      pendingUpdate = updateInfo;
      
      if (updateInfo.isCritical || updatePostponeCount >= MAX_POSTPONE_COUNT) {
        controlPanel.webContents.send('update:critical', {
          ...updateInfo,
          forceUpdate: true,
          reason: updateInfo.isCritical ? 'Critical security or stability update' : 'Update postponed too many times'
        });
      } else {
        controlPanel.webContents.send('update:status', 
          `Update available! Current: v${updateInfo.currentVersion}, Latest: v${updateInfo.latestVersion}`);
        controlPanel.webContents.send('update:available', updateInfo);
      }
    }
  } catch (err) {
    logError(`Auto update check failed: ${err.message}`);
    if (controlPanel) {
      // Show more user-friendly error messages
      if (err.message.includes('token has expired')) {
        controlPanel.webContents.send('update:status', 
          'Unable to check for updates. Please contact system administrator.');
      } else if (err.message.includes('rate limit exceeded')) {
        controlPanel.webContents.send('update:status', 
          'Too many update checks. Please try again later.');
      } else {
        controlPanel.webContents.send('update:status', 
          'Could not check for updates. Please try again later.');
      }
    }
  }
}

// Handle update postpone
function handleUpdatePostpone() {
  updatePostponeCount++;
  saveUpdateState({
    postponeCount: updatePostponeCount,
    lastPostponeTime: new Date().toISOString()
  });

  // If max postpone count reached, force update
  if (updatePostponeCount >= MAX_POSTPONE_COUNT && pendingUpdate) {
    controlPanel.webContents.send('update:critical', {
      ...pendingUpdate,
      forceUpdate: true,
      reason: 'Update postponed too many times'
    });
  }
}

// Reset update state after successful update
function resetUpdateState() {
  updatePostponeCount = 0;
  pendingUpdate = null;
  saveUpdateState({
    postponeCount: 0,
    lastPostponeTime: null
  });
}

app.on('ready', () => {
  createControlPanel();
  startAutoUpdateCheck();
  // Debug: List contents of important directories
  const appPath = getAppPath();
  listDir(appPath);
  listDir(path.join(appPath, 'controller'));
});

app.on('window-all-closed', () => {
  stopServer();
  stopAutoUpdateCheck();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (controlPanel === null) {
    createControlPanel();
  }
});

// IPC handlers
ipcMain.on('server:start', () => {
  startServer();
});

ipcMain.on('server:stop', () => {
  stopServer();
});

ipcMain.on('server:restart', () => {
  stopServer();
  setTimeout(() => startServer(), 1000);
});

ipcMain.on('open:browser', () => {
  if (serverRunning) {
    if (!browserWindow) {
      createBrowserWindow();
    }
    browserWindow.show();
    browserWindow.maximize();
  }
});

ipcMain.on('update:postpone', () => {
  handleUpdatePostpone();
});

ipcMain.on('update:completed', () => {
  resetUpdateState();
});

ipcMain.on('check:update', async () => {
  try {
    const updateInfo = await checkForUpdates();
    if (controlPanel) {
      if (updateInfo.hasUpdate) {
        pendingUpdate = updateInfo;
        
        if (updateInfo.isCritical || updatePostponeCount >= MAX_POSTPONE_COUNT) {
          controlPanel.webContents.send('update:critical', {
            ...updateInfo,
            forceUpdate: true,
            reason: updateInfo.isCritical ? 'Critical security or stability update' : 'Update postponed too many times'
          });
        } else {
          controlPanel.webContents.send('update:status', 
            `Update available! Current: v${updateInfo.currentVersion}, Latest: v${updateInfo.latestVersion}`);
          controlPanel.webContents.send('update:available', updateInfo);
        }
      } else {
        controlPanel.webContents.send('update:status', 
          `Your app (v${updateInfo.currentVersion}) is up to date!`);
      }
    }
  } catch (err) {
    if (controlPanel) {
      controlPanel.webContents.send('update:status', 
        'Could not check for updates. Please try again later.');
    }
    logError(`Update check failed: ${err.message}`);
  }
}); 