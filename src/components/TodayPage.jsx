import { FF, FS } from "../constants/theme.js";
import { Briefing } from "./Briefing.jsx";

export function TodayPage({ C, isDark, onItemClick, isMobile, onMenu }) {
  const date = new Date().toLocaleDateString("en-US",{
    weekday:"long", month:"long", day:"numeric"
  });

  return (
    <div style={{
      flex:1, overflowY:"auto",
      background:C.bg, minWidth:0,
    }}>
      {/* Hero header */}
      <div style={{
        padding: isMobile?"20px 20px 24px":"32px 32px 28px",
        borderBottom:`1px solid ${C.border}`,
      }}>
        {isMobile && (
          <button onClick={onMenu} style={{
            background:"none",border:"none",padding:0,marginBottom:16,
            cursor:"pointer",color:C.muted,display:"flex",alignItems:"center",
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14"/>
            </svg>
          </button>
        )}

        <div style={{
          fontSize:"0.65rem", fontFamily:FF.mono,
          color:C.muted, letterSpacing:"0.12em",
          marginBottom:10, textTransform:"uppercase",
        }}>Today in AI</div>

        <div style={{
          fontSize: isMobile?FS.lg:FS.xl,
          fontWeight:700, color:C.text,
          fontFamily:FF.sans, letterSpacing:"-0.03em",
          lineHeight:1.15, marginBottom:10,
        }}>{date}</div>

        <div style={{
          fontSize:FS.sm, color:C.muted,
          fontFamily:FF.sans, lineHeight:1.6,
          maxWidth:480,
        }}>
          The most important AI signals from the last 24 hours — curated and ranked.
        </div>
      </div>

      {/* Briefing list */}
      <Briefing C={C} isDark={isDark} onItemClick={onItemClick} fullPage={true}/>
    </div>
  );
}
