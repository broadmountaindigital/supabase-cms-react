export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      content_field_page_relations: {
        Row: {
          archived_at: string | null;
          content_field_id: string;
          created_at: string | null;
          id: string;
          site_page_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          archived_at?: string | null;
          content_field_id: string;
          created_at?: string | null;
          id?: string;
          site_page_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          archived_at?: string | null;
          content_field_id?: string;
          created_at?: string | null;
          id?: string;
          site_page_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'content_field_page_relations_content_field_id_fkey';
            columns: ['content_field_id'];
            isOneToOne: false;
            referencedRelation: 'content_fields';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_field_page_relations_site_page_id_fkey';
            columns: ['site_page_id'];
            isOneToOne: false;
            referencedRelation: 'site_pages';
            referencedColumns: ['id'];
          },
        ];
      };
      content_field_revisions: {
        Row: {
          content_field_id: string;
          created_at: string | null;
          created_by: string | null;
          field_value: string | null;
          field_value_hash: string | null;
          id: string;
          is_current: boolean | null;
          is_published: boolean | null;
          metadata: Json | null;
          parent_revision_id: string | null;
          published_at: string | null;
          published_by: string | null;
          revision_number: number;
          updated_at: string | null;
        };
        Insert: {
          content_field_id: string;
          created_at?: string | null;
          created_by?: string | null;
          field_value?: string | null;
          field_value_hash?: string | null;
          id?: string;
          is_current?: boolean | null;
          is_published?: boolean | null;
          metadata?: Json | null;
          parent_revision_id?: string | null;
          published_at?: string | null;
          published_by?: string | null;
          revision_number: number;
          updated_at?: string | null;
        };
        Update: {
          content_field_id?: string;
          created_at?: string | null;
          created_by?: string | null;
          field_value?: string | null;
          field_value_hash?: string | null;
          id?: string;
          is_current?: boolean | null;
          is_published?: boolean | null;
          metadata?: Json | null;
          parent_revision_id?: string | null;
          published_at?: string | null;
          published_by?: string | null;
          revision_number?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'content_field_revisions_content_field_id_fkey';
            columns: ['content_field_id'];
            isOneToOne: false;
            referencedRelation: 'content_fields';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_field_revisions_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_field_revisions_parent_revision_id_fkey';
            columns: ['parent_revision_id'];
            isOneToOne: false;
            referencedRelation: 'content_field_revisions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_field_revisions_published_by_fkey';
            columns: ['published_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      content_fields: {
        Row: {
          created_at: string;
          current_revision_id: string | null;
          field_name: string;
          field_namespace: string | null;
          field_value: string | null;
          id: string;
          last_published_at: string | null;
          last_published_by: string | null;
          site_id: string | null;
          total_revisions: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          current_revision_id?: string | null;
          field_name: string;
          field_namespace?: string | null;
          field_value?: string | null;
          id?: string;
          last_published_at?: string | null;
          last_published_by?: string | null;
          site_id?: string | null;
          total_revisions?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          current_revision_id?: string | null;
          field_name?: string;
          field_namespace?: string | null;
          field_value?: string | null;
          id?: string;
          last_published_at?: string | null;
          last_published_by?: string | null;
          site_id?: string | null;
          total_revisions?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_fields_current_revision_id_fkey';
            columns: ['current_revision_id'];
            isOneToOne: false;
            referencedRelation: 'content_field_revisions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_fields_last_published_by_fkey';
            columns: ['last_published_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_fields_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          full_name: string | null;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      site_pages: {
        Row: {
          created_at: string | null;
          id: string;
          page_description: string | null;
          page_name: string;
          page_title: string | null;
          site_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          page_description?: string | null;
          page_name: string;
          page_title?: string | null;
          site_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          page_description?: string | null;
          page_name?: string;
          page_title?: string | null;
          site_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'site_pages_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          },
        ];
      };
      sites: {
        Row: {
          created_at: string | null;
          id: string;
          site_name: string;
          site_url: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          site_name: string;
          site_url: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          site_name?: string;
          site_url?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_site_access: {
        Row: {
          created_at: string | null;
          id: string;
          role: Database['public']['Enums']['user_site_role'];
          site_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          role: Database['public']['Enums']['user_site_role'];
          site_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          role?: Database['public']['Enums']['user_site_role'];
          site_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_site_access_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_content_field_revision: {
        Args: {
          p_content_field_id: string;
          p_field_value: string;
          p_created_by?: string;
        };
        Returns: string;
      };
      get_content_fields_for_page: {
        Args: { page_id: string };
        Returns: {
          created_at: string;
          current_revision_id: string | null;
          field_name: string;
          field_namespace: string | null;
          field_value: string | null;
          id: string;
          last_published_at: string | null;
          last_published_by: string | null;
          site_id: string | null;
          total_revisions: number | null;
          updated_at: string;
        }[];
      };
      publish_content_field_revision: {
        Args: { p_revision_id: string; p_published_by?: string };
        Returns: boolean;
      };
      rollback_to_revision: {
        Args: { p_revision_id: string; p_created_by?: string };
        Returns: string;
      };
    };
    Enums: {
      user_site_role: 'author' | 'editor' | 'admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      user_site_role: ['author', 'editor', 'admin'],
    },
  },
} as const;
