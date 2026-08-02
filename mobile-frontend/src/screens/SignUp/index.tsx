import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  Alert,
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
import { US_STATES } from "../../constants/usStates";
import { useAuth } from "../../context/AuthContext";
import { colors, radii, space } from "../../theme/designTokens";
import { generateElectoralId } from "../../utils/electoralId";

interface Form {
  name: string;
  email: string;
  address: string;
  province: string;
  password: string;
}

const empty: Form = {
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
      const electoralId = generateElectoralId();
      const result = await onRegister?.({ ...form, electoralId });
      if (result?.success) {
        Alert.alert(
          "Success",
          `Registration successful! Your Electoral ID is ${electoralId}. Save it, you'll need it to sign in.`,
          [{ text: "OK", onPress: () => navigation.navigate("SignIn") }],
        );
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
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>State</Text>
              <View style={styles.pickerBorder}>
                <Picker
                  selectedValue={form.province}
                  onValueChange={(v) => set("province")(v)}
                >
                  <Picker.Item label="Select your state" value="" />
                  {US_STATES.map((state) => (
                    <Picker.Item key={state} label={state} value={state} />
                  ))}
                </Picker>
              </View>
            </View>
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
  fieldWrap: { marginBottom: space.md },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.ink,
    marginBottom: 6,
  },
  pickerBorder: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    overflow: "hidden",
  },
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
