import { useState, useEffect } from "react";
import { API, FS, FF, getTM } from "../constants/theme.js";

export function Briefing({ C, isDark, onItemClick, fullPage=false }) {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading]   = useState(true);
  const TML = getTM(isDark);

  useEffect(()=>{
    fetch(`${API}/briefing`)
      .then(r=>r.json())
      .then(d=>{ setBriefing(d); setLoading(false); })
      .catch(()=>setLoading(false));
  },[]);

  if(loading) return (
    <div>
      {[1,2,3,4,5].map(n=>(
        <div key={n} style={{padding:"24px 28px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{width:"12%",height:8,borderRadius:2,background:C.faint,marginBottom:14}}/>
          <div style={{width:"72%",height:18,borderRadius:2,background:C.faint,marginBottom:10}}/>
          <div style={{width:"90%",height:11,borderRadius:2,background:C.faint,marginBottom:6}}/>
          <div style={{width:"60%",height:11,borderRadius:2,background:C.faint}}/>
        </div>
      ))}
    </div>
  );

  if(!briefing?.items?.length) return (
    <div style={{padding:"40px 28px",color:C.muted,fontSize:FS.sm,fontFamily:FF.sans}}>
      Nothing to show yet — check back soon.
    </div>
  );

  return (
    <div>
      {briefing.items.map((item,i)=>{
        const m = TML[item.type]||TML.product;
        const isLast = i===briefing.items.length-1;
        return (
          <div key={i} onClick={()=>onItemClick&&onItemClick(item)}
            style={{
              padding:"24px 28px",
              borderBottom:isLast?"none":`1px solid ${C.border}`,
              cursor:"pointer",
              transition:"background .1s",
            }}
            onMouseEnter={e=>e.currentTarget.style.background=C.hover}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
          >
            {/* Category · Source · Time */}
            <div style={{
              display:"flex", alignItems:"center", gap:8,
              marginBottom:10, fontFamily:FF.mono, fontSize:"0.65rem",
            }}>
              <span style={{
                color:m.t, padding:"2px 8px", borderRadius:3,
                background:m.a, fontWeight:600, letterSpacing:"0.06em",
              }}>{m.label}</span>
              <span style={{color:C.muted}}>{item.src}</span>
              {item.timeLabel&&<>
                <span style={{color:C.faint}}>·</span>
                <span style={{color:C.faint}}>{item.timeLabel}</span>
              </>}
            </div>

            {/* Title */}
            <div style={{
              fontSize:fullPage?"1.05rem":FS.base,
              fontWeight:650,
              color:C.text,
              lineHeight:1.4,
              letterSpacing:"-0.025em",
              fontFamily:FF.sans,
              marginBottom:item.why?8:0,
              wordBreak:"break-word",
            }}>{item.title}</div>

            {/* Why this matters */}
            {item.why&&(
              <div style={{
                fontSize:FS.sm,
                color:C.muted,
                lineHeight:1.65,
                fontFamily:FF.sans,
                fontWeight:400,
              }}>{item.why}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
