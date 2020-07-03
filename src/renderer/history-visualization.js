import React, { useMemo } from "react";
import { sortBy, findLastIndex, last, chain } from "lodash";

import { traverse } from "./utils";

export default ({ history, onClick }) => {
  const { items, offsets } = useMemo(() => {
    let items = [];

    traverse(history, (node, parents) => {
      items.push({ data: node, parents });
    });

    items = sortBy(items, "data.timestamp");

    const branches = chain(items)
      .filter((item) => item.data.children.length > 1)
      .flatMap((item, i) => {
        if (item.parents.length > 0 || i === 0) {
          return item.data.children.slice(1);
        }

        return item.data.children;
      })
      .sortBy("timestamp")
      .map("url")
      .value();

    items = items.map((item, i) => {
      const matching = [...item.parents, item.data].map((d) =>
        branches.findIndex((url) => d.url === url)
      );

      const gx = Math.max(0, Math.max(...matching) + 1);
      const gy = i;

      return { ...item, gx, gy };
    });

    const offsets = Array.from(new Set(items.map((item) => item.gx))).map(
      (offset) => {
        const startItem = items
          .map((item, idx) => ({ item, idx }))
          .find(({ item }) => item.gx === offset);

        let start = 0;

        if (startItem.item.parents.length > 0) {
          const url = last(startItem.item.parents).url;

          const parent = items.find((item) => item.data.url === url);
          start = parent.gy;
        }

        const end = findLastIndex(items, (item) => item.gx === offset);

        return { offset, start, end };
      }
    );

    return { items, offsets };
  }, [history]);

  return (
    <div>
      <svg width={600} height={300}>
        <g transform="translate(6, 6)">
          {offsets.map(({ start, end, offset }, i) => {
            return (
              <line
                key={i}
                x1={offset * 14}
                y1={start * 16}
                x2={offset * 14}
                y2={end * 16}
                stroke="#777"
              />
            );
          })}

          {items.map((item, i) => {
            const { data, gx, gy } = item;
            const fill = data.current ? "#ddd" : "#777";

            return (
              <g
                key={i}
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
    </div>
  );
};
