import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChainMark from "../../components/brand/ChainMark";
import Logo from "../../components/brand/Logo";
import { Button } from "../../components/ui/Primitives";
import { useAuth } from "../../context/AuthContext";
import { colors, radii, space } from "../../theme/designTokens";

const shortcuts = [
  { key: "Menu", label: "Vote", body: "Open the ballot and cast your vote." },
  {
    key: "News",
    label: "Election news",
    body: "Latest updates and announcements.",
  },
];

export function Dashboard({ navigation }: any) {
  const { authState, onLogOut } = useAuth();
  const email = authState?.email || "voter";

  const signOut = async () => {
    await onLogOut?.();
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Logo />
          <TouchableOpacity onPress={signOut}>
            <Text style={styles.signOut}>Sign out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Welcome back.</Text>
        <Text style={styles.subtitle}>{email}</Text>

        <View style={styles.chainCard}>
          <Text style={styles.chainLabel}>CHAIN STATUS</Text>
          <Text style={styles.chainText}>
            The ledger is sealed and linked. Your ballot is verifiable end to
            end.
          </Text>
          <ChainMark count={4} width={260} height={80} />
          <View style={{ marginTop: space.md }}>
            <Button
              label="Enter voting"
              onPress={() => navigation.navigate("Menu")}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Jump back in</Text>
        <View style={styles.grid}>
          {shortcuts.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(s.key)}
            >
              <Text style={styles.cardTitle}>{s.label}</Text>
              <Text style={styles.cardBody}>{s.body}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg, paddingBottom: space.xxl },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.xl,
  },
  signOut: { color: colors.muted, fontWeight: "600" },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: space.xs },
  chainCard: {
    backgroundColor: colors.ink,
    borderRadius: radii.lg,
    padding: space.lg,
    marginTop: space.lg,
  },
  chainLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  chainText: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 23,
    marginTop: space.sm,
    marginBottom: space.md,
    opacity: 0.85,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
    marginTop: space.xl,
    marginBottom: space.md,
  },
  grid: { flexDirection: "row", justifyContent: "space-between" },
  card: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: colors.ink },
  cardBody: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
});
