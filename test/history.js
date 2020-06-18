const { last } = require("lodash");

const history = {
  item: "A",
  current: true,
  children: [],
};

// helpers

const traverse = (tree, callback, parent) => {
  callback(tree, parent);
  tree.children.forEach((node) => traverse(node, callback, tree));
};

class Exit extends Error {
  constructor(arg) {
    super();
    this.arg = arg;
  }
}

const callcc = (fn) => {
  const exit = (arg) => {
    throw new Exit(arg);
  };

  try {
    return fn(exit);
  } catch (e) {
    if (e instanceof Exit) {
      return e.arg;
    } else {
      throw e;
    }
  }
};

// main functions

const navigate = (history, item) => {
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

const back = (history) => {
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

const forward = (history) => {
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

//

const log = () =>
  console.log(
    Array.from({ length: 30 })
      .map(() => "-")
      .join("") + "\n",
    JSON.stringify(history, null, 2)
  );

navigate(history, "B");
navigate(history, "C");
navigate(history, "D");
log();

back(history);
back(history);
back(history);
log();

// forward(history);
// log();

navigate(history, "E");
navigate(history, "F");
log();

// back(history);
// back(history);
// log();

// forward(history);
// forward(history);
// log();
