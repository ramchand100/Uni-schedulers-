import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { ProfileSummary } from '@/lib/api/friends';
import { theme } from '@/lib/colors';

interface FriendRequestCardProps {
  profile: ProfileSummary;
  direction: 'incoming' | 'outgoing';
  onAccept?: () => void;
  onDecline?: () => void;
  isResponding?: boolean;
}

export function FriendRequestCard({ profile, direction, onAccept, onDecline, isResponding }: FriendRequestCardProps) {
  return (
    <View style={styles.row}>
      <Avatar name={profile.fullName || profile.username} color={theme.primary} />
      <View style={styles.body}>
        <Text style={styles.name}>{profile.fullName || profile.username}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        <Text style={styles.status}>{direction === 'incoming' ? 'Wants to be friends' : 'Request sent'}</Text>
      </View>
      {direction === 'incoming' ? (
        <View style={styles.actions}>
          <Button title="Accept" onPress={onAccept ?? (() => {})} loading={isResponding} />
          <Button title="Decline" variant="secondary" onPress={onDecline ?? (() => {})} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
  status: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    gap: 6,
  },
});
