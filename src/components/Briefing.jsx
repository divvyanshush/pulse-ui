import { useState, useEffect } from "react";
import { API, FS, FF, getTM } from "../constants/theme.js";

export function Briefing({ C, isDark, onItemClick, fullPage=false }) {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [open, setOpen]         = useState(true);
  const TML = getTM(isDark);

  useEffect(()=>{
    fetch(`${API}/briefing`)
      .then(r=>r.json())
      .then(d=>{ setBriefing(d); setLoading(false); })
      .catch(()=>setLoading(false));
  },[]);

  const show = open || fullPage;

  if(!fullPage && !loading && (!briefing || !briefing.items?.length)) return null;

  return (
    <div style={{background:C.bg}}>

      {/* Collapsible header — feed mode only */}
      {!fullPage && (
        <div onClick={()=>setOpen(o=>!o)}
          style={{
            padding:"12px 24px",
            display:"flex", alignItems:"center", gap:8,
            borderBottom:`1px solid ${C.border}`,
            cursor:"pointer",
            transition:"background .1s",
          }}
          onMouseEnter={e=>e.currentTarget.style.background=C.hover}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}
        >
          <span style={{fontSize:"0.65rem",fontWeight:600,letterSpacing:"0.12em",
            color:C.muted,fontFamily:FF.mono}}>TODAY</span>
          {briefing?.date&&(
            <span style={{fontSize:"0.65rem",color:C.muted,fontFamily:FF.mono,opacity:0.6}}>{briefing.date}</span>
          )}
          <span style={{marginLeft:"auto",fontSize:"0.65rem",color:C.muted,fontFamily:FF.mono,opacity:0.6}}>
            {open?"↑":"↓"}
          </span>
        </div>
      )}

      {/* Items */}
      {show && (
        <div>
          {loading ? (
            [1,2,3,4,5].map(n=>(
              <div key={n} style={{
                padding:fullPage?"28px 32px":"20px 24px",
                borderBottom:`1px solid ${C.border}`,
              }}>
                <div style={{width:"15%",height:9,borderRadius:2,background:C.faint,marginBottom:12}}/>
                <div style={{width:"75%",height:16,borderRadius:2,background:C.faint,marginBottom:8}}/>
                <div style={{width:"55%",height:12,borderRadius:2,background:C.faint}}/>
              </div>
            ))
          ) : briefing?.items?.map((item,i)=>{
            const m=TML[item.type]||TML.product;
            const isLast = i===briefing.items.length-1;
            return (
              <div key={i} onClick={()=>onItemClick&&onItemClick(item)}
                style={{
                  padding:fullPage?"28px 32px":"18px 24px",
                  borderBottom:isLast?"none":`1px solid ${C.border}`,
                  cursor:"pointer",
                  transition:"background .12s",
                }}
                onMouseEnter={e=>e.currentTarget.style.background=C.hover}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >
                {/* Type + source meta — top */}
                <div style={{
                  display:"flex", alignItems:"center", gap:8,
                  marginBottom:10, fontFamily:FF.mono,
                }}>
                  <span style={{
                    fontSize:"0.62rem", fontWeight:500,
                    color:m.t, padding:"2px 7px",
                    borderRadius:3, background:m.a,
                    letterSpacing:"0.06em",
                  }}>{m.label}</span>
                  <span style={{fontSize:"0.65rem",color:C.muted}}>
                    {item.src}
                  </span>
                  {item.timeLabel && (
                    <span style={{fontSize:"0.65rem",color:C.faint}}>· {item.timeLabel}</span>
                  )}
                </div>

                {/* Title — big and clear */}
                <div style={{
                  fontSize:fullPage?FS.md:FS.base,
                  fontWeight:600,
                  color:C.text,
                  lineHeight:1.45,
                  letterSpacing:"-0.02em",
                  fontFamily:FF.sans,
                  marginBottom:item.why?10:0,
                }}>{item.title}</div>

                {/* Why this matters */}
                {item.why && (
                  <div style={{
                    fontSize:FS.sm,
                    color:C.muted,
                    lineHeight:1.6,
                    fontFamily:FF.sans,
                  }}>{item.why}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
