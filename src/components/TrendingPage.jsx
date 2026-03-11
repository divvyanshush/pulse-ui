import { useState, useEffect } from "react";
import { API, FS, FF, getTM } from "../constants/theme.js";

export function TrendingPage({ C, isDark, items, onItemClick, isMobile, onMenu }) {
  const [repos, setRepos] = useState([]);
  const [tab, setTab]     = useState("hot");
  const TML = getTM(isDark);

  useEffect(()=>{
    fetch(`${API}/trending-repos`)
      .then(r=>r.json())
      .then(d=>setRepos(d.repos||d||[]))
      .catch(()=>{});
  },[]);

  const hotItems = [...items]
    .filter(i=>i.src!=="GitHub")
    .sort((a,b)=>(b.heat||0)-(a.heat||0))
    .slice(0,20);

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.bg,overflow:"hidden",minWidth:0}}>

      {/* Header */}
      <div style={{
        padding:isMobile?"20px 20px 0":"28px 32px 0",
        borderBottom:`1px solid ${C.border}`,
        flexShrink:0,
      }}>
        {isMobile && (
          <button onClick={onMenu} style={{
            background:"none",border:"none",padding:0,marginBottom:14,
            cursor:"pointer",color:C.muted,display:"flex",
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14"/>
            </svg>
          </button>
        )}

        <div style={{fontSize:"0.65rem",fontFamily:FF.mono,color:C.muted,
          letterSpacing:"0.12em",marginBottom:8}}>TRENDING</div>
        <div style={{fontSize:isMobile?FS.lg:FS.xl,fontWeight:700,color:C.text,
          fontFamily:FF.sans,letterSpacing:"-0.03em",marginBottom:16,
          lineHeight:1.15}}>What's hot right now</div>

        {/* Tabs */}
        <div style={{display:"flex",gap:0,marginBottom:-1}}>
          {[{id:"hot",label:"Hot Right Now"},{id:"repos",label:"GitHub Repos"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:"8px 16px",background:"transparent",border:"none",
              borderBottom:tab===t.id?`2px solid ${C.text}`:"2px solid transparent",
              color:tab===t.id?C.text:C.muted,
              fontSize:FS.sm,fontFamily:FF.sans,
              fontWeight:tab===t.id?600:400,
              cursor:"pointer",transition:"all .1s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto"}}>
        {tab==="hot" && hotItems.map((item,i)=>{
          const m=TML[item.type]||TML.product;
          return (
            <div key={item.id} onClick={()=>onItemClick(item)}
              style={{
                padding:isMobile?"16px 20px":"20px 32px",
                borderBottom:`1px solid ${C.border}`,
                cursor:"pointer",
                transition:"background .1s",
              }}
              onMouseEnter={e=>e.currentTarget.style.background=C.hover}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8,fontFamily:FF.mono}}>
                <span style={{fontSize:"0.62rem",fontWeight:500,color:m.t,
                  padding:"2px 7px",borderRadius:3,background:m.a,
                  letterSpacing:"0.06em"}}>{m.label}</span>
                <span style={{fontSize:"0.65rem",color:C.muted}}>{item.src}</span>
                <span style={{fontSize:"0.65rem",color:C.faint}}>· {item.timeLabel}</span>
              </div>
              <div style={{fontSize:FS.base,fontWeight:600,color:C.text,
                lineHeight:1.4,letterSpacing:"-0.02em",fontFamily:FF.sans,
                marginBottom:item.sum?6:0}}>{item.title}</div>
              {item.sum&&(
                <div style={{fontSize:FS.sm,color:C.muted,lineHeight:1.6,fontFamily:FF.sans,
                  display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",
                }}>{item.sum}</div>
              )}
            </div>
          );
        })}

        {tab==="repos" && repos.slice(0,20).map((repo,i)=>(
          <a key={i} href={repo.url||repo.link} target="_blank" rel="noopener noreferrer"
            style={{
              display:"block",
              padding:isMobile?"16px 20px":"20px 32px",
              borderBottom:`1px solid ${C.border}`,
              textDecoration:"none",transition:"background .1s",
            }}
            onMouseEnter={e=>e.currentTarget.style.background=C.hover}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
          >
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill={C.muted} flexShrink="0">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              <span style={{fontSize:FS.sm,fontWeight:600,color:C.text,
                fontFamily:FF.sans,letterSpacing:"-0.01em",flex:1,
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
              }}>{repo.name||repo.title}</span>
              {repo.stars&&(
                <span style={{fontSize:"0.65rem",color:C.muted,fontFamily:FF.mono,flexShrink:0}}>
                  ★ {typeof repo.stars==="number"?repo.stars.toLocaleString():repo.stars}
                </span>
              )}
            </div>
            {(repo.description||repo.sum)&&(
              <div style={{fontSize:FS.sm,color:C.muted,fontFamily:FF.sans,lineHeight:1.55,
                marginBottom:repo.language?4:0,
                display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",
              }}>{repo.description||repo.sum}</div>
            )}
            {repo.language&&(
              <div style={{fontSize:"0.65rem",color:C.muted,fontFamily:FF.mono,marginTop:4}}>
                {repo.language}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
