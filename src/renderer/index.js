import React, { useState } from "react";
import ReactDOM from "react-dom";

import "tachyons/src/tachyons.css";
import "./inject"; // so we reload when inject changes

import * as h from "./history";
import Webview from "./webview";
import usePersistedState from "./use-persisted-state";

const PANE_WIDTH = 640;

const INITIAL_STATE = [
  h.create("https://en.m.wikipedia.org/wiki/Double-loop_learning"),
];

const App = () => {
  const [histories, setHistories] = usePersistedState("history", INITIAL_STATE);
  const [fullscreenIdx, setFullscreenIdx] = useState(null);

  window.state = { histories };

  return (
    <div className="sans-serif bg-near-white vh-100 flex flex-column">
      <div
        className="flex items-center f6 gray"
        style={{ WebkitAppRegion: "drag", height: 38 }}
      >
        <div className="tc w-100">Research Browser</div>
      </div>

      <div
        className="flex overflow-x-scroll"
        style={{ height: "calc(100% - 38px)" }}
      >
        {histories.map((history, i) => {
          const current = h.getCurrent(history);

          const { url, title } = current.node;
          const canGoBack = current.parents.length > 0;
          const canGoForward = current.node.children.length > 0;

          const isFullscreen = i === fullscreenIdx;
          const width = isFullscreen ? "100%" : PANE_WIDTH; // TODO: width in px?

          const className = `ba b--dark-gray bg-dark-gray ${
            isFullscreen && "absolute w-100 z-3"
          }`;

          const style = isFullscreen
            ? { height: "calc(100% - 38px)" }
            : { height: "100%" };

          return (
            <div key={i + "-" + url} className={className} style={style}>
              <Webview
                src={url}
                title={title}
                history={history}
                width={width}
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
                  setHistories((draft) => {
                    h.navigate(draft[i], newUrl);
                  });
                }}
                onNewWindow={(url) => {
                  setHistories((draft) => {
                    draft.push(h.create(url));
                  });
                }}
                onClose={() => {
                  setHistories((draft) => {
                    draft.splice(i, 1);

                    if (draft.length === 0) {
                      INITIAL_STATE.forEach((initialValue, i) => {
                        draft[i] = initialValue;
                      });
                    }
                  });
                }}
                onFullscreen={() => {
                  setFullscreenIdx(fullscreenIdx === null ? i : null);
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
