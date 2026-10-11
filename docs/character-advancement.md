# Character advancement

The character sheet's Level Up wizard records one heroic level as a single save. Revert Previous Level removes the latest active recorded advancement after explicit confirmation. Existing manually entered levels remain compatible; they cannot be safely reverted without a recorded baseline.

The accepted Forge renderer, artwork, attachments, blade effects, and equipment metadata are unchanged. Its existing eligibility predicate continues to require Jedi level 1 and Weapon Proficiency (lightsabers).

## Rules and UI

`data/saga-advancement-v1.json` is the versioned progression and catalog layer. It includes five heroic classes, twelve Core prestige classes, and KOTOR Gladiator / Melee Duelist. Core prestige entry requirements and class tables were checked against the Wizards of the Coast Core Rulebook; the two KOTOR classes were checked against the KOTOR Campaign Guide. Catalog descriptions and supplemental talents/feats come from the Chronicle's existing Core/KOTOR/JATM catalogs. Narrative membership and other nonnumeric prerequisites require explicit attestation, rather than being inferred.

`advancement-engine-v1.js` is pure and independently testable. Heroic and class milestones are separate. BAB uses each class table; class defense bonuses use the highest value. Half-level is used for skills. HP uses the selected class's die, Constitution, the minimum gain of 1, retroactive Constitution changes, and Toughness. Ability increases are two distinct choices at multiples of four. Intelligence can add a trained class skill and language; Wisdom adds the appropriate retroactive Force Training powers. Force Training requires trained Use the Force and is not a class bonus feat. Force Points refresh to the selected class's allotment (5 / 6 / 7 + floor(heroic level / 2), plus Force Boon when owned). Destiny Points increase by one, or two for Force Disciple.

`patch-character-advancement-v160.js` installs the toolbar, six-step modal, descriptions/source references, physical-die entry or Roll for Me, exact review, story reward recording, and conflict-aware revert. Back/Next retain a draft. Cancel and failed saves do not apply a level. Core ability/class inputs and derived sheet formulas are reused. The preview includes defenses, HP, FP, abilities, BAB, half-level, and skill totals. Passive armor talents update the existing armor switches. Class features not represented by a canonical input are retained in the class-features panel for use during play; the wizard is not a combat simulator.

## Destiny and story rewards

The default Destiny ruleset automatically grants missing Jedi starting feats on first Jedi multiclassing, except Weapon Proficiency (lightsabers). It still awards the Jedi talent. The awakening override can be changed in Campaign settings. The Jedi level requirement for Force abilities remains enabled by default.

Record GM-approved Reward is a player attestation of a reward already authorized by their GM. It is not an independent GM approval channel and does not claim to verify the GM. A story reference and checkbox are mandatory. Fixed feats, including the deferred lightsaber proficiency, are saved as independent entitlements and consume no advancement selection. Parameterized feats still use the existing rules directory. When the same feat is independently re-awarded, its entitlement prevents reverting an earlier advancement from deleting it.

## Existing prestige levels

Older characters have one Other / Prestige field. The wizard requires an explicit named mapping with the same total before advancement. It never guesses a class. New named records derive prestige BAB and defense bonuses. The old Other/BAB fields remain present for compatibility. A GM-certified older personally built weapon can be recorded for Jedi Knight entry; the new Forge's saved weapons qualify directly.

## Persistence and recovery

`sheet.advancement` contains version, campaign, named prestige classes, class features, independent entitlements, and history. Each finished event has an ID, time, rules version, class and heroic levels, draft choices, grant origins, HP breakdown, changed field values, and a complete pre-level snapshot. Snapshots omit the nested history array to avoid recursive growth. The history itself remains alongside the snapshots.

Revert removes only recorded list additions, restores changed canonical fields, preserves unrelated fields/weapons/Forge state and independent rewards, and keeps a recoverable reverted event with the current snapshot and selected conflict resolutions. Later changed fields require explicit Keep current / Restore previous choices. Class-level conflicts require restoring the pre-level distribution. Current HP adjusts by the removed gain, preserving later damage and respecting the restored maximum. Previously spent Force Points are a conflict requiring a decision.

All new saves use `public.save_character_sheet_checked(expected_sheet, next_sheet, next_character_name, next_player_name)`. The function is SECURITY INVOKER with an empty search path, authenticated-only execution, existing ownership RLS, and a row lock. JSONB compare-and-set rejects a stale expected sheet. The client serializes autosaves, waits for them before opening a draft, disables duplicate Finish/Revert submissions, saves the next sheet and history together, and hydrates only after acknowledgment. The SQL migration is additive. Player records were not migrated or overwritten in bulk.

The live database function was tested with a temporary user/sheet inside a transaction and rolled back: initial save and update succeeded; a stale overwrite raised serialization_failure and left the current data intact. Anonymous execution is disabled. Character owners retain the existing freedom to edit their own sheet; the RPC does not turn client-side Saga validation into an anti-cheating security boundary.

## Validation

- `scripts/verify-advancement-engine.cjs`: awakening example, HP dice/floor/retroactivity, ability choices, feat milestones, Force Training and trained-skill dependencies, prestige bonuses and FP, legacy Other gate, independent rewards, field conflicts, snapshots, and equipment preservation.
- `scripts/verify-advancement-browser.cjs`: full app and patches in Chromium, physical/programmatic HP, Back, inert drafts/cancel/save failures, duplicate Finish, story unlock and re-gating after revert, confirmation and conflict resolutions, equipment preservation, stale saves, and mobile modal.
- Existing Forge equipment and full Chronicle tests run afterward; they cover accepted geometry, blade/audio behavior, equipment persistence, multiple sabers, and explicit editing.

The workflow `validate-character-advancement.yml` runs these against the character-advancement branch and relevant pull requests. No acceptance claim is made until the run passes.
