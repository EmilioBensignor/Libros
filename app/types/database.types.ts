export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            book_assets: {
                Row: {
                    book_id: string
                    caption: string | null
                    created_at: string
                    id: string
                    kind: Database["public"]["Enums"]["asset_kind"]
                    sort_order: number
                    source: Database["public"]["Enums"]["asset_source"]
                    storage_path: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    book_id: string
                    caption?: string | null
                    created_at?: string
                    id?: string
                    kind: Database["public"]["Enums"]["asset_kind"]
                    sort_order?: number
                    source?: Database["public"]["Enums"]["asset_source"]
                    storage_path: string
                    updated_at?: string
                    user_id?: string
                }
                Update: {
                    book_id?: string
                    caption?: string | null
                    created_at?: string
                    id?: string
                    kind?: Database["public"]["Enums"]["asset_kind"]
                    sort_order?: number
                    source?: Database["public"]["Enums"]["asset_source"]
                    storage_path?: string
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "book_assets_book_id_fkey"
                        columns: ["book_id"]
                        isOneToOne: false
                        referencedRelation: "books"
                        referencedColumns: ["id"]
                    },
                ]
            }
            book_links: {
                Row: {
                    book_id: string
                    created_at: string
                    id: string
                    kind: Database["public"]["Enums"]["link_kind"]
                    note: string | null
                    sort_order: number
                    title: string | null
                    updated_at: string
                    url: string
                    user_id: string
                }
                Insert: {
                    book_id: string
                    created_at?: string
                    id?: string
                    kind?: Database["public"]["Enums"]["link_kind"]
                    note?: string | null
                    sort_order?: number
                    title?: string | null
                    updated_at?: string
                    url: string
                    user_id?: string
                }
                Update: {
                    book_id?: string
                    created_at?: string
                    id?: string
                    kind?: Database["public"]["Enums"]["link_kind"]
                    note?: string | null
                    sort_order?: number
                    title?: string | null
                    updated_at?: string
                    url?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "book_links_book_id_fkey"
                        columns: ["book_id"]
                        isOneToOne: false
                        referencedRelation: "books"
                        referencedColumns: ["id"]
                    },
                ]
            }
            books: {
                Row: {
                    author: string | null
                    color_representativo: Json | null
                    created_at: string
                    deleted_at: string | null
                    id: string
                    keywords: string[]
                    notas_rich: Json | null
                    opinion: string | null
                    rating: number | null
                    status: Database["public"]["Enums"]["read_status"]
                    summary: string | null
                    takeaways: string[]
                    title: string
                    topic: string | null
                    updated_at: string
                    user_id: string
                    year: number | null
                }
                Insert: {
                    author?: string | null
                    color_representativo?: Json | null
                    created_at?: string
                    deleted_at?: string | null
                    id?: string
                    keywords?: string[]
                    notas_rich?: Json | null
                    opinion?: string | null
                    rating?: number | null
                    status?: Database["public"]["Enums"]["read_status"]
                    summary?: string | null
                    takeaways?: string[]
                    title: string
                    topic?: string | null
                    updated_at?: string
                    user_id?: string
                    year?: number | null
                }
                Update: {
                    author?: string | null
                    color_representativo?: Json | null
                    created_at?: string
                    deleted_at?: string | null
                    id?: string
                    keywords?: string[]
                    notas_rich?: Json | null
                    opinion?: string | null
                    rating?: number | null
                    status?: Database["public"]["Enums"]["read_status"]
                    summary?: string | null
                    takeaways?: string[]
                    title?: string
                    topic?: string | null
                    updated_at?: string
                    user_id?: string
                    year?: number | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            hard_delete_book: { Args: { p_book_id: string }; Returns: undefined }
            restore_book: { Args: { p_book_id: string }; Returns: undefined }
            soft_delete_book: { Args: { p_book_id: string }; Returns: undefined }
        }
        Enums: {
            asset_kind: "cover" | "board_image"
            asset_source: "screenshot" | "photo" | "web" | "other"
            link_kind: "article" | "video" | "podcast" | "website" | "other"
            read_status: "por_leer" | "leyendo" | "leido" | "pausado" | "abandonado"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {
            asset_kind: ["cover", "board_image"],
            asset_source: ["screenshot", "photo", "web", "other"],
            link_kind: ["article", "video", "podcast", "website", "other"],
            read_status: ["por_leer", "leyendo", "leido", "pausado", "abandonado"],
        },
    },
} as const
