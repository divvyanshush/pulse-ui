import { FS } from "../constants/theme.js";

export function SkeletonRow({C}) {
  return(
    <div style={{padding:"18px 16px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
        <div className="sk" style={{width:56,height:18,borderRadius:3}}/>
        <div className="sk" style={{width:"58%",height:14,borderRadius:3}}/>
      </div>
      <div className="sk" style={{width:"90%",height:12,borderRadius:3,marginBottom:7}}/>
      <div className="sk" style={{width:"68%",height:12,borderRadius:3,marginBottom:14}}/>
      <div style={{display:"flex",gap:12}}>
        <div className="sk" style={{width:40,height:11,borderRadius:3}}/>
        <div className="sk" style={{width:28,height:11,borderRadius:3}}/>
      </div>
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
