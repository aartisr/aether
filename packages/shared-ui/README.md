# Shared UI (Workspace Placeholder)

This workspace is reserved for the shared UI component library used by Aether applications.

Current state:

- No published component source is committed yet.
- The workspace is kept in the monorepo for forward-compatible package boundaries.

Intended direction:

- Reusable React components with strong accessibility defaults.
- Shared design tokens and UI primitives consumed by `apps/frontend`.
- Clear semver and migration notes once package code is introduced.

When adding components:

1. Co-locate tests with component modules.
2. Prefer prop-driven APIs over app-specific coupling.
3. Document usage examples and accessibility notes in this README.
