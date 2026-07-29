import { createClient } from '@supabase/supabase-js'

// Hardcoded values (temporary)
const supabaseUrl = "https://ejchxckoxjmfrrwicuih.supabase.co"
const supabaseAnonKey = "sb_publishable_VTlozSWELDB0jOxuc65DMQ_4FlQvMjp"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)