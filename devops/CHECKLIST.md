# Production Deployment Checklist & Runbooks

Use this to take the site live and to operate it. Ordered: **Pre-flight → Go-live → Post-launch → Runbooks**.

---

## A. Pre-flight (before first production deploy)

### Source & Secrets
- [ ] Remove any committed credentials: check `git grep -n "ghp_\|rnd_\|password\s*="` returns nothing in tracked files.
- [ ] `deploy.ps1` (hardcoded InfinityFree creds) either deleted or moved to `devops/legacy/` and its secrets removed.
- [ ] `.env`, `HOSTINGER_TEMP_SITE_CREDENTIALS.md` excluded from git (already in `.gitignore` — verify).
- [ ] Enable **secret scanning + push protection** in GitHub repo settings.

### GitHub secrets (repo → Settings → Secrets → Actions)
- [ ] `HOSTINGER_SFTP_HOST`, `HOSTINGER_SFTP_USER`, `HOSTINGER_SFTP_PASS`
- [ ] `HOSTINGER_REMOTE_DIR` (e.g. `public_html`)
- [ ] `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`
- [ ] `BACKUP_ENCRYPTION_KEY` (fresh random, ≥32 chars)
- [ ] `CF_ZONE_ID`, `CF_API_TOKEN` (Cloudflare purge)

### Environment (GitHub → Settings → Environments → `production`)
- [ ] Environment **required reviewers** enabled (human approval gate for deploy).

### Hostinger hPanel
- [ ] MySQL database exists and credentials work.
- [ ] `pdo_mysql` extension enabled; PHP version pinned.
- [ ] Automated daily DB backups enabled (hPanel) in addition to our GH backups.
- [ ] FTP/SSH credentials scoped; disable plaintext FTP if SSH is available.

### Cloudflare
- [ ] Domain proxied (orange cloud), SSL = **Full (strict)**.
- [ ] WAF managed rules ON; rate-limit rule on `/api/admin/login` and `/api/products/*/like`.
- [ ] Caching rule: `assets/*` → immutable, `Edge Cache TTL` 1 year.
- [ ] Cache rule for public `GET /api/*` read endpoints (short TTL) — exclude admin & writes.
- [ ] Web Analytics enabled.

---

## B. Go-Live Deploy (first time)

1. Push code to `main`; confirm **CI** passes (build, type-check, audit, secret scan).
2. Create a `v1.0.0` tag (or run `workflow_dispatch`).
3. Approve the **production** environment gate in the Actions run.
4. Pipeline: builds → packages → pre-flight DB check → **atomic deploy** → health verify → Cloudflare purge.
5. Verify in browser: homepage, category, product detail, admin login, image upload, search, chatbot.

---

## C. Post-Launch (first 48h)

- [ ] Confirm Cloudflare cache hit ratio > 80% for assets.
- [ ] Confirm Web Analytics shows traffic and no 5xx spike.
- [ ] Confirm `health.yml` and UptimeRobot report 100% uptime.
- [ ] Confirm **first scheduled backup** succeeded; do a **test restore** to a scratch DB.
- [ ] Confirm admin JWT still works after deploy (JWT_SECRET unchanged in Hostinger env).

---

## D. Daily / Weekly Operations

| Cadence | Task |
|:---|:---|
| Every 5 min | `health.yml` + UptimeRobot probe |
| Daily 02:30 UTC | `backup.yml` encrypted DB backup to GH Release |
| Daily | Review backup job result; spot-check app.log for `login.fail` / `5xx` |
| Weekly | Verify backups are restorable (rotate test-restore) |
| Monthly | Full restore drill; review SLOs; prune old GH Release backups (retention policy) |

**Backup retention:** keep daily for 14 days, weekly for 8 weeks, monthly for 12 months (automate pruning via a scheduled GH Action or manual cleanup of old GH Releases).

---

## E. Runbooks

### E1. Rollback a bad frontend release
```bash
# in CI deploy workflow (workflow_dispatch), set rollback_to=<previous release label>
# OR run the script directly:
ROLLBACK_TO=2026-08-16T11-00-00Z bash devops/deploy-atomic.sh
```
Effect: `current` symlink flips to the previous build. Assets are hashed, so no stale-cache issue. Verify `/api/health` + homepage.

### E2. Restore the database
1. Download the latest encrypted backup from GitHub Releases (`upanishad-*.sql.gz.gpg`).
2. Decrypt:
   ```bash
   gpg --batch --decrypt --passphrase "$BACKUP_ENCRYPTION_KEY" \
       upanishad-*.sql.gz.gpg > upanishad.sql.gz
   gunzip upanishad.sql.gz
   ```
3. Restore:
   ```bash
   mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < upanishad.sql
   ```
4. Verify data + `/api/health`.

### E3. Site under attack / high traffic
1. Cloudflare → Security → **Under Attack Mode** ON (temporarily).
2. Confirm WAF managed rules active; raise rate-limit severity.
3. If still degraded, verify origin load via Cloudflare analytics; contact Hostinger support for resource limits.

### E4. Deployment stuck / connection refused
1. Check `lftp`/SFTP reachability (`ping` + `curl ftp://...`).
2. Verify GitHub secrets are set and current.
3. Re-run deploy; if host blocks parallel connections, lower `mirror:parallel-transfer-count` in `deploy-atomic.sh`.

---

## F. Known shared-hosting limits (documented decisions)
- No true horizontal autoscaling — mitigated with CDN offload + fast rollback.
- Symlink availability varies — `SWAP_MODE=dir` fallback provided.
- No agents on origin — observability is out-of-band (Cloudflare + scheduled GH probes).
- MySQL is single-instance — mitigated with automated backups + monthly restore drills.
