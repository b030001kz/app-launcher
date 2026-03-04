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
                    display_name: string | null
                    url: string
                    description: string | null
                    icon: string | null
                    tags: string[] | null
                    category_id: string | null
                    project_id: string | null
                    status: '採用' | '保留' | '除外' | '企画中'
                    sort_order: number
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    display_name?: string | null
                    url: string
                    description?: string | null
                    icon?: string | null
                    tags?: string[] | null
                    category_id?: string | null
                    project_id?: string | null
                    status?: '採用' | '保留' | '除外' | '企画中'
                    sort_order?: number
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    display_name?: string | null
                    url?: string
                    description?: string | null
                    icon?: string | null
                    tags?: string[] | null
                    category_id?: string | null
                    project_id?: string | null
                    status?: '採用' | '保留' | '除外'
                    sort_order?: number
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    color: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    color?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    color?: string | null
                    created_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    description: string | null
                    color: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    description?: string | null
                    color?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    description?: string | null
                    color?: string | null
                    created_at?: string
                }
            }
            vercel_connections: {
                Row: {
                    user_id: string
                    access_token: string
                    created_at: string
                }
                Insert: {
                    user_id: string
                    access_token: string
                    created_at?: string
                }
                Update: {
                    user_id?: string
                    access_token?: string
                    created_at?: string
                }
            }
            app_tasks: {
                Row: {
                    id: string
                    app_id: string
                    user_id: string
                    title: string
                    completed: boolean
                    sort_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    app_id: string
                    user_id: string
                    title: string
                    completed?: boolean
                    sort_order?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    app_id?: string
                    user_id?: string
                    title?: string
                    completed?: boolean
                    sort_order?: number
                    created_at?: string
                }
            }
            dev_tools: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    url: string
                    icon: string
                    category: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    url: string
                    icon?: string
                    category?: string
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    url?: string
                    icon?: string
                    category?: string
                    description?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            app_status: '採用' | '保留' | '除外' | '企画中'
        }
    }
}
