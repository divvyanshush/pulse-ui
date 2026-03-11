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

  return (
    <div style={{background:C.bg}}>

      {/* Collapsible header — feed mode only */}
      {!fullPage && (
        <div onClick={()=>setOpen(o=>!o)}
          style={{
            padding:"12px 20px",
            display:"flex", alignItems:"center", gap:8,
            borderBottom:`1px solid ${C.border}`,
            cursor:"pointer",
          }}
          onMouseEnter={e=>e.currentTarget.style.background=C.hover}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}
        >
          <span style={{fontSize:FS.xs,fontWeight:600,letterSpacing:"0.12em",
            color:C.accent,fontFamily:FF.mono}}>TODAY</span>
          {briefing?.date&&(
            <span style={{fontSize:FS.xs,color:C.muted,fontFamily:FF.mono}}>{briefing.date}</span>
          )}
          <span style={{marginLeft:"auto",fontSize:FS.xs,color:C.muted,fontFamily:FF.mono}}>
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
                padding:fullPage?"20px 32px":"14px 20px",
                borderBottom:`1px solid ${C.border}`,
                display:"flex", gap:14,
              }}>
                <div style={{width:20,height:10,borderRadius:2,background:C.faint,flexShrink:0,marginTop:4}}/>
                <div style={{flex:1}}>
                  <div style={{width:"65%",height:12,borderRadius:2,background:C.faint,marginBottom:6}}/>
                  <div style={{width:"40%",height:10,borderRadius:2,background:C.faint}}/>
                </div>
              </div>
            ))
          ) : briefing?.items?.map((item,i)=>{
            const m=TML[item.type]||TML.product;
            const isLast = i===briefing.items.length-1;
            return (
              <div key={i} onClick={()=>onItemClick&&onItemClick(item)}
                style={{
                  padding:fullPage?"18px 32px":"13px 20px",
                  borderBottom:isLast?"none":`1px solid ${C.border}`,
                  display:"flex", gap:14, alignItems:"flex-start",
                  cursor:"pointer", transition:"background .1s",
                }}
                onMouseEnter={e=>e.currentTarget.style.background=C.hover}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >
                {/* Number */}
                <span style={{
                  fontSize:FS.xs, color:C.muted,
                  fontFamily:FF.mono, flexShrink:0,
                  width:20, textAlign:"right", marginTop:2,
                }}>{String(i+1).padStart(2,"0")}</span>

                {/* Content */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                    <span style={{
                      fontSize:"0.65rem",fontWeight:600,letterSpacing:"0.08em",
                      padding:"1px 5px",borderRadius:2,
                      background:m.a,color:m.t,border:`1px solid ${m.b}`,
                      flexShrink:0,fontFamily:FF.mono,whiteSpace:"nowrap",
                    }}>{m.label}</span>
                    <span style={{fontSize:FS.xs,color:C.muted,fontFamily:FF.mono}}>{item.src}</span>
                  </div>
                  <div style={{
                    fontSize:fullPage?FS.base:FS.sm,
                    fontWeight:600, color:C.text,
                    lineHeight:1.45, letterSpacing:"-0.015em",
                    fontFamily:FF.sans, marginBottom:item.why?4:0,
                  }}>{item.title}</div>
                  {item.why&&(
                    <div style={{
                      fontSize:FS.xs,color:C.muted,
                      fontStyle:"italic",lineHeight:1.5,
                      fontFamily:FF.sans,
                    }}>{item.why}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
