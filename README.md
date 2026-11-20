# The Next Shift — V4

**[Play the game](https://99sslgz.github.io/the-next-shift-v4/)**

A public, browser-based warehouse ethics game by Team 12. Open the game link to play without an account or installation. Progress stays in the visitor’s own browser.

## Share with the team

- Game website — https://99sslgz.github.io/the-next-shift-v4/
- Source repository — https://github.com/99sslgz/the-next-shift-v4

The website is published with GitHub Pages from the main branch. The root index.html loads the V4 application from dist/. The .nojekyll file keeps the JavaScript modules and other static files available as supplied.

## Working on the website

The game source is in dist/. Edit the V4 modules and styles there. No installation or compilation is needed to play the hosted website. Run `node --test tests/v4.test.mjs` to verify changes. If dist/index.html changes, run `node scripts/update-pages-entry.mjs` to refresh the public entry page before pushing to main.

A local, branching warehouse game for Team 12’s AMR Surveillance Policy project. V4 retains the cream paper, forest green, terracotta, serif headings, drawn characters, and warehouse floor of v1.

## Open the local website

Extract the entire ZIP. Double-click **Start-Next-Shift.cmd** and keep its window open while playing. The launcher finds Node.js 20+ from a normal installation or the current Codex runtime. It does not use a version-specific runtime path. A busy port is handled by selecting the next available local port and opening that address.

On a computer without Node.js or Codex, install Node.js LTS from https://nodejs.org. No application packages or build step are needed. Use the launcher because browsers restrict module loading when index.html is opened directly.

## What changes in V4

The game contains 52 authored decision scenes across Tim, Priya, and Tom, with 20 ending families. A player sees a subset of the scenes because earlier conditions select later situations. The connected campaign carries the warehouse state between all three chapters. Single chapters start from their own initial conditions.

Five visible signals describe the current world.

- The current character’s mood, expressed through a portrait, a line of dialogue, and an illustrative floor marker.
- The team’s willingness to speak up.
- Queue pressure, also reflected in waiting carts and the route illustration.
- The data boundary, including active histories, inference risks, restricted incident files, and preserved dispute evidence.
- The state of relevant evidence or accountability checks.

These are authored, qualitative story states. Internal ordinal values drive transitions. They do not estimate worker health, actual feelings, warehouse throughput, injury rates, or policy effectiveness. Policy assessments are separate from character reactions.

## Interconnected decisions

- Delaying Tim’s break immediately changes his mood and opens a confrontation. The trainee’s response can travel into later reporting trust.
- Protecting a break without preparing relief creates a packing problem. Missing queue coordination can create a separate overflow decision.
- Asking for training after neglecting cover can produce a refusal that requires a concrete assignment or another response.
- A team bonus can create group pressure even after individual rankings disappear.
- A name-free robot dashboard can produce a reconstructed worker comparison. Restricting software incompletely can encourage a linked paper workaround.
- Priya can withhold an account when the available reporting channel is not trusted. A protected channel makes that record available.
- A supervisor’s update cannot include an identity link that was never released, or a pace comparison that was never obtained. Obtaining a restricted link still does not automatically authorize forwarding it.
- Forwarding information beyond its purpose creates a disclosure problem and later reporting consequences.
- A diagnosis without prepared validation time opens a further decision instead of silently counting as a completed check.
- Tom’s account can depend on a usable appeal channel. Missing contextual evidence produces another inquiry.
- A previously preserved appeal copy enables recovery after deletion. Without that earlier copy, the recovery option is unavailable.
- A reviewer without authority creates a further obstacle. A promised remedy needs implementation before the story can portray a return.

Before-and-after cards show immediate signal changes. The next scene explains why it exists. Delayed ripples advance only on committed decisions. There is no penalty for reading slowly or leaving the page open. The character roster preserves earlier reactions while another chapter unfolds.

## Endings and replay

Endings depict the following shift, a later meeting, or a worker’s home or return. They show the resulting conditions and relationships without repeating the labels of the player’s choices. A separate collapsed journal holds the actual decisions, explanations, policy assessments, and world changes.

Rewind from the journal to remove a decision and everything after it. The engine replays the remaining valid events, recalculating moods, evidence availability, delayed ripples, and later chapters. Completed routes and discovered endings remain in the browser until reset is confirmed. A comparison describes how the visible conditions differ between completed worlds.

Progress is browser-local under **team12-next-shift-v4**, separate from older versions. Reload and use Continue your shift to resume. A journal can be downloaded as a local text file. If browser storage is unavailable, the game remains playable for the current visit.

## Sources and project restrictions

The three original scenarios and four policy rules come from **CT3 - Senario.pdf**. The scope and synthetic-data restrictions come from **Team 12 - Project Scope & Team Charter.pdf**. The live cross-examination informs the unresolved-safety-question gate and the robot-assignment re-identification test.

All added dialogue, events, records, timings, emotions, planning allocations, branches, and endings are fictional. The early completion-message finding is a synthetic extension, not a claim about a real vendor. A depicted reinstatement is one authored employment outcome after review, not a rule automatically implied by the policy.

There are no visitor accounts, analytics, response uploads, real worker records, warehouse connections, or physically accurate robot simulation. The local server binds only to 127.0.0.1. The proposal’s additional safeguards remain options for the team to evaluate.

## Source structure and verification

- dist/game.mjs holds the original scenario and policy material reused by the V4 model.
- dist/v4-game.mjs adds follow-up scenes, context-dependent access, and the routing rules.
- dist/v4-world.mjs defines discrete reactions, delayed effects, visible signals, and ending stories.
- dist/v4-engine.mjs validates and replays decisions, restores progress, handles rewind, and exports journals.
- dist/v4-ui.mjs and dist/v4-app.mjs render the world, decisions, and controls.
- dist/styles.css, dist/game.css, and dist/v4.css retain and extend the visual design.
- tests/v4.test.mjs checks 20 reachable endings, all 52 scenes, available alternatives, 150 deterministic route variations, causal chains, evidence gates, restoration, rewind, story content, and local serving.

Run **node --test tests/v4.test.mjs**. The application has no third-party runtime dependencies.
