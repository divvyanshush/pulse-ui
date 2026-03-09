import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jwzkauzjttbccwgvvjdr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_hyDbeGZLx5AkM1C3HFBY2A_MJcMFmYU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
