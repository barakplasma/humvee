# ADR: Maintain Distilled Reference Notes

Tags: #adr #docs #sources

## Context

The project uses multiple military manuals, public web mirrors, an official successor
manual figure, Wikipedia pages, and a Google Photos album. Raw PDFs and album images
are too large and slow to re-read for every small gameplay edit.

The user asked for an Obsidian-compatible folder of source details for future agent
work, similar in spirit to documentation-oriented skills that turn conversation and
source context into durable project notes.

## Decision

Maintain `docs/reference/` as a small Markdown knowledge base:

- One source ledger.
- One limits table.
- One controls/drivetrain note.
- One stage mapping note.
- ADR notes for source-handling decisions.

Use wiki links where helpful, but keep the files plain Markdown so GitHub and Obsidian
both render them.

## Consequences

- Future agents can check distilled notes before raw PDFs.
- Source caveats stay close to gameplay thresholds.
- If a manual or page is re-verified, update these notes in the same commit as any
  gameplay change that depends on the verification.
