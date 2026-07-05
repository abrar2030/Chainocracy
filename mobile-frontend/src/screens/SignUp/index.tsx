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

interface Form {
  electoralId: string;
  name: string;
  email: string;
  address: string;
  province: string;
  password: string;
}

const empty: Form = {
  electoralId: "",
  name: "",
  email: "",
  address: "",
  province: "",
  password: "",
};

export function SignUp({ navigation }: any) {
  const { onRegister } = useAuth();
  const [form, setForm] = useState<Form>(empty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof Form) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const submit = async () => {
    setError(null);
    const missing = Object.values(form).some((v) => !v);
    if (missing) {
      setError("Fill in every field to create your account.");
      return;
    }
    setLoading(true);
    try {
      const result = await onRegister?.(form);
      if (result?.success) {
        navigation.navigate("SignIn");
      } else {
        setError(result?.message || "Registration failed. Try again.");
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
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Register to take part.</Text>

          <View style={styles.form}>
            <TextField
              label="Electoral ID"
              value={form.electoralId}
              onChangeText={set("electoralId")}
            />
            <TextField
              label="Full name"
              value={form.name}
              onChangeText={set("name")}
            />
            <TextField
              label="Email"
              value={form.email}
              onChangeText={set("email")}
              keyboardType="email-address"
            />
            <TextField
              label="Address"
              value={form.address}
              onChangeText={set("address")}
            />
            <TextField
              label="Province"
              value={form.province}
              onChangeText={set("province")}
            />
            <TextField
              label="Password"
              value={form.password}
              onChangeText={set("password")}
              secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button label="Create account" onPress={submit} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already registered? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
              <Text style={styles.link}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: space.lg, paddingBottom: space.xxl },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.ink,
    marginTop: space.lg,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 16, color: colors.muted, marginTop: space.xs },
  form: { marginTop: space.lg },
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
