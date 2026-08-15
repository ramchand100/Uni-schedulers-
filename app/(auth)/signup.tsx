import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { theme } from '@/lib/colors';
import { supabase } from '@/lib/supabase';
import { signupSchema } from '@/lib/validation';

interface FormValues {
  email: string;
  password: string;
}

export default function SignupScreen() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path[0] as keyof FormValues, { message: issue.message });
      }
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await supabase.auth.signUp(parsed.data);
    setIsSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    if (!data.session) {
      // Email confirmation is required by the Supabase project's auth settings.
      setConfirmationSent(true);
    }
    // If a session came back immediately, AuthProvider picks it up and
    // RootNavigator sends the user into onboarding.
  };

  if (confirmationSent) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>We sent you a confirmation link. Open it, then come back and log in.</Text>
          <Button title="Back to login" onPress={() => router.replace('/(auth)/login')} variant="secondary" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Build your timetable and connect with classmates.</Text>

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

          <Button title="Sign up" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Text style={styles.link} onPress={() => router.replace('/(auth)/login')}>
            {' '}
            Log in
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: theme.textMuted,
  },
  link: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
