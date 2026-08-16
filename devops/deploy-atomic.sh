#!/usr/bin/env bash
#
# deploy-atomic.sh — Zero-downtime atomic deploy to Hostinger shared hosting.
#
# Strategy:
#   1. Upload the build to a NEW versioned release directory:
#        <REMOTE_DIR>/releases/<RELEASE_LABEL>/
#   2. Point `current` symlink at the new release (atomic `ln -sfn`).
#   3. On failure OR if ROLLBACK_TO is set, flip `current` to a previous release.
#
# Persisted separately (never re-deployed):
#   <REMOTE_DIR>/shared/uploads/   — user uploads
#   <REMOTE_DIR>/shared/config/    — runtime env (no secrets in git)
#
# NOTE: If the web server cannot follow symlinks (no FollowSymLinks on shared
# hosting), set SWAP_MODE=dir to upload into `current/` and atomically rename
# the old directory out and the new one in. See docs/ARCHITECTURE.md.

set -euo pipefail

# ---- Config (override via env; used by CI) ----
SFTP_HOST="${SFTP_HOST:?SFTP_HOST is required}"
SFTP_USER="${SFTP_USER:?SFTP_USER is required}"
SFTP_PASS="${SFTP_PASS:?SFTP_PASS is required}"
REMOTE_DIR="${REMOTE_DIR:-public_html}"
ROLLBACK_TO="${ROLLBACK_TO:-}"           # e.g. 2026-08-16T11-00-00Z
SWAP_MODE="${SWAP_MODE:-symlink}"        # symlink | dir
LOCAL_PKG="${LOCAL_PKG:-deploy_pkg}"
RELEASE_LABEL="${RELEASE_LABEL:-$(date -u +%Y-%m-%dT%H-%M-%SZ)}"

command -v lftp >/dev/null 2>&1 || { echo "ERROR: lftp is required. Install it or use sshpass."; exit 1; }

REMOTE_RELEASES="$REMOTE_DIR/releases"
REMOTE_CURRENT="$REMOTE_DIR/current"

echo "=== Atomic Deploy ==="
echo "  Host:     $SFTP_HOST"
echo "  Remote:   $REMOTE_DIR"
echo "  Release:  $RELEASE_LABEL"
echo "  Mode:     $SWAP_MODE"

# ---- 1. Ensure remote layout ----
lftp -u "$SFTP_USER","$SFTP_PASS" "$SFTP_HOST" <<EOF
set ssl:verify-certificate no
mkdir -p "$REMOTE_RELEASES"
mkdir -p "$REMOTE_DIR/shared/uploads"
mkdir -p "$REMOTE_DIR/shared/config"
EOF

# ---- 2. Rollback path ----
if [ -n "$ROLLBACK_TO" ]; then
  echo ">>> ROLLBACK to release: $ROLLBACK_TO"
  lftp -u "$SFTP_USER","$SFTP_PASS" "$SFTP_HOST" <<EOF
set ssl:verify-certificate no
cd "$REMOTE_RELEASES/$ROLLBACK_TO"
pwd
EOF
  # flip symlink (or dir rename) to previous release
  if [ "$SWAP_MODE" = "symlink" ]; then
    lftp -u "$SFTP_USER","$SFTP_PASS" "$SFTP_HOST" <<EOF
set ssl:verify-certificate no
cd "$REMOTE_DIR"
rm -f current
symlink "$REMOTE_RELEASES/$ROLLBACK_TO" current
EOF
  else
    lftp -u "$SFTP_USER","$SFTP_PASS" "$SFTP_HOST" <<EOF
set ssl:verify-certificate no
cd "$REMOTE_DIR"
rm -rf current_old
mv current current_old
mv "$REMOTE_RELEASES/$ROLLBACK_TO" current
rm -rf current_old
EOF
  fi
  echo ">>> Rollback complete."
  exit 0
fi

# ---- 3. Upload new release (mirror = delete remote-only files, exact copy) ----
echo ">>> Uploading release to $REMOTE_RELEASES/$RELEASE_LABEL/"
lftp -u "$SFTP_USER","$SFTP_PASS" "$SFTP_HOST" <<EOF
set ssl:verify-certificate no
set mirror:use-pget-min 1
set mirror:parallel-transfer-count 4
mkdir -p "$REMOTE_RELEASES/$RELEASE_LABEL"
mirror -R -vv --delete "$LOCAL_PKG" "$REMOTE_RELEASES/$RELEASE_LABEL"
EOF

# Link persistent shared assets into the release so uploads/env survive
lftp -u "$SFTP_USER","$SFTP_PASS" "$SFTP_HOST" <<EOF
set ssl:verify-certificate no
cd "$REMOTE_RELEASES/$RELEASE_LABEL"
rm -f uploads
symlink "$REMOTE_DIR/shared/uploads" uploads
cd "$REMOTE_DIR"
rm -f config
symlink "$REMOTE_DIR/shared/config" config
EOF

# ---- 4. Atomic switch of `current` ----
echo ">>> Switching current -> $RELEASE_LABEL"
if [ "$SWAP_MODE" = "symlink" ]; then
  lftp -u "$SFTP_USER","$SFTP_PASS" "$SFTP_HOST" <<EOF
set ssl:verify-certificate no
cd "$REMOTE_DIR"
rm -f current
symlink "$REMOTE_RELEASES/$RELEASE_LABEL" current
EOF
else
  lftp -u "$SFTP_USER","$SFTP_PASS" "$SFTP_HOST" <<EOF
set ssl:verify-certificate no
cd "$REMOTE_DIR"
rm -rf current_old
mv current current_old 2>/dev/null || true
mv "$REMOTE_RELEASES/$RELEASE_LABEL" current
rm -rf current_old
EOF
fi

echo ">>> Deploy complete. current -> $RELEASE_LABEL"
