"use client";
import { useEffect, useReducer, useState } from "react";
import SingleGame from "./SingleGame";
import DoubleGame from "./DoubleGame";
import { GOALS, initialRound, roundReducer } from "./roundRules";
export default function Home(){
 const [mode,setMode]=useState("single");
 const [round,dispatch]=useReducer(roundReducer,initialRound);
 const playing=round.status==="playing";
 useEffect(()=>{
   if(!playing)return;
   const tick=()=>dispatch({type:"tick",now:Date.now()});
   const timer=setInterval(tick,250);
   document.addEventListener("visibilitychange",tick);
   return()=>{clearInterval(timer);document.removeEventListener("visibilitychange",tick);};
 },[playing]);
 const canPlay=()=>round.status==="playing"&&Date.now()<round.deadline;
 const onCatch=()=>dispatch({type:"catch",now:Date.now()});
 return <>
  <nav className="mode-picker" aria-label="选择游戏版本"><button disabled={playing} aria-pressed={mode==="single"} onClick={()=>setMode("single")}>🍲 单人冒泡锅 · 原版</button><button disabled={playing} aria-pressed={mode==="double"} onClick={()=>setMode("double")}>🥢🥢 双人传送带 · 新版</button></nav>
  <section className={`round-panel ${playing?"in-play":""}`} aria-label="关卡挑战">
   {playing ? <><div className="round-stats"><b>🚩 第 {round.level+1} / 3 关 · {["轻松","挑战","高手"][round.level]}</b><strong className={round.remaining<=10?"time-low":""}>⏱️ {round.remaining} 秒</strong><b>🎯 本关 {round.caught} / {GOALS[round.level]} 只</b></div><progress aria-label="本关进度" max={GOALS[round.level]} value={round.caught}/><p>{mode==="double"?"两个人合力完成目标！左边按 F，右边按 J。":"等伙伴来到中间，按空格夹！"} 本关限时一分钟。</p><button className="end-round" onClick={()=>dispatch({type:"stop",now:Date.now()})}>结束这一局</button></>:
   <div className="round-result" role="status"><h1>{round.status==="ready"?"🏁 三关小挑战":round.status==="cleared"?`🌟 第 ${round.level+1} 关通过！`:round.status==="won"?"🏆 三关全部通过！":round.status==="lost"?"⏰ 时间到，这一局结束啦！":"🌙 这一局结束啦！"}</h1>
   <p>{round.status==="ready"?"每关一分钟，依次夹到 5 只、8 只、10 只。速度越来越快，夹取要越来越准！":`这局一共夹到 ${round.total} 只；${round.status==="cleared"?`下一关目标 ${GOALS[round.level+1]} 只。`:"收藏已经保存，可以休息一下了。"}`}</p>
   <p className="round-note">单人、双人都能闯关 · 最多三分钟游戏时间 · 结束后不会自动开新局</p>
   {round.status==="cleared"?<button className="round-start" onClick={()=>dispatch({type:"next",now:Date.now()})}>准备好了，进入第 {round.level+2} 关</button>:<button className="round-start" onClick={()=>dispatch({type:"start",now:Date.now()})}>{round.status==="ready"?"开始第一关":"重新挑战第一关"}</button>}
   {round.status==="cleared"&&<button className="end-round" onClick={()=>{dispatch({type:"stop",now:Date.now()});}}>先休息，不继续了</button>}
   </div>}
  </section>
  <div hidden={!playing}>{mode==="single"?<SingleGame active={playing} difficulty={round.level} canPlay={canPlay} onCatch={onCatch}/>:<DoubleGame active={playing} difficulty={round.level} canPlay={canPlay} onCatch={onCatch}/>}</div>
 </>;
}
