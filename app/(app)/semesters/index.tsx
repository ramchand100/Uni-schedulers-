import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/lib/colors';

export default function SemestersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Semesters</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 24,
  },
  title: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '700',
  },
});
