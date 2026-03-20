import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jwzkauzjttbccwgvvjdr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3emthdXpqdHRiY2N3Z3Z2amRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDEwODIsImV4cCI6MjA4ODYxNzA4Mn0.ryv22_ijrn4ci844s1Kalk6ylesmS-XQxoZQON49_Js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});
