import { last } from "lodash";
import { callcc, traverse } from "./utils";

export const navigate = (history, url) => {
  callcc((exit) => {
    traverse(history, (node) => {
      if (node.current) {
        node.current = false;

        node.children.push({
          url,
          title: "",
          timestamp: Date.now(),
          current: true,
          children: [],
        });

        exit();
      }
    });
  });
};

export const jump = (history, path) => {
  // reset all first
  traverse(history, (node) => {
    node.current = false;
  });

  // happy path coding...
  // assuming first item in path "fits" already
  let tmp = history;

  path.slice(1).forEach((p) => {
    tmp = tmp.children.find((h) => h.url === p);
  });

  if (tmp) {
    tmp.current = true;
  } else {
    throw new Error(`item not found for path: ${path}`);
  }
};

export const back = (history) => {
  callcc((exit) => {
    traverse(history, (node, parent) => {
      if (node.current) {
        if (parent !== undefined) {
          node.current = false;
          parent.current = true;
        }

        exit();
      }
    });
  });
};

export const forward = (history) => {
  callcc((exit) => {
    traverse(history, (node, parent) => {
      if (node.current) {
        if (node.children.length > 0) {
          node.current = false;
          last(node.children).current = true;
        }

        exit();
      }
    });
  });
};

export const current = (history) => {
  return callcc((exit) => {
    traverse(history, (node, parent) => {
      if (node.current) {
        exit({ node, parent });
      }
    });
  });
};

export const processCurrent = (history, callback) => {
  callcc((exit) => {
    traverse(history, (node, parent) => {
      if (node.current) {
        callback(node, parent);
        exit();
      }
    });
  });
};
