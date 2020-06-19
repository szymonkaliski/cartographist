import { last } from "lodash";
import { callcc, traverse } from "./utils";

export const navigate = (history, item) => {
  callcc((exit) => {
    traverse(history, (node) => {
      if (node.current) {
        node.current = false;
        node.children.push({
          item,
          current: true,
          children: [],
        });

        exit();
      }
    });
  });
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
        exit({ ...node, parent });
      }
    });
  });
};
