import { FF, FS } from "../constants/theme.js";
import { Briefing } from "./Briefing.jsx";

export function TodayPage({ C, isDark, onItemClick, isMobile }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});

  return (
    <div style={{flex:1,overflowY:"auto",background:C.bg,minWidth:0}}>

      {/* Header */}
      <div style={{
        padding:"16px 16px 14px",
        borderBottom:`1px solid ${C.border}`,
      }}>
        <div style={{
          fontSize:"0.72rem",fontWeight:600,color:C.text,
          fontFamily:FF.mono,letterSpacing:"0.04em",
        }}>{dateStr}</div>
      </div>

      <Briefing C={C} isDark={isDark} onItemClick={onItemClick} fullPage={true}/>
    </div>
  );
}
