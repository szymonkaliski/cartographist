const { ipcRenderer } = require("electron");

document.addEventListener("mouseover", (e) => {
  if (e.target.tagName !== "A") {
    return;
  }

  ipcRenderer.sendToHost("on-mouseover", e.target.href);
});

document.addEventListener("mouseout", (e) => {
  ipcRenderer.sendToHost("on-mouseout");
});
