# Approved Forge baseline — 2026-10-10

This directory preserves the approved Forge implementation before panoramic background experimentation.

## Restore files
- `index.html.snapshot.txt` → `index.html`
- `patch-forge-independent-blade-v156.js.snapshot.txt` → `patch-forge-independent-blade-v156.js`

## Original artwork (not changed)
- `forge-cavern-production.jpg` at repository root. Preserve original binary. Git history provides byte-identical restoration if ever needed.
- Claw foreground assets and all forge part assets are not modified by this backup operation.

## Baseline display parameters
- Cavern background: `forge-cavern-production.jpg?v=20261007-1634`
- Background size: `64% auto`, centered, no repeat
- Left foreground claw: `width:45px;left:calc(50% - 202px);bottom:108px`
- Right foreground claw: `width:45px;left:calc(50% + 153px);bottom:108px`
- Blade patch cache key: `20261010-2040`

Do not replace original artwork or modify geometry during extension development. Build new image assets under new names, compare the original 1279×720 center pixel-for-pixel, and deploy only after explicit approval.
