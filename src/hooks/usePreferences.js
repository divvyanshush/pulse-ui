import { useCallback } from "react";
import { supabase } from "../lib/supabase.js";

export function usePreferences(user) {
  const loadPreferences = useCallback(async () => {
    if(!user) return null;
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if(error) return null;
      return data;
    } catch(e) { return null; }
  }, [user]);

  const savePreferences = useCallback(async (prefs) => {
    if(!user) return;
    try {
      await supabase.from("user_preferences").upsert({
        user_id: user.id,
        ...prefs,
        updated_at: new Date().toISOString()
      });
    } catch(e) { console.warn("savePreferences:", e.message); }
  }, [user]);

  return { loadPreferences, savePreferences };
}
