import {chapters as originalChapters,policyNames,endingCatalog as originalEndings} from './game.mjs';
export {policyNames};
export const decisionsPerChapter=5;
export const chapterPlans={
  tim:['t-board','t-break','t-help','t-reid','t-close'],
  priya:['p-records','p-question','p-access','p-share','p-close'],
  tom:['m-appeal','m-records','m-retain','m-notice','m-remedy']
};
const openings={
  tim:{heading:'The number above his station',quote:'“If I stop to help, my own number drops.”',paragraphs:[
    'The morning shift begins with the rattle of totes and a screen waking above the picking floor. Tim signs into the robot system. His name joins a live ranking that decides weekly bonuses and warnings.',
    'A new picker calls for help. Tim knows the answer, but helping means fewer picks under his own name. His water bottle is still unopened, and his shoulders ache from yesterday’s shift.',
    'You take over as shift manager. Orders need to move. Over five decisions, you will decide what the warehouse watches, what it rewards, and whether Tim can step away without paying for it later.'
  ]},
  priya:{heading:'The tote was not clear',quote:'“I was still unloading when it moved.”',paragraphs:[
    'Priya is lifting the last item from a tote when the robot starts to move. She hits the emergency stop. No injury is reported, but the handoff is kept out of service while the event is examined.',
    'The log shows a “handoff complete” signal arriving too early. Her manager asks for every location and handoff from her shift. A question about a moving robot could become a conversation about her pace.',
    'You now lead the inquiry. Across five decisions, choose what evidence is needed, who may see it, and what a useful safety answer should leave behind.'
  ]},
  tom:{heading:'The report on the other side of the desk',quote:'“Nobody told me this was being kept.”',paragraphs:[
    'Tom thought the new robots were there to help with picking. A month later, his manager turns a screen towards him. It contains a detailed history of his individual output, compared with his coworkers’. Then comes the dismissal notice.',
    'At home, he puts the notice beside the bills and wonders how to explain it to his wife and child. Training never mentioned a report like this. He asks for a review.',
    'You receive the case. In five decisions, decide whether he can challenge the evidence, what the review preserves, and whether a promised remedy changes anything outside the office.'
  ]}
};
export const chapters=originalChapters.map(c=>({...c,first:chapterPlans[c.id][0],opening:openings[c.id]}));
export const chapterById=id=>chapters.find(c=>c.id===id);
export const endingCatalog=Object.fromEntries(Object.entries(originalEndings).map(([group,list])=>[group,list.map(([id,title])=>[id,id==='m-empty'?'The missing answer':title])]));
export const endingTitle=id=>Object.values(endingCatalog).flat().find(e=>e[0]===id)?.[1]??'The next shift';
const choice=(id,label,detail,patch,event,policy,why,extra={})=>({id,label,detail,patch,event,policy,why,...extra});
const scene=(id,chapter,title,prompt,choices,next,extra={})=>({id,chapter,title,prompt,choices,next,...extra});
const record=(id,label,detail)=>({id,label,detail});
const ready=w=>Boolean(w.pRobot&&w.pTrace);
const necessary=w=>w.pQuestion==='specific'&&ready(w);
const returnReady=w=>Boolean(w.mAuthority&&w.mFair&&w.mContext&&w.mSealed&&!w.mLost);

