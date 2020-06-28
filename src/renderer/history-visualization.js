import React from "react";
import * as d3 from "d3";
import { sortBy } from "lodash";

import { traverse } from "./utils";

const createLink = d3
  .linkVertical()
  .x((d) => d.x)
  .y((d) => d.y);

const pathForNode = (node) => {
  let path = [];

  traverse(
    node,
    (node) => node && path.push(node.data.url),
    (node) => (node ? [node.parent] : [])
  );

  return path.reverse();
};


export default ({ history, onClick }) => {
  console.log("history", history);

  let items = [];
  traverse(history, (node, parents) => {
    items.push({ data: node, parents });
  });

  items = sortBy(items, "data.timestamp");

  let splitPoints = []

  console.log(items)

  // for (let item of items) {
  //   if (item.data.children.length > 1) {
  //     // splitPoints.push(item.data.url)
  //   }

  //   const path = pathForNode(item)

  //   console.log({ splitPoints, path, item})

  //   // console.log(item.title, '\t', item.children.length)
  // }

  // console.log("items", items);

  // ---

  const root = d3.hierarchy(history);
  // .sort((a, b) => a.data.timestamp - b.data.timestamp);

  const tree = d3.tree().nodeSize([10, 100])(root);

  const descendants = tree.descendants();
  descendants.forEach((d, i) => {
    d.y = i * 20;
  });

  const links = tree.links().map(createLink);

  // console.log({ descendants, links });

  return (
    <svg width={600} height={300}>
      <g transform="translate(20,10)">
        {links.map((link, i) => {
          return <path key={i} d={link} stroke="#777" fill="none" />;
        })}

        {descendants.map((d) => {
          const fill = d.data.current ? "#ddd" : "#777";
          const path = pathForNode(d);

          return (
            <g
              key={path.join("-")}
              className="dim pointer"
              onClick={() => onClick(path)}
            >
              <circle cx={d.x} cy={d.y} r={2} fill={fill} />
              <text x={50} y={d.y} fill={fill} fontSize={14} dy={5}>
                {d.data.title || d.data.url}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};
