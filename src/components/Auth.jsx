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
    padding:"12px 14px", background:C.bg, border:"1px solid "+C.border,
    borderRadius:4, color:C.text, fontFamily:"IBM Plex Mono,monospace",
    fontSize:FS.base, outline:"none", width:"100%", boxSizing:"border-box",
    WebkitAppearance:"none",
  };

  return (
    <div style={{
      minHeight:"100vh",
      display:"flex", alignItems:"center", justifyContent:"center",
      background:C.bg, fontFamily:"IBM Plex Mono,monospace",
      padding:"16px", overflowY:"auto", position:"fixed", inset:0,
    }}>
      <div style={{width:"100%", maxWidth:400}}>

        {/* Logo */}
        <div style={{textAlign:"center", marginBottom:32}}>
          <div style={{fontSize:"1.8rem", fontWeight:700, color:C.text, letterSpacing:"0.2em", marginBottom:6}}>
            PULSE
          </div>
          <div style={{fontSize:FS.xs, color:C.muted, letterSpacing:"0.12em"}}>
            AI NEWS · REAL TIME
          </div>
          <div style={{width:32, height:2, background:C.accent, margin:"12px auto 0", borderRadius:1}}/>
        </div>

        {success ? (
          <div style={{textAlign:"center", padding:"32px 24px",
            border:"1px solid "+C.border, borderRadius:8, background:C.surface}}>
            <div style={{fontSize:"2rem", marginBottom:16}}>✉️</div>
            <div style={{fontSize:FS.sm, color:C.text, marginBottom:8, letterSpacing:"0.08em"}}>
              CHECK YOUR EMAIL
            </div>
            <div style={{fontSize:FS.xs, color:C.muted, lineHeight:1.7}}>
              Confirmation link sent to<br/>
              <span style={{color:C.sub}}>{email}</span>
            </div>
          </div>
        ) : (
          <div style={{border:"1px solid "+C.border, borderRadius:8,
            background:C.surface, overflow:"hidden"}}>

            {/* Tabs */}
            <div style={{display:"flex", borderBottom:"1px solid "+C.border}}>
              {[["signin","SIGN IN"],["signup","SIGN UP"]].map(([m,label])=>(
                <button key={m} onClick={()=>{setMode(m);setError(null);}}
                  style={{flex:1, padding:"14px 8px", border:"none", cursor:"pointer",
                    fontFamily:"IBM Plex Mono,monospace", fontSize:FS.xs, letterSpacing:"0.1em",
                    background:mode===m?C.bg:"transparent",
                    color:mode===m?C.text:C.muted,
                    borderBottom:mode===m?"2px solid "+C.accent:"2px solid transparent",
                    transition:"all .15s"}}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{padding:"20px 20px 24px"}}>

              {/* Google */}
              <button onClick={handleGoogle}
                style={{width:"100%", padding:"12px", marginBottom:16,
                  background:C.bg, border:"1px solid "+C.border, borderRadius:4,
                  color:C.sub, fontFamily:"IBM Plex Mono,monospace", fontSize:FS.sm,
                  letterSpacing:"0.08em", cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                  transition:"border-color .15s"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{flexShrink:0}}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                CONTINUE WITH GOOGLE
              </button>

              {/* Divider */}
              <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:16}}>
                <div style={{flex:1, height:1, background:C.border}}/>
                <span style={{fontSize:FS.xs, color:C.muted}}>OR</span>
                <div style={{flex:1, height:1, background:C.border}}/>
              </div>

              {/* Email/Password */}
              <div style={{display:"flex", flexDirection:"column", gap:10}}>
                <input value={email} onChange={e=>setEmail(e.target.value)}
                  type="email" placeholder="email address"
                  autoComplete="email" style={inp}/>
                <input value={password} onChange={e=>setPassword(e.target.value)}
                  type="password" placeholder="password"
                  autoComplete={mode==="signin"?"current-password":"new-password"}
                  onKeyDown={e=>e.key==="Enter"&&handle()} style={inp}/>

                {error && (
                  <div style={{fontSize:FS.xs, color:"#ff4d6d", padding:"10px 12px",
                    background:"rgba(255,77,109,.08)", border:"1px solid rgba(255,77,109,.2)",
                    borderRadius:4, lineHeight:1.5}}>
                    {error}
                  </div>
                )}

                <button onClick={handle} disabled={loading||!email||!password}
                  style={{padding:"13px", background:C.accent, border:"none", borderRadius:4,
                    color:isDark?"#000":"#fff", fontFamily:"IBM Plex Mono,monospace",
                    fontSize:FS.sm, fontWeight:600, letterSpacing:"0.1em", cursor:"pointer",
                    marginTop:4, opacity:loading||!email||!password?0.5:1,
                    transition:"opacity .15s"}}>
                  {loading?"...":(mode==="signin"?"SIGN IN":"CREATE ACCOUNT")}
                </button>
              </div>

            </div>
          </div>
        )}

        <div style={{textAlign:"center", marginTop:20, fontSize:FS.xs, color:C.muted}}>
          By continuing you agree to our terms of service
        </div>

      </div>
    </div>
  );
}
