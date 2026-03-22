import { FS, timeAgo } from "../constants/theme.js";

export function NotifPanel({C, isDark, alertLog, setAlertLog, notifPerm, requestNotifPermission, onClose, isMobile, onItemClick}) {
  return (
    <>
      <div style={{padding:"16px 18px 14px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:FS.md,fontWeight:600,color:C.text,letterSpacing:"0.1em"}}>ALERTS</span>
          {!isMobile && (
            <button className="ibtn" onClick={onClose}
              style={{color:C.muted,fontSize:FS.lg,padding:2,lineHeight:1}}>✕</button>
          )}
        </div>
        <div style={{fontSize:FS.xs,color:C.muted,letterSpacing:"0.06em"}}>
          {notifPerm==="granted"?"Push on · ":notifPerm==="denied"?"Push blocked · ":"Push off · "}
          {alertLog.length} alert{alertLog.length!==1?"s":""}
        </div>
      </div>
      {notifPerm!=="granted" && notifPerm!=="denied" && (
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,
          display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{fontSize:FS.sm,color:C.sub,marginBottom:3}}>Browser push</div>
            <div style={{fontSize:FS.xs,color:C.muted}}>Alerts even when tab is in background</div>
          </div>
          <button className="fbtn" onClick={requestNotifPermission}
            style={{padding:"7px 14px",background:"rgba(0,255,136,.08)",
              border:"1px solid rgba(0,255,136,.25)",borderRadius:4,
              color:C.accent,fontSize:FS.xs,letterSpacing:"0.08em",flexShrink:0,marginLeft:12}}>
            ENABLE
          </button>
        </div>
      )}
      {notifPerm==="granted" && (
        <div style={{padding:"11px 18px",borderBottom:`1px solid ${C.border}`,
          display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:C.accent,
            boxShadow:isDark?`0 0 6px ${C.accent}`:"none",flexShrink:0}}/>
          <span style={{fontSize:FS.sm,color:C.accent}}>Push notifications active</span>
        </div>
      )}
      {notifPerm==="denied" && (
        <div style={{padding:"11px 18px",borderBottom:`1px solid ${C.border}`,
          display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#ff4d6d",flexShrink:0}}/>
          <span style={{fontSize:FS.xs,color:C.muted,lineHeight:1.5}}>Blocked — re-enable in browser site settings</span>
        </div>
      )}
      <div style={{flex:1,overflowY:"auto",minHeight:0}}>
        {alertLog.length===0 ? (
          <div style={{padding:"52px 18px",textAlign:"center"}}>
            <div style={{fontSize:"1.6rem",marginBottom:12,opacity:.2}}>🔔</div>
            <div style={{fontSize:FS.sm,color:C.muted,letterSpacing:"0.08em"}}>NO ALERTS YET</div>
            <div style={{fontSize:FS.xs,color:C.muted,marginTop:6,opacity:.6,lineHeight:1.6}}>
              Alerts appear here when new or trending items arrive in real time
            </div>
          </div>
        ) : alertLog.map((a,i)=>(
          <div key={i} onClick={()=>{if(a.item&&onItemClick){onItemClick(a.item);onClose();}}}
            style={{padding:"13px 18px",borderBottom:`1px solid ${C.border}`,
              display:"flex",alignItems:"flex-start",gap:10,cursor:a.item?"pointer":"default",transition:"background .1s"}}
            onMouseEnter={e=>{if(a.item)e.currentTarget.style.background=C.hover;}}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{width:6,height:6,borderRadius:"50%",flexShrink:0,marginTop:5,
              background:a.type==="hot"?"#ff4d6d":C.accent}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:FS.xs,color:a.type==="hot"?"#ff4d6d":C.accent,
                letterSpacing:"0.08em",marginBottom:3,fontWeight:600}}>
                {a.title.toUpperCase()}
              </div>
              <div style={{fontSize:FS.sm,color:C.sub,lineHeight:1.5,overflow:"hidden",
                display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>
                {a.body}
              </div>
            </div>
            <div style={{fontSize:FS.xs,color:C.muted,flexShrink:0,marginTop:2}}>
              {timeAgo(Math.floor(a.ts/1000))}
            </div>
          </div>
        ))}
      </div>
      {alertLog.length>0 && (
        <div style={{padding:"12px 18px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          <button className="fbtn" onClick={()=>setAlertLog([])}
            style={{width:"100%",padding:"10px",background:"transparent",
              border:`1px solid ${C.border}`,borderRadius:4,
              color:C.muted,fontSize:FS.xs,letterSpacing:"0.08em"}}>
            CLEAR ALL
          </button>
        </div>
      )}
    </>
  );
}
