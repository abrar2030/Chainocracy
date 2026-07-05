/**
 * ChainMark: the signature element. A short chain of ballot blocks, each sealed
 * with a verification check and linked to the next, expressing the core idea
 * that every vote becomes a verified, tamper-evident block in the chain.
 */

interface ChainMarkProps {
  count?: number;
  className?: string;
  animated?: boolean;
}

export default function ChainMark({
  count = 4,
  className = "",
  animated = true,
}: ChainMarkProps) {
  const blocks = Array.from({ length: count });
  const gap = 78;

  return (
    <svg
      viewBox={`0 0 ${count * gap} 96`}
      className={className}
      role="img"
      aria-label="A chain of verified ballot blocks"
      fill="none"
    >
      {blocks.map((_, i) => {
        const x = i * gap + 14;
        const delay = animated ? `${i * 0.14}s` : "0s";
        return (
          <g key={i}>
            {i > 0 && (
              <line
                className={animated ? "qb-linkline" : ""}
                x1={x - gap + 50}
                y1={48}
                x2={x}
                y2={48}
                stroke={colorFor(i)}
                strokeWidth={3}
                strokeLinecap="round"
                style={{ animationDelay: delay }}
              />
            )}
            <g
              className={animated ? "qb-block" : ""}
              style={{ animationDelay: delay }}
            >
              <rect
                x={x}
                y={24}
                width={48}
                height={48}
                rx={12}
                fill={i === count - 1 ? "#2E43C9" : "#16224A"}
              />
              <path
                d={`M ${x + 15} ${48} l 6 7 l 12 -14`}
                stroke="#17B6A5"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

function colorFor(i: number): string {
  return i % 2 === 0 ? "#2E43C9" : "#17B6A5";
}
