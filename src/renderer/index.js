import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import fs from "fs";
import md5 from "md5";
import normalizeUrl from "normalize-url";
import { ipcRenderer, remote } from "electron";
import { last } from "lodash";

import "tachyons/src/tachyons.css";
import "./inject"; // so we reload when inject changes

import * as h from "./history";
import Webview from "./webview";
import History from "./history-visualization";
import usePersistedImmer from "./use-persisted-immer";

const PANE_WIDTH = 640;
const HISTORY_WIDTH = 420;

const NEW_URL = normalizeUrl("https://duckduckgo.com");

const createEmptyState = () => {
  return {
    history: h.create(NEW_URL),
    panes: [NEW_URL],
    fullscreenId: null,
  };
};

const App = () => {
  const [state, setState] = usePersistedImmer("state", createEmptyState());
  const [lastStoreHash, setLastStoreHash] = useState(null);

  const replaceStateFromObject = (obj) => {
    setState((draft) => {
      Object.entries(obj).forEach(([key, value]) => {
        draft[key] = value;
      });
    });
  };

  const resetToInitialState = () => replaceStateFromObject(createEmptyState());

  // debugging tools
  useEffect(() => {
    window.reset = resetToInitialState;
    window.state = state;
  }, [state, setState]);

  const onNewPane = () => {
    setState((draft) => {
      h.navigate(draft.history, draft.history.url, NEW_URL);
      draft.panes.push(normalizeUrl(NEW_URL));
    });
  };

  useEffect(() => {
    ipcRenderer.on("NEW_PANE", () => {
      onNewPane();
    });

    ipcRenderer.on("NEW_TRAIL", () => {
      const currentHash = md5(JSON.stringify(state));

      if (currentHash !== lastStoreHash) {
        const result = remote.dialog.showMessageBoxSync({
          type: "warning",
          message:
            "Current trail has unsaved changes, creating a new one will loose them. Do you want to proceed?",
          buttons: ["Yes", "No"],
        });

        const chosenNo = result === 1;

        if (chosenNo) {
          return;
        }
      }

      resetToInitialState();
    });

    ipcRenderer.on("SAVE_TRAIL", () => {
      const savePath = remote.dialog.showSaveDialogSync({
        title: "Save Trail",
        defaultPath: "cartographist.trail",
      });

      if (!savePath) {
        return;
      }

      const stringified = JSON.stringify(state);

      setLastStoreHash(md5(stringified));
      fs.writeFileSync(savePath, stringified);
    });

    ipcRenderer.on("LOAD_TRAIL", () => {
      let loadPath = remote.dialog.showOpenDialogSync({
        filters: [{ name: "Trails", extensions: "trail" }],
      });

      if (!loadPath || loadPath.length === 0) {
        return;
      }

      loadPath = loadPath[0];

      let data, parsed;

      try {
        data = fs.readFileSync(loadPath);
        parsed = JSON.parse(data);
      } catch (e) {
        alert(e.toString());
      }

      if (data && parsed) {
        setLastStoreHash(md5(data));
        replaceStateFromObject(parsed);
      }
    });

    return () => {
      ipcRenderer.removeAllListeners("NEW_PANE");
      ipcRenderer.removeAllListeners("NEW_TRAIL");
      ipcRenderer.removeAllListeners("SAVE_TRAIL");
      ipcRenderer.removeAllListeners("LOAD_TRAIL");
    };
  }, [state, onNewPane, lastStoreHash, setLastStoreHash]);

  return (
    <div className="sans-serif bg-near-white vh-100 flex flex-column">
      <div className="flex h-100">
        <div className="flex flex-column bg-dark-gray">
          <div style={{ WebkitAppRegion: "drag", height: 38 }}>
            <div className="fr pa1">
              <button
                className="bg-dark-gray light-gray bw0 pointer dim f4"
                title="Fullscreen"
                onClick={onNewPane}
              >
                +
              </button>
            </div>
          </div>

          <div
            className="h-100 overflow-scroll"
            style={{ width: HISTORY_WIDTH }}
          >
            <History
              history={state.history}
              panes={state.panes}
              onClick={(path) => {
                setState((draft) => {
                  const targetUrl = last(path);

                  // don't create duplicate panes
                  if (draft.panes.some((pane) => pane === targetUrl)) {
                    return;
                  }

                  draft.panes.push(targetUrl);
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
