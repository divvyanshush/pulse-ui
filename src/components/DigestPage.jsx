import { useState, useEffect } from "react";
import { API, FF, FS, getTM } from "../constants/theme.js";
import { Row } from "./Row.jsx";

function DigestSection({ cat, C, isDark, onItemClick, onBookmark, bookmarks, readIds, detail }) {
  const [open, setOpen] = useState(false);
  const TML = getTM(isDark);
  const m = TML[cat.id] || TML.product;

  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>

      {/* Section header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: "16px 16px 14px",
          cursor: "pointer",
          transition: "background .08s",
          userSelect: "none",
        }}
        onMouseEnter={e => e.currentTarget.style.background = C.hover}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        {/* Top row — label + count + toggle */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: cat.summary ? 10 : 0,
        }}>
          <span style={{
            fontSize: "0.62rem", fontWeight: 600,
            color: m.t, letterSpacing: "0.1em",
            fontFamily: FF.mono,
          }}>{cat.label.toUpperCase()}</span>
          <span style={{
            fontSize: "0.65rem", color: C.muted,
            fontFamily: FF.mono,
          }}>{cat.count} items</span>
          <span style={{
            marginLeft: "auto",
            fontSize: "0.65rem", color: C.muted,
            fontFamily: FF.mono,
          }}>{open ? "↑ collapse" : "↓ expand"}</span>
        </div>

        {/* AI digest summary */}
        {cat.summary && (
          <div style={{
            fontSize: "0.82rem",
            color: C.text,
            lineHeight: 1.6,
            fontFamily: FF.sans,
            fontWeight: 400,
            borderLeft: `2px solid ${m.t}`,
            paddingLeft: 10,
            opacity: 0.9,
          }}>{cat.summary}</div>
        )}

        {/* Top 3 titles preview when collapsed */}
        {!open && cat.items.slice(0, 3).map((item, i) => (
          <div key={item.id} style={{
            fontSize: "0.72rem", color: C.muted,
            fontFamily: FF.mono, marginTop: i === 0 ? 10 : 4,
            overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            <span style={{ color: C.faint, marginRight: 6 }}>—</span>
            {item.title}
          </div>
        ))}
      </div>

      {/* Expanded items */}
      {open && (
        <div>
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
        </div>
      )}
    </div>
  );
}

export function DigestPage({ C, isDark, onItemClick, onBookmark, bookmarks, readIds, detail, isMobile }) {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/digest`)
      .then(r => r.json())
      .then(d => { setDigest(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg, overflow: "hidden", minWidth: 0 }}>

      {/* Header */}
      <div style={{ padding: "16px 16px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: "0.65rem", color: C.muted, fontFamily: FF.mono, letterSpacing: "0.1em", marginBottom: 4 }}>
          // digest
        </div>
        <div style={{ fontSize: "0.75rem", color: C.muted, fontFamily: FF.mono }}>
          what's happening across ai today — by category
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading && (
          <div style={{
            "--sk-base": isDark ? "#1a1a1a" : "#efefef",
            "--sk-highlight": isDark ? "#252525" : "#e0e0e0",
          }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} style={{ padding: "16px 16px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div className="sk" style={{ width: 60, height: 8 }} />
                  <div className="sk" style={{ width: 40, height: 8 }} />
                </div>
                <div className="sk" style={{ width: "90%", height: 11, marginBottom: 6 }} />
                <div className="sk" style={{ width: "70%", height: 11, marginBottom: 6 }} />
                <div className="sk" style={{ width: "50%", height: 11 }} />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ padding: "32px 16px", color: C.muted, fontSize: "0.75rem", fontFamily: FF.mono }}>
            failed to load digest — {error}
          </div>
        )}

        {!loading && digest?.categories?.map(cat => (
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
