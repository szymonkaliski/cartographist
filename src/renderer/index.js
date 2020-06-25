import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { last } from "lodash";

import "tachyons/src/tachyons.css";
import "./inject"; // so we reload when inject changes

import * as h from "./history";
import Webview from "./webview";
import usePersistedState from "./use-persisted-state";

const replaceAt = (array, index, value) => {
  const ret = array.slice(0);
  ret[index] = value;
  return ret;
};

const App = () => {
  const [histories, setHistories] = usePersistedState("history", [
    {
      url: "https://en.m.wikipedia.org/wiki/Double-loop_learning",
      title: "",
      current: true,
      children: [],
    },
  ]);

  window.getStatus = () => ({ histories });

  return (
    <div className="sans-serif bg-near-white vh-100 flex flex-column">
      <div
        className="flex items-center f6 gray"
        style={{ WebkitAppRegion: "drag", height: 38 }}
      >
        <div className="tc w-100">Research Browser</div>
      </div>

      <div className="flex overflow-x-scroll h-100 mh2 mb2">
        {histories.map((history, i) => {
          const current = h.current(history);

          const { url, title } = current.node;
          const canGoBack = !!current.parent;
          const canGoForward = current.node.children.length > 0;

          return (
            <div key={i + "-" + url} className="ba b--dark-gray bg-dark-gray">
              <Webview
                src={url}
                title={title}
                history={history}
                canGoBack={canGoBack}
                canGoForward={canGoForward}
                onSetTitle={(newTitle) => {
                  setHistories((draft) => {
                    h.processCurrent(draft[i], (node) => {
                      node.title = newTitle;
                    });
                  });
                }}
                onGoBack={() => {
                  setHistories((draft) => {
                    h.back(draft[i]);
                  });
                }}
                onGoForward={() => {
                  setHistories((draft) => {
                    h.forward(draft[i]);
                  });
                }}
                onNavigateHistory={(path) => {
                  setHistories((draft) => {
                    h.jump(draft[i], path);
                  });
                }}
                onNavigate={(newUrl) => {
                  if (url === newUrl) {
                    return;
                  }

                  setHistories((draft) => {
                    h.navigate(draft[i], newUrl);
                  });
                }}
                onNewWindow={(url) => {
                  // TODO
                }}
                onClose={() => {
                  // TODO
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
