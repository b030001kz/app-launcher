export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            apps: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    url: string
                    description: string | null
                    icon: string | null
                    tags: string[] | null
                    status: '採用' | '保留' | '除外'
                    sort_order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    url: string
                    description?: string | null
                    icon?: string | null
                    tags?: string[] | null
                    status?: '採用' | '保留' | '除外'
                    sort_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    url?: string
                    description?: string | null
                    icon?: string | null
                    tags?: string[] | null
                    status?: '採用' | '保留' | '除外'
                    sort_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "apps_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            app_status: '採用' | '保留' | '除外'
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
