import { useState, useEffect } from "react";
import { API, FS, FF, getTM } from "../constants/theme.js";

export function Briefing({ C, isDark, onItemClick, fullPage=false }) {
  const [briefing, setBriefing] = useState(null);
  const [loading,  setLoading]  = useState(true);
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
        <div key={n} style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{width:"10%",height:7,background:C.faint,marginBottom:8,borderRadius:1}}/>
          <div style={{width:"70%",height:13,background:C.faint,marginBottom:6,borderRadius:1}}/>
          <div style={{width:"90%",height:9,background:C.faint,marginBottom:4,borderRadius:1}}/>
          <div style={{width:"60%",height:9,background:C.faint,borderRadius:1}}/>
        </div>
      ))}
    </div>
  );

  if(!briefing?.items?.length) return (
    <div style={{padding:"32px 16px",color:C.muted,fontSize:"0.75rem",fontFamily:FF.mono}}>
      no items yet — check back soon
    </div>
  );

  return (
    <div>
      {briefing.items.map((item,i)=>{
        const m=TML[item.type]||TML.product;
        const isLast=i===briefing.items.length-1;
        return (
          <div key={i} onClick={()=>onItemClick&&onItemClick(item)}
            style={{
              padding:"14px 16px",
              borderBottom:isLast?"none":`1px solid ${C.border}`,
              cursor:"pointer",transition:"background .08s",
            }}
            onMouseEnter={e=>e.currentTarget.style.background=C.hover}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
          >
            {/* Meta */}
            <div style={{
              display:"flex",alignItems:"center",gap:6,
              marginBottom:6,fontFamily:FF.mono,fontSize:"0.68rem",
            }}>
              <span style={{color:m.t,fontWeight:600,letterSpacing:"0.08em"}}>{m.label}</span>
              <span style={{color:C.faint}}>·</span>
              <span style={{color:C.muted}}>{item.src}</span>
              {item.timeLabel&&<>
                <span style={{color:C.faint}}>·</span>
                <span style={{color:C.muted}}>{item.timeLabel}</span>
              </>}
            </div>

            {/* Title */}
            <div style={{
              fontSize:FS.base,fontWeight:500,color:C.text,
              lineHeight:1.4,letterSpacing:"-0.01em",
              fontFamily:FF.sans,marginBottom:item.why?6:0,
              wordBreak:"break-word",
            }}>{item.title}</div>

            {/* Why */}
            {item.why&&(
              <div style={{
                fontSize:"0.78rem",color:C.muted,
                lineHeight:1.55,fontFamily:FF.mono,
              }}>{item.why}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
