import { useState, useEffect, useRef } from "react";
import { API, FS, SRC_COLORS, getTM } from "../constants/theme.js";
import { BmSvg, DL } from "./Shared.jsx";

export function Detail({item, onClose, C, isDark, isBookmarked, onBookmark, items=[], onItemClick}) {
  const TML=getTM(isDark);
  const m=TML[item.type]||TML.product;
  const srcColor=SRC_COLORS[item.src]||"#666";
  const [aiSummary,setAiSummary]=useState(null);
  const [aiLoading,setAiLoading]=useState(false);
  const [aiError,  setAiError]  =useState(null);
  const loaded=useRef(false);

  useEffect(()=>{ if(!loaded.current){loaded.current=true;fetchSummary();} },[item.id]);

  const fetchSummary=async()=>{
    if(aiLoading) return;
    setAiLoading(true);setAiError(null);setAiSummary(null);
    try{
      const res=await fetch(`${API}/summarize`,{method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({title:item.title,sum:item.sum,src:item.src,type:item.type})});
      const data=await res.json();
      if(data.error) throw new Error(data.error);
      setAiSummary(data.summary);
    }catch(e){setAiError(e.message);}
    finally{setAiLoading(false);}
  };

  return(
    <div style={{width:"100%",minWidth:0}}>
      <div style={{padding:"14px 16px",borderBottom:"none",
        position:"sticky",top:0,background:C.surface,zIndex:5}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <button className="ibtn" onClick={onClose}
            style={{color:C.muted,fontSize:FS.xs,padding:0,letterSpacing:"0.12em",
              display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.color=C.sub}
            onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8 2L4 6l4 4"/>
            </svg>
            CLOSE
          </button>
          <button className="ibtn" onClick={e=>onBookmark(item,e)}
            style={{display:"flex",alignItems:"center",gap:5,
              color:isBookmarked?C.text:C.muted,fontSize:FS.xs,
              letterSpacing:"0.1em",padding:0,minHeight:36}}
            onMouseEnter={e=>e.currentTarget.style.color=isBookmarked?C.text:C.sub}
            onMouseLeave={e=>e.currentTarget.style.color=isBookmarked?C.text:C.muted}>
            <BmSvg filled={isBookmarked} size={11} color="currentColor"/>
            {isBookmarked?"SAVED":"SAVE"}
          </button>
        </div>
        <span style={{fontSize:"0.62rem",fontWeight:600,letterSpacing:"0.1em",
          padding:"3px 7px",borderRadius:2,background:m.a,color:m.t,}}>
          {m.label}
        </span>
        <div style={{fontSize:FS.lg,fontWeight:600,lineHeight:1.55,
          margin:"12px 0 10px",color:C.text,wordBreak:"break-word"}}>{item.title}</div>
        <div style={{display:"flex",alignItems:"center",gap:12,fontSize:FS.xs,flexWrap:"wrap"}}>
          <span style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:srcColor,flexShrink:0}}/>
            <span style={{color:srcColor,fontWeight:500}}>{item.srcLabel||item.src}</span>
          </span>
          <span style={{color:C.muted}}>{item.timeLabel}</span>
          {item.score>0&&<span style={{color:C.muted}}>↑{item.score}</span>}
          {item.comments>0&&<span style={{color:C.muted}}>{item.comments} replies</span>}
        </div>
      </div>

      <div style={{padding:"0 16px 32px"}}>
        <DL C={C}>
          <span style={{display:"flex",alignItems:"center",gap:7}}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill={C.accent}><polygon points="5,0 6,4 10,5 6,6 5,10 4,6 0,5 4,4"/></svg>
            <span>AI INSIGHT</span>
            {!aiLoading&&(
              <button className="ibtn" onClick={fetchSummary}
                style={{color:C.muted,fontSize:FS.xs,padding:0,marginLeft:4,letterSpacing:"0.08em"}}
                onMouseEnter={e=>e.currentTarget.style.color=C.sub}
                onMouseLeave={e=>e.currentTarget.style.color=C.muted}>↻ REDO</button>
            )}
          </span>
        </DL>
        <div style={{background:C.accentDim,
          border:`1px solid ${C.accentBorder}`,borderRadius:4,padding:"14px 16px",minHeight:66}}>
          {aiLoading&&(
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:10,height:10,border:`1.5px solid ${C.border}`,
                borderTopColor:C.accent,borderRadius:"50%",
                animation:"spin .7s linear infinite",flexShrink:0,marginTop:2}}/>
              <div style={{flex:1}}>
                <div className="sk" style={{width:"82%",height:11,borderRadius:2,marginBottom:8}}/>
                <div className="sk" style={{width:"68%",height:11,borderRadius:2,marginBottom:8}}/>
                <div className="sk" style={{width:"52%",height:11,borderRadius:2}}/>
              </div>
            </div>
          )}
          {!aiLoading&&aiError&&<div style={{fontSize:FS.xs,color:"#ff4d6d"}}>{aiError}</div>}
          {!aiLoading&&aiSummary&&(
            <p style={{fontSize:FS.sm,lineHeight:1.85,
              color:C.text,margin:0,wordBreak:"break-word"}}>{aiSummary}</p>
          )}
        </div>

        <DL C={C}>SUMMARY</DL>
        <p style={{fontSize:FS.sm,lineHeight:1.85,
          color:C.muted,wordBreak:"break-word",margin:0}}>{item.sum}</p>

        {item.authors&&(
          <><DL C={C}>AUTHORS</DL>
          <p style={{fontSize:FS.sm,color:C.muted,wordBreak:"break-word",margin:0,lineHeight:1.7}}>
            {item.authors}</p></>
        )}

        <DL C={C}>SIGNAL</DL>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
          <div style={{flex:1,height:3,background:C.border,borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${item.heat||0}%`,background:m.t,borderRadius:2,opacity:.75}}/>
          </div>
          <span style={{fontSize:FS.xs,color:C.muted,flexShrink:0}}>{item.heat||0}/100</span>
        </div>

        <div style={{marginTop:24,display:"flex",gap:8}}>
          <a href={item.link} target="_blank" rel="noreferrer" className="open-link"
            style={{display:"flex",alignItems:"center",gap:6,
              padding:"7px 12px",
              background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,
              fontSize:FS.xs,color:C.sub,letterSpacing:"0.08em",textDecoration:"none",flexShrink:0}}>
            <span>READ ON {(item.srcLabel||item.src).toUpperCase()}</span>
            <span style={{fontSize:FS.xs}}>↗</span>
          </a>
          <button className="fbtn open-link" onClick={()=>{
              navigator.clipboard.writeText(item.link);
              const el=document.getElementById("copy-confirm");
              if(el){el.style.opacity=1;setTimeout(()=>el.style.opacity=0,1500);}
            }}
            style={{display:"flex",alignItems:"center",gap:6,
              padding:"7px 12px",
              background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,
              fontSize:FS.xs,color:C.sub,letterSpacing:"0.08em",cursor:"pointer"}}>
            <span>COPY LINK</span>
            <span id="copy-confirm" style={{fontSize:FS.xs,color:C.accent,opacity:0,transition:"opacity .3s"}}>COPIED ✓</span>
          </button>
        </div>

        {(()=>{
          const related = items.filter(i=>
            i.id!==item.id && (
              i.type===item.type ||
              (item.title&&i.title&&item.title.split(" ").filter(w=>w.length>4).some(w=>i.title.toLowerCase().includes(w.toLowerCase())))
            )
          ).slice(0,3);
          if(!related.length) return null;
          return(
            <div style={{marginTop:28}}>
              <div style={{fontSize:FS.xs,color:C.muted,letterSpacing:"0.1em",marginBottom:12}}>RELATED</div>
              {related.map(r=>{
                const m=getTM(isDark)[r.type]||getTM(isDark).product;
                return(
                  <div key={r.id} onClick={()=>onItemClick&&onItemClick(r)}
                    style={{padding:"10px 0",borderBottom:"none",cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                      <span style={{fontSize:"0.6rem",padding:"2px 5px",borderRadius:2,
                        background:m.a,color:m.t,letterSpacing:"0.06em"}}>{m.label}</span>
                      <span style={{fontSize:FS.xs,color:C.muted}}>{r.srcLabel||r.src}</span>
                    </div>
                    <div style={{fontSize:FS.sm,color:C.text,lineHeight:1.5,
                      display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                      {r.title}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
