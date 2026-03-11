export const API = "https://pulse-backend-production-cd92.up.railway.app";

export const timeAgo = ts => {
  const s = Math.floor(Date.now()/1000 - ts);
  if(s<60)    return `${s}s`;
  if(s<3600)  return `${Math.floor(s/60)}m`;
  if(s<86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
};

export const FS = {
  xs:  "0.75rem",
  sm:  "0.85rem",
  base:"0.95rem",
  md:  "1.1rem",
  lg:  "1.3rem",
  xl:  "1.6rem",
};

// Font families
export const FF = {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'IBM Plex Mono', 'Fira Mono', monospace",
};

export const DARK = {
  text:"#ececec", sub:"#999999", muted:"#666666", faint:"#333333",
  bg:"#0f0f0f", surface:"#1a1a1a", hover:"#222222", border:"#2a2a2a",
  accent:"#00e5ff", accentDim:"rgba(0,229,255,0.1)", accentBorder:"rgba(0,229,255,0.25)",
  light:false,
};

export const LIGHT = {
  text:"#111128", sub:"#44445a", muted:"#888899", faint:"#ccccdd",
  bg:"#f4f4f8", surface:"#eeeef4", hover:"#e5e5ec", border:"#d0d0dc",
  accent:"#0066cc", accentDim:"rgba(0,102,204,0.08)", accentBorder:"rgba(0,102,204,0.25)",
  light:true,
};

export const TM_DARK = {
  model:    {label:"MODEL",    a:"rgba(255,255,255,.04)", b:"rgba(255,255,255,.1)", t:"#00e5ff"},
  research: {label:"RESEARCH", a:"rgba(255,255,255,.04)", b:"rgba(255,255,255,.1)", t:"#7eb8ff"},
  drama:    {label:"DRAMA",    a:"rgba(255,255,255,.04)", b:"rgba(255,255,255,.1)", t:"#ff6b82"},
  funding:  {label:"FUNDING",  a:"rgba(255,255,255,.04)", b:"rgba(255,255,255,.1)", t:"#e8c84a"},
  product:  {label:"PRODUCT",  a:"rgba(255,255,255,.04)", b:"rgba(255,255,255,.1)", t:"#a78bfa"},
  policy:   {label:"POLICY",   a:"rgba(255,255,255,.04)", b:"rgba(255,255,255,.1)", t:"#fb923c"},
};

export const TM_LIGHT = {
  model:    {label:"MODEL",    a:"rgba(0,0,0,.04)",  b:"rgba(0,0,0,.12)", t:"#0066cc"},
  research: {label:"RESEARCH", a:"rgba(0,0,0,.04)",  b:"rgba(0,0,0,.12)", t:"#1a56aa"},
  drama:    {label:"DRAMA",    a:"rgba(0,0,0,.04)",  b:"rgba(0,0,0,.12)", t:"#c0192e"},
  funding:  {label:"FUNDING",  a:"rgba(0,0,0,.04)",  b:"rgba(0,0,0,.12)", t:"#8a6400"},
  product:  {label:"PRODUCT",  a:"rgba(0,0,0,.04)",  b:"rgba(0,0,0,.12)", t:"#6d28d9"},
  policy:   {label:"POLICY",   a:"rgba(0,0,0,.04)",  b:"rgba(0,0,0,.12)", t:"#c2410c"},
};

export const getTM = (isDark) => isDark ? TM_DARK : TM_LIGHT;

export const SRC_COLORS = {
  HN:"#ff6314", arXiv:"#e05555", "Dev.to":"#5b6df8",
  GitHub:"#9b72e8", "Lobste.rs":"#d44040", OpenAI:"#19c37d",
  Anthropic:"#d4845a", HuggingFace:"#ffb020", VentureBeat:"#3d8fe0",
  TechCrunch:"#2ab858", TheVerge:"#e84040", Wired:"#aaaaaa", MITReview:"#cc3333",
  SimonW:"#1a8cff", Interconnects:"#e06030", AINnews:"#cc2244", Microsoft:"#0078d4",
  GoogleResearch:"#4285f4", MetaAI:"#0668E1", TDS:"#1a8c6b", MarkTechPost:"#7b2ff7",
  TechTalks:"#2d6a9f", TheSequence:"#e05c00", AIWeekly:"#0a8a5c",
  LastWeekInAI:"#c0392b", ImportAI:"#8e44ad",
};

export const FILTERS = ["all","model","research","drama","funding","product","policy","bookmarks"];
