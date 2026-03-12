import { FS } from "../constants/theme.js";

export function SkeletonRow({C, isDark}) {
  const bg = isDark ? "#1a1a1a" : "#efefef";
  const hi = isDark ? "#252525" : "#e0e0e0";
  return(
    <div style={{
      padding:"12px 16px",borderBottom:`1px solid ${C.border}`,
      display:"flex",flexDirection:"column",gap:6,
      "--sk-base":bg,"--sk-highlight":hi,
    }}>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <div className="sk" style={{width:42,height:7}}/>
        <div className="sk" style={{width:58,height:7}}/>
        <div className="sk" style={{width:26,height:7}}/>
      </div>
      <div className="sk" style={{width:"72%",height:14}}/>
      <div className="sk" style={{width:"88%",height:9}}/>
      <div className="sk" style={{width:"55%",height:9}}/>
    </div>
  );
}

export function BmSvg({filled, size=13}) {
  return(
    <svg width={size} height={size*15/13} viewBox="0 0 13 15"
      fill={filled?"currentColor":"none"} stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{display:"block",flexShrink:0,transition:"fill .1s,stroke .1s"}}>
      <path d="M1 1h11v13l-5.5-3.5L1 14V1z"/>
    </svg>
  );
}

export function DL({children, C}) {
  return(
    <div style={{fontSize:FS.xs,letterSpacing:"0.12em",color:C.muted,textTransform:"uppercase",
      margin:"20px 0 10px",paddingTop:16,borderTop:`1px solid ${C.border}`,
      display:"flex",alignItems:"center",gap:6}}>
      {children}
    </div>
  );
}

export function SB({label, children, C}) {
  return(
    <div style={{padding:"14px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{fontSize:FS.xs,letterSpacing:"0.14em",color:C.muted,
        textTransform:"uppercase",marginBottom:12,fontWeight:500}}>{label}</div>
      {children}
    </div>
  );
}
