import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chapters,chapterPlans,scenes,sceneById,endingId,endingCatalog} from '../dist/v4-game.mjs';
import {initialWorld,enterChapter} from '../dist/v4-world.mjs';
import {freshRun,beginChapter,simulate,commit,continueRun,advanceChapter,rewind,restoreApp,validAnswer,applyAnswer,endingStory,exportJournal} from '../dist/v4-engine.mjs';
import {createServer} from '../server.mjs';

const good={
  't-board':'workflow','t-break':'cover','t-help':'shared','t-reid':'broader','t-close':'carry',
  'p-records':['robot','signal','account'],'p-question':'specific','p-access':'redacted','p-share':['status','finding'],'p-close':'bounded',
  'm-appeal':'pause','m-records':['account','context','basis'],'m-retain':'seal','m-notice':'boundary','m-remedy':'remedy'
};
function fallback(s){
  if(!s.type)return good[s.id];
  const a=good[s.id].filter(id=>s.records.some(r=>r.id===id&&!r.locked));
  for(const r of s.records)if(a.length<s.min&&!r.locked&&!a.includes(r.id))a.push(r.id);
  return a;
}
function route(mode,overrides={},stop){
  let r=freshRun(mode);
  for(let i=0;i<24;i++){
    const e=simulate(r);if(stop?.(e))return r;
    if(e.stage==='ending')return r;
    if(e.stage==='intro'){r=beginChapter(r);continue;}
    if(e.stage==='chapterEnd'){r=advanceChapter(r);continue;}
    r=continueRun(commit(r,Object.hasOwn(overrides,e.scene.id)?overrides[e.scene.id]:fallback(e.scene)));
  }
  throw new Error('Route did not finish.');
}
const fixtures={
  't-glass':['tim',{'t-close':'reopen'}], 't-shadow':['tim',{'t-reid':'code'}],
  't-stranded':['tim',{'t-break':'later'}], 't-rhythm':['tim',{}],
  'p-drift':['priya',{'p-close':'performance'}],
  'p-silence':['priya',{'p-records':['account','shift'],'p-question':'collect','p-access':'full'}],
  'p-paper':['priya',{'p-close':'paper'}], 'p-signal':['priya',{}],
  'm-last':['tom',{'m-remedy':'apology'}], 'm-file':['tom',{'m-notice':'consent'}],
  'm-empty':['tom',{'m-retain':'delete'}], 'm-hearing':['tom',{}],
  'w-glass':['campaign',{'t-close':'reopen'}], 'w-signal':['campaign',{'p-close':'paper'}],
  'w-visible':['campaign',{'t-reid':'code'}], 'w-paper':['campaign',{'m-notice':'vague'}],
  'w-stranded':['campaign',{'t-break':'later'}], 'w-late':['campaign',{'t-board':'public','t-close':'repair'}],
  'w-unfinished':['campaign',{'m-remedy':'apology'}], 'w-next':['campaign',{}]
};

test('all 20 ending families remain reachable with five decisions per chapter',()=>{
  assert.deepEqual(Object.keys(fixtures).sort(),Object.values(endingCatalog).flat().map(e=>e[0]).sort());
  for(const [id,args] of Object.entries(fixtures)){
    const r=route(...args),e=simulate(r);
    assert.equal(e.ending,id,id);assert.equal(e.log.length,r.mode==='campaign'?15:5,id);
    assert.ok(endingStory(r).paragraphs.every(p=>p.length>80));
    for(const c of r.mode==='campaign'?chapters:[chapters.find(c=>c.id===r.mode)]){
      assert.deepEqual(e.log.filter(x=>x.chapter===c.id).map(x=>x.id),chapterPlans[c.id]);
    }
  }
});

