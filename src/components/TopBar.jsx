import { FF } from "../constants/theme.js";

const TABS = [
  { id:"brief",  label:"brief"  },
  { id:"feed",   label:"feed"   },
  { id:"saved",  label:"saved"  },
];

export function TopBar({ C, isDark, page, setPage, user, setShowAuth, bmCount, toggleDark, onSignOut, isMobile }) {
  return (
    <div style={{
      height:40,
      minHeight:40,
      display:"flex",
      alignItems:"center",
      borderBottom:`1px solid ${C.border}`,
      background:C.bg,
      paddingLeft:16,
      paddingRight:16,
      gap:0,
      flexShrink:0,
      userSelect:"none",
    }}>

      {/* Logo */}
      <div style={{
        fontSize:"0.78rem",
        fontWeight:700,
        color:C.text,
        fontFamily:FF.mono,
        letterSpacing:"0.08em",
        marginRight:24,
        flexShrink:0,
      }}>PULSE</div>

      {/* Tabs */}
      <div style={{display:"flex",alignItems:"stretch",height:"100%",flex:1,gap:0}}>
        {TABS.map(t=>{
          const active = page===t.id;
          return (
            <button key={t.id} onClick={()=>setPage(t.id)}
              style={{
                height:"100%",
                padding:"0 14px",
                background:"none",
                border:"none",
                borderBottom:active?`2px solid ${C.text}`:"2px solid transparent",
                color:active?C.text:C.muted,
                fontSize:"0.72rem",
                fontFamily:FF.mono,
                fontWeight:active?500:400,
                letterSpacing:"0.06em",
                cursor:"pointer",
                transition:"color .1s, border-color .1s",
                flexShrink:0,
              }}
              onMouseEnter={e=>{ if(!active) e.currentTarget.style.color=C.sub; }}
              onMouseLeave={e=>{ if(!active) e.currentTarget.style.color=C.muted; }}
            >
              {t.id==="saved" && bmCount>0 ? `saved (${bmCount})` : t.label}
            </button>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>

        {/* Dark toggle */}
        <button onClick={toggleDark}
          style={{
            background:"none",border:`1px solid ${C.border}`,
            padding:"3px 8px",cursor:"pointer",
            color:C.muted,fontSize:"0.65rem",
            fontFamily:FF.mono,letterSpacing:"0.06em",
            borderRadius:2,transition:"border-color .1s, color .1s",
          }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.sub; e.currentTarget.style.color=C.text; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.muted; }}
        >{isDark?"light":"dark"}</button>

        {/* Auth */}
        {user ? (
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {!isMobile && (
              <span style={{fontSize:"0.65rem",color:C.muted,fontFamily:FF.mono}}>
                {user.email?.split("@")[0]}
              </span>
            )}
            <button onClick={onSignOut}
              style={{
                background:"none",border:`1px solid ${C.border}`,
                padding:"3px 8px",cursor:"pointer",
                color:C.muted,fontSize:"0.65rem",
                fontFamily:FF.mono,letterSpacing:"0.06em",
                borderRadius:2,transition:"all .1s",
              }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.sub; e.currentTarget.style.color=C.text; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.muted; }}
            >sign out</button>
          </div>
        ) : (
          <button onClick={()=>setShowAuth(true)}
            style={{
              background:C.accent,
              border:"none",
              padding:"4px 12px",cursor:"pointer",
              color:isDark?"#0a0a0a":"#ffffff",
              fontSize:"0.7rem",
              fontFamily:FF.mono,letterSpacing:"0.06em",
              fontWeight:600,
              borderRadius:2,transition:"opacity .1s",
            }}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}
          >sign in</button>
        )}
      </div>
    </div>
  );
}
