import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSearchUsers, useSendFriendRequest } from '@/hooks/useFriends';
import { theme } from '@/lib/colors';

export default function AddFriendScreen() {
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useSearchUsers(query);
  const sendRequest = useSendFriendRequest();
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Input
        placeholder="Search by username"
        autoCapitalize="none"
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setError(null);
        }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        style={styles.list}
        data={results ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10 }}
        ListEmptyComponent={
          !isLoading && query.trim().length >= 2 ? <Text style={styles.empty}>No users found.</Text> : null
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Avatar name={item.fullName || item.username} color={theme.primary} />
            <View style={styles.body}>
              <Text style={styles.name}>{item.fullName || item.username}</Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
            <Button
              title={sentIds.has(item.id) ? 'Sent' : 'Add'}
              disabled={sentIds.has(item.id)}
              variant={sentIds.has(item.id) ? 'secondary' : 'primary'}
              onPress={() => {
                sendRequest.mutate(item.id, {
                  onSuccess: () => setSentIds((prev) => new Set(prev).add(item.id)),
                  onError: (err) => setError(err instanceof Error ? err.message : 'Could not send request'),
                });
              }}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 20,
    gap: 16,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    padding: 12,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '600',
  },
  username: {
    color: theme.textMuted,
    fontSize: 13,
  },
  empty: {
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 20,
  },
  error: {
    color: theme.danger,
    fontSize: 14,
  },
});