function alternatives(s){
  if(!s.type)return s.choices.filter(c=>!c.locked).map(c=>c.id);
  const ids=s.records.filter(r=>!r.locked).map(r=>r.id),out=[];
  for(let bits=1;bits<2**ids.length;bits++){
    const a=ids.filter((_,i)=>bits&(1<<i));if(a.length>=s.min&&a.length<=s.max)out.push(a);
  }
  return out;
}
test('every legal standalone route ends after exactly five decisions without a dead end',()=>{
  assert.equal(scenes.length,15);
  for(const c of chapters){
    const found=new Set();let paths=0;
    function walk(id,w,depth){
      if(id===null){assert.equal(depth,5);found.add(endingId(c.id,w));paths++;return;}
      assert.ok(depth<5);assert.equal(id,chapterPlans[c.id][depth]);
      const s=sceneById(id,w),answers=alternatives(s);assert.ok(answers.length);
      for(const a of answers){const step=applyAnswer(s,a,w);assert.equal(typeof step.result.policy,'string');assert.equal(typeof step.result.event,'string');walk(step.next,step.world,depth+1);}
    }
    walk(c.first,enterChapter(initialWorld(),c.id),0);
    assert.ok(paths>=200,`${c.id}: ${paths} paths`);
    assert.deepEqual([...found].sort(),endingCatalog[c.id].map(e=>e[0]).sort());
  }
});

test('each introduction precedes decisions, persists on reload, and does not advance the world',()=>{
  let r=freshRun('campaign');
  for(const [index,c] of chapters.entries()){
    const e=simulate(r);assert.equal(e.stage,'intro');assert.equal(e.chapter,c.id);assert.equal(e.log.length,index*5);
    assert.equal(e.world.beat,index*5);assert.equal(e.scene,null);
    assert.throws(()=>commit(r,'anything'));
    const restored=restoreApp({version:5,run:r});assert.equal(simulate(restored.run).stage,'intro');
    assert.ok(c.opening.paragraphs.length>=3);assert.match(c.opening.paragraphs.at(-1),/five decisions/i);
    r=beginChapter(r);assert.throws(()=>beginChapter(r));assert.equal(simulate(r).world.beat,index*5);
    for(let i=0;i<5;i++){const before=simulate(r);r=continueRun(commit(r,fallback(before.scene)));}
    assert.equal(simulate(r).stage,index===2?'ending':'chapterEnd');
    if(index<2)r=advanceChapter(r);
  }
  assert.equal(r.events.filter(e=>e.id.startsWith('intro:')).length,3);
  assert.equal(simulate(r).log.length,15);
});

test('a denied break changes the next prompt and later witness availability within the same budget',()=>{
  const denied=simulate(route('campaign',{'t-board':'public','t-break':'later'},e=>e.scene?.id==='t-help'));
  const covered=simulate(route('campaign',{},e=>e.scene?.id==='t-help'));
  assert.equal(denied.world.people.tim.mood,'angry');assert.notEqual(denied.scene.prompt(denied.world),covered.scene.prompt(covered.world));
  assert.ok(denied.world.pending.some(p=>p.key==='break-word'));
  const later=route('campaign',{'t-board':'public','t-break':'later','t-help':'own','t-close':'reopen'},e=>e.scene?.id==='p-records');
  const e=simulate(later);assert.ok(e.world.fired.includes('break-word'));assert.equal(e.log.length,5);
  assert.equal(e.scene.records.find(r=>r.id==='account').locked,true);
  assert.throws(()=>commit(later,['robot','account']));
  const open=simulate(route('campaign',{},e=>e.scene?.id==='p-records'));
  assert.equal(open.scene.records.find(r=>r.id==='account').locked,false);
});

test('incident access is reviewed and unavailable evidence cannot appear in a later update',()=>{
  const noLink=route('priya',{},e=>e.scene?.id==='p-share'),n=simulate(noLink);
  assert.equal(n.scene.records.find(r=>r.id==='identity').locked,true);
  assert.equal(n.scene.records.find(r=>r.id==='pace').locked,true);
  assert.throws(()=>commit(noLink,['identity']));
  const accepted=simulate(route('priya',{'p-access':'request'},e=>e.scene?.id==='p-share'));
  assert.equal(accepted.world.pAuthorized,true);assert.equal(accepted.world.pRejected,false);
  const rejected=simulate(route('priya',{'p-question':'collect','p-access':'request'},e=>e.scene?.id==='p-share'));
  assert.equal(rejected.world.pAuthorized,false);assert.equal(rejected.world.pRejected,true);
  assert.equal(rejected.scene.records.find(r=>r.id==='identity').locked,true);
  const leaked=simulate(route('priya',{'p-access':'request','p-share':['status','identity']},e=>e.scene?.id==='p-close'));
  assert.equal(leaked.world.pPurposeBreach,true);assert.equal(leaked.world.people.priya.mood,'shutout');
  assert.equal(leaked.log.at(-1).policy,'violation');
});

