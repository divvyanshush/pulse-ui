import { FF, FS } from "../constants/theme.js";

const NAV = [
  {
    id:"today", label:"Today",
    icon:(c)=>(
      <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="11" height="10" rx="1.5"/>
        <path d="M5 1v2M10 1v2M2 6h11"/>
      </svg>
    )
  },
  {
    id:"feed", label:"Feed",
    icon:(c)=>(
      <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
        <path d="M2 4h11M2 7.5h11M2 11h7"/>
      </svg>
    )
  },
  {
    id:"trending", label:"Trending",
    icon:(c)=>(
      <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1,11 5,6 8,9 14,3"/>
        <polyline points="10,3 14,3 14,7"/>
      </svg>
    )
  },
  {
    id:"saved", label:"Saved",
    icon:(c)=>(
      <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2h9a1 1 0 011 1v10l-5-3-5 3V3a1 1 0 011-1z"/>
      </svg>
    )
  },
];

function NavItem({ n, active, onClick, C, children }) {
  return (
    <div onClick={onClick}
      style={{
        display:"flex", alignItems:"center", gap:8,
        padding:"7px 12px", margin:"1px 8px",
        borderRadius:6, cursor:"pointer",
        background:active?C.hover:"transparent",
        transition:"background .1s",
        userSelect:"none",
      }}
      onMouseEnter={e=>{ e.currentTarget.style.background=C.hover; }}
      onMouseLeave={e=>{ e.currentTarget.style.background=active?C.hover:"transparent"; }}
    >
      {children}
    </div>
  );
}

export function NavSidebar({ C, isDark, page, setPage, user, setShowAuth, bmCount, toggleDark, onSignOut }) {
  return (
    <div style={{
      width:220, minWidth:220, height:"100vh",
      background:C.surface,
      borderRight:`1px solid ${C.border}`,
      display:"flex", flexDirection:"column",
      flexShrink:0,
      WebkitFontSmoothing:"antialiased",
    }}>

      {/* Logo */}
      <div style={{padding:"18px 20px 14px"}}>
        <div style={{
          fontSize:"1.05rem", fontWeight:700,
          color:C.text, letterSpacing:"-0.03em",
          fontFamily:FF.sans,
        }}>Pulse</div>
        <div style={{
          fontSize:"0.6rem", color:C.muted,
          letterSpacing:"0.06em", marginTop:1,
          fontFamily:FF.mono,
        }}>AI SIGNALS · DAILY</div>
      </div>

      {/* Nav */}
      <div style={{flex:1, padding:"4px 0", overflowY:"auto"}}>

        {/* Section label */}
        <div style={{
          padding:"6px 20px 4px",
          fontSize:"0.58rem", fontWeight:600,
          color:C.muted, letterSpacing:"0.1em",
          fontFamily:FF.mono,
        }}>NAVIGATION</div>

        {NAV.map(n=>{
          const active = page===n.id;
          const color = active ? C.text : C.muted;
          return (
            <NavItem key={n.id} n={n} active={active} C={C}
              onClick={()=>{
                if(n.id==="saved" && !user){ setShowAuth(true); return; }
                setPage(n.id);
              }}
            >
              {n.icon(color)}
              <span style={{
                fontSize:"0.82rem",
                fontWeight:active?500:400,
                color, fontFamily:FF.sans,
                flex:1,
              }}>{n.label}</span>
              {n.id==="saved" && bmCount>0 && (
                <span style={{
                  fontSize:"0.58rem", color:C.muted,
                  fontFamily:FF.mono, background:C.faint,
                  padding:"1px 6px", borderRadius:10,
                }}>{bmCount}</span>
              )}
            </NavItem>
          );
        })}
      </div>

      {/* Bottom */}
      <div style={{borderTop:`1px solid ${C.border}`, padding:"8px 0 12px"}}>

        <NavItem n={{}} active={false} C={C} onClick={toggleDark}>
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke={C.muted} strokeWidth="1.6" strokeLinecap="round">
            {isDark
              ? <><circle cx="7.5" cy="7.5" r="2.8"/><path d="M7.5 1.5v1M7.5 12v1M1.5 7.5h1M12 7.5h1M3.2 3.2l.7.7M11.1 11.1l.7.7M11.1 3.2l-.7.7M4 11.1l-.7.7"/></>
              : <path d="M12.5 9A5.5 5.5 0 015.5 2a5.5 5.5 0 100 11 5.5 5.5 0 007-4z"/>
            }
          </svg>
          <span style={{fontSize:"0.82rem",color:C.muted,fontFamily:FF.sans}}>
            {isDark?"Light mode":"Dark mode"}
          </span>
        </NavItem>

        {user ? (
          <NavItem n={{}} active={false} C={C} onClick={()=>{}}>
            <div style={{
              width:22, height:22, borderRadius:"50%",
              background:C.accent, display:"flex",
              alignItems:"center", justifyContent:"center",
              flexShrink:0,
            }}>
              <span style={{
                fontSize:"0.6rem", fontWeight:700,
                color:"#000", fontFamily:FF.mono,
              }}>{(user.email||"?")[0].toUpperCase()}</span>
            </div>
            <span style={{
              fontSize:"0.78rem", color:C.sub,
              overflow:"hidden", textOverflow:"ellipsis",
              whiteSpace:"nowrap", flex:1,
              fontFamily:FF.sans,
            }}>{user.email?.split("@")[0]}</span>
            <div onClick={e=>{e.stopPropagation();onSignOut&&onSignOut();}}
              style={{
                fontSize:"0.6rem",color:C.muted,
                fontFamily:FF.mono,cursor:"pointer",
                padding:"2px 4px",borderRadius:3,
              }}
              onMouseEnter={e=>e.currentTarget.style.color=C.text}
              onMouseLeave={e=>e.currentTarget.style.color=C.muted}
            >OUT</div>
          </NavItem>
        ) : (
          <NavItem n={{}} active={false} C={C} onClick={()=>setShowAuth(true)}>
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke={C.accent} strokeWidth="1.6" strokeLinecap="round">
              <path d="M5 2H3a1.5 1.5 0 00-1.5 1.5v8A1.5 1.5 0 003 13h2"/>
              <polyline points="10,4 13,7.5 10,11"/>
              <line x1="13" y1="7.5" x2="5" y2="7.5"/>
            </svg>
            <span style={{fontSize:"0.82rem",color:C.text,fontWeight:600,fontFamily:FF.sans}}>Sign in</span>
          </NavItem>
        )}
      </div>
    </div>
  );
}
