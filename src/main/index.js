const path = require("path");
const { app, BrowserWindow } = require("electron");
const { format } = require("url");

const IS_DEV = process.env.NODE_ENV !== "production";

let mainWindow;

const createWindow = () => {
  const window = new BrowserWindow({
    titleBarStyle: "hiddenInset",
    webPreferences: {
      // webSecurity: false, // otherwise we can't load images using file:/// url
      nodeIntegration: true,
      webviewTag: true,
    },
  });

  if (IS_DEV) {
    window.webContents.openDevTools();
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.loadURL(
      format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true,
      })
    );
  }

  window.on("closed", () => {
    mainWindow = null;
  });

  return window;
};

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    mainWindow = createWindow();
  }
});

app.on("ready", () => {
  mainWindow = createWindow();
});
