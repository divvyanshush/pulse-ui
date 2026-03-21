import { useState, useEffect } from "react";
import { FS, FF } from "../constants/theme.js";

export function OnboardingBanner({ C, isDark, onDismiss }) {
  const steps = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
      title: "Signal ranked",
      desc: "Every item is scored by source credibility, engagement velocity, and how relevant it is to builders — not clicks.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      title: "Daily brief",
      desc: "Every morning an AI summary of what actually happened overnight across models, research, tools and more.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      title: "Save anything",
      desc: "Bookmark items to read later. Sign in to sync across devices.",
    },
  ];

  return (
    <div style={{
      margin:"16px 16px 0",
      background:C.surface,
      border:`1px solid ${C.border}`,
      borderRadius:8,
      padding:"20px 20px 16px",
      position:"relative",
      flexShrink:0,
    }}>
      {/* Close */}
      <button onClick={onDismiss}
        style={{
          position:"absolute", top:12, right:12,
          background:"none", border:"none", cursor:"pointer",
          color:C.muted, padding:4, lineHeight:0,
        }}
        onMouseEnter={e=>e.currentTarget.style.color=C.text}
        onMouseLeave={e=>e.currentTarget.style.color=C.muted}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <div style={{
        fontSize:FS.xs, color:C.muted, fontFamily:FF.sans,
        letterSpacing:"0.08em", marginBottom:14, textTransform:"uppercase",
      }}>
        Welcome to Cobun AI
      </div>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(3, 1fr)",
        gap:16,
      }}>
        {steps.map((s, i) => (
          <div key={i} style={{display:"flex", flexDirection:"column", gap:8}}>
            <div style={{color:C.text}}>{s.icon}</div>
            <div style={{
              fontSize:FS.sm, fontWeight:600,
              color:C.text, fontFamily:FF.sans,
            }}>{s.title}</div>
            <div style={{
              fontSize:FS.xs, color:C.muted,
              fontFamily:FF.sans, lineHeight:1.6,
            }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <button onClick={onDismiss}
        style={{
          marginTop:16, padding:"8px 20px",
          background:C.accent, border:"none", borderRadius:4,
          color:isDark?"#141414":"#ffffff",
          fontSize:FS.sm, fontFamily:FF.sans, fontWeight:500,
          cursor:"pointer", transition:"opacity .1s",
        }}
        onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
        onMouseLeave={e=>e.currentTarget.style.opacity="1"}
      >
        Got it
      </button>
    </div>
  );
}
