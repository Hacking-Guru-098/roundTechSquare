import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { login } from "../api/auth";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuth } from "../hooks/useAuth";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { getErrorMessage } from "../utils/errors";
import { theme } from "../utils/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

type FormValues = { email: string; password: string };

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onChange"
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      await signIn(data.token);
    }
  });

  const onSubmit = handleSubmit((values) => mutation.mutate(values));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.brandContainer}>
          <Text style={styles.brandLogo}>⚡</Text>
          <Text style={styles.brandName}>TaskSphere</Text>
          <Text style={styles.brandTagline}>Sleek. Fast. Minimalistic.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to pick up right where you left off.</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" }
              }}
              render={({ field: { value, onChange } }) => (
                <Input label="Email Address" value={value} onChangeText={onChange} placeholder="you@example.com" />
              )}
            />
            {!!errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" }
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                />
              )}
            />
            {!!errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

            {!!mutation.error && <Text style={styles.formError}>{getErrorMessage(mutation.error, "Invalid credentials")}</Text>}

            <View style={{ marginTop: 8 }}>
              <Button
                title="Sign In"
                onPress={onSubmit}
                disabled={mutation.isPending || isSubmitting}
                loading={mutation.isPending || isSubmitting}
              />
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.mutedText}>New here?</Text>
            <Pressable onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.linkText}>Create an account</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  scrollContainer: { flexGrow: 1, padding: theme.spacing.lg, justifyContent: "center" },
  brandContainer: { alignItems: "center", marginBottom: 32 },
  brandLogo: { fontSize: 44, marginBottom: 8, textShadowColor: theme.colors.primary, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 },
  brandName: { fontSize: 28, fontWeight: "900", color: theme.colors.text, letterSpacing: 0.5 },
  brandTagline: { fontSize: 14, color: theme.colors.muted, marginTop: 4, fontWeight: "500" },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg + 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4
  },
  header: { gap: 6 },
  title: { fontSize: 22, fontWeight: "800", color: theme.colors.text, letterSpacing: 0.2 },
  subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 },
  form: { gap: theme.spacing.md },
  errorText: { color: theme.colors.danger, fontWeight: "600", fontSize: 12, marginTop: -4 },
  formError: { color: theme.colors.danger, fontWeight: "700", textAlign: "center", fontSize: 13 },
  footerRow: { flexDirection: "row", gap: 6, justifyContent: "center", alignItems: "center", marginTop: 4 },
  mutedText: { color: theme.colors.muted, fontSize: 14 },
  linkText: { color: theme.colors.primary, fontWeight: "700", fontSize: 14 }
});
