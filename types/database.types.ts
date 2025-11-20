export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      couples: {
        Row: {
          id: string;
          couple_code: string;
          anniversary_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_code: string;
          anniversary_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_code?: string;
          anniversary_date?: string | null;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          name: string;
          couple_id: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          couple_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          couple_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          couple_id: string;
          title: string;
          description: string | null;
          event_date: string;
          event_time: string | null;
          event_type: "date" | "anniversary" | "todo";
          color: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          title: string;
          description?: string | null;
          event_date: string;
          event_time?: string | null;
          event_type?: "date" | "anniversary" | "todo";
          color?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          event_time?: string | null;
          event_type?: "date" | "anniversary" | "todo";
          color?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
