import React from "react";
import * as d3 from "d3";

const createLink = d3
  .linkVertical()
  .x((d) => d.x)
  .y((d) => d.y);

export default ({ history }) => {
  console.log({ history });

  const root = d3.hierarchy(history);

  console.log({ root });

  const tree = d3.tree().nodeSize([10, 0])(
    root.sort((a, b) => a.data.timestamp - b.data.timestamp)
  );

  console.log({ tree });

  const descendants = tree.descendants();
  descendants.forEach((d, i) => {
    d.y = i * 20;
  });

  const links = tree.links().map(createLink);

  console.log({ descendants, links });

  return (
    <svg width={600} height={300}>
      <g transform="translate(10,10)">
        {links.map((link) => {
          return <path d={link} stroke="#777" fill="none" />;
        })}

        {descendants.map((d) => {
          const fill = d.data.current ? "#ddd" : "#777";

          return (
            <g>
              <circle cx={d.x} cy={d.y} r={2} fill={fill} />
              <text x={50} y={d.y} fill={fill} fontSize={14} dy={5}>
                {d.data.item}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};
