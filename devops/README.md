# DevOps — Upanishad Store Production

Production-grade deployment & operations for the **Hostinger shared hosting + Cloudflare + GitHub Actions** architecture.

## Docs index

| Doc | Contents |
|:---|:---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Infrastructure topology, environment split, atomic release layout |
| [CI_CD.md](CI_CD.md) | Pipeline design, GitHub Actions, secrets, rollback behavior |
| [MONITORING.md](MONITORING.md) | Observability, logging, alerting, SLOs, scaling on shared hosting |
| [CHECKLIST.md](CHECKLIST.md) | Go-live checklist + runbooks (rollback, DB restore, incident response) |

## Artifacts

| File | Purpose |
|:---|:---|
| `../.github/workflows/ci.yml` | Build, type-check, audit, secret-scan on PR/push |
| `../.github/workflows/deploy.yml` | Production atomic deploy (manual / tag) with approval gate + rollback |
| `../.github/workflows/backup.yml` | Scheduled encrypted MySQL backup → GitHub Release |
| `../.github/workflows/health.yml` | Scheduled uptime/health probe → GitHub issue on failure |
| [deploy-atomic.sh](deploy-atomic.sh) | Zero-downtime atomic SFTP deploy + rollback |

## Quick start

1. Configure **GitHub Secrets** (see `CI_CD.md` section "Environment / secrets required").
2. Enable the **production** environment with required reviewers.
3. Push to `main` → CI runs. Tag `v1.0.0` → deploy pipeline runs.
4. Confirm first scheduled backup + health check.

## Security note

`deploy.ps1` (repo root) contains hardcoded InfinityFree credentials and is **not** part of this production pipeline. Delete it or strip its secrets before going live. All credentials belong in GitHub Secrets / Hostinger env vars, never in the repo.
