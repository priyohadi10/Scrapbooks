export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          settings: Json;
          pages: Json;
          assets: Json;
          export_config: Json;
          thumbnail: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          settings: Json;
          pages: Json;
          assets: Json;
          export_config: Json;
          thumbnail?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          settings?: Json;
          pages?: Json;
          assets?: Json;
          export_config?: Json;
          thumbnail?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          name: string;
          src: string;
          thumbnail: string | null;
          category: string | null;
          tags: string[] | null;
          size: number | null;
          width: number | null;
          height: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          name: string;
          src: string;
          thumbnail?: string | null;
          category?: string | null;
          tags?: string[] | null;
          size?: number | null;
          width?: number | null;
          height?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          name?: string;
          src?: string;
          thumbnail?: string | null;
          category?: string | null;
          tags?: string[] | null;
          size?: number | null;
          width?: number | null;
          height?: number | null;
          created_at?: string;
        };
      };
      export_jobs: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          format: string;
          status: string;
          progress: number;
          url: string | null;
          error: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          format: string;
          status?: string;
          progress?: number;
          url?: string | null;
          error?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          format?: string;
          status?: string;
          progress?: number;
          url?: string | null;
          error?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
  };
}

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
