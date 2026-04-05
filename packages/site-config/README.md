# Site Config (Workspace Placeholder)

This workspace is reserved for centralized configuration shared across Aether applications.

Current state:

- No runtime config module is committed yet.
- The workspace exists to keep future shared config logic isolated from app code.

Intended direction:

- Typed configuration schemas and environment validation.
- Shared constants for navigation, metadata, and feature flags.
- Config layering by environment (local, preview, production) with safe defaults.

When adding config modules:

1. Export typed interfaces.
2. Validate required environment variables at startup.
3. Keep secrets in host environment, not in committed config files.
