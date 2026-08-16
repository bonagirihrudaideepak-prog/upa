# Production Infrastructure Architecture — Upanishad Store

Target: **Hostinger shared web hosting** (existing live footprint) fronted by **Cloudflare**, driven by **GitHub Actions** CI/CD. This keeps the current PHP + MySQL + compiled-React deployment model while adding production-grade deployment, observability, backup, and reliability practices — no containerization, no horizontal scaling (not supported by shared hosting).

---

## 1. High-Level Topology

```
                         ┌──────────────────────────────┐
                         │         GITHUB (repo)        │
                         │  Source of truth + CI/CD      │
                         │  GitHub Actions runners       │
                         └──────────────┬───────────────┘
                                        │ 1) build frontend
                                        │ 2) run tests
                                        │ 3) package artifact
                                        │ 4) SFTP deploy (atomic)
                                        ▼
   Users ──► Cloudflare ──► Hostinger shared hosting (public_html)
    (TLS)      │  CDN / WAF / cache / bots / analytics      │
               │                                            ▼
               │                                   ┌─────────────────────────┐
               │                                   │  upanishadmobiles.com   │
               │                                   │  index.php (PHP API)    │
               │                                   │  index.html (React SPA) │
               │                                   │  /assets (hashed, CDN)  │
               │                                   │  /uploads               │
               │                                   │  /config                │
               │                                   └───────────┬─────────────┘
               │                                                ▼
               │                                   ┌─────────────────────────┐
               │                                   │  MySQL (Hostinger DB)   │
               │                                   │  u836516682_upa_db       │
               │                                   └─────────────────────────┘
               │
               └───────► Scheduled GitHub Action  ──► DB backup (encrypted) ──► GitHub Releases / S3
```

### Data flow
1. **Static assets** (React build) are served from `/assets/*` with immutable, long-lived cache headers and pushed to Cloudflare's edge — near-zero origin load for repeat visits.
2. **API** (`/api/*`) is handled by `index.php` (PHP/PDO, parameterized queries) and is **not** CDN-cached (or cached briefly for read-only GETs only) to preserve correctness.
3. **Uploads** (`/uploads/*`) are served from origin; Cloudflare caches them; a separate protected strategy avoids serving user uploads as executable/inline content.
4. **Admin** (`/admin/*`) is a client-side route in the SPA, gated by JWT.

---

## 2. Environment Separation

| Environment | Hosting | Purpose | DB | Deploy trigger |
|:---|:---|:---|:---|:---|
| `production` | Hostinger `public_html` | Live customer site | `u836516682_upa_db` | Manual `workflow_dispatch` or tag `v*` |
| `staging` | Hostinger `staging/` subfolder (or second hPanel site) | Pre-release verification | copy of prod (sanitized) | Push to `develop` |
| `preview` | GitHub Pages / PR build artifact | Per-PR smoke test | mock/read-only | Pull request opened |

> **Rule:** Never run schema migrations or seed writes against production from a non-production pipeline. All destructive operations require a human `approval` gate in the workflow.

---

## 3. Component Responsibilities

### 3.1 Cloudflare (front edge — free tier covers all of this)
- **DNS**: authoritative for `upanishadmobiles.com` (proxied / orange cloud).
- **TLS**: Full (strict) — terminate TLS at edge, origin uses Hostinger's free SSL.
- **CDN**: cache `assets/*` (immutable), `uploads/*`, and optionally `GET /api/*` read endpoints with short TTLs.
- **WAF**: managed rules (SQLi/XSS/bots), rate limiting rule on `/api/admin/login` and `/api/products/*/like`.
- **Bot management**: block known bad bots, challenge scrapers.
- **Analytics**: Cloudflare Web Analytics (privacy-friendly, no cookie banner needed) + analytics on key endpoints.
- **Performance**: Brotli, HTTP/3, Argo/prefetch (optional paid).

### 3.2 Hostinger shared hosting (origin)
- Serves PHP API + static SPA + uploads via Apache + `.htaccess` routing.
- MySQL database (`u836516682_upa_db`).
- **Deploy target**: `public_html` with an atomic directory-swap strategy (see `deploy-atomic.sh`).

### 3.3 GitHub (source + CI/CD + backup store)
- Repository is the single source of truth.
- GitHub Actions: build, test, package, deploy (SFTP), scheduled DB backups.
- GitHub **Secrets** hold all credentials (never commit them).
- GitHub **Releases** / attached artifacts host encrypted DB backups.

---

## 4. Deployment Directory Layout on Hostinger

Atomic, zero-downtime deploys via **versioned release directories + a symlink/`current` pointer** that Apache resolves:

```
public_html/
├── releases/
│   ├── 2026-08-16T10-30-00Z/     # immutable build (build id / git sha)
│   │   ├── index.php
│   │   ├── index.html
│   │   ├── assets/               # hashed filenames → cache-friendly
│   │   ├── uploads/              # symlink → shared uploads volume
│   │   └── config/               # symlink → shared config (env, no secrets in git)
│   └── 2026-08-16T11-00-00Z/
├── current -> releases/2026-08-16T11-00-00Z/   # symlink flipped atomically
├── shared/
│   ├── uploads/                  # persistent user uploads (never re-deployed)
│   └── config/env.php            # runtime secrets (excluded from build)
└── .htaccess                     # routes to ./current/...
```

**Why:** `ln -sfn` is atomic — the web server always resolves a valid build. `uploads/` and runtime secrets live outside the swapped directory, so they survive deploys and rollbacks. A failed deploy = flip the symlink back to the previous release.

> **Shared-hosting caveat:** Apache on Hostinger may not allow symlink dereferencing by default (requires `Options +FollowSymLinks`). If symlinks are blocked, fall back to **rsync-in-place with a swap of the whole `public_html` contents** (upload to `current/` + swap directory names) or use hPanel's staging→production publish. The pipeline supports both.

---

## 5. Key Production Properties

| Property | Implementation |
|:---|:---|
| **Zero-downtime deploys** | Atomic release-dir swap; immutable versioned builds |
| **Rollback** | Symlink flip to previous release (seconds); DB schema changes are backward-compatible |
| **Secrets management** | GitHub Secrets + Hostinger env vars + `.env` excluded from git |
| **Backups** | Scheduled GH Action: `mysqldump` → `gpg`-encrypt → upload to GH Release / S3; retention policy |
| **Observability** | Cloudflare Web Analytics + UptimeRobot + structured application logs to a central sink |
| **Scaling (as far as shared hosting allows)** | Cloudflare edge caching; split static vs dynamic caching; offload image/static delivery to CDN |
| **Security** | Cloudflare WAF + rate limiting; no secrets in repo; parameterized SQL; strict TLS |

See `CI_CD.md` for the pipeline, `MONITORING.md` for observability, and `CHECKLIST.md` for the go-live checklist.
