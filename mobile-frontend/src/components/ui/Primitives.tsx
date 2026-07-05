import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, radii, space } from "../../theme/designTokens";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.btn,
        isPrimary && styles.btnPrimary,
        isSecondary && styles.btnSecondary,
        variant === "ghost" && styles.btnGhost,
        (disabled || loading) && styles.btnDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.white : colors.primary} />
      ) : (
        <Text
          style={[
            styles.btnLabel,
            isPrimary ? styles.btnLabelLight : styles.btnLabelDark,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

interface TextFieldProps extends TextInputProps {
  label: string;
}

export function TextField({ label, ...rest }: TextFieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoCapitalize="none"
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 50,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.lg,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnSecondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  btnGhost: { backgroundColor: "transparent" },
  btnDisabled: { opacity: 0.6 },
  btnLabel: { fontSize: 15, fontWeight: "600" },
  btnLabelLight: { color: colors.white },
  btnLabelDark: { color: colors.ink },
  fieldWrap: { marginBottom: space.md },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.ink,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: space.md,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.white,
  },
});
