import React, { useMemo } from "react";
import { sortBy, findLastIndex, last, chain, identity } from "lodash";

import { traverse } from "./utils";

const [W, H] = [16, 16];

export default ({ history, onClick }) => {
  const { items, verticalLines, horizontalLines } = useMemo(() => {
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

    const verticalLines = Array.from(new Set(items.map((item) => item.gx)))
      .map((offset) => {
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
      })
      .filter((d) => d.start !== d.end);

    const horizontalLines = items
      .map((item) => {
        const { gy, gx } = item;

        const matches = verticalLines.filter((line) => line.start === gy);

        if (matches.length === 0) {
          return null;
        }

        return {
          offset: gy,
          start: gx,
          end: Math.max(...matches.map((m) => m.offset)),
        };
      })
      .filter(identity)
      .filter((d) => d.start !== d.end);

    return { items, verticalLines, horizontalLines };
  }, [history]);

  const maxX = Math.max(verticalLines.length, 1);
  const maxY = items.length;

  return (
    <div className="scroll" style={{ maxHeight: 260 }}>
      <svg width={600} height={maxY * H} className="pa2">
        <g transform="translate(2, 6)">
          {verticalLines.map(({ start, end, offset }, i) => (
            <line
              key={i}
              x1={offset * W}
              y1={start * H}
              x2={offset * W}
              y2={end * H}
              stroke="#777"
            />
          ))}

          {horizontalLines.map(({ start, end, offset }, i) => (
            <line
              key={i}
              x1={start * W}
              y1={offset * H}
              x2={end * W}
              y2={offset * H}
              stroke="#777"
            />
          ))}

          {items.map((item, i) => {
            const { data, gx, gy } = item;
            const fill = data.current ? "#ddd" : "#777";

            return (
              <g
                key={i}
                className="dim pointer"
                transform={`translate(0, ${gy * W})`}
                onClick={() => {
                  const path = item.parents
                    .map((p) => p.url)
                    .concat([data.url]);

                  onClick(path);
                }}
              >
                <circle cx={gx * W} cy={0} r={2} fill={fill} />
                <text x={maxX * W} y={5} fill={fill} fontSize={14}>
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
