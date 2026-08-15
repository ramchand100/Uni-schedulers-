import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { theme } from '@/lib/colors';
import { supabase } from '@/lib/supabase';
import { loginSchema } from '@/lib/validation';

interface FormValues {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path[0] as keyof FormValues, { message: issue.message });
      }
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setIsSubmitting(false);

    if (error) {
      setSubmitError(error.message);
    }
    // On success, AuthProvider picks up the session and RootNavigator redirects.
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to see your schedule and friends.</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Password"
                secureTextEntry
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />

          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

          <Button title="Log in" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />

          <Link href="/(auth)/forgot-password" style={styles.link}>
            Forgot password?
          </Link>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New here?</Text>
          <Text style={styles.link} onPress={() => router.push('/(auth)/signup')}>
            {' '}
            Create an account
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  title: {
    color: theme.text,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 15,
  },
  form: {
    gap: 14,
  },
  submitError: {
    color: theme.danger,
    fontSize: 14,
  },
  link: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: theme.textMuted,
  },
});
