# Character exports and GM party review

The player character header has Export to PDF and Export to Word controls. Galactic Database links to `gm-party.html`, a read-only roster, complete saved character view, advancement review list, individual exports, party ZIP downloads, and a PDF combat summary.

## Architecture and access

The repository is a static GitHub Pages application. Supabase supplies authentication and authoritative `character_sheets` rows. The existing SELECT policy permits `auth.uid() = user_id OR is_gm()`. Ownership policies continue controlling edits. No new backend, database table, migration, permission, or public file-storage bucket is needed.

Player exports obtain a verified authenticated user, read that user's current saved row, and verify ownership and account continuity. They do not call collect, hydrate, save, or update. An open wizard and unsaved inputs are excluded. They do not update edit timestamps. Each export uses one returned row as its consistent snapshot; changes saved after that read belong to the next export.

The GM page reuses `destiny-gm-admin-auth`, validates the user and server `is_gm()` before reads, and checks authorization again afterward. Database RLS remains the enforcement boundary if someone changes requests or navigates directly to the page. Bulk downloads re-read the intended IDs and require every selected record to remain accessible. The roster lists actual accessible sheets, with no hardcoded characters or example statistics. The current schema has no campaign identifier to support additional campaign scoping.

Document generation happens locally in the authenticated browser after its protected read. The PDF, Word, and ZIP bytes are downloaded with temporary object URLs, which are revoked. There are no publicly hosted generated documents. Runtime packages and fonts are served locally from `vendor/`; external document services receive no character information.

## Hidden feature boundary

`character-export-model-v1.js` uses an explicit allowlist of player-visible fields. It never clones page HTML, reads modal contents, serializes the raw saved sheet, or exports arbitrary object keys. Unknown fields, GM notes, module configuration, unfinished construction data, raw advancement snapshots, and the Forge interface do not enter the document model.

Only saved weapon records contribute weapon names and calculated combat details. A completed custom lightsaber can appear as equipment, including its applicable crystal effects and both-end attack modifier. The construction window, part choices, draft, activation UI, sounds, and hidden system descriptions never appear. Force sections without character access or owned powers are omitted. Player-authored notes are preserved as literal text.

## Calculation reuse

`scripts/build-export-calculator.cjs` extracts the existing species presets, ability/armor/defense/skill functions, and weapon calculations into `character-export-calculator-v1.js`. It runs those functions against isolated value objects instead of the live DOM, and uses the existing advancement engine's class tables and damage-threshold correction. It does not modify the live sheet's math or hydrate another character into it. Its generated source hash and `--check` detect source drift. Browser tests compare exported defenses, threshold, and all skills against the fully loaded Chronicle for multiple species, armor states, and temporary Dexterity scores.

Both PDF and Word renderers consume the same section model. Base and other ability values, final scores/modifiers, classes, combat statistics, skill training/misc values, armor, weapons, feats, talents, owned Force abilities, per-use power availability, class features, languages, equipment, notes, and record metadata are covered where present. The current schema stores credits, background, biography, healing details, DR, and shields in free text rather than dedicated fields; those notes are preserved without fabricating separate values. Unknown/missing required data is labeled Unavailable. Custom species follow the existing sheet's Custom behavior.

PDF uses US Letter pages, embedded DejaVu Sans fonts, selectable text, wrapping, and page numbers. Unsupported font glyphs produce an actionable error recommending Word rather than silently dropping text. Word contains editable paragraphs and tables with repeating headers; it is not a screenshot. Missing optional values are shown as Unavailable. Blank maximum-Dexterity and temporary-Dexterity inputs retain the existing calculator's no-cap/normal-Dexterity behavior, visible in the defense breakdown.

## Advancement review

The existing checked level-up save already commits an event and pre-level snapshot in the character record. The GM view reads this durable ledger, so a failed save produces no review item and re-reading cannot create duplicate events. Events are deduplicated by ID. The before/after comparison reconstructs that advancement from its recorded field deltas and class features rather than comparing against later edits. It reports actual changed level, BAB, defenses, threshold, HP, resources, ability inputs, choices, skills, and class features.

Reverted events remain visibly marked, with both advancement and reversal times. The current roster uses the actual current saved sheet. This integration does not modify the existing revert behavior or independent story entitlements. Legacy manually entered levels have no invented comparison history. The current ledger is player-editable sheet data protected by the existing save safeguards; it is not an independent immutable audit log.

The review list persists through the stored history and refreshes every 30 seconds while visible, on focus, or manually. It has no reviewed/unreviewed acknowledgment state, push notifications, email, or background service. Reversals are displayed in the persistent review item; they do not create an additional duplicate event. Historical after-snapshots are reconstructed from existing committed deltas instead of adding a second snapshot ledger.

## Combat planning

The GM detail and PDF summary show maximum HP and normal Dexterity as the planning baseline, with saved current HP/resources explicitly labeled. Primary attacks, damage, speed, feats, talents, class features, and Force powers are available. Conditions and tactical effects remain subject to the existing sheet's calculations and the GM's rules judgment. Flat-footed Reflex is not invented because its interaction with talents is not currently modeled independently. No encounter score is generated. A combined full party dossier, structured recovery archive, and Tactical Dossier/Command Console sync remain outside this release.

## Limits and failure behavior

Individual raw sheets are limited to 2 MB and 1,000 weapons. ZIP exports support up to 30 characters and 30 MB of generated document data, with IDs making filenames unique. Access failures clear the GM view. Dependency, missing-sheet, unsupported-font, malformed-data, and network failures are surfaced to the user. Export buttons prevent duplicate simultaneous submissions.

## Verification

Run `npm ci --ignore-scripts`, `npx playwright install --with-deps chromium`, `npm run test:exports`, and `npm run test:regression`.

The export suite covers allowlist canaries, custom text, missing values, Unicode names, current power availability, custom saber calculations, long multi-page notes, advancement reconstruction, duplicate events, reversal status, live math parity, fresh saved reads, no saves on export, actual PDF/DOCX downloads, duplicate-name ZIPs, GM denial before reads, and mobile layout. Existing advancement and full Forge/equipment suites remain regression gates. Generated fixture documents and browser screenshots are QA intermediates, not player data.

Live database verification used a rolled-back transaction with existing owner/GM identities. It confirmed that an owner cannot SELECT another character, the GM can read the authorized sheets, and anonymous SELECT returns no sheets. No character records or policies were changed. PDF text was checked for hidden canaries and complete long notes, and both document formats were rendered for visual review. Rendering Word through LibreOffice verifies compatibility there; Microsoft Word itself was not available in this environment.

## Deployment and rollback

Merge the reviewed change into `main`, which is the repository's existing GitHub Pages source at the root. There is no build step or database migration for deployment; runtime files are already committed. Wait for the existing Pages workflow to succeed. Open the Chronicle, check the two new export controls, then follow the Galactic Database party-roster link with the existing GM session. Sign in through Galactic Database first if necessary.

To roll back, revert this feature's merge commit and let Pages redeploy. No data restoration or schema rollback is needed because this feature does not write character records. Existing player exports remain ordinary local documents. PDF and Word are human-readable references; no import/restore or disaster-recovery claim is made.
