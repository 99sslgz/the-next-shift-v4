import {chapters,chapterById,sceneById,routeAfter,endingCatalog,endingTitle,policyNames} from './v4-game.mjs';
import {endingId} from './game.mjs';
import {initialWorld,enterChapter,evolve,changeReport,narrative} from './v4-world.mjs';
export const modes=['campaign','tim','priya','tom'];
export const freshRun=(mode='campaign')=>({id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,mode:modes.includes(mode)?mode:'campaign',events:[],revealed:false});
export const initialApp=()=>({version:4,run:null,archive:[],discoveries:[]});
const value=(x,w,a)=>typeof x==='function'?x(w,a):x;
export function validAnswer(s,a){
  if(s.type==='records')return Array.isArray(a)&&a.length>=s.min&&a.length<=s.max&&new Set(a).size===a.length&&a.every(id=>s.records.some(r=>r.id===id&&!r.locked));
  if(s.type==='allocation')return Boolean(a&&typeof a==='object'&&!Array.isArray(a)&&Object.keys(a).length===s.items.length&&s.items.every(i=>Number.isInteger(a[i.id])&&a[i.id]>=0&&a[i.id]<=3)&&Object.values(a).reduce((x,y)=>x+y,0)<=3);
  return typeof a==='string'&&s.choices.some(c=>c.id===a&&!c.locked);
}
export function applyAnswer(s,a,w){
  s=sceneById(s.id,w);
  if(!validAnswer(s,a))throw new Error('This response is not available in the current world.');
  const selected=s.type?s.apply(a,w):s.choices.find(c=>c.id===a);
  const patch=value(selected.patch,w,a)??{};
  let after=evolve(w,{...w,...patch},s,a,selected);
  if(selected.policy==='violation'){
    after.everViolation=true;
    if(s.chapter==='priya')after.everMisuse=true;else after.everMonitoring=true;
  }
  const route=routeAfter(s,after,a,value(s.next,after,a));
  const label=s.type==='records'?a.map(id=>s.records.find(r=>r.id===id).label).join(' + '):s.type==='allocation'?s.items.map(i=>`${i.label} ${a[i.id]}`).join(' / '):selected.label;
  return {world:after,result:{id:s.id,chapter:s.chapter,question:s.title,answer:structuredClone(a),label,event:value(selected.event,after,a),policy:selected.policy,why:selected.why,tradeoff:selected.tradeoff??'',changes:changeReport(w,after,s.chapter),reaction:{...after.people[s.chapter]},ripples:after.lastRipple,nextReason:route.reason},next:route.next};
}
export function simulate(run,{truncate=false}={}){
  if(!run||!modes.includes(run.mode))throw new Error('Unknown game mode.');
  const order=run.mode==='campaign'?chapters.map(c=>c.id):[run.mode];
  let ci=0,node=chapterById(order[0]).first,w=enterChapter(initialWorld(),order[0]),arrival='The shift begins with the conditions already on the floor.',log=[],validEvents=[],chapterEndings=[];
  for(const [eventIndex,e] of (Array.isArray(run.events)?run.events:[]).slice(0,150).entries()){
    try{
      if(!node){
        if(run.mode!=='campaign'||ci===order.length-1||e.id!==`next:${order[ci+1]}`||e.answer!==null)throw new Error('Invalid chapter transition.');
        chapterEndings.push({chapter:order[ci],id:endingId(order[ci],w)});
        ci++;w=enterChapter(w,order[ci]);arrival=w.teamTrust<=1?'Earlier shifts have made workers cautious about supplying an account.':'The earlier shifts leave their access rules and relationships in place.';node=chapterById(order[ci]).first;validEvents.push({id:e.id,answer:null});continue;
      }
      const s=sceneById(node,w);
      if(e.id!==node)throw new Error('This response belongs to a different scene.');
      const step=applyAnswer(s,e.answer,w);w=step.world;node=step.next;arrival=step.result.nextReason;log.push({...step.result,eventIndex});validEvents.push({id:e.id,answer:structuredClone(e.answer)});
    }catch(error){if(!truncate)throw error;break;}
  }
  const chapter=order[ci];
  return {world:w,chapter,scene:node?{...sceneById(node,w),cause:arrival}:null,stage:node?'play':run.mode==='campaign'&&ci<order.length-1?'chapterEnd':'ending',log,validEvents,chapterEndings,chapterEnding:node?null:endingId(chapter,w),ending:node?null:endingId(run.mode==='campaign'&&ci===order.length-1?'campaign':chapter,w)};
}
export function commit(run,answer){const ev=simulate(run);if(ev.stage!=='play'||run.revealed)throw new Error('Continue to the next scene first.');applyAnswer(ev.scene,answer,ev.world);return {...run,events:[...run.events,{id:ev.scene.id,answer:structuredClone(answer)}],revealed:true};}
export function continueRun(run){if(!run.revealed)throw new Error('No scene result to continue.');return {...run,revealed:false};}
export function advanceChapter(run){const ev=simulate(run);if(ev.stage!=='chapterEnd'||run.revealed)throw new Error('Finish the current chapter first.');const next=chapters[chapters.findIndex(c=>c.id===ev.chapter)+1];return {...run,events:[...run.events,{id:`next:${next.id}`,answer:null}],revealed:false};}
export function rewind(run,eventIndex){const ev=simulate(run);if(!ev.log.some(e=>e.eventIndex===eventIndex))throw new Error('Choose a recorded decision.');return {...run,events:run.events.slice(0,eventIndex),revealed:false};}
function restoreRun(r){
  if(!r||!modes.includes(r.mode)||!Array.isArray(r.events))return null;
  const fixed={id:typeof r.id==='string'?r.id.slice(0,80):freshRun(r.mode).id,mode:r.mode,events:r.events.slice(0,150),revealed:Boolean(r.revealed)};
  const ev=simulate(fixed,{truncate:true});fixed.events=ev.validEvents;
  if(!ev.log.length||fixed.events.length!==r.events.length||fixed.events.at(-1)?.id.startsWith('next:'))fixed.revealed=false;
  return fixed;
}
export function restoreApp(raw){try{const data=typeof raw==='string'?JSON.parse(raw):raw;if(data?.version!==4)return initialApp();const known=Object.values(endingCatalog).flat().map(e=>e[0]);return {version:4,run:restoreRun(data.run),archive:(Array.isArray(data.archive)?data.archive:[]).slice(-12).map(restoreRun).filter(r=>r&&simulate(r).stage==='ending'),discoveries:[...new Set((Array.isArray(data.discoveries)?data.discoveries:[]).filter(id=>known.includes(id)))]};}catch{return initialApp();}}
export function endingStory(run){const ev=simulate(run);return {id:ev.ending,title:endingTitle(ev.ending),paragraphs:narrative(run.mode==='campaign'&&ev.stage==='ending'?'campaign':ev.chapter,ev.world)};}
export function exportJournal(run){const ev=simulate(run);const story=ev.stage!=='play'?endingStory(run):null;return ['THE NEXT SHIFT / V4',`${run.mode==='campaign'?'Connected campaign':chapterById(run.mode).person+' scenario'} / ${ev.log.length} committed decisions`,'All events and consequences are authored fiction. This is not a physical robot simulation or a real-world outcome estimate.',...(story?[`\nENDING / ${story.title}`,...story.paragraphs]:[]),'\nDECISION JOURNAL',...ev.log.map((e,i)=>`\n${i+1}. ${chapterById(e.chapter).person} / ${e.question}\nChoice: ${e.label}\nWorld event: ${e.event}\n${policyNames[e.policy]}\nWorld changes: ${e.changes.map(c=>c.label+' / '+c.before+' → '+c.after).join('; ')}\nWorker reaction: ${e.reaction.quote}\nReason: ${e.why}${e.tradeoff?'\nTradeoff: '+e.tradeoff:''}`)].join('\n\n');}
