import { useState, useEffect } from "react";
import { API, FF, FS, getTM } from "../constants/theme.js";
import { Row } from "./Row.jsx";

function DigestSection({ cat, C, isDark, onItemClick, onBookmark, bookmarks, readIds, detail }) {
  const [open, setOpen] = useState(false);
  const TML = getTM(isDark);
  const m = TML[cat.id] || TML.product;

  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>

      {/* Header — always visible */}
      <div style={{ padding: "18px 16px 16px" }}>

        {/* Label row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
        }}>
          <span style={{
            fontSize: FS.xs, fontWeight: 700,
            color: m.t, letterSpacing: "0.12em",
            fontFamily: FF.mono,
          }}>{cat.label.toUpperCase()}</span>
          <span style={{
            fontSize: FS.xs, color: C.faint,
            fontFamily: FF.mono,
          }}>· {cat.count}</span>
        </div>

        {/* AI summary */}
        {cat.summary && (
          <div style={{
            fontSize: FS.sm,
            color: C.text,
            lineHeight: 1.65,
            fontFamily: FF.sans,
            borderLeft: `2px solid ${m.t}`,
            paddingLeft: 10,
            marginBottom: 12,
            opacity: 0.88,
          }}>{cat.summary}</div>
        )}

        {/* Preview titles — collapsed */}
        {!open && (
          <div style={{ marginBottom: 10 }}>
            {cat.items.slice(0, 3).map((item, i) => (
              <div key={item.id}
                onClick={(e) => { e.stopPropagation(); onItemClick(item); }}
                style={{
                  fontSize: FS.sm, color: C.muted,
                  fontFamily: FF.mono,
                  marginTop: i === 0 ? 0 : 5,
                  overflow: "hidden", textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  padding: "2px 0",
                }}
                onMouseEnter={e => e.currentTarget.style.color = C.text}
                onMouseLeave={e => e.currentTarget.style.color = C.muted}
              >
                <span style={{ color: C.faint, marginRight: 8, fontFamily: FF.mono }}>›</span>
                {item.title}
              </div>
            ))}
            {cat.count > 3 && (
              <div style={{
                fontSize: FS.xs, color: C.faint,
                fontFamily: FF.mono, marginTop: 6,
              }}>+{cat.count - 3} more</div>
            )}
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            background: "none",
            border: `1px solid ${C.border}`,
            padding: "3px 10px",
            cursor: "pointer",
            color: C.muted,
            fontSize: FS.xs,
            fontFamily: FF.mono,
            letterSpacing: "0.06em",
            borderRadius: 2,
            transition: "all .1s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.sub; e.currentTarget.style.color = C.text; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
        >
          {open ? "↑ collapse" : `↓ show all ${cat.count}`}
        </button>
      </div>

      {/* Expanded items — visually separated */}
      {open && (
        <div style={{
          borderTop: `1px solid ${C.border}`,
          background: isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
        }}>
          {cat.items.map((item, i) => (
            <Row
              key={item.id} item={item} i={i}
              C={C} isDark={isDark}
              onClick={() => onItemClick(item)}
              isBookmarked={!!bookmarks[item.id]}
              onBookmark={onBookmark}
              selected={detail?.id === item.id}
              isRead={readIds.has(item.id)}
            />
          ))}
          {/* Collapse button at bottom */}
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}` }}>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none", border: `1px solid ${C.border}`,
                padding: "3px 10px", cursor: "pointer",
                color: C.muted, fontSize: FS.xs,
                fontFamily: FF.mono, letterSpacing: "0.06em",
                borderRadius: 2, transition: "all .1s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.sub; e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
            >↑ collapse</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BriefPage({ C, isDark, onItemClick, onBookmark, bookmarks, readIds, detail }) {
  const [digest,  setDigest]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetch(`${API}/digest`)
      .then(r => r.json())
      .then(d => { setDigest(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.bg, overflow:"hidden", minWidth:0 }}>

      {/* Header */}
      <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:FS.xs, color:C.muted, fontFamily:FF.mono, letterSpacing:"0.1em" }}>// brief</span>
        <span style={{ fontSize:FS.xs, color:C.faint, fontFamily:FF.mono }}>
          {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}).toUpperCase()}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto" }}>
        {loading && (
          <div style={{"--sk-base":isDark?"#1a1a1a":"#efefef","--sk-highlight":isDark?"#252525":"#e0e0e0"}}>
            {[1,2,3,4].map(n=>(
              <div key={n} style={{padding:"18px 16px",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <div className="sk" style={{width:80,height:8}}/>
                  <div className="sk" style={{width:30,height:8}}/>
                </div>
                <div className="sk" style={{width:"92%",height:10,marginBottom:6}}/>
                <div className="sk" style={{width:"75%",height:10,marginBottom:6}}/>
                <div className="sk" style={{width:"55%",height:10,marginBottom:14}}/>
                <div className="sk" style={{width:80,height:22,borderRadius:2}}/>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{padding:"32px 16px",color:C.muted,fontSize:FS.xs,fontFamily:FF.mono}}>
            failed to load — {error}
          </div>
        )}

        {!loading && !error && digest?.categories?.map(cat => (
          <DigestSection
            key={cat.id} cat={cat}
            C={C} isDark={isDark}
            onItemClick={onItemClick}
            onBookmark={onBookmark}
            bookmarks={bookmarks}
            readIds={readIds}
            detail={detail}
          />
        ))}
      </div>
    </div>
  );
}
