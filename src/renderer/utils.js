const traverseInternal = (tree, callback, parents, accessor) => {
  callback(tree, parents);

  accessor(tree).forEach((node) =>
    traverseInternal(node, callback, [...parents, tree], accessor)
  );
};

export const traverse = (
  tree,
  callback,
  accessor = (node) => node.children
) => {
  return traverseInternal(tree, callback, [], accessor);
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