test('late repairs preserve prior misuse and incomplete safety work is not narrated as validated',()=>{
  const late=simulate(route('campaign',{'t-board':'public','t-close':'repair'}));assert.equal(late.world.everViolation,true);assert.equal(late.ending,'w-late');
  const repaired=simulate(route('priya',{'p-access':'full'}));assert.equal(repaired.world.pBroad,false);assert.equal(repaired.world.everMisuse,true);
  const paper=route('priya',{'p-close':'paper'});assert.equal(simulate(paper).world.pValidated,false);
  assert.match(endingStory(paper).paragraphs.join(' '),/empty validation line/);
  const carry=simulate(route('tim',{'t-board':'private'}));assert.equal(carry.log.at(-1).policy,'violation');
});

test('a meaningful return requires authority, context, fair review and preserved evidence',()=>{
  const done=route('tom'),d=simulate(done);assert.equal(d.world.mReturn,true);assert.equal(d.world.people.tom.mood,'relieved');
  for(const overrides of [{'m-appeal':'explain'},{'m-records':['account','basis']},{'m-retain':'delete'},{'m-retain':'continue'},{'m-notice':'vague'}]){
    const r=route('tom',overrides),e=simulate(r);assert.equal(e.world.mReturn,false);assert.equal(e.world.mRemedyScheduled,true);
    assert.doesNotMatch(endingStory(r).paragraphs.join(' '),/On his first morning back/);
  }
  assert.equal(simulate(route('tom',{'m-retain':'seal'})).world.mLost,false);
  assert.equal(simulate(route('tom',{'m-retain':'delete'})).world.mLost,true);
});

test('rewind removes future chapters, recalculates ripples, and restores at the actual decision',()=>{
  const original=route('campaign',{'t-break':'later'}),e=simulate(original);
  const target=e.log.find(x=>x.id==='t-break').eventIndex,r=rewind(original,target),at=simulate(r);
  assert.equal(at.chapter,'tim');assert.equal(at.scene.id,'t-break');assert.equal(at.log.length,1);
  assert.equal(at.world.tDeniedEver,undefined);assert.ok(!at.world.pending.some(p=>p.key==='break-word'));
  assert.equal(r.events.some(x=>x.id==='intro:priya'),false);
  const changed=continueRun(commit(r,'cover'));assert.equal(simulate(changed).world.tBreak,true);
  assert.equal(simulate(original).ending,'w-stranded');
});

