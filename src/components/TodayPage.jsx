import { FF, FS, getTM, SRC_COLORS } from "../constants/theme.js";
import { Briefing } from "./Briefing.jsx";

export function TodayPage({ C, isDark, onItemClick }) {
  const date = new Date().toLocaleDateString("en-US", {
    weekday:"long", month:"long", day:"numeric"
  });

  return (
    <div style={{
      flex:1,
      overflowY:"auto",
      background:C.bg,
      minWidth:0,
    }}>
      {/* Page header */}
      <div style={{
        padding:"20px 20px 16px",
        borderBottom:`1px solid ${C.border}`,
      }}>
        <div style={{
          fontSize:"0.62rem",
          fontFamily:FF.mono,
          color:C.muted,
          letterSpacing:"0.12em",
          marginBottom:6,
        }}>TODAY IN AI</div>
        <div style={{
          fontSize:"1.4rem",
          fontWeight:700,
          color:C.text,
          fontFamily:FF.sans,
          letterSpacing:"-0.03em",
          lineHeight:1.2,
        }}>{date}</div>
        <div style={{
          fontSize:FS.xs,
          color:C.muted,
          marginTop:6,
          fontFamily:FF.sans,
        }}>Top signals from across the AI landscape</div>
      </div>

      {/* Briefing items */}
      <Briefing C={C} isDark={isDark} onItemClick={onItemClick} fullPage={true}/>
    </div>
  );
}
