# TRACE — Criminal Network Analysis

TRACE is a local browser-based prototype for reviewing documented relationships in a case. It is designed as an investigative aid: it does not identify guilt, infer intent, or make enforcement decisions.

## Run from PowerShell

Open PowerShell in this folder and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\Start-Trace.ps1
```

The app opens as a local HTML page. It does not need a server, package installation, API key, or internet connection to run (Google Fonts are optional; system fonts are used if they are unavailable).

To run the dependency-free smoke checks from PowerShell, use `node .\smoke-test.cjs`. The checks run against an isolated mock browser and do not modify the app's real browser data.

## Features

- Case overview with entity, documented-link, community, and review-queue counts.
- Interactive relationship graph with pan, zoom, search, entity-type and group filters, and focus mode.
- Entity profiles with linked records, relationship labels, source references, and provenance notes.
- Shortest documented connection-path finder and source-referenced relationship entry.
- Analyst review queue, review status toggles, searchable entity register, source register, and session audit trail.
- CSV import, JSON case snapshot export, browser-local case persistence, and responsive desktop/mobile layout.
- Descriptive network indicators for link counts, group crossings, most-linked entity, and source labels.
- Clear synthetic-data labeling and caution that connections are not proof of guilt or coordination.

## Data and limitations

All initial entities, links, dates, and source references are invented for demonstration. User-added case data is stored in this browser's local storage and exported only when you choose to download a case snapshot. Clearing browser storage removes the local case. The displayed confidence labels are illustrative review labels, not calibrated probabilities. The community numbers are seeded demo groupings, not AI-detected communities. The force-layout control is a visual-preview placeholder; node positions are illustrative. No real investigative data is collected or transmitted.

### CSV import format

Entity rows use `name,type,source,community`, where type is `Person`, `Organization`, or `Financial`. Relationship rows use `from,to,relationship,source_ref,note`; `from` and `to` can be an entity ID or exact entity name. Relationships are added only when both entities already exist and a source reference is supplied. Invalid, duplicate, and unmatched rows are skipped and counted in the import toast. Keep files limited to records you are authorized to process.

Before any real-world use, replace the demo data only with lawfully obtained and authorized records, implement access controls, encryption, retention limits, source-level audit trails, and independent validation. Analysts must verify each source and identity match.
