import { useState, useEffect } from "react";
import { API, FS, FF, getTM } from "../constants/theme.js";

export function Briefing({ C, isDark, onItemClick }) {
  const [briefing, setBriefing] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [open,     setOpen]     = useState(true);
  const TML = getTM(isDark);

  useEffect(()=>{
    fetch(`${API}/briefing`)
      .then(r=>r.json())
      .then(d=>{ setBriefing(d); setLoading(false); })
      .catch(()=>setLoading(false));
  },[]);

  if(!loading && (!briefing || !briefing.items?.length)) return null;

  return (
    <div style={{
      borderBottom:`1px solid ${C.border}`,
      background:isDark?"rgba(0,229,255,0.02)":"rgba(0,102,204,0.02)",
    }}>
      {/* Header */}
      <div style={{
        padding:"10px 18px",
        display:"flex", alignItems:"center", gap:10,
        borderBottom:`1px solid ${C.border}`,
        cursor:"pointer",
      }} onClick={()=>setOpen(o=>!o)}>
        <div style={{
          width:5, height:5, borderRadius:"50%",
          background:C.accent, flexShrink:0,
        }}/>
        <span style={{
          fontSize:"0.6rem", fontWeight:700,
          letterSpacing:"0.16em", color:C.accent,
        }}>
          TODAY'S BRIEFING
        </span>
        {briefing?.date && (
          <span style={{fontSize:"0.58rem", color:C.muted, letterSpacing:"0.08em"}}>
            {briefing.date}
          </span>
        )}
        <span style={{
          marginLeft:"auto", fontSize:"0.58rem",
          color:C.muted, letterSpacing:"0.08em",
        }}>
          {open ? "COLLAPSE ↑" : "EXPAND ↓"}
        </span>
      </div>

      {/* Items */}
      {open && (
        <div>
          {loading ? (
            // Skeleton
            [1,2,3,4,5,6,7,8,9,10].map(n=>(
              <div key={n} style={{
                padding:"12px 18px",
                borderBottom:`1px solid ${C.border}`,
                display:"flex", gap:12, alignItems:"flex-start",
              }}>
                <div style={{
                  width:16, height:16, borderRadius:2,
                  background:C.faint, flexShrink:0,
                }}/>
                <div style={{flex:1}}>
                  <div className="sk" style={{width:"70%",height:11,borderRadius:2,marginBottom:5}}/>
                  <div className="sk" style={{width:"45%",height:9,borderRadius:2}}/>
                </div>
              </div>
            ))
          ) : briefing?.items?.map((item,i)=>{
            const m = TML[item.type] || TML.product;
            return (
              <div key={i}
                onClick={()=>onItemClick && onItemClick({
                  id:item.id, title:item.title, type:item.type,
                  src:item.src, heat:item.heat, link:item.link,
                })}
                style={{
                  padding:"12px 18px",
                  borderBottom:i<9?`1px solid ${C.border}`:"none",
                  display:"flex", gap:12, alignItems:"flex-start",
                  cursor:"pointer", transition:"background .1s",
                }}
                onMouseEnter={e=>e.currentTarget.style.background=C.hover}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>

                {/* Number */}
                <span style={{
                  fontSize:"0.58rem", fontWeight:700,
                  color:C.muted, flexShrink:0,
                  width:16, textAlign:"right", marginTop:1,
                }}>
                  {String(item.idx).padStart(2,"0")}
                </span>

                {/* Content */}
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:4}}>
                    <span style={{
                      fontSize:"0.52rem", fontWeight:600,
                      letterSpacing:"0.1em", padding:"2px 5px",
                      borderRadius:2, background:m.a, color:m.t,
                      border:`1px solid ${m.b}`, flexShrink:0,
                      whiteSpace:"nowrap",
                    }}>{m.label}</span>
                    <span style={{
                      fontSize:"0.6rem", color:C.muted,
                      letterSpacing:"0.06em", flexShrink:0,
                    }}>{item.src}</span>
                  </div>
                  <div style={{
                    fontSize:FS.xs, fontWeight:600,
                    color:C.text, lineHeight:1.4,
                    marginBottom:3, letterSpacing:"-0.01em",
                  }}>{item.title}</div>
                  {item.why && (
                    <div style={{
                      fontSize:FS.xs, color:C.sub,
                      fontStyle:"italic", lineHeight:1.5,
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
