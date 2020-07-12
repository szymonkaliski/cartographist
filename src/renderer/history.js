import { last } from "lodash";
import { callcc, traverse } from "./utils";

export const create = (url) => {
  return {
    url,
    title: "",
    children: [],
    timestamp: Date.now(),
  };
};

export const navigate = (history, fromUrl, toUrl) => {
  if (fromUrl === toUrl) {
    return;
  }

  const alreadyExists = callcc((exit) => {
    traverse(history, (node) => {
      if (node.url === toUrl) {
        exit(true);
      }
    });
  });

  if (alreadyExists) {
    return;
  }

  callcc((exit) => {
    traverse(history, (node) => {
      if (node.url === fromUrl) {
        const existingChild = node.children.find((n) => n.url === toUrl);

        if (existingChild) {
          exit();
        }

        node.children.push(create(toUrl));
      }
    });
  });
};

export const back = (history, url) => {
  return callcc((exit) => {
    traverse(history, (node, parents) => {
      if (node.url === url) {
        const parent = last(parents);

        if (parent !== undefined) {
          exit(parent.url);
        }

        exit();
      }
    });
  });
};

export const forward = (history, url) => {
  return callcc((exit) => {
    traverse(history, (node) => {
      if (node.url === url) {
        if (node.children.length > 0) {
          exit(last(node.children).url);
        }

        exit();
      }
    });
  });
};

export const get = (history, url) => {
  return callcc((exit) => {
    traverse(history, (node, parents) => {
      if (node.url === url) {
        exit({ node, parents });
      }
    });
  });
};

export const process = (history, url, callback) => {
  callcc((exit) => {
    traverse(history, (node, parents) => {
      if (node.url === url) {
        callback(node, parents);
        exit();
      }
    });
  });
};
