"use client";
import { useEffect, useReducer, useState } from "react";
import SingleGame from "./SingleGame";
import DoubleGame from "./DoubleGame";
import { GOALS, initialRound, roundReducer } from "./roundRules";
export default function Home(){
 const [mode,setMode]=useState("single");
 const [round,dispatch]=useReducer(roundReducer,initialRound);
 const playing=round.status==="playing";
 const minimum=GOALS[round.level];
 const stillNeeded=Math.max(0,minimum-round.caught);
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
   <div className="difficulty" role="group" aria-label="选择难度">{["轻松","挑战","高手"].map((label,index)=><button key={label} type="button" aria-pressed={round.difficulty===index} onClick={()=>dispatch({type:"difficulty",difficulty:index,now:Date.now()})}>{label}</button>)}</div>
   <p className="difficulty-help">难度可随时切换，不影响本关计时和目标。</p>
   {playing ? <><div className="round-stats"><b>🚩 第 {round.level+1} / 3 关 · {["轻松","挑战","高手"][round.difficulty]}</b><strong className={round.remaining<=10?"time-low":""}>⏱️ {round.remaining} 秒</strong><b>🎯 已夹 {round.caught} 只 · 最低 {minimum} 只</b></div><progress aria-label="本关进度" max={GOALS[round.level]} value={round.caught}/><p className="minimum-rule">本关至少夹到 <strong>{minimum} 只</strong> 才能通关，还差 <strong>{stillNeeded} 只</strong>。数量按本关重新计算，时间到未达标则失败。</p><p>{mode==="double"?"两个人合力完成目标！左边按 F，右边按 J。":"等伙伴来到中间，按空格夹！"} 本关限时一分钟。</p><button className="end-round" onClick={()=>dispatch({type:"stop",now:Date.now()})}>结束这一局</button></>:
   <div className="round-result" role="status"><h1>{round.status==="ready"?"🏁 三关小挑战":round.status==="cleared"?`🌟 第 ${round.level+1} 关通过！`:round.status==="won"?"🏆 三关全部通过！":round.status==="lost"?`⏰ 第 ${round.level+1} 关未通过`:"🌙 这一局结束啦！"}</h1>
   <p>{round.status==="ready"?"每关限时一分钟，夹到最低数量才算通关。进入下一关后，本关数量重新从零计算。":round.status==="lost"?`本关夹到 ${round.caught} 只，最低需要 ${minimum} 只，还差 ${stillNeeded} 只。这局共夹到 ${round.total} 只，收藏已保存。`:round.status==="cleared"?`本关夹到 ${round.caught} 只，已达到最低 ${minimum} 只！下一关至少夹到 ${GOALS[round.level+1]} 只。`:`这局一共夹到 ${round.total} 只，收藏已经保存，可以休息一下了。`}</p>
   <div className="level-goals" aria-label="每关最低通关数量">{GOALS.map((goal,index)=><span key={goal}>第 {index+1} 关：至少 <b>{goal} 只</b></span>)}</div>
   <p className="round-note">单人、双人都能闯关 · 最多三分钟游戏时间 · 结束后不会自动开新局</p>
   {round.status==="cleared"?<button className="round-start" onClick={()=>dispatch({type:"next",now:Date.now()})}>准备好了，进入第 {round.level+2} 关</button>:<button className="round-start" onClick={()=>dispatch({type:"start",now:Date.now()})}>{round.status==="ready"?"开始第一关":"重新挑战第一关"}</button>}
   {round.status==="cleared"&&<button className="end-round" onClick={()=>{dispatch({type:"stop",now:Date.now()});}}>先休息，不继续了</button>}
   </div>}
  </section>
  <div hidden={!playing}>{mode==="single"?<SingleGame active={playing} difficulty={round.difficulty} canPlay={canPlay} onCatch={onCatch}/>:<DoubleGame active={playing} difficulty={round.difficulty} canPlay={canPlay} onCatch={onCatch}/>}</div>
 </>;
}
