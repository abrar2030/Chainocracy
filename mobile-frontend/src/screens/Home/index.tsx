import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChainMark from "../../components/brand/ChainMark";
import Logo from "../../components/brand/Logo";
import { Button } from "../../components/ui/Primitives";
import { colors, radii, space } from "../../theme/designTokens";

const steps = [
  { n: "01", title: "Register", body: "Enroll with your electoral ID." },
  { n: "02", title: "Verify", body: "Confirm identity with a one-time code." },
  { n: "03", title: "Vote", body: "Your ballot is sealed into the chain." },
  {
    n: "04",
    title: "Results",
    body: "Tallies are published for anyone to check.",
  },
];

export function Home({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Logo />
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>BLOCKCHAIN ELECTIONS</Text>
          <Text style={styles.title}>
            Elections you can count on, and anyone can check.
          </Text>
          <Text style={styles.subtitle}>
            QuantumBallot records every vote as a verified block in a shared
            chain. The chain keeps it honest.
          </Text>
        </View>

        <View style={styles.chainCard}>
          <View style={styles.chainCardTop}>
            <Text style={styles.chainLabel}>LIVE CHAIN</Text>
            <Text style={styles.sealed}>sealed</Text>
          </View>
          <ChainMark count={4} width={280} height={88} />
        </View>

        <View style={styles.steps}>
          {steps.map((s) => (
            <View key={s.n} style={styles.stepCard}>
              <Text style={styles.stepNum}>{s.n}</Text>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepBody}>{s.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            label="Create account"
            onPress={() => navigation.navigate("SignUp")}
          />
          <View style={{ height: space.sm }} />
          <Button
            label="Sign in"
            variant="secondary"
            onPress={() => navigation.navigate("SignIn")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg, paddingBottom: space.xxl },
  header: { marginBottom: space.xl },
  hero: { marginBottom: space.lg },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: space.sm,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.ink,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: space.md,
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
  },
  chainCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    marginBottom: space.lg,
  },
  chainCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: space.sm,
  },
  chainLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  sealed: { color: colors.accent, fontSize: 11, fontWeight: "600" },
  steps: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: space.lg,
  },
  stepCard: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    marginBottom: space.md,
  },
  stepNum: { color: colors.primary, fontWeight: "700", marginBottom: 6 },
  stepTitle: { fontSize: 16, fontWeight: "600", color: colors.ink },
  stepBody: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  actions: { marginTop: space.sm },
});
