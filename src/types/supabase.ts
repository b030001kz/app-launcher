export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
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
            }
        }
    }
}
