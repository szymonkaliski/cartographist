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
  const [title, setTitle] = useState("");
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

    ref.current.addEventListener("page-title-updated", (e) => {
      setTitle(e.title);
    });
  }, [ref, setTitle]);

  return (
    <div className="flex flex-column h-100">
      <div
        className="pa2 sans-serif f6 light-gray flex items-center justify-between"
        style={{ width: 640 }}
      >
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

      <div className="h-100">
        <webview ref={ref} src={src} style={{ width: 640, height: "100%" }} />
      </div>
    </div>
  );
};

const App = () => {
  const [urls, setUrls] = usePersistedState("urls", []);

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
              src={url}
              onNavigate={(url) => setUrls(replaceAt(urls, i, url))}
              onNewWindow={(url) => setUrls([...urls.slice(0, i + 1), [url]])}
              onClose={() => setUrls(urls.slice(0, i))}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
