const { app, Menu } = require("electron");

module.exports = (mainWindow) => {
  const sendToMainWindow = (cmd) => {
    if (!mainWindow) {
      return;
    }

    mainWindow.webContents.send(cmd);
  };

  const template = [
    {
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideothers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },

    {
      label: "File",
      submenu: [
        {
          label: "New Pane",
          accelerator: "CmdOrCtrl+T",
          click: () => sendToMainWindow("NEW_PANE"),
        },
        { type: "separator" },
        {
          label: "New Trail",
          accelerator: "CmdOrCtrl+N",
          click: () => sendToMainWindow("NEW_TRAIL"),
        },
        {
          label: "Save Trail",
          accelerator: "CmdOrCtrl+S",
          click: () => sendToMainWindow("SAVE_TRAIL"),
        },
        {
          label: "Load Trail",
          accelerator: "CmdOrCtrl+O",
          click: () => sendToMainWindow("LOAD_TRAIL"),
        },
        { type: "separator" },
        { role: "close" },
      ],
    },

    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteAndMatchStyle" },
        { role: "delete" },
      ],
    },

    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forcereload" },
        { role: "toggledevtools" },
        { type: "separator" },
        { role: "resetzoom" },
        { role: "zoomin" },
        { role: "zoomout" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },

    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        { type: "separator" },
        { role: "front" },
        { type: "separator" },
        { role: "window" },
      ],
    },

    {
      role: "help",
    },
  ];

  return Menu.buildFromTemplate(template);
};
