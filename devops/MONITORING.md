# Monitoring & Logging Strategy

Shared hosting limits us to out-of-band observability (we can't run Prometheus/Grafana agents on the origin). We compose a **multi-source, pull-based + scheduled** observability stack with zero agents on the host.

---

## 1. Layers of Observability

| Layer | Tool | What it captures | Frequency |
|:---|:---|:---|:---|
| Edge (users) | **Cloudflare Web Analytics** | Page views, visits, referrers, country, device — privacy-friendly, no cookie banner | Real-time dashboard |
| Edge (availability) | **Cloudflare Analytics** + **UptimeRobot** | Origin uptime, status-code distribution, cache hit ratio, bandwidth | 30s–5min |
| Edge (security) | **Cloudflare WAF / Firewall analytics** | Blocked threats (SQLi/XSS/bot), rate-limit events | Real-time |
| Edge (performance) | **Cloudflare Speed/Performance** | TTFB, cache hit ratio, Brotli/HTTP3 adoption | Real-time |
| Application | **Structured logs** (see below) | API errors, slow requests, auth failures, DB errors | On event |
| Database | **Scheduled GH Action health probe** | `SHOW STATUS`, table sizes, slow-query indicators, disk | Every 5 min (health) + daily |
| Synthetic | **GH Actions health.yml** | `GET /api/health`, `GET /` status codes | Every 5 min |

---

## 2. Application Logging

Add a lightweight, **structured** log layer to the PHP backend (`index.php`) that writes JSON lines to a log file under `shared/logs/` (persisted across deploys) and optionally emits them to a sink:

```php
function log_event(string $level, string $event, array $ctx = []): void {
    $dir = __DIR__ . '/shared/logs';
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    $line = json_encode([
        'ts'    => date('c'),
        'level' => $level,
        'event' => $event,
        'ctx'   => $ctx,
    ], JSON_UNESCAPED_SLASHES);
    @file_put_contents($dir . '/app.log', $line . "\n", FILE_APPEND);
}
```

Log key events:
- `admin.login.fail` / `admin.login.success` (include username, IP)
- `upload.error` / `upload.success` (filename, size)
- `db.error` (without credentials)
- `api.5xx` (endpoint, status)

**Log hygiene:** never log passwords, tokens, or full credit/PII. Mask IPs if required.

### Log shipping
- Cloudflare **Logpush** (paid) can ship edge logs to S3/Cloudflare R2 for retention + querying.
- For origin app logs, a scheduled GH Action can pull the `app.log` via SFTP and archive it to GitHub Releases / R2 daily (combine with the backup job).
- **Search/alerting**: use Cloudflare dashboard + a GitHub issue (via `health.yml`) as the alert channel, or hook the log-archive action into an issue/notification if a pattern (e.g., many `login.fail`) appears.

---

## 3. Alerting Rules

| Alert | Condition | Channel |
|:---|:---|:---|
| Site down | UptimeRobot / health probe != 200 × 3 | Email/SMS (UptimeRobot), GitHub issue |
| Origin 5xx spike | Cloudflare analytics 5xx rate > threshold | Email/Webhook |
| Login brute-force | >10 failed `admin.login` in 5 min | GitHub issue + email |
| Cache hit ratio drop | CDN hit ratio < 80% | Dashboard review |
| Backup failure | backup.yml job fails | GitHub notification |

---

## 4. Service Level Targets (SLOs)

| Metric | Target |
|:---|:---|
| Availability | ≥ 99.5% monthly |
| Homepage load (TTFB, edge) | ≤ 200ms |
| Homepage load (origin TTFB) | ≤ 500ms |
| API error rate (5xx) | ≤ 0.1% |
| Backup success | 100% (restore tested monthly) |

---

## 5. Reliability & Scaling on Shared Hosting

Because shared hosting has no autoscaling, "scale" = **offload + cache**:

1. **Cloudflare edge caching** — serve `assets/*` (immutable, 1-year) and `uploads/*` from the edge. This absorbs the overwhelming majority of repeat traffic with zero origin cost.
2. **Static-vs-dynamic split** — only `/api/*` write endpoints and admin reach the PHP origin; public read endpoints may be CDN-cached with short TTLs (ETag already implemented in `index.php` via `json_response_cached`).
3. **DB connection reuse** — `getDatabaseConnection()` uses a static singleton (already done) → no per-request connect churn.
4. **Query optimization** — composite indexes already added in `autoInitDatabase`; keep `EXPLAIN` in the review loop.
5. **Brotli/gzip at edge** — enabled by default in Cloudflare; origin also sends gzip via Apache.

### Failover / availability
- **MySQL**: Hostinger-managed; enable their automated daily backups in hPanel (in addition to our encrypted GH backups). Restore runbook below.
- **No hot-standby origin** on shared hosting — mitigate via CDN edge + fast rollback + quick DB restore rather than multi-region failover.

---

## 6. Incident Response

1. **Detect** — UptimeRobot / health.yml / Cloudflare alerts fire.
2. **Assess** — check `/api/health`, Cloudflare analytics, app.log.
3. **Mitigate**:
   - Frontend-only issue → rollback `current` symlink to previous release (seconds).
   - API/DB issue → check `app.log`, verify DB connectivity, restore latest backup if corrupted.
   - Under attack → enable Cloudflare "Under Attack" mode / tighten WAF rules.
4. **Recover** — re-deploy fixed build via CI; verify health.
5. **Postmortem** — record in a `runbooks/` doc; update SLOs/alert thresholds.

See `CHECKLIST.md` for the go-live checklist and `RUNBOOKS.md` for restore procedures.
