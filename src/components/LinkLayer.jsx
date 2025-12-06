import { getConnectionPoint } from "../utils/canvasMath";

export default function LinkLayer({ links, getIdeaById, onRemove }) {
  return (
 <svg className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-visible">

      
      {/* Arrow head */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#374151" fillOpacity="0.6"/>
        </marker>
      </defs>

      {links.map((link, i) => {
        const from = getIdeaById(link.from);
        const to = getIdeaById(link.to);

        if (!from || !to) return null;

        const { fromX, fromY, toX, toY } = getConnectionPoint(from, to);

        return (
          <g className="pointer-events-auto" key={i}>
            <line
              x1={fromX}
              y1={fromY}
              x2={toX}
              y2={toY}
              stroke="#374151"
              strokeWidth={2}
              strokeOpacity={0.6}
              markerEnd="url(#arrowhead)"
            />

            <circle
              cx={(fromX + toX) / 2}
              cy={(fromY + toY) / 2}
              r={10}
              fill="red"
              className="cursor-pointer"
              onClick={() => onRemove(i)}
            />

            <text
              x={(fromX + toX) / 2}
              y={(fromY + toY) / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={8}
              fill="white"
            >
              ✕
            </text>
          </g>
        );
      })}
    </svg>
  );
}