test('saved progress validates the new graph and keeps introductions out of journals and endings',()=>{
  const r=route('campaign'),saved=restoreApp(JSON.stringify({version:5,run:r,archive:[r],discoveries:['w-next','unknown']}));
  assert.equal(simulate(saved.run).ending,'w-next');assert.equal(saved.archive.length,1);assert.deepEqual(saved.discoveries,['w-next']);
  assert.equal(restoreApp({version:4,run:r}).run,null);
  const bad=structuredClone(r);bad.events[2]={id:'t-break',answer:'invalid'};
  const fixed=restoreApp({version:5,run:bad});assert.equal(fixed.run.events.length,2);assert.equal(fixed.run.revealed,false);
  assert.equal(simulate(fixed.run).scene.id,'t-break');
  const intro=exportJournal(freshRun('priya'));assert.match(intro,/0 committed decisions/);assert.doesNotMatch(intro,/ENDING \//);
  const journal=exportJournal(r);assert.match(journal,/15 committed decisions/);assert.doesNotMatch(journal,/intro:|undefined|\[object Object\]/);
});

test('rendered campaign presents all three openings, 15 decisions and their feedback',async()=>{
  // A small DOM adapter exercises the real rendering and event handlers without
  // pretending to verify layout, CSS, or browser appearance.
  const handlers={},nodes={},saved=new Map();let checked=[];
  const node=id=>nodes[id]??=(id==='#app'?{
    innerHTML:'',addEventListener:(type,fn)=>{handlers[type]=fn;},
    querySelectorAll:selector=>selector==='input[name="record"]:checked'?checked.map(value=>({value})):[]
  }:{innerHTML:'',textContent:'',disabled:false,focus(){},addEventListener(){},showModal(){},close(){}});
  const old={document:globalThis.document,window:globalThis.window,localStorage:globalThis.localStorage};
  globalThis.document={querySelector:node};globalThis.window={scrollTo(){}};
  globalThis.localStorage={getItem:key=>saved.get(key),setItem:(key,value)=>saved.set(key,value)};
  const action=(name,data={})=>handlers.click({target:{closest:()=>({dataset:{action:name,...data}})}});
  try{
    await import('../dist/v4-app.mjs?render-test');
    assert.match(node('#app').innerHTML,/15 decisions in a campaign/);
    action('new',{mode:'campaign'});
    for(const [index,c] of chapters.entries()){
      const opening=node('#app').innerHTML;assert.match(opening,/class="chapter-opening"/);
      assert.ok(opening.includes(c.opening.heading));assert.doesNotMatch(opening,/id="decision-form"/);
      action('begin-chapter');
      for(let i=0;i<5;i++){
        assert.match(node('#app').innerHTML,new RegExp(`DECISION ${i+1} OF 5`));
        const run=JSON.parse(saved.get('team12-next-shift-five-v1')).run,s=simulate(run).scene,a=fallback(s);
        if(s.type){checked=a;handlers.change({target:{name:'record'}});}
        else handlers.change({target:{name:'response',value:a}});
        assert.equal(node('#commit-button').disabled,false);
        handlers.submit({target:{id:'decision-form'},preventDefault(){}});
        assert.match(node('#app').innerHTML,/YOUR CHOICE HAS LANDED/);
        action('continue');
      }
      assert.match(node('#app').innerHTML,/class="ending-story vignette-story"/);
      if(index<2)action('next-chapter');
    }
    const final=JSON.parse(saved.get('team12-next-shift-five-v1'));
    assert.equal(simulate(final.run).log.length,15);assert.equal(final.archive.length,1);
    assert.ok(!saved.has('team12-next-shift-v4'));
    assert.doesNotMatch(node('#app').innerHTML,/undefined|\[object Object\]/);
  }finally{for(const [key,value] of Object.entries(old))if(value===undefined)delete globalThis[key];else globalThis[key]=value;}
});

test('portable server and Pages entry serve every reachable local asset',async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    const base=`http://127.0.0.1:${server.address().port}`;
    const queue=['/'],seen=new Set();
    while(queue.length){
      const item=queue.shift();if(seen.has(item))continue;seen.add(item);
      const response=await fetch(base+item);assert.equal(response.status,200,item);const body=await response.text();
      const refs=item==='/'?[...body.matchAll(/(?:src|href)="(\.\/[^"#?]+)"/g)].map(x=>x[1]):item.endsWith('.mjs')?[...body.matchAll(/from ['"](\.\/[^'"]+)['"]/g)].map(x=>x[1]):[];
      for(const ref of refs)queue.push(new URL(ref,base+(item==='/'?'/index.html':item)).pathname);
    }
    assert.ok(seen.has('/five-game.mjs'));assert.ok(seen.has('/v4-engine.mjs'));
    assert.equal((await fetch(base+'/../package.json')).status,404);
    const entry=(await readFile(new URL('../index.html',import.meta.url),'utf8')).replaceAll('\r\n','\n');assert.match(entry,/\.\/dist\/v4-app\.mjs/);
    const html=(await readFile(new URL('../dist/index.html',import.meta.url),'utf8')).replaceAll('\r\n','\n');assert.equal(entry,html.replaceAll('href="./','href="./dist/').replaceAll('src="./','src="./dist/'));
  }finally{await new Promise(resolve=>server.close(resolve));}
});
