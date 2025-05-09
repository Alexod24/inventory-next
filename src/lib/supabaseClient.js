import { createClient} from '@supabase/supabase-js';

 // Replace with your Supabase Anon Key

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);