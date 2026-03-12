export const API = "https://pulse-backend-production-cd92.up.railway.app";

export const timeAgo = ts => {
  const s = Math.floor(Date.now()/1000 - ts);
  if(s<60)    return `${s}s`;
  if(s<3600)  return `${Math.floor(s/60)}m`;
  if(s<86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
};

export const FS = {
  xs:  "0.72rem",
  sm:  "0.82rem",
  base:"0.92rem",
  md:  "1.05rem",
  lg:  "1.25rem",
  xl:  "1.5rem",
};

export const FF = {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'IBM Plex Mono', 'Fira Mono', monospace",
};

export const DARK = {
  text:"#e8e8e8", sub:"#888888", muted:"#555555", faint:"#2e2e2e",
  bg:"#0a0a0a", surface:"#111111", hover:"#161616", border:"#1e1e1e",
  accent:"#adfa1d", accentDim:"rgba(173,250,29,0.08)", accentBorder:"rgba(173,250,29,0.2)",
  light:false,
};

export const LIGHT = {
  text:"#0a0a0a", sub:"#444444", muted:"#888888", faint:"#e5e5e5",
  bg:"#ffffff", surface:"#fafafa", hover:"#f5f5f5", border:"#e8e8e8",
  accent:"#18181b", accentDim:"rgba(0,0,0,0.04)", accentBorder:"rgba(0,0,0,0.15)",
  light:true,
};

export const TM_DARK = {
  model:    {label:"MODELS",    a:"rgba(173,250,29,0.08)",  b:"rgba(173,250,29,0.15)",  t:"#adfa1d"},
  research: {label:"RESEARCH", a:"rgba(96,165,250,0.08)",  b:"rgba(96,165,250,0.15)",  t:"#60a5fa"},
  drama:    {label:"DRAMA",    a:"rgba(248,113,113,0.08)", b:"rgba(248,113,113,0.15)", t:"#f87171"},
  funding:  {label:"FUNDING",  a:"rgba(250,204,21,0.08)",  b:"rgba(250,204,21,0.15)",  t:"#facc15"},
  product:  {label:"TOOLS",     a:"rgba(167,139,250,0.08)", b:"rgba(167,139,250,0.15)", t:"#a78bfa"},
  policy:   {label:"POLICY",   a:"rgba(251,146,60,0.08)",  b:"rgba(251,146,60,0.15)",  t:"#fb923c"},
  repo:     {label:"REPO",     a:"rgba(155,114,232,0.08)",  b:"rgba(155,114,232,0.15)",  t:"#9b72e8"},
  discuss:  {label:"DISCUSS",  a:"rgba(100,116,139,0.08)",  b:"rgba(100,116,139,0.15)",  t:"#94a3b8"},
};

export const TM_LIGHT = {
  model:    {label:"MODELS",    a:"rgba(0,0,0,0.04)", b:"rgba(0,0,0,0.1)", t:"#166534"},
  research: {label:"RESEARCH", a:"rgba(0,0,0,0.04)", b:"rgba(0,0,0,0.1)", t:"#1e40af"},
  drama:    {label:"DRAMA",    a:"rgba(0,0,0,0.04)", b:"rgba(0,0,0,0.1)", t:"#991b1b"},
  funding:  {label:"FUNDING",  a:"rgba(0,0,0,0.04)", b:"rgba(0,0,0,0.1)", t:"#854d0e"},
  product:  {label:"TOOLS",     a:"rgba(0,0,0,0.04)", b:"rgba(0,0,0,0.1)", t:"#5b21b6"},
  policy:   {label:"POLICY",   a:"rgba(0,0,0,0.04)", b:"rgba(0,0,0,0.1)", t:"#9a3412"},
  repo:     {label:"REPO",     a:"rgba(0,0,0,0.04)", b:"rgba(0,0,0,0.1)", t:"#5b21b6"},
  discuss:  {label:"DISCUSS",  a:"rgba(0,0,0,0.04)", b:"rgba(0,0,0,0.1)", t:"#475569"},
};

export const getTM = (isDark) => isDark ? TM_DARK : TM_LIGHT;

export const SRC_COLORS = {
  HN:"#ff6314", arXiv:"#e05555", "Dev.to":"#5b6df8",
  GitHub:"#9b72e8", "Lobste.rs":"#d44040", OpenAI:"#19c37d",
  Anthropic:"#d4845a", HuggingFace:"#ffb020", VentureBeat:"#3d8fe0",
  TechCrunch:"#2ab858", TheVerge:"#e84040", Wired:"#aaaaaa", MITReview:"#cc3333",
  SimonW:"#1a8cff", Interconnects:"#e06030", AINnews:"#cc2244", Microsoft:"#0078d4",
  GoogleResearch:"#4285f4", MetaAI:"#0668E1", TDS:"#1a8c6b", MarkTechPost:"#7b2ff7",
};

export const FILTERS = ["all","model","research","tool","repo","discuss"];
