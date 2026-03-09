import { useState, useRef, useCallback, useEffect } from "react";
import { API, timeAgo } from "../constants/theme.js";

export function useFeed({ showToast, pushNotif }) {
  const [items,     setItems]     = useState([]);
  const [pending,   setPending]   = useState([]);
  const [status,    setStatus]    = useState("loading");
  const [errMsg,    setErrMsg]    = useState("");
  const [lastFetch, setLastFetch] = useState(null);
  const prevIds = useRef(new Set());
  const feedRef = useRef(null);

  const loadFeed = useCallback(async(isRefresh=false)=>{
    setStatus("loading");
    try{
      const res=await fetch(`${API}/feed`);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      const enriched=data.items.map(i=>({...i,timeLabel:timeAgo(i.time)}));
      if(isRefresh&&prevIds.current.size>0){
        const novel=enriched.filter(i=>!prevIds.current.has(i.id));
        if(novel.length){
          setPending(p=>[...novel,...p]);
          const top=novel.sort((a,b)=>(b.heat||0)-(a.heat||0))[0];
          showToast(`${novel.length} new item${novel.length>1?"s":""}`,top.title,"new",top);
          pushNotif(`PULSE · ${novel.length} new`,top.title);
        }
        const trending=enriched.filter(i=>!prevIds.current.has(i.id)&&(i.heat||0)>=75);
        if(trending.length){
          const t=trending[0];
          showToast("Trending now",t.title,"hot",t);
          pushNotif("PULSE · Trending",t.title);
        }
      }else{
        setItems(enriched);
      }
      prevIds.current=new Set(enriched.map(i=>i.id));
      setLastFetch(Date.now());
      setStatus("ok");
    }catch(e){
      setStatus("err"); setErrMsg(e.message);
    }
  },[showToast,pushNotif]);

  const loadPending = useCallback(()=>{
    setItems(p=>{const m=new Map(p.map(x=>[x.id,x]));pending.forEach(x=>m.set(x.id,x));const a=[...m.values()];a.sort((a,b)=>b.time-a.time);return a;});
    setPending([]);
    feedRef.current?.scrollTo({top:0,behavior:"smooth"});
  },[pending]);

  // Auto-refresh every 90s
  useEffect(()=>{const id=setInterval(()=>loadFeed(true),90_000);return()=>clearInterval(id);},[loadFeed]);

  // Update time labels every 30s
  useEffect(()=>{const id=setInterval(()=>setItems(p=>p.map(i=>({...i,timeLabel:timeAgo(i.time)}))),30_000);return()=>clearInterval(id);},[]);

  // Tab title
  useEffect(()=>{ document.title = pending.length>0?`Pulse (${pending.length})`:"Pulse"; },[pending]);

  return { items, setItems, pending, setPending, status, errMsg, lastFetch, feedRef, loadFeed, loadPending };
}
