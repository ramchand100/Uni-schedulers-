// Hand-written to mirror supabase/migrations/0001_init.sql. If a live Supabase
// project is connected, prefer regenerating this file with:
//   supabase gen types typescript --project-id <id> > src/types/database.ts

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          university: string | null;
          avatar_color: string;
          active_days: number[];
          onboarding_completed: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string; username: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      semesters: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          term: 'Fall' | 'Spring' | 'Summer';
          year: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['semesters']['Row']> & {
          user_id: string;
          name: string;
          term: 'Fall' | 'Spring' | 'Summer';
          year: number;
        };
        Update: Partial<Database['public']['Tables']['semesters']['Row']>;
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          semester_id: string;
          user_id: string;
          title: string;
          course_code: string | null;
          instructor: string | null;
          credit_hours: number;
          section: string | null;
          room: string | null;
          color: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['courses']['Row']> & {
          semester_id: string;
          user_id: string;
          title: string;
          credit_hours: number;
        };
        Update: Partial<Database['public']['Tables']['courses']['Row']>;
        Relationships: [];
      };
      class_sessions: {
        Row: {
          id: string;
          course_id: string;
          user_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          session_type: 'lecture' | 'lab' | 'tutorial';
        };
        Insert: Partial<Database['public']['Tables']['class_sessions']['Row']> & {
          course_id: string;
          user_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
        };
        Update: Partial<Database['public']['Tables']['class_sessions']['Row']>;
        Relationships: [];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: 'pending' | 'accepted' | 'declined';
          created_at: string;
          responded_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['friendships']['Row']> & {
          requester_id: string;
          addressee_id: string;
        };
        Update: Partial<Database['public']['Tables']['friendships']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_users: {
        Args: { query: string };
        Returns: { id: string; username: string; full_name: string | null; avatar_color: string }[];
      };
      get_profile_summaries: {
        Args: { ids: string[] };
        Returns: { id: string; username: string; full_name: string | null; avatar_color: string }[];
      };
      is_friend: {
        Args: { target: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
