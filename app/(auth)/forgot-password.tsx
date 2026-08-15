import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { theme } from '@/lib/colors';
import { supabase } from '@/lib/supabase';
import { emailSchema } from '@/lib/validation';

interface FormValues {
  email: string;
}

export default function ForgotPasswordScreen() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { email: '' } });

  const onSubmit = async ({ email }: FormValues) => {
    setSubmitError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError('email', { message: parsed.error.issues[0]?.message });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data);
    setIsSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset your password</Text>
        {sent ? (
          <>
            <Text style={styles.subtitle}>If an account exists for that email, a reset link is on its way.</Text>
            <Button title="Back to login" onPress={() => router.replace('/(auth)/login')} variant="secondary" />
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>Enter your email and we&apos;ll send you a reset link.</Text>
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
              {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
              <Button title="Send reset link" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
            </View>
          </>
        )}
      </View>
    </View>
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
    gap: 20,
  },
  title: {
    color: theme.text,
    fontSize: 26,
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
});
