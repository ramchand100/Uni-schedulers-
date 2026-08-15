import { router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FriendListItem } from '@/components/friends/FriendListItem';
import { FriendRequestCard } from '@/components/friends/FriendRequestCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Spinner } from '@/components/ui/Spinner';
import { useFriendRequests, useFriends, useRespondToFriendRequest } from '@/hooks/useFriends';
import { theme } from '@/lib/colors';

export default function FriendsScreen() {
  const {
    data: friends,
    isLoading: friendsLoading,
    isError: friendsError,
    isFetching: friendsFetching,
    refetch: refetchFriends,
  } = useFriends();
  const {
    data: requests,
    isLoading: requestsLoading,
    isError: requestsError,
    isFetching: requestsFetching,
    refetch: refetchRequests,
  } = useFriendRequests();
  const respond = useRespondToFriendRequest();

  const incoming = requests?.filter((r) => r.direction === 'incoming') ?? [];
  const outgoing = requests?.filter((r) => r.direction === 'outgoing') ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <Button title="+ Add friend" onPress={() => router.push('/(app)/friends/add')} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={friendsFetching || requestsFetching}
            onRefresh={() => {
              refetchFriends();
              refetchRequests();
            }}
            tintColor={theme.primary}
          />
        }
      >
        {incoming.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requests</Text>
            {incoming.map((req) => (
              <FriendRequestCard
                key={req.friendshipId}
                profile={req.profile}
                direction={req.direction}
                isResponding={respond.isPending}
                onAccept={() => respond.mutate({ friendshipId: req.friendshipId, status: 'accepted' })}
                onDecline={() => respond.mutate({ friendshipId: req.friendshipId, status: 'declined' })}
              />
            ))}
          </View>
        ) : null}

        {outgoing.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sent</Text>
            {outgoing.map((req) => (
              <FriendRequestCard key={req.friendshipId} profile={req.profile} direction={req.direction} />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your friends</Text>
          {friendsLoading || requestsLoading ? (
            <Spinner />
          ) : friendsError || requestsError ? (
            <ErrorState
              onRetry={() => {
                refetchFriends();
                refetchRequests();
              }}
            />
          ) : !friends || friends.length === 0 ? (
            <EmptyState title="No friends yet" description="Add classmates to see when you're free together." />
          ) : (
            friends.map((friend) => (
              <FriendListItem
                key={friend.friendshipId}
                profile={friend.profile}
                onPress={() => router.push(`/(app)/friends/${friend.profile.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 0,
  },
  title: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
