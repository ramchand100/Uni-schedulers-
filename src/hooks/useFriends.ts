import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/hooks/useSession';
import { fetchFriendRequests, fetchFriends, respondToFriendRequest, searchUsers, sendFriendRequest, removeFriendship } from '@/lib/api/friends';

export function friendsQueryKey(userId: string | undefined) {
  return ['friends', userId] as const;
}

export function friendRequestsQueryKey(userId: string | undefined) {
  return ['friendRequests', userId] as const;
}

export function useFriends() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: friendsQueryKey(userId),
    queryFn: () => fetchFriends(userId!),
    enabled: !!userId,
  });
}

export function useFriendRequests() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: friendRequestsQueryKey(userId),
    queryFn: () => fetchFriendRequests(userId!),
    enabled: !!userId,
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['searchUsers', query],
    queryFn: () => searchUsers(query),
    enabled: query.trim().length >= 2,
  });
}

export function useSendFriendRequest() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addresseeId: string) => sendFriendRequest(userId!, addresseeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: friendRequestsQueryKey(userId) }),
  });
}

export function useRespondToFriendRequest() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ friendshipId, status }: { friendshipId: string; status: 'accepted' | 'declined' }) =>
      respondToFriendRequest(friendshipId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendRequestsQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: friendsQueryKey(userId) });
    },
  });
}

export function useRemoveFriendship() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendshipId: string) => removeFriendship(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendsQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: friendRequestsQueryKey(userId) });
    },
  });
}
