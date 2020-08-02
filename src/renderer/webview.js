import React, { useState, useRef, useEffect } from "react";
import normalizeUrl from "normalize-url";
import path from "path";

const INJECT_PATH = path.join(process.cwd(), __dirname, "inject.js");
const CHROME_IPHONE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/83.0.4147.71 Mobile/15E148 Safari/604.1";

export default ({
  src,
  width,

  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,

  onSetTitle,
  onNewWindow,
  onClose,
  onNavigate,
  onFullscreen,
}) => {
  const [hoverUrl, setHoverUrl] = useState(null);
  const [tmpSrc, setTmpSrc] = useState(null);

  const ref = useRef(null);
  const urlRef = useRef(null);

  useEffect(() => {
    setTmpSrc(src);

    if (ref.current) {
      ref.current.scrollIntoView();
    }
  }, [src]);

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

  return (
    <div className="flex flex-column h-100" style={{ width }}>
      <div className="pa2 sans-serif f6 light-gray flex items-center justify-between bg-dark-gray">
        <div className="flex w-100">
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

          <input
            className="ml2 w-100 bg-near-white dark-gray ph2 pv1 bw0 pointer outline-0"
            ref={urlRef}
            value={tmpSrc || ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onNavigate(normalizeUrl(tmpSrc));
              }

              if (e.key === "Escape") {
                setTmpSrc(src);
                urlRef.current.blur();
              }
            }}
            onChange={(e) => {
              setTmpSrc(e.target.value);
            }}
          />

          <button
            className="bg-dark-gray light-gray bw0 pointer dim ml2"
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
        <webview
          ref={ref}
          src={src}
          style={{ width, height: "100%" }}
          preload={`file://${INJECT_PATH}`}
          useragent={CHROME_IPHONE_USER_AGENT}
        />

        {hoverUrl && (
          <div
            className="absolute bg-dark-gray f7 light-gray pa1 truncate z-5"
            style={{ bottom: 0, maxWidth: width }}
          >
            {hoverUrl}
          </div>
        )}
      </div>
    </div>
  );
};
