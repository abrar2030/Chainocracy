import Svg, { G, Line, Path, Rect } from "react-native-svg";
import { colors } from "../../theme/designTokens";

interface ChainMarkProps {
  count?: number;
  width?: number;
  height?: number;
}

/**
 * The signature element: a short chain of sealed, linked ballot blocks, each
 * with a verification check. Mirrors the web ChainMark so both apps share it.
 */
export default function ChainMark({
  count = 4,
  width = 240,
  height = 88,
}: ChainMarkProps) {
  const gap = 78;
  const blocks = Array.from({ length: count });

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${count * gap} 96`}
      accessibilityLabel="A chain of verified ballot blocks"
    >
      {blocks.map((_, i) => {
        const x = i * gap + 14;
        return (
          <G key={i}>
            {i > 0 ? (
              <Line
                x1={x - gap + 50}
                y1={48}
                x2={x}
                y2={48}
                stroke={i % 2 === 0 ? colors.primary : colors.accent}
                strokeWidth={3}
                strokeLinecap="round"
              />
            ) : null}
            <Rect
              x={x}
              y={24}
              width={48}
              height={48}
              rx={12}
              fill={i === count - 1 ? colors.primary : colors.ink2}
            />
            <Path
              d={`M ${x + 15} ${48} l 6 7 l 12 -14`}
              stroke={colors.accent}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </G>
        );
      })}
    </Svg>
  );
}
