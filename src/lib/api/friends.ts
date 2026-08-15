import { supabase } from '@/lib/supabase';

export interface ProfileSummary {
  id: string;
  username: string;
  fullName: string | null;
  avatarColor: string;
}

export interface FriendEntry {
  friendshipId: string;
  profile: ProfileSummary;
}

export interface FriendRequestEntry extends FriendEntry {
  direction: 'incoming' | 'outgoing';
}

function toProfileSummary(row: { id: string; username: string; full_name: string | null; avatar_color: string }): ProfileSummary {
  return { id: row.id, username: row.username, fullName: row.full_name, avatarColor: row.avatar_color };
}

async function resolveProfileSummaries(ids: string[]): Promise<Map<string, ProfileSummary>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.rpc('get_profile_summaries', { ids });
  if (error) throw error;
  return new Map(data.map((row) => [row.id, toProfileSummary(row)]));
}

export async function fetchFriends(userId: string): Promise<FriendEntry[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('id, requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  if (error) throw error;

  const otherIds = data.map((row) => (row.requester_id === userId ? row.addressee_id : row.requester_id));
  const summaries = await resolveProfileSummaries(otherIds);

  return data
    .map((row) => {
      const otherId = row.requester_id === userId ? row.addressee_id : row.requester_id;
      const profile = summaries.get(otherId);
      return profile ? { friendshipId: row.id, profile } : null;
    })
    .filter((entry): entry is FriendEntry => entry !== null);
}

export async function fetchFriendRequests(userId: string): Promise<FriendRequestEntry[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('id, requester_id, addressee_id')
    .eq('status', 'pending')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  if (error) throw error;

  const otherIds = data.map((row) => (row.requester_id === userId ? row.addressee_id : row.requester_id));
  const summaries = await resolveProfileSummaries(otherIds);

  return data
    .map((row) => {
      const isIncoming = row.addressee_id === userId;
      const otherId = isIncoming ? row.requester_id : row.addressee_id;
      const profile = summaries.get(otherId);
      const direction: 'incoming' | 'outgoing' = isIncoming ? 'incoming' : 'outgoing';
      return profile ? { friendshipId: row.id, profile, direction } : null;
    })
    .filter((entry): entry is FriendRequestEntry => entry !== null);
}

export async function searchUsers(query: string): Promise<ProfileSummary[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const { data, error } = await supabase.rpc('search_users', { query: trimmed });
  if (error) throw error;
  return data.map(toProfileSummary);
}

export async function sendFriendRequest(requesterId: string, addresseeId: string) {
  const { error } = await supabase.from('friendships').insert({ requester_id: requesterId, addressee_id: addresseeId });
  if (error) throw error;
}

export async function respondToFriendRequest(friendshipId: string, status: 'accepted' | 'declined') {
  const { error } = await supabase
    .from('friendships')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', friendshipId);
  if (error) throw error;
}

export async function removeFriendship(friendshipId: string) {
  const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
  if (error) throw error;
}