export const scenes=[
  scene('t-board','tim','What should the floor be watching?',
    'The live ranking ties each worker’s picks to their name. Tim checks it before reaching for his water. Choose what happens to the display and its underlying history.',[
      choice('public','Keep the public ranking','Use individual output for bonuses and warnings.',{tMonitor:'public',everMonitoring:true},'The board stays bright. Tim sees his name below the target and puts the bottle down.','violation','The proposal prohibits ongoing identifiable AMR productivity histories, including public rankings.'),
      choice('private','Keep the ranking in the office','Remove the public display but retain the same individual history.',{tMonitor:'private',everMonitoring:true},'The floor screen goes blank. Behind the office door, the same individual record continues to grow.','violation','Changing the audience does not change continuous individual productivity monitoring into a permitted use.'),
      choice('workflow','Replace ranks with workflow totals','Keep current assignments and show where work is waiting.',{tMonitor:'off'},'Names leave the board. Dispatch can still see current work and the blocked handoff.','allowed','Necessary task coordination and aggregate operational analysis can remain without a continuing individual rank.')
    ],'t-break'),
  scene('t-break','tim','Tim asks for water',
    w=>w.tMonitor==='off'?'The ranking is gone, but the queue remains. Tim asks to leave for water. A data restriction alone has not arranged anyone to cover him.':'Tim asks for water while his output history keeps updating. The queue is growing. Decide how a break is treated.',[
      choice('cover','Protect the break and arrange relief','Reassign active tasks and reroute work around the blockage.',{tBreak:true,tCoverage:true,tQueue:'managed'},'Tim takes his water. A relief assignment covers the station, though some waiting work shifts elsewhere.','allowed','Active-task coordination can protect a break without building a worker pace history. Workload support remains necessary alongside the monitoring rule.'),
      choice('later','Make the next target come first','Ask him to wait until the queue improves.',{tBreak:false,tQueue:'blocked'},'“The target keeps moving,” Tim says. The trainee hears the exchange. His bottle stays by the tote.','review','Removing a ranking does not by itself remove pressure to delay a break. This shows a limit of the monitoring policy alone.'),
      choice('track','Allow the break and record it against his pace','Add the pause to his ongoing individual comparison.',{tBreak:true,tMonitor:'private',everMonitoring:true,tQueue:'managed'},'Tim gets water. The supervisor adds the pause to his individual pace history.','violation','Break access does not justify extending an individually identifiable AMR productivity dossier.')
    ],'t-help'),
  scene('t-help','tim','What counts as a good shift?',
    w=>w.tBreak?'The new picker is still stuck at the handoff. Helping takes Tim away from his own picks. The bonus rule will tell everyone whether that work matters.':'Tim is still waiting for a proper break. The new picker needs help too. Another request can become another invisible task unless work and rewards change together.',[
      choice('shared','Assign and recognize the shared work','Cover training time and review quality, difficult tasks, and context.',{tHelp:true,tMentorPlan:true,tBonus:'context'},'A task is reassigned before the demonstration starts. The review includes training and waiting, rather than assuming every lower count means less effort.','allowed','Contextual recognition and active assignments can support cooperation without retaining continuous individual AMR output histories.'),
      choice('own','Keep individual output as the reward rule','Tell Tim to protect his own number.',{tHelp:false,tBonus:'rank',tMonitor:'private',everMonitoring:true},'Tim returns to his tote. The trainee waits, and the individual comparison remains the easiest way to be rewarded.','violation','The incentive continues to rely on the identifiable productivity history the proposal prohibits, while leaving cooperation uncounted.'),
      choice('credit','Add a lasting helpfulness score to the profile','Keep the individual pace record and add another worker rating.',{tHelp:true,tBonus:'rank',tMonitor:'private',everMonitoring:true},'Training is acknowledged, but a second score appears beside the first. Tim watches the profile while he teaches.','violation','A richer evaluation dossier can still cross the same boundary when it continues identifiable AMR productivity monitoring.')
    ],'t-reid'),
  scene('t-reid','tim','Robot 07 has no employee name',
    'Dispatch offers whole-shift load totals by robot number. Robot 07 has stayed with Tim all day. The employee-ID column is hidden. What may the supervisor see?',[
      choice('broader','Use broader workflow totals and test the released view','Separate necessary current-task links from lasting output comparisons.',{tReidTest:true,tReidLeak:false,tTaskBlind:false},'The supervisor sees the workflow instead of Robot 07’s whole-shift count. A check asks whether a worker can still be reconstructed from the view.','allowed','Identifiability depends on known assignments and other context. Hiding employee IDs alone is insufficient.'),
      choice('code','Rename the robot and keep its totals','Leave the one-worker assignment and count unchanged.',{tReidTest:true,tReidLeak:true},'The code changes. The supervisor still knows which robot has followed Tim through the shift.','violation','A pseudonym does not remove the link when the audience already knows the robot assignment.'),
      choice('trust','Release the totals with a reminder not to infer names','Rely on the rule while retaining the same accessible view.',{tReidTest:true,tReidLeak:true},'The reminder is sent. The assignment sheet still turns the supposedly anonymous total into Tim’s output.','violation','A reminder does not prevent the accessible view from being used for identifiable productivity monitoring.')
    ],'t-close'),
  scene('t-close','tim','What reaches the next manager?',
    'The shift is nearly over. A policy has to survive the software settings, linked exports, and the next person at this desk. Choose what the handover actually does.',[
      choice('carry','Verify the chosen settings and open a challenge route','Give workers the purposes, recipients, and a person responsible for concerns.',{tEnforce:true,tVoice:true,tHandover:true},w=>w.tMonitor!=='off'||w.tReidLeak?'The settings are documented, including the individual view still available. A clear explanation has not repaired that boundary.':'The access check and worker challenge route travel with the handover. The next manager receives the open workload issues too.',w=>w.tMonitor!=='off'||w.tReidLeak?'violation':'allowed','Notice and verification must concern a permitted practice. They cannot authorize a prohibited history or a reconstructable individual output view.'),
      choice('repair','Stop the individual views and repair earlier uses','Restrict linked exports, protect breaks, and give workers a remedy route.',{tMonitor:'off',tReidLeak:false,tEnforce:true,tVoice:true,tBreak:true,tLateRepair:true,tHandover:true},'The individual views are restricted before handover. Tim gets a concrete protection now, alongside a route to challenge what happened earlier.','allowed','A later repair can improve current conditions. It does not erase prior collection, inference, or decisions based on them.'),
      choice('reopen','Keep individual ranks and explain them more clearly','Let notice stand in for a use restriction.',{tMonitor:'public',tEnforce:false,everMonitoring:true},'Tomorrow’s screen is prepared with names again. The new explanation accompanies the same continuing comparison.','violation','Notice is required, but it does not authorize monitoring the proposal prohibits.')
    ],null),

  scene('p-records','priya','Build the first evidence packet',
    'The affected handoff is stopped. Choose two or three records to examine first. The question is why a completion signal arrived before unloading finished.',[],'p-question',{
      type:'records',min:2,max:3,records:[
        record('robot','Robot event window','Motion state and received signal, 13:13–13:15. No worker name.'),
        record('signal','Redacted handoff trace','The task and signal sequence around the event.'),
        record('account','Priya’s event account','What she saw while unloading and pressing the emergency stop.'),
        record('shift','Full individual shift history','Every location and handoff from her working day.')
      ],apply:a=>({patch:{pIsolate:true,pRobot:a.includes('robot'),pTrace:a.includes('signal'),pAccount:a.includes('account'),pBroad:a.includes('shift')},event:a.includes('shift')?'The packet now contains a whole working day around a two-minute event. Priya asks where that history will go.':'The packet contains the event sources you selected. Its gaps remain visible.',policy:a.includes('shift')?'violation':'allowed',why:a.includes('shift')?'The incident does not by itself justify a whole identifiable shift. Additional fields and time windows need a specific necessity argument.':'Starting with event-specific, non-identifying records follows the proposal. A worker’s account can add relevant context without disclosing their entire history.'})
    }),
  scene('p-question','priya','Which question is still unresolved?',
    w=>ready(w)?'The packet locates a premature completion signal. Before asking for anything identifiable, define what is missing and why it matters to this event.':'Your packet has not completed the robot-and-signal checks. Decide whether to fill that gap or turn the incident into a broader inquiry.',[
      choice('specific','Identify the active handoff behind the premature signal','Complete the redacted event checks before considering identity.',{pQuestion:'specific',pRobot:true,pTrace:true},'The question stays attached to the signal at 13:14. Missing redacted sources are checked before any identity request is released.','allowed','A specific unresolved safety question makes it possible to assess necessity. A general suspicion about the worker does not.'),
      choice('suspicion','Ask whether Priya is generally slower than coworkers','Use a pace concern as the reason for more access.',{pQuestion:'pace',pBroad:true,pPace:true,everMisuse:true},'The incident form starts asking for a worker comparison. The premature signal has not acquired an explanation.','violation','A pace suspicion cannot turn the safety exception into authorization for productivity monitoring.'),
      choice('collect','Collect everything and decide relevance afterwards','Let the investigator filter it once the file arrives.',{pQuestion:'all',pBroad:true},'The request has no meaningful field or time limit. Its scope is decided after disclosure.','violation','Minimum necessary access requires establishing purpose and scope before release.')
    ],'p-access'),
  scene('p-access','priya','Who gets through the identifiable-record gate?',
    w=>necessary(w)?'The reviewer has the redacted checks and a specific event question. A minimum task-to-operator link may be considered only if that link is still necessary.':'The current request has not established both a specific event question and prior redacted checks. A short time window alone cannot repair that omission.',[
      choice('redacted','Continue with the non-identifying event sources','Complete the packet without releasing a worker history.',{pAccess:'redacted',pRobot:true,pTrace:true,pAuthorized:false},'The signal sequence is available to the inquiry. The supervisor receives no identifiable working-day history from this step.','allowed','Non-identifying sources come first. An identity request, if still necessary, needs its own justification.'),
      choice('request','Submit the minimum event link to a designated reviewer','Apply the question, prior-check, field, audience, and expiry limits.',w=>({pAccess:'reviewed',pAuthorized:necessary(w),pRejected:!necessary(w),pGate:true,pRobot:true,pTrace:true}),w=>w.pAuthorized?'The reviewer authorizes only the necessary event-specific link for its restricted safety purpose. The whole shift is withheld.':'The reviewer refuses the request as submitted and returns the inquiry to the missing redacted sources.', 'allowed','A documented incident starts the process. The reviewer must still decide necessity and minimum scope before disclosure.',{reactionScene:'p-review',reactionAnswer:'conditional'}),
      choice('full','Release the entire shift to the supervisor','Treat the incident report as sufficient authorization.',{pAccess:'full',pAuthorized:true,pBroad:true,everMisuse:true},'The full-shift file reaches the supervisor. It can answer questions the incident never established a need to ask.','violation','A qualifying incident is not blanket permission for all identifiable records about the worker.')
    ],'p-share'),
  scene('p-share','priya','Pack the supervisor’s update',
    'Choose the update’s contents. The supervisor needs operational status; a restricted evidence link does not automatically belong in that audience.',[], 'p-close',{
      type:'records',min:1,max:4,records:[
        record('status','Affected handoff and operational status','What remains unavailable and how current work is coordinated.'),
        record('finding','Redacted finding or open safety question','The event sequence and what is still unresolved.'),
        record('identity','Identifiable event link','The restricted event-to-worker record, if released.'),
        record('pace','Whole-shift pace comparison','A comparison reconstructed from the broader history, if obtained.')
      ],apply:a=>({patch:{pSharedPace:a.includes('pace'),pSharedIdentity:a.includes('identity'),pPurposeBreach:a.includes('pace')||a.includes('identity'),pPace:a.includes('pace')},event:a.includes('pace')?'A pace question reaches Priya before the safety inquiry is finished. She stops adding detail.':a.includes('identity')?'The restricted link reaches an additional audience without a separate need being established.':'The supervisor receives the redacted information you selected. The restricted record stays with its authorized audience.',policy:a.includes('pace')||a.includes('identity')?'violation':a.includes('status')&&a.includes('finding')?'allowed':'review',why:a.includes('pace')||a.includes('identity')?'Safety authorization does not automatically permit forwarding identity or making a productivity comparison. Recipient and purpose limits still matter.':'A redacted finding can support operations while preserving the incident-specific boundary.'})
    }),
  scene('p-close','priya','What would it mean to close this case?',
    w=>ready(w)?'The synthetic trace points to an early completion-message sequence. A competent team still has to validate the finding. Priya wants her account heard and the file’s future explained.':'The event sources are still incomplete. Closing a tracker cannot supply the missing explanation. Priya also needs a way to question the conclusion and any misuse of her records.',[
      choice('bounded','Hear Priya, require validation, and bound the file','Keep an unresolved check open; challenge unrelated use and name an access owner.',w=>({pHeard:true,pAccount:true,pConfidential:true,pDiagnosis:ready(w),pValidated:ready(w),pIsolate:true,pBounded:true,pBroad:false,pPurposeBreach:false,pPace:false,pRemedy:true}),w=>w.pValidated?'The competent team validates the fictional event finding. Priya’s account is heard, unrelated uses can be challenged, and the remaining file has a restricted purpose and review date.':'The handoff remains isolated and the missing event checks are handed over explicitly. Priya gets a hearing and a bounded file, not a claim that the safety question is already solved.','allowed','Validation, worker participation, purpose limits, and remedies are distinct obligations. A complete record may support a check; a missing record must remain an open issue.',{reactionScene:'p-retain',reactionAnswer:'bounded'}),
      choice('paper','Mark the proposed software change complete','Archive the case without validation or a substantive worker hearing.',w=>({pDiagnosis:ready(w),pValidated:false,pHeard:false,pBounded:false,pPaperClear:true,pIsolate:false}), 'The tracker turns green. No recorded validation closes the event sequence, and Priya’s attendance does not become an account in the finding.','review','A software change or completed tracker entry does not establish that the event was resolved or the worker heard.',{reactionScene:'p-retest',reactionAnswer:'software'}),
      choice('performance','Use the incident records for a pace warning','Make worker output the final conclusion.',{pPace:true,pPurposeBreach:true,pHeard:false,pBounded:false,everMisuse:true},'Priya receives a pace warning. The report has become a reason to question the worker who raised it.','violation','The specific safety exception does not authorize unrelated productivity discipline.',{reactionScene:'p-meeting',reactionAnswer:'warning'})
    ],null),

  scene('m-appeal','tom','Can Tom change the decision?',
    w=>w.teamTrust<=1?'The earlier shifts have left people cautious about where reports travel. Tom asks for a review that can change his dismissal, through a channel he can safely use.':'Tom asks to see the hidden report and challenge the dismissal. A clearer explanation will help only if the process can respond to what he says.',[
      choice('pause','Open a restricted review with authority to correct it','Pause reliance on the report and stop the ongoing individual feed.',{mAppeal:true,mAuthority:true,mPrivate:true,mCollect:false,mNewMonitoring:false,mFinal:false},'The case enters a restricted review with power to change the decision. Tom can examine its basis and respond.','allowed','A remedy needs access to reasons, a usable worker channel, and authority to correct an unsupported decision.'),
      choice('explain','Explain the report but keep the decision final','Offer transparency without a process that can change the outcome.',{mAppeal:false,mAuthority:false,mPrivate:false},'Tom can now see the comparison. Nothing he supplies is allowed to change its result.','review','Explanation alone does not remedy prohibited collection or provide a meaningful challenge.'),
      choice('confirm','Confirm the dismissal because the report is precise','Treat its month of individual rates as sufficient.',{mAppeal:false,mAuthority:false,mFinal:true,mCollect:true},'The detailed comparison is placed beside a final notice. The work around the count stays outside the decision.','violation','Precision does not establish fair evaluation, and the proposal prohibits the continuing individual AMR history used here.')
    ],'m-records'),
  scene('m-records','tom','What will the review examine?',
    'Choose two or three records. A lower count may include training, difficult assignments, and waiting. A new monitoring baseline would create another history rather than recover the reasons for this decision.',[],'m-retain',{
      type:'records',min:2,max:3,records:[
        record('account','Tom’s account','He describes training a coworker and waiting at a blocked handoff.'),
        record('context','Task and downtime context','A synthetic shift note records the difficult assignment and waiting.'),
        record('basis','The disputed report and decision trail','What was collected and how it was used in the dismissal.'),
        record('more','A fresh month of individual AMR monitoring','Collect another baseline while the appeal waits.')
      ],apply:a=>({patch:{mAccount:a.includes('account'),mContext:a.includes('context'),mBasis:a.includes('basis'),mNewMonitoring:a.includes('more'),mCollect:a.includes('more')},event:a.includes('more')?'The review starts another individual profile while Tom waits for an answer.':'The packet contains the sources you selected. Missing context remains a question to resolve, not an assumed lack of effort.',policy:a.includes('more')?'violation':'allowed',why:a.includes('more')?'A pending dispute is not an exception for repeating continuous individual AMR productivity collection.':'The review can examine a bounded basis and relevant context while stopping ongoing monitoring.'})
    }),
  scene('m-retain','tom','What should happen to the disputed record?',
    'Tom may need the record to challenge what happened. Keeping a bounded dispute packet and continuing to build a productivity profile are different uses.',[
      choice('seal','Stop collection and seal only the necessary dispute evidence','Give the review and Tom justified access, with a review and deletion decision.',{mCollect:false,mNewMonitoring:false,mSealed:true,mLost:false},'The feed stops. Necessary disputed evidence remains available to the restricted review and Tom’s challenge.','allowed','Bounded preservation can support a remedy without continuing prohibited monitoring. The retention period still needs contextual justification.'),
      choice('delete','Delete the disputed record before the hearing','Remove the basis without preserving an appeal copy.',{mCollect:false,mNewMonitoring:false,mSealed:false,mLost:true},'The reviewer reaches for the decision trail and finds an empty space. Tom can no longer use that record to test the original reasons.','review','Deletion can remove evidence a worker needs. Privacy and a meaningful remedy both require consideration.'),
      choice('continue','Keep the individual feed running until the review ends','Use the growing profile as the appeal’s evidence.',{mCollect:true,mNewMonitoring:true,mSealed:false},'The appeal stays open while the individual record keeps growing.','violation','The dispute does not authorize the continuous individual AMR productivity monitoring being challenged.')
    ],'m-notice'),
  scene('m-notice','tom','What will the next worker be told?',
    'The next induction is being written. Tom was told the robots would help. Decide both what the new notice explains and what practice it describes.',[
      choice('boundary','Explain and verify a bounded data practice','Stop individual histories; explain access, retention, contextual review, and challenge routes.',{mNotice:true,mCollect:false,mNewMonitoring:false,mFair:true,mEnforce:true},'The induction describes necessary task data and a real restriction. Evaluation has reasons and a worker response route. The access settings are checked.','allowed','Notice must accompany a substantive limit and meaningful process. A disclosed prohibited practice would still cross the proposal’s boundary.'),
      choice('consent','Explain the individual profile and require a signature','Keep the old collection after workers acknowledge it.',{mNotice:true,mCollect:true,mNewMonitoring:true,mFair:false,mEnforce:false},'The form is clearer. The same individual history continues after the worker signs to join the shift.','violation','Required acknowledgment does not authorize monitoring the proposal prohibits.'),
      choice('vague','Say only that robots support efficiency','Leave purposes, recipients, and the challenge process unexplained.',{mNotice:false,mFair:false,mEnforce:false},'The next worker receives the broad promise Tom heard. The data boundary remains difficult to question.','violation','The proposal separately requires notice of purposes, recipients, and retention. Stopping a feed does not satisfy that explanation duty.')
    ],'m-remedy'),
  scene('m-remedy','tom','What changes when Tom leaves the office?',
    w=>returnReady(w)?'The authorized review has relevant context and a fair process. The hidden comparison cannot stand as a sufficient basis for dismissal. A remedy now needs implementation.':'The review still has a missing piece: authority, relevant context, a fair method, or bounded, preserved evidence. A promised correction must not be presented as a completed one.',[
      choice('remedy','Correct unsupported reliance and implement a meaningful remedy','Use the authorized review; name and schedule any steps still unresolved.',w=>({mRemedy:true,mAppeal:true,mFinal:false,mHeard:true,mReturn:returnReady(w),mRemedyImplemented:returnReady(w),mRemedyScheduled:!returnReady(w)}),w=>w.mReturn?'In this fictional branch, the employer reinstates Tom after the contextual review rejects the hidden comparison as sufficient. He receives the correction and supported return arrangements.':'Tom receives a named owner and a review date for the unresolved work. The employment outcome remains open; a missing safeguard is not claimed to be fixed.','allowed','A remedy should affect the decision and its harm. Implementation requires adequate reasons and authority. A depicted return is an authored outcome, not an automatic legal result.',{reactionScene:'m-return',reactionAnswer:w=>w.mReturn?'concrete':'schedule'}),
      choice('apology','Apologize and promise better notice','Leave the dismissal untouched and unreviewable.',{mRemedy:false,mReturn:false},'Tom receives an apology alongside the unchanged notice. The process improves for someone else before it changes his situation.','review','A future promise does not answer whether the current decision and its effects need correction.'),
      choice('confirm','Uphold the dismissal from the hidden ranking','Treat the missing context as irrelevant.',{mRemedy:false,mFinal:true,mReturn:false},'The disputed comparison remains the decisive document. Tom leaves with the original objection unanswered.','violation','The decision continues to rely on the continuing identifiable AMR history the proposal prohibits.')
    ],null)
];
const sceneMap=new Map(scenes.map(s=>[s.id,s]));
export function sceneById(id,w){
  const s=sceneMap.get(id);if(!s||!w)return s;
  const result={...s};
  if(s.choices)result.choices=s.choices.map(c=>({...c,locked:false}));
  if(s.type==='records')result.records=s.records.map(r=>{
    const withheld=(s.id==='p-records'&&r.id==='account'&&w.people.priya.trust<=1&&!w.pConfidential)||(s.id==='m-records'&&r.id==='account'&&w.people.tom.trust<=1&&!w.mPrivate);
    const noIdentity=s.id==='p-share'&&r.id==='identity'&&!w.pAuthorized;
    const noPace=s.id==='p-share'&&r.id==='pace'&&!w.pBroad;
    return {...r,locked:withheld||noIdentity||noPace,lockedReason:withheld?'A trusted restricted channel is needed before the worker supplies this account.':noIdentity?'No identifiable event link was released.':noPace?'No whole-shift history was obtained.':''};
  });
  return result;
}
export function routeAfter(s,w,a){
  const reasons={
    't-board':w.tMonitor==='off'?'The names are gone. The next question is whether the working day changes too.':'The continuing comparison changes what a break may cost Tim.',
    't-break':w.tBreak?'Break coverage changes what the team can ask Tim to do next.':'The unanswered break request changes how another demand will be received.',
    't-help':'The way shared work is treated now meets a supposedly anonymous output view.',
    't-reid':w.tReidLeak?'The robot assignment has left a worker identifiable. The handover must face that fact.':'The released view has a boundary that still needs to survive the next manager.',
    'p-records':'The selected packet determines what is known before asking for more access.',
    'p-question':necessary(w)?'A specific event question and redacted checks can now be presented to a reviewer.':'The request still needs a defensible safety question before identity can be released.',
    'p-access':w.pAuthorized?'A restricted link exists. Its original authorization does not settle who may receive it next.':'The update must use the records actually available to the investigation.',
    'p-share':w.pPurposeBreach?'The disclosure has changed Priya’s trust as well as the file. Closing the case must address both.':'The bounded update leaves a separate question about validation, participation, and the file’s future.',
    'm-appeal':w.mAuthority?'A review that can change the decision now needs relevant evidence.':'A clearer explanation has not given the review authority. Its evidence still needs examination.',
    'm-records':'The packet you assembled determines what can be preserved or lost for the challenge.',
    'm-retain':w.mLost?'The missing decision trail changes what a later review can establish.':'The collection decision leaves a separate duty to explain the future practice.',
    'm-notice':returnReady(w)?'The process has the conditions to implement a correction.':'The unresolved conditions limit what can honestly be implemented now.'
  };
  return {next:s.next,reason:reasons[s.id]??'The five decisions close with these conditions still in the warehouse.'};
}
export function endingId(chapter,w){
  if(chapter==='tim')return w.tMonitor!=='off'?'t-glass':w.tReidLeak?'t-shadow':!w.tBreak||!w.tHelp||w.tQueue!=='managed'?'t-stranded':'t-rhythm';
  if(chapter==='priya')return w.pPace||w.pPurposeBreach||w.pBroad?'p-drift':!w.pDiagnosis?'p-silence':!w.pValidated||!w.pBounded||!w.pHeard?'p-paper':'p-signal';
  if(chapter==='tom')return !w.mAppeal||!w.mRemedy||w.mFinal?'m-last':w.mCollect||w.mNewMonitoring?'m-file':w.mLost||!w.mSealed||!w.mFair||!w.mAuthority||!w.mContext||!w.mNotice||!w.mEnforce?'m-empty':'m-hearing';
  if(w.tMonitor!=='off'||w.mCollect||w.mNewMonitoring)return 'w-glass';
  if(!w.pDiagnosis||!w.pValidated)return 'w-signal';
  if(w.tReidLeak)return 'w-visible';
  if(!w.tEnforce||!w.mEnforce||!w.pBounded)return 'w-paper';
  if(!w.tBreak||!w.tHelp||w.tQueue!=='managed')return 'w-stranded';
  if(!w.mAuthority||!w.mContext||!w.mFair||!w.mRemedy||!w.mReturn||!w.mNotice||!w.pHeard||!w.tVoice)return 'w-unfinished';
  if(w.everViolation||w.mLost||w.pLost)return 'w-late';
  return 'w-next';
}
