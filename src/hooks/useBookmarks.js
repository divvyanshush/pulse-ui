import { useState, useCallback } from "react";
import { API } from "../constants/theme.js";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState({});

  const loadBookmarks = useCallback(async()=>{
    try{
      const res=await fetch(`${API}/bookmarks`);
      const data=await res.json();
      const map={};
      (data.bookmarks||[]).forEach(b=>{map[b.id]=b;});
      setBookmarks(map);
    }catch(e){}
  },[]);

  const toggleBookmark = useCallback((item,e)=>{
    e?.stopPropagation(); e?.preventDefault();
    const saved=!!bookmarks[item.id];
    if(saved){
      setBookmarks(b=>{const n={...b};delete n[item.id];return n;});
      fetch(`${API}/bookmarks/${encodeURIComponent(item.id)}`,{method:"DELETE"}).catch(()=>{});
    }else{
      setBookmarks(b=>({...b,[item.id]:{...item,bookmarkedAt:Date.now()}}));
      fetch(`${API}/bookmarks`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({item})}).catch(()=>{});
    }
  },[bookmarks]);

  return { bookmarks, loadBookmarks, toggleBookmark };
}
