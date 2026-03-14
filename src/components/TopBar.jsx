import { useState } from "react";
import { FF, FS } from "../constants/theme.js";
import { MoonIcon, SunIcon, SignOutIcon, BriefIcon, FeedIcon, BmSvg } from "./Shared.jsx";

const TABS = [
  { id:"brief", label:"Brief"  },
  { id:"feed",  label:"Feed"   },
  { id:"saved", label:"Saved"  },
];

function UserIcon({size=16, color="currentColor"}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"block",flexShrink:0}}>
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}

export function TopBar({ C, isDark, page, setPage, user, setShowAuth, bmCount, toggleDark, onSignOut, isMobile }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{
      height:48, minHeight:48,
      display:"flex", alignItems:"center",
      borderBottom:`1px solid ${C.border}`,
      background:C.bg,
      paddingLeft:16, paddingRight:16,
      gap:0, flexShrink:0, userSelect:"none",
      position:"relative",
    }}>

      {/* Logo */}
      <div style={{marginRight:24, flexShrink:0, display:"flex", alignItems:"center"}}>
        <svg width="140" height="30" viewBox="0 0 183 39" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.6195 27.7702C11.3018 25.4498 10 22.3043 10 19.0247C10 15.7451 11.3018 12.5996 13.6195 10.2793M17.1192 24.2705C15.7295 22.8784 14.9489 20.9917 14.9489 19.0247C14.9489 17.0577 15.7295 15.171 17.1192 13.7789" stroke="#8D8BFA" strokeWidth="2.475" strokeLinecap="round"/>
          <path d="M27.6311 18.496L25.7831 14.944H25.7111V27.76H23.1191V11.008H26.1431L31.6151 20.272L33.4631 23.824H33.5351V11.008H36.1271V27.76H33.1031L27.6311 18.496Z" fill="#8D8BFA"/>
          <path d="M44.956 28.048C44.06 28.048 43.26 27.896 42.556 27.592C41.852 27.288 41.252 26.856 40.756 26.296C40.26 25.72 39.876 25.032 39.604 24.232C39.348 23.416 39.22 22.512 39.22 21.52C39.22 20.528 39.348 19.632 39.604 18.832C39.876 18.016 40.26 17.328 40.756 16.768C41.252 16.192 41.852 15.752 42.556 15.448C43.26 15.144 44.06 14.992 44.956 14.992C45.868 14.992 46.668 15.152 47.356 15.472C48.06 15.792 48.644 16.24 49.108 16.816C49.572 17.376 49.916 18.032 50.14 18.784C50.38 19.536 50.5 20.344 50.5 21.208V22.192H41.932V22.6C41.932 23.56 42.212 24.352 42.772 24.976C43.348 25.584 44.164 25.888 45.22 25.888C45.988 25.888 46.636 25.72 47.164 25.384C47.692 25.048 48.14 24.592 48.508 24.016L50.044 25.528C49.58 26.296 48.908 26.912 48.028 27.376C47.148 27.824 46.124 28.048 44.956 28.048ZM44.956 17.032C44.508 17.032 44.092 17.112 43.708 17.272C43.34 17.432 43.02 17.656 42.748 17.944C42.492 18.232 42.292 18.576 42.148 18.976C42.004 19.376 41.932 19.816 41.932 20.296V20.464H47.74V20.224C47.74 19.264 47.492 18.496 46.996 17.92C46.5 17.328 45.82 17.032 44.956 17.032Z" fill="#8D8BFA"/>
          <path d="M60.9559 25.696H60.8599C60.7479 26 60.5959 26.296 60.4039 26.584C60.2279 26.872 59.9959 27.128 59.7079 27.352C59.4359 27.56 59.0999 27.728 58.6999 27.856C58.3159 27.984 57.8679 28.048 57.3559 28.048C56.0599 28.048 55.0519 27.632 54.3319 26.8C53.6279 25.968 53.2759 24.776 53.2759 23.224V15.28H55.8919V22.888C55.8919 24.824 56.6919 25.792 58.2919 25.792C58.6279 25.792 58.9559 25.752 59.2759 25.672C59.5959 25.576 59.8759 25.44 60.1159 25.264C60.3719 25.088 60.5719 24.864 60.7159 24.592C60.8759 24.32 60.9559 24 60.9559 23.632V15.28H63.5719V27.76H60.9559V25.696Z" fill="#8D8BFA"/>
          <path d="M67.3178 27.76V15.28H69.9338V17.68H70.0538C70.2298 17.04 70.5978 16.48 71.1578 16C71.7178 15.52 72.4938 15.28 73.4858 15.28H74.1818V17.8H73.1498C72.1098 17.8 71.3098 17.968 70.7498 18.304C70.2058 18.64 69.9338 19.136 69.9338 19.792V27.76H67.3178Z" fill="#8D8BFA"/>
          <path d="M85.4618 27.76C84.7738 27.76 84.2458 27.568 83.8778 27.184C83.5098 26.784 83.2858 26.28 83.2058 25.672H83.0858C82.8458 26.456 82.4058 27.048 81.7658 27.448C81.1258 27.848 80.3498 28.048 79.4378 28.048C78.1418 28.048 77.1418 27.712 76.4378 27.04C75.7498 26.368 75.4058 25.464 75.4058 24.328C75.4058 23.08 75.8538 22.144 76.7498 21.52C77.6618 20.896 78.9898 20.584 80.7338 20.584H82.9898V19.528C82.9898 18.76 82.7818 18.168 82.3658 17.752C81.9498 17.336 81.3018 17.128 80.4218 17.128C79.6858 17.128 79.0858 17.288 78.6218 17.608C78.1578 17.928 77.7658 18.336 77.4458 18.832L75.8858 17.416C76.3018 16.712 76.8858 16.136 77.6378 15.688C78.3898 15.224 79.3738 14.992 80.5898 14.992C82.2058 14.992 83.4458 15.368 84.3098 16.12C85.1738 16.872 85.6058 17.952 85.6058 19.36V25.624H86.9258V27.76H85.4618ZM80.1818 26.056C80.9978 26.056 81.6698 25.88 82.1978 25.528C82.7258 25.16 82.9898 24.672 82.9898 24.064V22.264H80.7818C78.9738 22.264 78.0698 22.824 78.0698 23.944V24.376C78.0698 24.936 78.2538 25.36 78.6218 25.648C79.0058 25.92 79.5258 26.056 80.1818 26.056Z" fill="#8D8BFA"/>
          <path d="M92.1536 27.76C91.2576 27.76 90.5856 27.536 90.1376 27.088C89.7056 26.624 89.4896 25.984 89.4896 25.168V10H92.1056V25.624H93.8336V27.76H92.1536Z" fill="#8D8BFA"/>
          <path d="M104.651 28.048C102.459 28.048 100.739 27.312 99.4911 25.84C98.2431 24.352 97.6191 22.2 97.6191 19.384C97.6191 17.976 97.7791 16.736 98.0991 15.664C98.4191 14.592 98.8831 13.688 99.4911 12.952C100.099 12.216 100.835 11.664 101.699 11.296C102.579 10.912 103.563 10.72 104.651 10.72C106.107 10.72 107.323 11.04 108.299 11.68C109.291 12.32 110.067 13.264 110.627 14.512L108.347 15.76C108.059 14.96 107.611 14.328 107.003 13.864C106.411 13.384 105.627 13.144 104.651 13.144C103.355 13.144 102.339 13.584 101.603 14.464C100.867 15.344 100.499 16.56 100.499 18.112V20.656C100.499 22.208 100.867 23.424 101.603 24.304C102.339 25.184 103.355 25.624 104.651 25.624C105.659 25.624 106.475 25.368 107.099 24.856C107.739 24.328 108.211 23.656 108.515 22.84L110.699 24.16C110.139 25.376 109.355 26.328 108.347 27.016C107.339 27.704 106.107 28.048 104.651 28.048Z" fill="#8D8BFA"/>
          <path d="M113.382 27.76V15.28H115.998V17.68H116.118C116.294 17.04 116.662 16.48 117.222 16C117.782 15.52 118.558 15.28 119.55 15.28H120.246V17.8H119.214C118.174 17.8 117.374 17.968 116.814 18.304C116.27 18.64 115.998 19.136 115.998 19.792V27.76H113.382Z" fill="#8D8BFA"/>
          <path d="M131.526 27.76C130.838 27.76 130.31 27.568 129.942 27.184C129.574 26.784 129.35 26.28 129.27 25.672H129.15C128.91 26.456 128.47 27.048 127.83 27.448C127.19 27.848 126.414 28.048 125.502 28.048C124.206 28.048 123.206 27.712 122.502 27.04C121.814 26.368 121.47 25.464 121.47 24.328C121.47 23.08 121.918 22.144 122.814 21.52C123.726 20.896 125.054 20.584 126.798 20.584H129.054V19.528C129.054 18.76 128.846 18.168 128.43 17.752C128.014 17.336 127.366 17.128 126.486 17.128C125.75 17.128 125.15 17.288 124.686 17.608C124.222 17.928 123.83 18.336 123.51 18.832L121.95 17.416C122.366 16.712 122.95 16.136 123.702 15.688C124.454 15.224 125.438 14.992 126.654 14.992C128.27 14.992 129.51 15.368 130.374 16.12C131.238 16.872 131.67 17.952 131.67 19.36V25.624H132.99V27.76H131.526ZM126.246 26.056C127.062 26.056 127.734 25.88 128.262 25.528C128.79 25.16 129.054 24.672 129.054 24.064V22.264H126.846C125.038 22.264 124.134 22.824 124.134 23.944V24.376C124.134 24.936 124.318 25.36 124.686 25.648C125.07 25.92 125.59 26.056 126.246 26.056Z" fill="#8D8BFA"/>
          <path d="M134.212 15.28H136.756L138.028 20.512L139.156 25.24H139.228L140.524 20.512L142.036 15.28H144.388L145.924 20.512L147.244 25.24H147.316L148.42 20.512L149.716 15.28H152.14L148.78 27.76H145.828L143.188 18.568H143.14L142.156 22.072L140.5 27.76H137.62L134.212 15.28Z" fill="#8D8BFA"/>
          <path d="M157.296 27.76C156.4 27.76 155.728 27.536 155.28 27.088C154.848 26.624 154.632 25.984 154.632 25.168V10H157.248V25.624H158.976V27.76H157.296Z" fill="#8D8BFA"/>
          <path d="M164.977 13.7789C166.366 15.171 167.147 17.0577 167.147 19.0247C167.147 20.9917 166.366 22.8784 164.977 24.2705M168.476 10.2793C170.794 12.5996 172.096 15.7451 172.096 19.0247C172.096 22.3043 170.794 25.4498 168.476 27.7701" stroke="#8D8BFA" strokeWidth="2.475" strokeLinecap="round"/>
        </svg>
      </div>

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
                fontSize:FS.sm,
                fontFamily:FF.sans,
                fontWeight:active?500:400,
                cursor:"pointer",
                transition:"color .1s, border-color .1s",
                flexShrink:0,
              }}
              onMouseEnter={e=>{ if(!active) e.currentTarget.style.color=C.sub; }}
              onMouseLeave={e=>{ if(!active) e.currentTarget.style.color=C.muted; }}
            >
              <span style={{display:"flex",alignItems:"center",gap:5}}>
                {t.id==="brief" && <BriefIcon size={12} color="currentColor"/>}
                {t.id==="feed"  && <FeedIcon  size={12} color="currentColor"/>}
                {t.id==="saved" && <BmSvg size={11} filled={bmCount>0} color="currentColor"/>}
                {t.id==="saved" && bmCount>0 ? `Saved (${bmCount})` : t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right — account icon */}
      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        {user ? (
          <div style={{position:"relative"}}>
            <button onClick={()=>setMenuOpen(o=>!o)}
              style={{
                display:"flex",alignItems:"center",justifyContent:"center",
                width:32,height:32,borderRadius:"50%",
                background:menuOpen?C.surface:C.faint,
                border:`1px solid ${menuOpen?C.sub:C.border}`,
                cursor:"pointer",color:C.text,
                transition:"all .15s",flexShrink:0,
              }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.sub; e.currentTarget.style.background=C.surface; }}
              onMouseLeave={e=>{ if(!menuOpen){ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.faint; } }}
            >
              <UserIcon size={15} color={C.text}/>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <>
                {/* Backdrop */}
                <div onClick={()=>setMenuOpen(false)}
                  style={{position:"fixed",inset:0,zIndex:99}}/>
                {/* Menu */}
                <div style={{
                  position:"absolute",right:0,top:"calc(100% + 8px)",
                  width:220,
                  background:C.surface,
                  border:`1px solid ${C.border}`,
                  borderRadius:6,
                  boxShadow:`0 8px 24px rgba(0,0,0,0.3)`,
                  zIndex:100,
                  overflow:"hidden",
                }}>
                  {/* Email */}
                  <div style={{
                    padding:"12px 14px",
                    borderBottom:`1px solid ${C.border}`,
                  }}>
                    <div style={{fontSize:FS.xs,color:C.muted,fontFamily:FF.mono,marginBottom:2}}>signed in as</div>
                    <div style={{fontSize:FS.sm,color:C.text,fontFamily:FF.sans,fontWeight:500,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"
                    }}>{user.email}</div>
                  </div>

                  {/* Dark/light toggle */}
                  <button onClick={()=>{ toggleDark(); setMenuOpen(false); }}
                    style={{
                      width:"100%",display:"flex",alignItems:"center",gap:10,
                      padding:"11px 14px",background:"none",border:"none",
                      borderBottom:`1px solid ${C.border}`,
                      color:C.text,fontSize:FS.sm,fontFamily:FF.sans,
                      cursor:"pointer",transition:"background .1s",textAlign:"left",
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.hover}
                    onMouseLeave={e=>e.currentTarget.style.background="none"}
                  >
                    {isDark ? <SunIcon size={14} color={C.muted}/> : <MoonIcon size={14} color={C.muted}/>}
                    <span>{isDark ? "Light mode" : "Dark mode"}</span>
                  </button>

                  {/* Sign out */}
                  <button onClick={()=>{ onSignOut(); setMenuOpen(false); }}
                    style={{
                      width:"100%",display:"flex",alignItems:"center",gap:10,
                      padding:"11px 14px",background:"none",border:"none",
                      color:C.text,fontSize:FS.sm,fontFamily:FF.sans,
                      cursor:"pointer",transition:"background .1s",textAlign:"left",
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.hover}
                    onMouseLeave={e=>e.currentTarget.style.background="none"}
                  >
                    <SignOutIcon size={14} color={C.muted}/>
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button onClick={()=>setShowAuth(true)}
            style={{
              background:C.accent,border:"none",
              padding:"5px 14px",cursor:"pointer",
              color:isDark?"#0a0a0a":"#ffffff",
              fontSize:FS.sm,fontFamily:FF.sans,
              fontWeight:600,borderRadius:3,
              transition:"opacity .1s",
            }}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}
          >Sign in</button>
        )}
      </div>
    </div>
  );
}
