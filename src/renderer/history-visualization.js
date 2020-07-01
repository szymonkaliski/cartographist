import React from "react";
import * as d3 from "d3";
import { sortBy, findLastIndex, last, chain } from "lodash";

import { traverse } from "./utils";

// const createLink = d3
//   .linkVertical()
//   .x((d) => d.x)
//   .y((d) => d.y);

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

  const splitPoints = items
    .filter((item) => {
      return item.data.children.length > 1;
    })
    .map((item) => item.data.url);

  console.log("splitPoints", splitPoints);

  const branches = chain(items)
    .filter((item) => {
      return item.data.children.length > 1;
    })
    .flatMap((item, i) => {
      console.log("here", item);

      if (item.parents.length > 0 || i === 0) {
        return item.data.children.slice(1);
      }

      return item.data.children;
    })
    .sortBy("timestamp")
    .map("url")
    .value();

  console.log("branches", branches);

  // let runningOffset = 0
  // const itemsWithBranchesOld = items.map((item) => {
  //   const matching = item.parents.filter((p) => {
  //     return splitPoints.find((url) => p.url === url);
  //   });

  //   console.log(item.data.url, "matching", matching, item);

  //   let offset = 0;
  //   matching.forEach((m) => {
  //     let found = false;
  //     m.children.forEach((childTree, i) => {
  //       if (!found) {
  //         traverse(childTree, (node) => {
  //           if (!found && node.url === item.data.url) {
  //             found = true;
  //             offset += i;
  //           }
  //         });
  //       }
  //     });
  //   });

  //   return { ...item, offset };
  // });

  const itemsWithBranches = items.map((item) => {
    const matching = [...item.parents, item.data].map((p) => {
      return branches.findIndex((url) => p.url === url);
    });

    const self = branches.findIndex((url) => item.data.url === url);

    console.log(item.data.url, "matching", matching, self);

    let offset = Math.max(0, Math.max(...matching) + 1);
    // if (self > 0) {
    //   offset = self;
    // }

    // let offset = Math.max(0, matching.find(m => m > 0) || 0);

    // let offset = 0;
    // matching.forEach((m) => {
    //   let found = false;
    //   m.children.forEach((childTree, i) => {
    //     if (!found) {
    //       traverse(childTree, (node) => {
    //         if (!found && node.url === item.data.url) {
    //           found = true;
    //           offset += i;
    //         }
    //       });
    //     }
    //   });
    // });

    return { ...item, offset };
  });

  const itemsOnGrid = itemsWithBranches.map((item, i) => {
    return {
      ...item,
      gx: item.offset,
      gy: i,
    };
  });

  console.log("itemsOnGrid", itemsOnGrid);

  // itemsWithBranches.forEach(item => {
  //   console.log(item.offset, item.data.url)
  // })

  // console.log("splitPoints", splitPoints);
  // console.log("itemsWithBranches", itemsWithBranches);

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

  // const root = d3.hierarchy(history);
  // // .sort((a, b) => a.data.timestamp - b.data.timestamp);

  // const tree = d3.tree().nodeSize([10, 100])(root);

  // const descendants = tree.descendants();
  // descendants.forEach((d, i) => {
  //   d.y = i * 20;
  // });

  // const links = tree.links().map(createLink);

  // console.log({ descendants, links });

  // ---

  const offsets = Array.from(new Set(itemsOnGrid.map((i) => i.offset))).map(
    (offset) => {
      const startItem = itemsOnGrid
        .map((item, idx) => ({ item, idx }))
        .find((i) => i.item.offset === offset);

      let start = 0;
      // startItem.idx;

      if (startItem.item.parents.length > 0) {
        const url = last(startItem.item.parents).url;

        console.log("offset, url", startItem, offset, url);

        const parent = itemsOnGrid.find((item) => item.data.url === url);
        start = parent.gy;
      }

      // console.log({ offset, startItem });

      // const start = startItem.idx;
      const end = findLastIndex(itemsOnGrid, (i) => i.offset === offset);

      return { offset, start, end };
    }
  );

  console.log("offsets", offsets);

  return (
    <div>
      <svg width={600} height={300}>
        <g transform="translate(6, 6)">
          {offsets.map(({ start, end, offset }) => {
            return (
              <line
                x1={offset * 14}
                y1={start * 16}
                x2={offset * 14}
                y2={end * 16}
                stroke="#777"
              />
            );
          })}

          {itemsOnGrid.map((item, i) => {
            const { data, gx, gy } = item;

            const fill = data.current ? "#ddd" : "#777";

            return (
              <g
                className="dim pointer"
                transform={`translate(0, ${gy * 16})`}
                onClick={() => {
                  const path = item.parents
                    .map((p) => p.url)
                    .concat([data.url]);

                  onClick(path);
                }}
              >
                <circle cx={gx * 14} cy={0} r={2} fill={fill} />

                <text x={100} y={5} fill={fill} fontSize={14}>
                  {data.title || data.url}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* <hr /> */}

      {/* <div className="f6"> */}
      {/*   {itemsWithBranches.map((item) => { */}
      {/*     return ( */}
      {/*       <div className="flex"> */}
      {/*         <div style={{ width: 100 }}> */}
      {/*           <div style={{ marginLeft: item.offset * 14 }}>.</div> */}
      {/*         </div> */}
      {/*         <div>{item.data.title}</div> */}
      {/*       </div> */}
      {/*     ); */}
      {/*   })} */}
      {/* </div> */}

      {/* <hr /> */}

      {/* <svg width={600} height={300}> */}
      {/*   <g transform="translate(20,10)"> */}
      {/*     {links.map((link, i) => { */}
      {/*       return <path key={i} d={link} stroke="#777" fill="none" />; */}
      {/*     })} */}

      {/*     {descendants.map((d) => { */}
      {/*       const fill = d.data.current ? "#ddd" : "#777"; */}
      {/*       const path = pathForNode(d); */}

      {/*       return ( */}
      {/*         <g */}
      {/*           key={path.join("-")} */}
      {/*           className="dim pointer" */}
      {/*           onClick={() => onClick(path)} */}
      {/*         > */}
      {/*           <circle cx={d.x} cy={d.y} r={2} fill={fill} /> */}
      {/*           <text x={50} y={d.y} fill={fill} fontSize={14} dy={5}> */}
      {/*             {d.data.title || d.data.url} */}
      {/*           </text> */}
      {/*         </g> */}
      {/*       ); */}
      {/*     })} */}
      {/*   </g> */}
      {/* </svg> */}
    </div>
  );
};
