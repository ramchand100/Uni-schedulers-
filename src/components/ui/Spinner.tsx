import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { theme } from '@/lib/colors';

export function Spinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background,
  },
});
