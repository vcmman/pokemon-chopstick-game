import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile(new URL('../app/roundRules.ts', import.meta.url), 'utf8');
const {outputText} = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.ESNext}});
const {initialRound,roundReducer:reduce,GOALS}=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
const event=(type,now=1000)=>({type,now});
test('a round has three finite levels with rising goals and an explicit next button',()=>{
 let state=reduce(initialRound,event('start'));
 for(let level=0;level<3;level++){
  for(let n=0;n<GOALS[level];n++)state=reduce(state,event('catch'));
  assert.equal(state.status,level===2?'won':'cleared');
  const saved=state;
  assert.equal(reduce(state,event('catch')),saved);
  if(level<2){state=reduce(state,event('next',2000));assert.equal(state.level,level+1);assert.equal(state.caught,0);assert.equal(state.remaining,60);}
 }
 assert.equal(state.total,23);
 assert.equal(reduce(state,event('tick',999999)),state);
});
test('the deadline ends the game even when the tab was in the background',()=>{
 const active=reduce(initialRound,event('start'));
 assert.equal(reduce(active,event('tick',60001)).remaining,1);
 const end=reduce(active,event('catch',61000));
 assert.equal(end.status,'lost');assert.equal(end.total,0);
 assert.equal(reduce(end,event('catch',62000)),end);
 assert.equal(reduce(active,event('tick',999999)).status,'lost');
});
test('stop works during play and between levels, and retry resets session progress',()=>{
 let state=reduce(initialRound,event('start'));
 assert.equal(reduce(state,event('stop')).status,'stopped');
 for(let i=0;i<5;i++)state=reduce(state,event('catch'));
 assert.equal(reduce(state,event('stop')).status,'stopped');
 state=reduce(state,event('start',9000));
 assert.equal(state.total,0);assert.equal(state.level,0);assert.equal(state.deadline,69000);
});
test('difficulty switches immediately without resetting an active round or bypassing its deadline',()=>{
 let state=reduce(initialRound,event('start'));
 state=reduce(state,event('catch',2000));
 for(const difficulty of [2,0,1]){
  const changed=reduce(state,{type:'difficulty',difficulty,now:3000});
  assert.equal(changed.difficulty,difficulty);
  for(const field of ['deadline','caught','total','level','remaining','status'])assert.equal(changed[field],state[field]);
  state=changed;
 }
 for(const difficulty of [-1,3,1.5])assert.equal(reduce(state,{type:'difficulty',difficulty,now:3000}),state);
 assert.equal(reduce(state,{type:'difficulty',difficulty:2,now:state.deadline}).status,'lost');
});
test('difficulty can be selected before starting and still increases with progression',()=>{
 let state=reduce(initialRound,{type:'difficulty',difficulty:1,now:0});
 state=reduce(state,event('start'));
 assert.equal(state.difficulty,1);
 for(let n=0;n<5;n++)state=reduce(state,event('catch'));
 state=reduce(state,event('next'));
 assert.equal(state.difficulty,1);
 for(let n=0;n<8;n++)state=reduce(state,event('catch'));
 state=reduce(state,event('next'));
 assert.equal(state.difficulty,2);
});
for (const [level,minimum] of GOALS.entries()) {
 test(`level ${level+1} requires its own minimum of ${minimum} catches before it can pass`,()=>{
  let state=reduce(initialRound,event('start'));
  for(let previous=0;previous<level;previous++){
   for(let i=0;i<GOALS[previous];i++)state=reduce(state,event('catch'));
   state=reduce(state,event('next'));
  }
  assert.equal(state.level,level);
  assert.equal(state.caught,0,'previous levels must not count towards this minimum');
  for(let i=0;i<minimum-1;i++)state=reduce(state,event('catch'));
  assert.equal(state.status,'playing');
  assert.equal(reduce(state,event('next')).level,level,'cannot enter next level below the minimum');
  const failed=reduce(state,event('tick',state.deadline));
  assert.equal(failed.status,'lost');
  assert.equal(failed.caught,minimum-1);
  assert.equal(reduce(failed,event('next')),failed);
  const passed=reduce(state,event('catch',state.deadline-1));
  assert.equal(passed.caught,minimum);
  assert.equal(passed.status,level===2?'won':'cleared');
 });
}
