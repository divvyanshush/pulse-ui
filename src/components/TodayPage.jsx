import { FF, FS } from "../constants/theme.js";
import { Briefing } from "./Briefing.jsx";

export function TodayPage({ C, isDark, onItemClick, isMobile }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const timeStr = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false});

  return (
    <div style={{flex:1,overflowY:"auto",background:C.bg,minWidth:0}}>

      {/* Header */}
      <div style={{
        padding:"20px 16px 18px",
        borderBottom:`1px solid ${C.border}`,
      }}>
        {/* Top line — label + time */}
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:12,
        }}>
          <span style={{
            fontSize:"0.65rem",color:C.accent,
            fontFamily:FF.mono,letterSpacing:"0.1em",
            fontWeight:600,
          }}>PULSE://TODAY</span>
          <span style={{
            fontSize:"0.65rem",color:C.muted,
            fontFamily:FF.mono,letterSpacing:"0.06em",
          }}>{timeStr}</span>
        </div>

        {/* Date */}
        <div style={{
          fontSize:isMobile?"1.1rem":"1.35rem",
          fontWeight:700,color:C.text,
          fontFamily:FF.sans,letterSpacing:"-0.03em",
          lineHeight:1.15,marginBottom:10,
        }}>{dateStr}</div>

        {/* Tagline */}
        <div style={{
          fontSize:"0.72rem",color:C.muted,
          fontFamily:FF.mono,lineHeight:1.55,
          borderLeft:`2px solid ${C.border}`,
          paddingLeft:10,
        }}>top signals for ai builders — updated hourly</div>
      </div>

      <Briefing C={C} isDark={isDark} onItemClick={onItemClick} fullPage={true}/>
    </div>
  );
}
