export const traverse = (tree, callback, parent) => {
  callback(tree, parent);
  tree.children.forEach((node) => traverse(node, callback, tree));
};

class Exit extends Error {
  constructor(arg) {
    super();
    this.arg = arg;
  }
}

export const callcc = (fn) => {
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
