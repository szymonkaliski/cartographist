import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";

import "tachyons/src/tachyons.css";

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

const Webview = ({ src, onNewWindow, onClose, onNavigate }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.addEventListener("new-window", (e) => {
      onNewWindow(e.url);
    });

    ref.current.addEventListener("did-navigate", (e) => {
      onNavigate(e.url);
    });

    ref.current.addEventListener("did-navigate-in-page", (e) => {
      onNavigate(e.url);
    });
  }, [ref]);

  return (
    <div className="h-100">
      <div
        className="pa2 sans-serif f6 bg-light-gray gray flex items-center justify-between"
        style={{ width: 640 }}
      >
        <div title={src} className="truncate">
          {src}
        </div>

        <button
          className="bg-none bw0 pointer dim"
          title="Close"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <webview ref={ref} src={src} style={{ width: 640, height: "100%" }} />
    </div>
  );
};

const App = () => {
  const [urls, setUrls] = usePersistedState("urls", []);

  // useEffect(() => {
  //   if (urls.length === 0) {
  //     setUrls(["https://en.m.wikipedia.org/wiki/Double-loop_learning"]);
  //   }
  // }, [urls, setUrls]);

  console.log("urls", urls);

  return (
    <div className="sans-serif bg-near-white vh-100">
      <div
        className="flex items-center f6 gray"
        style={{ "-webkit-app-region": "drag", height: 38 }}
      >
        <div className="tc w-100">Research Browser</div>
      </div>

      <div className="flex overflow-scroll h-100">
        {urls.map((url, i) => (
          <div key={url} className="ba b--light-gray bg-dark-gray mh1">
            <Webview
              src={url}
              onNavigate={(url) => setUrls(replaceAt(urls, i, url))}
              onNewWindow={(url) => setUrls(urls.slice(0, i + 1).concat([url]))}
              onClose={() => setUrls(urls.slice(0, i))}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
