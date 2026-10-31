# Security and data boundaries

Reviewed on 2026-10-31. This repository is a public portfolio project, not an approved deployment for sensitive records.

## Current behavior

Game state stays in the browser. Stockfish runs locally in a Web Worker. No school database or user account backend is used.

## Before using real data

- Keep production data, exports, credentials and deployment configuration outside this public repository and its history.
- Enforce authentication and per-user/role authorization on the server. Browser-selected identities, login-code lookups and hidden buttons are not authorization.
- For a database-backed deployment, review table grants, row-level policies, storage buckets and callable functions. Test anonymous, ordinary-user and administrator access separately with synthetic fixtures.
- Keep privileged keys on the server; rotate any exposed secret. A public client key does not prove that backend access is safe.
- Review cached browser data, downloaded exports and shared-device access. Third-party scripts, fonts, maps and embeds may receive normal request metadata.

## Validation and reporting

Run `python scripts/check_public_source.py`. CI also scans reachable Git history with Gitleaks. Reviewed public client/browser-key findings may be listed by fingerprint in `.gitleaksignore`; this does not allow privileged keys or future unknown findings.

These checks are heuristic. They do not prove that every name, image, recording or server policy is safe. Frontend changes do not revoke old keys, remove cached copies, or shut down separately hosted backends.

Report sensitive findings privately through GitHub private vulnerability reporting if available; do not post real records or secret values in public issues.
