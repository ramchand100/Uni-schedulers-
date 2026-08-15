import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { theme } from '@/lib/colors';
import type { ProfileSummary } from '@/lib/api/friends';

interface FriendListItemProps {
  profile: ProfileSummary;
  onPress?: () => void;
}

export function FriendListItem({ profile, onPress }: FriendListItemProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Avatar name={profile.fullName || profile.username} color={friendColor(profile.id)} />
      <View style={styles.body}>
        <Text style={styles.name}>{profile.fullName || profile.username}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
      </View>
    </Pressable>
  );
}

// Deterministic per-user color so avatars stay visually distinct and stable.
function friendColor(id: string): string {
  const palette = ['#4F46E5', '#0EA5E9', '#14B8A6', '#F97316', '#EC4899', '#A855F7'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % palette.length;
  return palette[Math.abs(hash) % palette.length];
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
});
