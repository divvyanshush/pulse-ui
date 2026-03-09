import { useState, useRef, useCallback } from "react";

export function useNotifs() {
  const [toast,         setToast]         = useState(null);
  const [alertLog,      setAlertLog]      = useState([]);
  const [notifPerm,     setNotifPerm]     = useState(typeof Notification!=="undefined" ? Notification.permission : "default");
  const toastTimer = useRef(null);

  const playChime = useCallback((type="new") => {
    try {
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      const freqs = type==="hot" ? [523,659] : [659,784];
      freqs.forEach((freq,i) => {
        const osc=ctx.createOscillator(), gain=ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type="sine"; osc.frequency.value=freq;
        const t=ctx.currentTime+i*0.12;
        gain.gain.setValueAtTime(0,t);
        gain.gain.linearRampToValueAtTime(0.08,t+0.01);
        gain.gain.exponentialRampToValueAtTime(0.001,t+0.32);
        osc.start(t); osc.stop(t+0.32);
      });
    } catch(e){}
  },[]);

  const showToast = useCallback((title,body,type="new",item=null)=>{
    if(toastTimer.current) clearTimeout(toastTimer.current);
    setToast({title,body,type,item});
    setAlertLog(p=>[{title,body,type,ts:Date.now(),item},...p].slice(0,20));
    playChime(type);
    toastTimer.current=setTimeout(()=>setToast(null),5000);
  },[playChime]);

  const pushNotif = useCallback((title,body)=>{
    if(typeof Notification==="undefined"||Notification.permission!=="granted") return;
    try{ new Notification(title,{body,icon:"/favicon.ico"}); }catch(e){}
  },[]);

  const requestNotifPermission = useCallback(async()=>{
    if(typeof Notification==="undefined") return;
    const perm=await Notification.requestPermission();
    setNotifPerm(perm);
  },[]);

  return { toast, setToast, alertLog, setAlertLog, notifPerm, showToast, pushNotif, requestNotifPermission };
}
