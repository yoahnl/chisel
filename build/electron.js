const {app, BrowserWindow, Menu, MenuItem, shell, autoUpdater, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');


function constructMenu() {
  let menuTemplate = [{
    label: 'Edit',
    submenu: [{
      label: 'Undo',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo'
    }, {
      label: 'Redo',
      accelerator: 'Shift+CmdOrCtrl+Z',
      role: 'redo'
    }, {
      type: 'separator'
    }, {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    }, {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }, {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }, {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    }]
  }, {
    label: 'View',
    submenu: [{
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click: (item, focusedWindow) => {
        if (focusedWindow) {
          // при перезагрузке закрываем второстепенные окна
          if (focusedWindow.id === 1)
            BrowserWindow.getAllWindows().forEach(win => {
              if (win.id > 1)
                win.close();
            });
          focusedWindow.reload();
        }
      }
    }, {
      label: 'Toggle Full Screen',
      accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
      click: (item, focusedWindow) => {
        if (focusedWindow)
          focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
      }
    }, {
      label: 'Toggle Developer Tools',
      accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
      click: (item, focusedWindow) => {
        if (focusedWindow)
          focusedWindow.toggleDevTools();
      }
    }, {
      type: 'separator'
    }]
  }, {
    label: 'Window',
    role: 'window',
    submenu: [{
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    }, {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    }, {
      type: 'separator'
    }, {
      label: 'Reopen Window',
      accelerator: 'CmdOrCtrl+Shift+T',
      enabled: false,
      key: 'reopenMenuItem',
      click: () => app.emit('activate')
    }]
  }, {
    label: 'Help',
    role: 'help',
    submenu: [{
      label: 'Learn More',
      click: () => shell.openExternal('http://electron.atom.io')
    }]
  }];


  function addUpdateMenuItems(items, position) {
    if (process.mas)
      return;

    const version = app.getVersion();
    const updateItems = [{
      label: `Version ${version}`,
      enabled: false
    }, {
      label: 'Checking for Update',
      enabled: false,
      key: 'checkingForUpdate'
    }, {
      label: 'Check for Update',
      visible: false,
      key: 'checkForUpdate',
      click: () => autoUpdater.checkForUpdates()
    }, {
      label: 'Restart and Install Update',
      enabled: true,
      visible: false,
      key: 'restartToUpdate',
      click: () => autoUpdater.quitAndInstall()
    }];

    items.splice.apply(items, [position, 0].concat(updateItems));
  }

  switch (process.platform) {
    case 'darwin':
      const name = app.getName();
      menuTemplate.unshift({
        label: name,
        submenu: [{
          label: `About ${name}`,
          role: 'about'
        }, {
          type: 'separator'
        }, {
          label: 'Services',
          role: 'services',
          submenu: []
        }, {
          type: 'separator'
        }, {
          label: `Hide ${name}`,
          accelerator: 'Command+H',
          role: 'hide'
        }, {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        }, {
          label: 'Show All',
          role: 'unhide'
        }, {
          type: 'separator'
        }, {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => app.quit()
        }]
      });

      // Window menu.
      menuTemplate[3].submenu.push({
        type: 'separator'
      }, {
        label: 'Bring All to Front',
        role: 'front'
      });

      addUpdateMenuItems(menuTemplate[0].submenu, 1);

      break;

    case 'win32':
      const helpMenu = menuTemplate[menuTemplate.length - 1].submenu;
      addUpdateMenuItems(helpMenu, 0);
      break;
  }

  return menuTemplate;
}

function findReopenMenuItem() {
  const menu = Menu.getApplicationMenu();
  if (!menu)
    return null;

  for (let item of menu.items) {
    if (item.submenu) {
      for (let itemSub of item.submenu.items) {
        if (itemSub.key === 'reopenMenuItem')
          return itemSub;
      }
    }
  }
  return null;
}

let templateContextText = [{
  label: 'Undo',
  role: 'undo'
}, {
  label: 'Redo',
  role: 'redo'
}, {
  type: 'separator'
}, {
  label: 'Cut',
  role: 'cut'
}, {
  label: 'Copy',
  role: 'copy'
}, {
  label: 'Paste',
  role: 'paste'
}, {
  label: 'Select All',
  role: 'selectall'
}];



let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({width: 1600, height: 960});
  mainWindow.loadURL(isDev ? 'http://localhost:9000' : `file://${path.join(__dirname, '../dist/index.html')}`);
  mainWindow.on('closed', () => mainWindow = null);
  mainWindow.openDevTools();
}



//================== app hooks==========



app.on('ready', () => {
  const menu = Menu.buildFromTemplate(constructMenu());
  Menu.setApplicationMenu(menu);

  createWindow();
});

app.on('browser-window-created', (event, win) => {
  let reopenMenuItem = findReopenMenuItem();
  if (reopenMenuItem)
    reopenMenuItem.enabled = false;

  const contextMenu = Menu.buildFromTemplate(templateContextText);
  win.webContents.on('context-menu', (e, params) => {
    contextMenu.popup(win, params.x, params.y);
  });
});

app.on('window-all-closed', () => {
  let reopenMenuItem = findReopenMenuItem();
  if (reopenMenuItem)
    reopenMenuItem.enabled = true;

  //if (process.platform !== 'darwin')
    app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});