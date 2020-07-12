import React from "react";
import ReactDOM from "react-dom";
import normalizeUrl from "normalize-url";
import { last } from "lodash";

import "tachyons/src/tachyons.css";
import "./inject"; // so we reload when inject changes

import * as h from "./history";
import Webview from "./webview";
import History from "./history-visualization";
import usePersistedImmer from "./use-persisted-immer";

const PANE_WIDTH = 640;
const HISTORY_WIDTH = 420;

const START_URL = normalizeUrl("https://szymonkaliski.com");
// https://en.m.wikipedia.org/wiki/Double-loop_learning"
// https://notes.andymatuschak.org"

const INITIAL_STATE = {
  history: h.create(START_URL),
  panes: [START_URL],
  fullscreenId: null,
};

const App = () => {
  const [state, setState] = usePersistedImmer("state", INITIAL_STATE);

  window.reset = () => {
    setState((draft) => {
      Object.entries(INITIAL_STATE).forEach(([key, value]) => {
        draft[key] = value;
      });
    });
  };

  window.state = state;

  return (
    <div className="sans-serif bg-near-white vh-100 flex flex-column">
      <div className="flex h-100">
        <div className="flex flex-column bg-dark-gray">
          <div style={{ WebkitAppRegion: "drag", height: 38 }} />

          <div
            className="h-100 overflow-scroll"
            style={{ width: HISTORY_WIDTH }}
          >
            <History
              history={state.history}
              panes={state.panes}
              onClick={(path) => {
                setState((draft) => {
                  draft.panes.push(last(path));
                });
              }}
            />
          </div>
        </div>

        <div className="flex overflow-x-scroll">
          {state.panes.map((url, id) => {
            const { node, parents } = h.get(state.history, url);
            const { title } = node;
            const canGoBack = parents.length > 0;
            const canGoForward = node.children.length > 0;

            const isFullscreen = id === state.fullscreenId;
            const width = isFullscreen
              ? `calc(100% - ${HISTORY_WIDTH}px)`
              : PANE_WIDTH;

            const className = `ba b--dark-gray bg-white h-100 w-100 flex-shrink-0 ${
              isFullscreen && "absolute w-100 z-3"
            }`;

            return (
              <div key={id} className={className} style={{ width }}>
                <Webview
                  src={url}
                  title={title}
                  history={history}
                  canGoBack={canGoBack}
                  canGoForward={canGoForward}
                  onSetTitle={(newTitle) => {
                    setState((draft) => {
                      const url = draft.panes[id];

                      h.process(draft.history, url, (node) => {
                        node.title = newTitle;
                      });
                    });
                  }}
                  onGoBack={() => {
                    setState((draft) => {
                      draft.panes[id] = h.back(draft.history, draft.panes[id]);
                    });
                  }}
                  onGoForward={() => {
                    setState((draft) => {
                      draft.panes[id] = h.forward(
                        draft.history,
                        draft.panes[id]
                      );
                    });
                  }}
                  onNavigate={(newUrl) => {
                    const normalizedNewUrl = normalizeUrl(newUrl);

                    setState((draft) => {
                      const url = draft.panes[id];
                      h.navigate(draft.history, url, normalizedNewUrl);

                      draft.panes[id] = normalizedNewUrl;
                    });
                  }}
                  onNewWindow={(newUrl) => {
                    const normalizedNewUrl = normalizeUrl(newUrl);

                    setState((draft) => {
                      const url = draft.panes[id];
                      h.navigate(draft.history, url, normalizedNewUrl);

                      draft.panes.push(normalizedNewUrl);
                    });
                  }}
                  onClose={() => {
                    setState((draft) => {
                      draft.panes = draft.panes.filter(
                        (_, draftId) => draftId !== id
                      );

                      draft.fullscreenId = null;
                    });
                  }}
                  onFullscreen={() => {
                    setState((draft) => {
                      draft.fullscreenId =
                        draft.fullscreenId === null ? id : null;
                    });
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
