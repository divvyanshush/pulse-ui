import { FF, FS } from "../constants/theme.js";
import { Briefing } from "./Briefing.jsx";

export function TodayPage({ C, isDark, onItemClick, isMobile }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});

  return (
    <div style={{flex:1,overflowY:"auto",background:C.bg,minWidth:0}}>

      {/* Header */}
      <div style={{
        padding:"20px 16px 16px",
        borderBottom:`1px solid ${C.border}`,
      }}>
        <div style={{
          fontSize:"0.65rem",color:C.muted,
          fontFamily:FF.mono,letterSpacing:"0.1em",
          marginBottom:6,
        }}>// today in ai</div>
        <div style={{
          fontSize:isMobile?FS.md:FS.lg,
          fontWeight:600,color:C.text,
          fontFamily:FF.sans,letterSpacing:"-0.02em",
          lineHeight:1.2,marginBottom:6,
        }}>{dateStr}</div>
        <div style={{
          fontSize:"0.75rem",color:C.muted,
          fontFamily:FF.mono,lineHeight:1.5,
        }}>top signals for builders — curated daily</div>
      </div>

      <Briefing C={C} isDark={isDark} onItemClick={onItemClick} fullPage={true}/>
    </div>
  );
}
