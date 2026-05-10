# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CLAUDE.md`** at the repo root — this is the primary domain reference for FreshMart. It covers architecture, routes, auth, database schema, and environment setup.
- **`CONTEXT.md`** at the repo root if it exists (not yet created — `CLAUDE.md` serves this role for now).
- **`docs/adr/`** — read ADRs that touch the area you're about to work in, if this directory exists.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront.

## File structure

Single-context repo:

```
/
├── CLAUDE.md          ← primary domain reference
├── CONTEXT.md         ← domain glossary (create when needed)
├── docs/adr/          ← architectural decisions (create when needed)
└── backend/ frontend/
```

## Use the project's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the terms as defined in `CLAUDE.md`. Key terms for this project: order statuses (`pending → processing → out_for_delivery → delivered`), roles (`customer`, `admin`), `asyncHandler`, `AppError`, `requireAuth`, `attachUser`.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding.
