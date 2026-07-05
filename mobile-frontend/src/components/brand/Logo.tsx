import { StyleSheet, Text, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { colors } from "../../theme/designTokens";

interface LogoProps {
  tone?: "light" | "dark";
}

/** Wordmark with a sealed-block mark. Mirrors the web logo. */
export default function Logo({ tone = "dark" }: LogoProps) {
  const textColor = tone === "light" ? colors.white : colors.ink;
  return (
    <View style={styles.row}>
      <Svg width={28} height={28} viewBox="0 0 32 32">
        <Rect x={3} y={3} width={26} height={26} rx={8} fill={colors.primary} />
        <Path
          d="M 11 16 l 3.5 4 l 7 -8"
          stroke={colors.accent}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
      <Text style={[styles.word, { color: textColor }]}>
        Quantum<Text style={{ color: colors.primary }}>Ballot</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  word: { fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },
});
