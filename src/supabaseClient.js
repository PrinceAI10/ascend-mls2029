import { createClient } from '@supabase/supabase-js'

// Hardcoded values (temporary)
const supabaseUrl = "https://ejchxckoxjmfrrwicuih.supabase.co"
const supabaseAnonKey = "sb_publishable_VTlozSWELDB0jOxuc65DMQ_4FlQvMjp"

// Auth is configured so a signed-in student STAYS signed in - including inside an
// installed PWA (Add to Home Screen), where the default settings often "forget"
// the user on every launch. Key points:
//   persistSession    - keep the session in localStorage across app restarts
//   autoRefreshToken  - silently refresh the token so it never quietly expires
//   detectSessionInUrl - finish the Google redirect and store the session
//   flowType 'pkce'   - the robust OAuth flow for mobile / installed PWAs
//   storageKey        - a fixed key so the session is found even if the project
//                       ref or URL changes later
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'ascend-auth',
  },
})
