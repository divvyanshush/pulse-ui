export const API = "https://pulse-backend-production-cd92.up.railway.app";

export const timeAgo = ts => {
  const s = Math.floor(Date.now()/1000 - ts);
  if(s<60)    return `${s}s`;
  if(s<3600)  return `${Math.floor(s/60)}m`;
  if(s<86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
};

export const FS = {
  xs:  "0.65rem",
  sm:  "0.75rem",
  base:"0.85rem",
  md:  "0.95rem",
  lg:  "1.05rem",
  xl:  "1.2rem",
};

export const DARK = {
  text:"#d8d8f0", sub:"#8888aa", muted:"#555570", faint:"#333350",
  bg:"#050507", surface:"#09090f", hover:"#0d0d16", border:"#111128", light:false,
};

export const LIGHT = {
  text:"#1a1a2e", sub:"#44445a", muted:"#888899", faint:"#ccccdd",
  bg:"#f5f5f0", surface:"#ededea", hover:"#e5e5e0", border:"#d8d8d0", light:true,
};

export const TM_DARK = {
  model:    {label:"MODEL",    a:"rgba(0,255,136,.12)",  b:"rgba(0,255,136,.3)",  t:"#00ff88"},
  research: {label:"RESEARCH", a:"rgba(77,166,255,.12)", b:"rgba(77,166,255,.3)", t:"#4da6ff"},
  drama:    {label:"DRAMA",    a:"rgba(255,77,109,.12)", b:"rgba(255,77,109,.3)", t:"#ff4d6d"},
  funding:  {label:"FUNDING",  a:"rgba(255,215,0,.12)",  b:"rgba(255,215,0,.3)",  t:"#ffd700"},
  product:  {label:"PRODUCT",  a:"rgba(199,125,255,.12)",b:"rgba(199,125,255,.3)",t:"#c77dff"},
  policy:   {label:"POLICY",   a:"rgba(255,159,67,.12)", b:"rgba(255,159,67,.3)", t:"#ff9f43"},
};

export const TM_LIGHT = {
  model:    {label:"MODEL",    a:"rgba(0,130,65,.1)",    b:"rgba(0,130,65,.3)",   t:"#006e34"},
  research: {label:"RESEARCH", a:"rgba(20,90,190,.1)",   b:"rgba(20,90,190,.3)",  t:"#1450aa"},
  drama:    {label:"DRAMA",    a:"rgba(190,20,55,.1)",   b:"rgba(190,20,55,.3)",  t:"#be1437"},
  funding:  {label:"FUNDING",  a:"rgba(140,100,0,.1)",   b:"rgba(140,100,0,.3)",  t:"#7a5800"},
  product:  {label:"PRODUCT",  a:"rgba(110,40,190,.1)",  b:"rgba(110,40,190,.3)", t:"#5e20b8"},
  policy:   {label:"POLICY",   a:"rgba(185,85,0,.1)",    b:"rgba(185,85,0,.3)",   t:"#a04800"},
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
