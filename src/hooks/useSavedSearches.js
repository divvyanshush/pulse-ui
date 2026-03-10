import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase.js";

export function useSavedSearches(user) {
  const [savedSearches, setSavedSearches] = useState([]);

  const loadSavedSearches = useCallback(async () => {
    if(!user) return;
    try {
      const { data, error } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if(error) throw error;
      setSavedSearches(data||[]);
    } catch(e) { console.warn("loadSavedSearches:", e.message); }
  }, [user]);

  const saveSearch = useCallback(async (query) => {
    if(!user || !query.trim()) return;
    try {
      const { data, error } = await supabase
        .from("saved_searches")
        .insert({ user_id: user.id, query: query.trim() })
        .select()
        .single();
      if(error) throw error;
      setSavedSearches(s => [data, ...s]);
      return data;
    } catch(e) { console.warn("saveSearch:", e.message); }
  }, [user]);

  const deleteSearch = useCallback(async (id) => {
    if(!user) return;
    setSavedSearches(s => s.filter(x => x.id !== id));
    await supabase.from("saved_searches").delete().eq("id", id).eq("user_id", user.id);
  }, [user]);

  return { savedSearches, loadSavedSearches, saveSearch, deleteSearch };
}
