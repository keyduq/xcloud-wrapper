const { app, BrowserWindow, session } = require("electron");
const { default: axios } = require("axios");
const fs = require("fs/promises");
const { platform } = require("os");

const betterXcloudScript =
  "https://github.com/redphx/better-xcloud/releases/latest/download/better-xcloud.user.js";

const prepareScript = async () => {
  const additionalScript = await fs.readFile(
    "assets/js/additional.user.js",
    "utf-8",
  );
  const { data } = await axios.get(betterXcloudScript);
  return data.replace("/* ADDITIONAL CODE */", additionalScript);
};

if (require("electron-squirrel-startup") === true) app.quit();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
  });
  win.loadURL("https://xbox.com/play");
  if (platform() === "darwin") {
    // kiosk mode for macOS so the dock and menu bar are always hidden
    win.webContents.on("enter-html-full-screen", () => {
      win.setKiosk(true);
    });
    win.on("leave-html-full-screen", () => {
      win.setKiosk(false);
    });
    win.on("enter-full-screen", () => {
      win.setKiosk(true);
    });
    win.on("leave-full-screen", () => {
      win.setKiosk(false);
    });
  }
  win.webContents.on("dom-ready", async () => {
    try {
      const script = await prepareScript();
      console.log(script);
      win.webContents.executeJavaScript(script);
    } catch (error) {
      console.error(error);
    }
  });
};

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
