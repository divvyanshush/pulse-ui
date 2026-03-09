import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase.js";

export function useBookmarks(user) {
  const [bookmarks, setBookmarks] = useState({});

  const loadBookmarks = useCallback(async()=>{
    if(!user) return;
    try{
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id);
      if(error) throw error;
      const map={};
      (data||[]).forEach(b=>{ map[b.item_id]=b.item; });
      setBookmarks(map);
    }catch(e){ console.warn("loadBookmarks:", e.message); }
  },[user]);

  const toggleBookmark = useCallback(async(item, e)=>{
    e?.stopPropagation(); e?.preventDefault();
    if(!user) return;
    const saved=!!bookmarks[item.id];
    if(saved){
      setBookmarks(b=>{const n={...b};delete n[item.id];return n;});
      await supabase.from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", item.id);
    }else{
      setBookmarks(b=>({...b,[item.id]:{...item,bookmarkedAt:Date.now()}}));
      await supabase.from("bookmarks")
        .upsert({ user_id:user.id, item_id:item.id, item:{...item,bookmarkedAt:Date.now()} });
    }
  },[bookmarks, user]);

  return { bookmarks, loadBookmarks, toggleBookmark };
}
