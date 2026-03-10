import { FS } from "../constants/theme.js";

export function SavedSearches({ C, isDark, savedSearches, onSearch, onDelete, onSave, currentQuery }) {
  const hasMatch = savedSearches.some(s => s.query.toLowerCase() === currentQuery.toLowerCase());

  return (
    <div style={{marginBottom:24}}>
      <div style={{fontSize:FS.xs,color:C.muted,letterSpacing:"0.1em",marginBottom:10,fontWeight:600}}>
        SAVED SEARCHES
      </div>

      {/* Save current search */}
      {currentQuery.trim() && !hasMatch && (
        <button onClick={()=>onSave(currentQuery)}
          style={{width:"100%",padding:"8px 10px",marginBottom:8,
            background:"rgba(0,255,136,0.06)",border:"1px dashed rgba(0,255,136,0.3)",
            borderRadius:4,color:C.accent,fontFamily:"IBM Plex Mono,monospace",
            fontSize:FS.xs,cursor:"pointer",letterSpacing:"0.08em",textAlign:"left"}}>
          + SAVE "{currentQuery}"
        </button>
      )}

      {savedSearches.length === 0 && !currentQuery.trim() && (
        <div style={{fontSize:FS.xs,color:C.muted,lineHeight:1.6,padding:"8px 0"}}>
          Search for something and save it to get alerts when new articles match.
        </div>
      )}

      {savedSearches.map(s=>(
        <div key={s.id}
          style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,
            padding:"8px 10px",borderRadius:4,border:`1px solid ${C.border}`,
            background:C.bg,cursor:"pointer"}}
          onClick={()=>onSearch(s.query)}>
          <span style={{fontSize:FS.xs,color:C.sub,flex:1,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            🔍 {s.query}
          </span>
          <button onClick={e=>{e.stopPropagation();onDelete(s.id);}}
            style={{background:"none",border:"none",color:C.muted,cursor:"pointer",
              fontSize:"0.7rem",padding:"0 2px",lineHeight:1,flexShrink:0}}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
