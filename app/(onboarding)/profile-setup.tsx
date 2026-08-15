import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUpdateProfile } from '@/hooks/useProfile';
import { theme } from '@/lib/colors';
import { usernameSchema } from '@/lib/validation';

interface FormValues {
  username: string;
  fullName: string;
  university: string;
}

export default function ProfileSetupScreen() {
  const updateProfile = useUpdateProfile();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { username: '', fullName: '', university: '' } });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    const parsedUsername = usernameSchema.safeParse(values.username.trim().toLowerCase());
    if (!parsedUsername.success) {
      setError('username', { message: parsedUsername.error.issues[0]?.message });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        username: parsedUsername.data,
        fullName: values.fullName.trim() || undefined,
        university: values.university.trim() || undefined,
      });
      router.push('/(onboarding)/create-first-semester');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setSubmitError(message.includes('duplicate') ? 'That username is already taken.' : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Set up your profile</Text>
        <Text style={styles.subtitle}>This is how classmates will find and add you.</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Username"
                autoCapitalize="none"
                placeholder="e.g. ali_khan"
                value={value}
                onChangeText={onChange}
                error={errors.username?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <Input label="Full name" placeholder="Ali Khan" value={value} onChangeText={onChange} />
            )}
          />
          <Controller
            control={control}
            name="university"
            render={({ field: { onChange, value } }) => (
              <Input label="University" placeholder="e.g. NUST, LUMS, FAST" value={value} onChangeText={onChange} />
            )}
          />

          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

          <Button title="Continue" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
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
