import { useState, useEffect } from "react";
import { API, FS, FF, getTM } from "../constants/theme.js";

export function TrendingPage({ C, isDark, items, onItemClick, isMobile }) {
  const [repos, setRepos] = useState([]);
  const [tab,   setTab]   = useState("hot");
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

      {/* Header + tabs */}
      <div style={{
        padding:"0 0 0",
        borderBottom:`1px solid ${C.border}`,
        flexShrink:0,
      }}>
        <div style={{padding:"16px 16px 0"}}>
          <div style={{fontSize:"0.65rem",color:C.muted,fontFamily:FF.mono,
            letterSpacing:"0.1em",marginBottom:4}}>// trending</div>
        </div>
        <div style={{display:"flex",gap:0,paddingLeft:4}}>
          {[{id:"hot",label:"hot right now"},{id:"repos",label:"github repos"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:"8px 12px",background:"none",border:"none",
              borderBottom:tab===t.id?`2px solid ${C.text}`:"2px solid transparent",
              color:tab===t.id?C.text:C.muted,
              fontSize:"0.7rem",fontFamily:FF.mono,letterSpacing:"0.06em",
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
                padding:"12px 16px",borderBottom:`1px solid ${C.border}`,
                cursor:"pointer",transition:"background .08s",
                display:"flex",flexDirection:"column",gap:5,
              }}
              onMouseEnter={e=>e.currentTarget.style.background=C.hover}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <div style={{display:"flex",alignItems:"center",gap:6,fontFamily:FF.mono,fontSize:"0.68rem"}}>
                <span style={{color:m.t,fontWeight:600,letterSpacing:"0.08em"}}>{m.label}</span>
                <span style={{color:C.faint}}>·</span>
                <span style={{color:C.muted}}>{item.src}</span>
                <span style={{color:C.faint}}>·</span>
                <span style={{color:C.muted}}>{item.timeLabel}</span>
              </div>
              <div style={{fontSize:FS.base,fontWeight:500,color:C.text,
                lineHeight:1.4,letterSpacing:"-0.01em",fontFamily:FF.sans,
              }}>{item.title}</div>
              {item.sum&&(
                <div style={{fontSize:"0.78rem",color:C.muted,lineHeight:1.55,
                  fontFamily:FF.mono,paddingLeft:26,
                  display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",
                }}>{item.sum}</div>
              )}
            </div>
          );
        })}

        {tab==="repos" && repos.slice(0,20).map((repo,i)=>(
          <a key={i} href={repo.url||repo.link} target="_blank" rel="noopener noreferrer"
            style={{
              display:"flex",flexDirection:"column",gap:4,
              padding:"12px 16px",borderBottom:`1px solid ${C.border}`,
              textDecoration:"none",transition:"background .08s",
            }}
            onMouseEnter={e=>e.currentTarget.style.background=C.hover}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
          >
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill={C.muted} style={{flexShrink:0}}>
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              <span style={{fontSize:FS.sm,fontWeight:500,color:C.text,
                fontFamily:FF.sans,flex:1,
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
              }}>{repo.name||repo.title}</span>
              {repo.stars&&(
                <span style={{fontSize:"0.65rem",color:C.muted,fontFamily:FF.mono,flexShrink:0}}>
                  ★ {typeof repo.stars==="number"?repo.stars.toLocaleString():repo.stars}
                </span>
              )}
            </div>
            {(repo.description||repo.sum)&&(
              <div style={{fontSize:"0.75rem",color:C.muted,fontFamily:FF.mono,lineHeight:1.5,
                paddingLeft:21,
                display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",
              }}>{repo.description||repo.sum}</div>
            )}
            {repo.language&&(
              <div style={{fontSize:"0.65rem",color:C.muted,fontFamily:FF.mono,paddingLeft:21}}>
                {repo.language}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
