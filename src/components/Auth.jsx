import { useState } from "react";
import { FS } from "../constants/theme.js";
import { supabase } from "../lib/supabase.js";

export function Auth({ onAuth, C, isDark }) {
  const [mode,     setMode]     = useState("signin");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const handle = async () => {
    if(!email||!password) return;
    setLoading(true); setError(null);
    const err = await onAuth(mode, email, password);
    if(err) setError(err.message);
    else if(mode==="signup") setSuccess(true);
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
  };

  const inp = {
    padding:"11px 14px", background:C.bg, border:"1px solid "+C.border,
    borderRadius:3, color:C.text, fontFamily:"IBM Plex Mono,monospace",
    fontSize:FS.sm, outline:"none", width:"100%", boxSizing:"border-box",
    WebkitAppearance:"none", transition:"border-color .15s",
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex",
      background:C.bg, fontFamily:"IBM Plex Mono,monospace",
      overflowY:"auto", position:"fixed", inset:0,
    }}>
      {/* Left panel — branding */}
      {!false && (
        <div style={{
          display:"none",
          flex:1, background:C.surface,
          borderRight:"1px solid "+C.border,
          padding:"48px", flexDirection:"column",
          justifyContent:"space-between",
          "@media(min-width:768px)":{display:"flex"},
        }}/>
      )}

      {/* Right panel — form */}
      <div style={{
        flex:1, display:"flex", alignItems:"center",
        justifyContent:"center", padding:"24px",
      }}>
        <div style={{width:"100%", maxWidth:360}}>

          {/* Logo */}
          <div style={{marginBottom:40}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:C.accent}}/>
              <span style={{fontSize:FS.md,fontWeight:700,letterSpacing:"0.25em",color:C.text}}>
                PULSE
              </span>
            </div>
            <div style={{fontSize:FS.xs,color:C.muted,letterSpacing:"0.08em",lineHeight:1.6}}>
              AI signals for developers.<br/>
              Research · Repos · Tools · News
            </div>
          </div>

          {success ? (
            <div style={{padding:"28px 24px",
              border:"1px solid "+C.border, borderRadius:6, background:C.surface}}>
              <div style={{marginBottom:16}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke={C.accent} strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <polyline points="2,4 12,13 22,4"/>
                </svg>
              </div>
              <div style={{fontSize:FS.sm,color:C.text,marginBottom:6,fontWeight:600}}>
                Check your email
              </div>
              <div style={{fontSize:FS.xs,color:C.muted,lineHeight:1.7}}>
                Confirmation link sent to<br/>
                <span style={{color:C.sub}}>{email}</span>
              </div>
            </div>
          ) : (
            <div>
              {/* Mode toggle */}
              <div style={{display:"flex",gap:0,marginBottom:24,
                background:C.surface,borderRadius:4,padding:3,
                border:"1px solid "+C.border}}>
                {[["signin","Sign in"],["signup","Sign up"]].map(([m,label])=>(
                  <button key={m} onClick={()=>{setMode(m);setError(null);}}
                    style={{flex:1,padding:"8px",border:"none",cursor:"pointer",
                      fontFamily:"IBM Plex Mono,monospace",fontSize:FS.xs,
                      letterSpacing:"0.08em",borderRadius:3,
                      background:mode===m?C.bg:"transparent",
                      color:mode===m?C.text:C.muted,
                      boxShadow:mode===m?"0 1px 3px rgba(0,0,0,0.2)":"none",
                      transition:"all .15s"}}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Google */}
              <button onClick={handleGoogle}
                style={{width:"100%",padding:"11px",marginBottom:14,
                  background:C.surface,border:"1px solid "+C.border,borderRadius:3,
                  color:C.sub,fontFamily:"IBM Plex Mono,monospace",fontSize:FS.xs,
                  letterSpacing:"0.08em",cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                  transition:"border-color .15s, background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.faint}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <svg width="16" height="16" viewBox="0 0 24 24" style={{flexShrink:0}}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <div style={{flex:1,height:1,background:C.border}}/>
                <span style={{fontSize:"0.6rem",color:C.muted,letterSpacing:"0.08em"}}>OR</span>
                <div style={{flex:1,height:1,background:C.border}}/>
              </div>

              {/* Email/Password */}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <input value={email} onChange={e=>setEmail(e.target.value)}
                  type="email" placeholder="Email address"
                  autoComplete="email" style={inp}
                  onFocus={e=>e.target.style.borderColor=C.accent}
                  onBlur={e=>e.target.style.borderColor=C.border}/>
                <input value={password} onChange={e=>setPassword(e.target.value)}
                  type="password" placeholder="Password"
                  autoComplete={mode==="signin"?"current-password":"new-password"}
                  onKeyDown={e=>e.key==="Enter"&&handle()}
                  style={inp}
                  onFocus={e=>e.target.style.borderColor=C.accent}
                  onBlur={e=>e.target.style.borderColor=C.border}/>

                {error && (
                  <div style={{fontSize:FS.xs,color:"#ff4d6d",padding:"9px 12px",
                    background:"rgba(255,77,109,.06)",border:"1px solid rgba(255,77,109,.15)",
                    borderRadius:3,lineHeight:1.5}}>
                    {error}
                  </div>
                )}

                <button onClick={handle} disabled={loading||!email||!password}
                  style={{padding:"12px",background:C.accent,border:"none",borderRadius:3,
                    color:isDark?"#000":"#fff",fontFamily:"IBM Plex Mono,monospace",
                    fontSize:FS.xs,fontWeight:700,letterSpacing:"0.12em",cursor:"pointer",
                    marginTop:2,opacity:loading||!email||!password?0.4:1,
                    transition:"opacity .15s"}}>
                  {loading?"...":(mode==="signin"?"SIGN IN →":"CREATE ACCOUNT →")}
                </button>
              </div>

              <div style={{textAlign:"center",marginTop:20,fontSize:"0.6rem",color:C.muted,lineHeight:1.6}}>
                By continuing you agree to our terms of service
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
