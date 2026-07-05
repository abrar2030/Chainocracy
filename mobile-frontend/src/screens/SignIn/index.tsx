import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../../components/brand/Logo";
import { Button, TextField } from "../../components/ui/Primitives";
import { useAuth } from "../../context/AuthContext";
import { colors, radii, space } from "../../theme/designTokens";

export function SignIn({ navigation }: any) {
  const { onLogin } = useAuth();
  const [electoralId, setElectoralId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!electoralId || !password) {
      setError("Enter your electoral ID and password to continue.");
      return;
    }
    setLoading(true);
    try {
      const result = await onLogin?.(electoralId.trim(), password);
      if (result?.success) {
        navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
      } else {
        setError(result?.message || "Sign in failed. Check your details.");
      }
    } catch {
      setError("We could not reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Logo />
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Access your ballot.</Text>

          <View style={styles.form}>
            <TextField
              label="Electoral ID"
              value={electoralId}
              onChangeText={setElectoralId}
              autoComplete="username"
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={{ marginTop: space.sm }}>
              <Button label="Sign in" onPress={submit} loading={loading} />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.link}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg, flexGrow: 1, justifyContent: "center" },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.ink,
    marginTop: space.xl,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 16, color: colors.muted, marginTop: space.xs },
  form: { marginTop: space.xl },
  error: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: space.md,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.sm,
    padding: space.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: space.lg,
  },
  footerText: { color: colors.muted },
  link: { color: colors.primary, fontWeight: "600" },
});
