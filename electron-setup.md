# 💻 Transform Website to Desktop App with Electron

## What is Electron?
Electron wraps your website into a desktop app for Windows, Mac, and Linux.

## Step 1: Install Electron
```bash
cd Smart-Scheduler
npm init -y
npm install electron --save-dev
```

## Step 2: Create Main App File
Create `main.js`:
```javascript
const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'icon.png')
  })

  mainWindow.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

## Step 3: Update package.json
```json
{
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder"
  }
}
```

## Step 4: Run Desktop App
```bash
npm start
```

## Step 5: Build Installer
```bash
npm install electron-builder --save-dev
npm run build
```

## Result
- Native desktop app for Windows/Mac/Linux
- Can be distributed as installer
- Full desktop integration
