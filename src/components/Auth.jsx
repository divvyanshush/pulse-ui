import { useState } from "react";
import { FS, FF } from "../constants/theme.js";
import { supabase } from "../lib/supabase.js";

export function Auth({ onAuth, C, isDark }) {
  const [mode,      setMode]      = useState("signin");
  const [resetSent, setResetSent] = useState(false);
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [error,     setError]     = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);

  const handle = async () => {
    if(!email||!password) return;
    setLoading(true); setError(null);
    const err = await onAuth(mode, email, password);
    if(err) setError(err.message);
    else if(mode==="signup") setSuccess(true);
    setLoading(false);
  };

  const handleReset = async () => {
    if(!email) return;
    setLoading(true); setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/app"
    });
    if(error) setError(error.message);
    else setResetSent(true);
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/app" }
    });
  };

  const inp = {
    padding:"12px 14px",
    background:C.bg,
    border:"1px solid "+C.border,
    borderRadius:4,
    color:C.text,
    fontFamily:FF.sans,
    fontSize:FS.base,
    outline:"none",
    width:"100%",
    boxSizing:"border-box",
    transition:"border-color .15s",
  };

  return (
    <div style={{
      minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center",
      background:C.bg, padding:"24px", position:"fixed", inset:0, overflowY:"auto",
    }}>
      <div style={{width:"100%", maxWidth:400}}>

        {/* Logo */}
        <div style={{marginBottom:36, textAlign:"center"}}>
          <svg width="103" height="19" viewBox="0 0 103 19" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginBottom:16}}>
            <path d="M8.42445 18.1435C3.31245 18.1435 0.000453144 14.5915 0.000453144 9.09547C0.000453144 3.64747 3.43245 0.023468 8.56845 0.023468C12.7205 0.023468 15.8165 2.44747 16.4165 6.21547H13.1765C12.5765 4.17547 10.8245 2.97547 8.49645 2.97547C5.25645 2.97547 3.21645 5.32747 3.21645 9.07147C3.21645 12.7915 5.28045 15.1915 8.49645 15.1915C10.8725 15.1915 12.6965 13.9435 13.2725 11.9995H16.4645C15.7925 15.6955 12.5765 18.1435 8.42445 18.1435ZM18.0914 11.9035C18.0914 8.20747 20.7554 5.66347 24.4274 5.66347C28.0994 5.66347 30.7634 8.20747 30.7634 11.9035C30.7634 15.5995 28.0994 18.1435 24.4274 18.1435C20.7554 18.1435 18.0914 15.5995 18.0914 11.9035ZM21.0194 11.9035C21.0194 14.0635 22.4114 15.5275 24.4274 15.5275C26.4434 15.5275 27.8354 14.0635 27.8354 11.9035C27.8354 9.74347 26.4434 8.27947 24.4274 8.27947C22.4114 8.27947 21.0194 9.74347 21.0194 11.9035ZM35.7963 17.8555H33.0843V-0.000531673H36.0123V7.72747C36.7803 6.40747 38.3643 5.61547 40.1643 5.61547C43.5483 5.61547 45.6123 8.25547 45.6123 11.9995C45.6123 15.6475 43.3803 18.1675 39.9723 18.1675C38.1963 18.1675 36.6843 17.3755 35.9883 16.0075L35.7963 17.8555ZM36.0363 11.8795C36.0363 14.0155 37.3563 15.4795 39.3723 15.4795C41.4363 15.4795 42.6603 13.9915 42.6603 11.8795C42.6603 9.76747 41.4363 8.25547 39.3723 8.25547C37.3563 8.25547 36.0363 9.74347 36.0363 11.8795ZM55.7024 5.99947H58.6304V17.8555H55.9184L55.7024 16.2715C54.9824 17.3995 53.4464 18.1675 51.8624 18.1675C49.1264 18.1675 47.5184 16.3195 47.5184 13.4155V5.99947H50.4464V12.3835C50.4464 14.6395 51.3344 15.5515 52.9664 15.5515C54.8144 15.5515 55.7024 14.4715 55.7024 12.2155V5.99947ZM64.5826 17.8555H61.6546V5.99947H64.3666L64.6066 7.53547C65.3506 6.33547 66.7906 5.63947 68.3986 5.63947C71.3746 5.63947 72.9106 7.48747 72.9106 10.5595V17.8555H69.9826V11.2555C69.9826 9.26347 68.9986 8.30347 67.4866 8.30347C65.6866 8.30347 64.5826 9.55147 64.5826 11.4715V17.8555ZM84.2001 17.8555H81.0081L87.3441 0.311469H90.4881L96.8241 17.8555H93.5841L92.1681 13.7995H85.6161L84.2001 17.8555ZM88.5201 5.54347L86.5281 11.2075H91.2801L89.2641 5.54347C89.1201 5.08747 88.9521 4.55947 88.9041 4.19947C88.8321 4.53547 88.6881 5.06347 88.5201 5.54347ZM102.096 0.311469V17.8555H99.0241V0.311469H102.096Z" fill={C.text}/>
          </svg>
          <div style={{fontSize:FS.sm, color:C.muted, fontFamily:FF.sans}}>
            AI intelligence for developers
          </div>
        </div>

        {success ? (
          <div style={{
            padding:"32px 28px", border:"1px solid "+C.border,
            borderRadius:8, background:C.surface, textAlign:"center"
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke={C.text} strokeWidth="1.5" strokeLinecap="round" style={{marginBottom:16}}>
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <polyline points="2,4 12,13 22,4"/>
            </svg>
            <div style={{fontSize:FS.md, color:C.text, marginBottom:8, fontWeight:600, fontFamily:FF.sans}}>
              Check your email
            </div>
            <div style={{fontSize:FS.sm, color:C.muted, lineHeight:1.7, fontFamily:FF.sans}}>
              We sent a confirmation link to<br/>
              <span style={{color:C.text, fontWeight:500}}>{email}</span>
            </div>
          </div>
        ) : (
          <div style={{
            padding:"32px 28px", border:"1px solid "+C.border,
            borderRadius:8, background:C.surface,
          }}>
            {/* Mode toggle */}
            <div style={{
              display:"flex", gap:0, marginBottom:24,
              background:C.bg, borderRadius:6, padding:3,
              border:"1px solid "+C.border
            }}>
              {[["signin","Sign in"],["signup","Sign up"]].map(([m,label])=>(
                <button key={m} onClick={()=>{setMode(m);setError(null);}}
                  style={{
                    flex:1, padding:"9px", border:"none", cursor:"pointer",
                    fontFamily:FF.sans, fontSize:FS.sm, borderRadius:4,
                    background:mode===m?C.surface:"transparent",
                    color:mode===m?C.text:C.muted,
                    boxShadow:mode===m?"0 1px 4px rgba(0,0,0,0.15)":"none",
                    transition:"all .15s", fontWeight:mode===m?500:400,
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Google */}
            <button onClick={handleGoogle}
              style={{
                width:"100%", padding:"12px", marginBottom:16,
                background:C.bg, border:"1px solid "+C.border, borderRadius:6,
                color:C.text, fontFamily:FF.sans, fontSize:FS.sm,
                cursor:"pointer", display:"flex", alignItems:"center",
                justifyContent:"center", gap:10, transition:"border-color .15s",
                fontWeight:400,
              }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.sub}
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
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{flex:1,height:1,background:C.border}}/>
              <span style={{fontSize:FS.xs,color:C.muted,fontFamily:FF.sans}}>or</span>
              <div style={{flex:1,height:1,background:C.border}}/>
            </div>

            {/* Inputs */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <input value={email} onChange={e=>setEmail(e.target.value)}
                type="email" placeholder="Email address"
                autoComplete="email" style={inp}
                onFocus={e=>e.target.style.borderColor=C.text}
                onBlur={e=>e.target.style.borderColor=C.border}/>

              <input value={password} onChange={e=>setPassword(e.target.value)}
                type="password" placeholder="Password"
                autoComplete={mode==="signin"?"current-password":"new-password"}
                onKeyDown={e=>e.key==="Enter"&&handle()}
                style={inp}
                onFocus={e=>e.target.style.borderColor=C.text}
                onBlur={e=>e.target.style.borderColor=C.border}/>

              {mode==="signin" && (
                <div style={{textAlign:"right"}}>
                  {resetSent
                    ? <span style={{fontSize:FS.xs,color:C.muted,fontFamily:FF.sans}}>Reset link sent</span>
                    : <button onClick={handleReset} disabled={!email||loading}
                        style={{
                          fontSize:FS.xs,color:C.muted,background:"none",border:"none",
                          cursor:"pointer",fontFamily:FF.sans,padding:0,
                          opacity:!email?0.4:1,transition:"color .1s",
                        }}
                        onMouseEnter={e=>e.currentTarget.style.color=C.text}
                        onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
                        Forgot password?
                      </button>
                  }
                </div>
              )}

              {error && (
                <div style={{
                  fontSize:FS.sm, color:"#f87171", padding:"10px 14px",
                  background:"rgba(248,113,113,0.06)", border:"1px solid rgba(248,113,113,0.15)",
                  borderRadius:4, lineHeight:1.5, fontFamily:FF.sans,
                }}>
                  {error}
                </div>
              )}

              <button onClick={handle} disabled={loading||!email||!password}
                style={{
                  padding:"13px", background:C.accent, border:"none", borderRadius:6,
                  color:isDark?"#141414":"#ffffff", fontFamily:FF.sans,
                  fontSize:FS.sm, fontWeight:600, cursor:"pointer", marginTop:4,
                  opacity:loading||!email||!password?0.4:1,
                  transition:"opacity .15s",
                }}>
                {loading ? "..." : (mode==="signin" ? "Sign in" : "Create account")}
              </button>
            </div>

            <div style={{
              textAlign:"center", marginTop:20, fontSize:FS.xs,
              color:C.muted, lineHeight:1.7, fontFamily:FF.sans,
            }}>
              By continuing you agree to our{" "}
              <a href="/terms.html" target="_blank"
                style={{color:C.sub, textDecoration:"underline"}}>Terms</a>
              {" "}and{" "}
              <a href="/privacy.html" target="_blank"
                style={{color:C.sub, textDecoration:"underline"}}>Privacy Policy</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
