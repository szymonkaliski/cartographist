import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { last } from "lodash";
import produce from "immer";

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
      item: "https://en.m.wikipedia.org/wiki/Double-loop_learning",
      current: true,
      children: [],
    },
  ]);

  console.log(histories);

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

          const url = current.item;
          const canGoBack = !!current.parent;
          const canGoForward = current.children.length > 0;

          return (
            <div key={i + "-" + url} className="ba b--dark-gray bg-dark-gray">
              <Webview
                src={url}
                history={history}
                canGoBack={canGoBack}
                canGoForward={canGoForward}
                onGoBack={() => {
                  setHistories(
                    replaceAt(
                      histories,
                      i,
                      produce(history, (draft) => {
                        h.back(draft);
                      })
                    )
                  );
                }}
                onGoForward={() => {
                  setHistories(
                    replaceAt(
                      histories,
                      i,
                      produce(history, (draft) => {
                        h.forward(draft);
                      })
                    )
                  );
                }}
                onNavigate={(newUrl) => {
                  if (url === newUrl) {
                    return;
                  }

                  const newHistory = produce(history, (draft) => {
                    h.navigate(draft, newUrl);
                  });

                  setHistories(replaceAt(histories, i, newHistory));
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
