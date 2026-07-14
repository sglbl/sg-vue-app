import { createClient } from '@supabase/supabase-js'
import type { Database } from '@db/database.types.ts'

export const supabase = createClient<Database>(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_ANON_KEY
)
