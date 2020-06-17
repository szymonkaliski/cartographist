import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { last } from "lodash";

import "tachyons/src/tachyons.css";
import "./inject.js"; // so we reload when inject changes

// TODO: make this dynamic
const INJECT_PATH =
  "file:///Users/szymon/Documents/Projects/research-browser/src/renderer/inject.js";

const BROWSER_WIDTH = 640;

const replaceAt = (array, index, value) => {
  const ret = array.slice(0);
  ret[index] = value;
  return ret;
};

const usePersistedState = (key, initialValue) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (value === initialValue) {
      const stored = localStorage[key];

      if (stored) {
        let storedValue;

        try {
          storedValue = JSON.parse(stored);
        } catch (e) {}

        if (storedValue) {
          setValue(storedValue);
        }
      }
    } else {
      localStorage[key] = JSON.stringify(value);
    }
  }, [value]);

  return [value, setValue];
};

const Webview = ({ urls, onNewWindow, onClose, onNavigate }) => {
  const [title, setTitle] = useState("");
  const [hoverUrl, setHoverUrl] = useState(null);

  const ref = useRef(null);
  const src = last(urls);

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
      setTitle(e.title);
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
  }, [ref, setTitle]);

  return (
    <div className="flex flex-column h-100" style={{ width: BROWSER_WIDTH }}>
      <div className="pa2 sans-serif f6 light-gray flex items-center justify-between">
        <div className="flex">
          <button
            className="bg-dark-gray light-gray bw0 pointer dim"
            disabled={urls.length <= 1}
          >
            ←
          </button>
          <button className="bg-dark-gray light-gray bw0 pointer dim">→</button>
        </div>

        <div title={src} className="truncate flex">
          <div>{title}</div>
          <div className="mh2 silver">&mdash;</div>
          <div className="silver">{src}</div>
        </div>

        <button
          className="bg-dark-gray light-gray bw0 pointer dim"
          title="Close"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <div className="h-100 relative">
        <webview
          ref={ref}
          src={src}
          style={{ width: BROWSER_WIDTH, height: "100%" }}
          preload={INJECT_PATH}
        />

        {hoverUrl && (
          <div
            className="absolute bg-dark-gray f7 light-gray pa1 truncate"
            style={{ bottom: 0, maxWidth: BROWSER_WIDTH }}
          >
            {hoverUrl}
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [urls, setUrls] = useState([
    ["https://en.m.wikipedia.org/wiki/Double-loop_learning"],
  ]);

  console.log(urls);

  return (
    <div className="sans-serif bg-near-white vh-100 flex flex-column">
      <div
        className="flex items-center f6 gray"
        style={{ "-webkit-app-region": "drag", height: 38 }}
      >
        <div className="tc w-100">Research Browser</div>
      </div>

      <div className="flex overflow-x-scroll h-100 mh2 mb2">
        {urls.map((url, i) => (
          <div key={url} className="ba b--dark-gray bg-dark-gray">
            <Webview
              urls={url}
              onNavigate={(url) => {
                if (last(urls[i]) === url) {
                  return;
                }

                setUrls(replaceAt(urls, i, [...urls[i], url]));
              }}
              onNewWindow={(url) => {
                setUrls([...urls.slice(0, i + 1), [url]]);
              }}
              onClose={() => setUrls(urls.slice(0, i))}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
