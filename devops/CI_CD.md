# CI/CD Pipeline — GitHub Actions

## Workflow overview

| Pipeline | File | Trigger | Env |
|:---|:---|:---|:---|
| `ci.yml` — Build, test, lint, security scan | `.github/workflows/ci.yml` | `pull_request`, push to `main`/`develop` | — |
| `deploy.yml` — Package + atomic SFTP deploy | `.github/workflows/deploy.yml` | tag `v*` or manual `workflow_dispatch` | production |
| `backup.yml` — Scheduled encrypted DB backup | `.github/workflows/backup.yml` | `schedule` (cron) + manual | production |
| `health.yml` — Scheduled uptime/health check | `.github/workflows/health.yml` | `schedule` | production |

## CI job (ci.yml)

1. **Checkout** + setup Node 20.
2. **Install & build** frontend (`npm ci` + `npm run build`).
3. **Type-check** (`tsc --noEmit`) — catches type regressions before deploy.
4. **Lint** (`eslint`) if configured.
5. **Unit/build smoke**: verify `dist/index.html` and `dist/assets/*` exist.
6. **Dependency audit** (`npm audit --audit-level=high`) — fail on high/critical.
7. **Secret scan** (trufflehog/gitleaks) — fail if credentials are committed.
8. **Upload build artifact** for later deploy/PR preview.

## Deploy pipeline (deploy.yml) — production

```
[manual or tag v*] → BUILD → PACKAGE → PRE-FLIGHT (DB reachable, migrations diff) → DEPLOY (atomic) → VERIFY (health) → [optional] rollback
```

- **Environment**: `production` with a **required reviewer approval gate** for deploy steps.
- **Artifact**: `upanishad-store-deploy.zip` containing `index.php`, `config/`, `index.html`, `assets/`, `db.sql`, `.htaccess`.
- **Deploy**: `devops/deploy-atomic.sh` (SFTP upload to `releases/<build>` + symlink swap). Uses `lftp`/`sshpass` (credentials from GitHub Secrets).
- **Verify**: after swap, poll `https://upanishadmobiles.com/api/health` and `GET /` for `200`; assert expected asset hash present.
- **Rollback**: on failure, re-run with `PREVIOUS_RELEASE` to flip the symlink back.

### Environment / secrets required in GitHub

| Secret | Used for |
|:---|:---|
| `HOSTINGER_SFTP_HOST` | `ftp.yourhostinger-domain.com` (or SSH host if SSH enabled) |
| `HOSTINGER_SFTP_USER` | Hostinger FTP/SSH user |
| `HOSTINGER_SFTP_PASS` | Hostinger FTP/SSH password (or `HOSTINGER_SSH_KEY` for SSH) |
| `HOSTINGER_REMOTE_DIR` | `public_html` (or absolute path) |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASS` | Pre-flight DB connectivity + backups + `credentials.php` generation |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Bootstrap admin seed (only used when `admin_users` is empty) |
| `BACKUP_ENCRYPTION_KEY` | GPG passphrase for encrypted backups |
| `JWT_SECRET` | Runtime secret — set in Hostinger env (fail-closed if missing in production) |
| `CF_ZONE_ID` / `CF_API_TOKEN` | (optional) Cloudflare cache purge after deploy |

> **Never** commit these values. The deploy workflow generates a gitignored `hostinger_php/config/credentials.php` from secrets at build time; `config/credentials.example.php` is the committed (secret-free) template.

## Pre-flight checks before deploy

- MySQL is reachable and credentials valid.
- No pending backward-incompatible schema changes (schema migrations are versioned and applied independently, never embedded in a hot swap).
- `uploads/` and runtime `config/env.php` exist in `shared/` and are writable.
- Cloudflare cache is purged for `assets/*` index files after swap (or rely on hashed filenames, which change each build — no purge needed for assets).

## Zero-downtime + rollback behavior

- New builds have **unique hashed asset filenames** → Cloudflare never serves stale JS/CSS.
- The `current` symlink flip is atomic.
- Rollback = `ln -sfn releases/<prev> current`; because assets are hashed and the API is backward-compatible, an old frontend can safely talk to a newer API (and vice-versa within a compatible window).
