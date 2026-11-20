# The Next Shift — five-decision stories

A playable warehouse ethics story by Team 12. This feature branch revises V4 with story openings and exactly five decisions for each of Tim, Priya, and Tom. A full campaign has 15 decisions. The original cream, forest green, terracotta, serif headings, and illustrated warehouse remain.

This work is on `feature/five-decision-stories`. GitHub Pages currently publishes `main`. The [public game](https://99sslgz.github.io/the-next-shift-v4/) changes when the feature branch is merged into `main`.

## Open this version locally

Double-click **Start-Next-Shift.cmd** and keep its window open while playing. Extract the entire ZIP first if using the downloadable copy. The launcher finds Node.js 20+ from a normal installation or the current Codex runtime, and selects another port when the default is busy. No application packages or compilation are needed.

If Node.js and Codex are absent, install [Node.js LTS](https://nodejs.org). Use the launcher because opening index.html directly restricts JavaScript module loading in browsers.

## Three short stories

Each chapter starts with a short scene introducing the person, the conflict, and the player's role. Entering a story does not count as a decision. A visible counter shows the five decisions. There are no extra decision detours.

- **Tim** — identifiable rankings, a supported break, recognition for shared work, robot-assignment re-identification, and a handover that verifies the boundary.
- **Priya** — event-specific evidence, a specific unresolved safety question, reviewed access, the supervisor's update, and validation with worker participation and bounded retention.
- **Tom** — an appeal with authority, contextual evidence, preservation of disputed evidence, meaningful notice, and an implemented or explicitly unfinished remedy.

Later prompts, available records, moods, willingness to speak, queue pressure, and endings still depend on earlier decisions. A denied break can affect later reporting trust. An identifiable link cannot appear in an update unless it was actually released. A reviewer can reject a poorly justified request. A promised remedy is not portrayed as a completed return without authority, context, a fair process, and bounded preserved evidence.

## Consequences and replay

The floor and five world signals react after each decision. Before-and-after cards show immediate changes, and delayed effects advance on committed decisions. Reading slowly has no penalty. The character roster keeps earlier reactions visible during later chapters.

The game retains 20 ending families, including eight for the connected campaign. Endings depict a later shift, meeting, home, or return to work. The separate journal holds the exact decisions and policy explanations. Rewind clears a selected decision and everything after it, then recalculates the world. Completed routes can be compared, and journals downloaded locally.

Progress uses `team12-next-shift-five-v1` in the visitor's browser. The older V4 save remains under its previous key. This edition has a different event structure and does not reinterpret an older route as a shortened one.

## Project boundaries

The original scenarios and policy rules come from **CT3 - Senario.pdf**. The project scope and synthetic-data restrictions come from **Team 12 - Project Scope & Team Charter.pdf**. The team's cross-examination informs the unresolved-safety-question gate and indirect worker-identification issue.

All dialogue, records, event timings, emotions, consequences, and endings are authored fiction. Mood, trust, and queue signals are qualitative story states, not measurements or predictions of worker health, throughput, injuries, or policy effectiveness. The premature-message diagnosis is a synthetic extension, not a claim about a vendor. Reinstatement is an authored employment outcome, not an automatic legal result.

There are no visitor accounts, analytics, response uploads, real worker records, or warehouse connections. The illustration does not simulate robot physics. The local server binds only to 127.0.0.1.

## Source and verification

- `dist/five-game.mjs` defines the 15 decisions, openings, conditional record access, and endings. `dist/v4-game.mjs` exports this active model.
- `dist/game.mjs` retains the original scenario and policy material.
- `dist/v4-world.mjs` defines reactions, delayed effects, visible signals, and ending stories.
- `dist/v4-engine.mjs` validates and replays decisions, including introduction transitions, restore, rewind, and journal export.
- `dist/v4-app.mjs` and `dist/v4-ui.mjs` render the experience.
- `dist/styles.css`, `dist/game.css`, and `dist/v4.css` preserve and extend the visual design. Priya's hair is layered around her face so facial features remain exposed.

Run `npm test` and `npm run check`. The tests enumerate every legal standalone route, verify five decisions per chapter and 15 per campaign, reach every ending family, and check access restrictions, delayed consequences, remedies, rewind, restore, rendered campaign transitions, and local assets. The rendering test checks markup and event handling. It does not assess visual layout.

The root `index.html` is the GitHub Pages entry. After editing `dist/index.html`, run `npm run prepare:pages` to refresh it. `.nojekyll` preserves the supplied static modules and assets.
