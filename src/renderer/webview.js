import React, { useState, useRef, useEffect } from "react";
import path from "path";

import History from "./history-visualization";

const INJECT_PATH = path.join(process.cwd(), __dirname, "inject.js");

export default ({
  src,
  history,
  title,
  width,

  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,

  onNavigateHistory,

  onSetTitle,
  onNewWindow,
  onClose,
  onNavigate,
  onFullscreen
}) => {
  const [hoverUrl, setHoverUrl] = useState(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    // ref.current.addEventListener("dom-ready", () => {
    //   ref.current.openDevTools();
    // });

    ref.current.addEventListener("new-window", (e) => {
      onNewWindow(e.url);
    });

    ref.current.addEventListener("did-navigate", (e) => {
      onNavigate(e.url);
    });

    ref.current.addEventListener("did-navigate-in-page", (e) => {
      onNavigate(e.url);
    });

    ref.current.addEventListener("page-title-updated", (e) => {
      onSetTitle(e.title);
    });

    ref.current.addEventListener("ipc-message", (e) => {
      const { channel, args } = e;

      if (channel === "on-mouseover") {
        setHoverUrl(args[0]);
      }

      if (channel === "on-mouseout") {
        setHoverUrl(null);
      }
    });
  }, [ref]);

  const canShowHistory = canGoForward || canGoBack;

  return (
    <div className="flex flex-column h-100" style={{ width }}>
      <div className="pa2 sans-serif f6 light-gray flex items-center justify-between">
        <div className="flex truncate">
          <button
            className={`bg-dark-gray bw0 pointer dim ${
              canGoBack ? "light-gray" : "gray"
            }`}
            disabled={!canGoBack}
            onClick={onGoBack}
          >
            ←
          </button>
          <button
            className={`bg-dark-gray bw0 pointer dim ${
              canGoForward ? "light-gray" : "gray"
            }`}
            disabled={!canGoForward}
            onClick={onGoForward}
          >
            →
          </button>
          <button
            className={`bg-dark-gray bw0 pointer dim ${
              canShowHistory ? "light-gray" : "gray"
            }`}
            disabled={!canShowHistory}
            onClick={() => setIsHistoryVisible(!isHistoryVisible)}
          >
            ◯
          </button>

          <div title={src} className="flex ml2">
            {title && (
              <>
                <div>{title}</div>
                <div className="mh2 silver">&mdash;</div>
              </>
            )}
            <div className="silver">{src}</div>
          </div>
        </div>

        <div className="flex">
          <button
            className="bg-dark-gray light-gray bw0 pointer dim"
            title="Fullscreen"
            onClick={onFullscreen}
          >
            ⤢
          </button>

          <button
            className="bg-dark-gray light-gray bw0 pointer dim"
            title="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="h-100 relative">
        {isHistoryVisible && (
          <div
            className="absolute bg-dark-gray light-gray w-100 pa2 overflow-scroll"
            style={{ top: 0 }}
          >
            <History history={history} onClick={onNavigateHistory} />
          </div>
        )}

        <webview
          ref={ref}
          src={src}
          style={{ width, height: "100%" }}
          preload={`file://${INJECT_PATH}`}
        />

        {hoverUrl && (
          <div
            className="absolute bg-dark-gray f7 light-gray pa1 truncate"
            style={{ bottom: 0, maxWidth: width }}
          >
            {hoverUrl}
          </div>
        )}
      </div>
    </div>
  );
};
