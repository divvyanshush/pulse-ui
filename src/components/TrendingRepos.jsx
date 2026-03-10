import { useState, useEffect } from "react";
import { FS, API } from "../constants/theme.js";

export function TrendingRepos({ C, isDark, onRepoClick, embedded=false }) {
  const [repos,   setRepos]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    fetch(`${API}/trending-repos`)
      .then(r=>r.json())
      .then(d=>{ setRepos(d.repos||[]); setLoading(false); })
      .catch(()=>setLoading(false));
  },[]);

  const fmt = n => n>=1000 ? (n/1000).toFixed(1)+"k" : n;

  // Convert repo to feed item format for Detail panel
  const toItem = repo => ({
    id: `github-${repo.id}`,
    src: "GitHub",
    srcLabel: "GitHub",
    type: "model",
    title: repo.name,
    sum: repo.description || "No description available.",
    link: repo.url,
    score: repo.stars,
    comments: repo.forks,
    tags: repo.topics,
    heat: 80,
    timeLabel: "trending",
    _repoMeta: {
      stars: repo.stars,
      forks: repo.forks,
      language: repo.language,
      topics: repo.topics,
    }
  });

  if(loading) return (
    <div style={{padding:"12px 0"}}>
      {[1,2,3].map(i=>(
        <div key={i} className="sk" style={{height:48,borderRadius:4,marginBottom:6}}/>
      ))}
    </div>
  );

  if(!repos.length) return null;

  return (
    <div style={{marginBottom:embedded?0:24}}>
      {!embedded&&<div style={{fontSize:FS.xs,color:C.muted,letterSpacing:"0.1em",
        marginBottom:10,fontWeight:600}}>
        TRENDING REPOS
      </div>}
      {repos.map(repo=>(
        <div key={repo.id} className="row"
          onClick={()=>onRepoClick(toItem(repo))}
          style={{padding:"10px",marginBottom:4,borderRadius:4,
            border:`1px solid ${C.border}`,cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:4}}>
            <span style={{fontSize:FS.xs,color:C.text,fontWeight:500,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>
              {repo.name.split("/")[1]}
            </span>
            <span style={{fontSize:FS.xs,color:C.sub,flexShrink:0,fontWeight:500}}>
              {fmt(repo.stars)} ★
            </span>
          </div>
          {repo.description&&(
            <div style={{fontSize:"0.65rem",color:C.muted,lineHeight:1.4,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {repo.description}
            </div>
          )}
          <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
            {repo.language&&(
              <span style={{fontSize:"0.58rem",padding:"1px 5px",borderRadius:2,
                background:isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)",
                color:C.sub,border:`1px solid ${C.border}`}}>
                {repo.language}
              </span>
            )}
            {repo.topics.map(t=>(
              <span key={t} style={{fontSize:"0.58rem",padding:"1px 5px",borderRadius:2,
                background:isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)",
                color:C.sub,border:`1px solid ${C.border}`}}>
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
