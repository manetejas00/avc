#!/usr/bin/env bash
# ==============================================================================
# AVC Dhanam Solutions - Pre-Migration Backup Script
# Target: Hostinger SSH / Linux Server Environment
# ==============================================================================
set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_ROOT="${HOME}/backups/pre_migration_${TIMESTAMP}"
SITE_DIR="${HOME}/domains/test1.avinyacarefoundation.org"
PUBLIC_DIR="${SITE_DIR}/public_html"

echo "========================================================"
echo "Starting Pre-Migration Backup: ${TIMESTAMP}"
echo "Backup destination: ${BACKUP_ROOT}"
echo "========================================================"

mkdir -p "${BACKUP_ROOT}/files"
mkdir -p "${BACKUP_ROOT}/database"
mkdir -p "${BACKUP_ROOT}/configs"

# 1. Back up environment & configuration files
echo "[1/5] Backing up environment and server configurations..."
if [ -f "${SITE_DIR}/.env" ]; then
    cp -p "${SITE_DIR}/.env" "${BACKUP_ROOT}/configs/.env.backup"
fi
if [ -f "${SITE_DIR}/.env.production" ]; then
    cp -p "${SITE_DIR}/.env.production" "${BACKUP_ROOT}/configs/.env.production.backup"
fi
if [ -f "${PUBLIC_DIR}/.htaccess" ]; then
    cp -p "${PUBLIC_DIR}/.htaccess" "${BACKUP_ROOT}/configs/.htaccess.public.backup"
fi
if [ -f "${SITE_DIR}/.htaccess" ]; then
    cp -p "${SITE_DIR}/.htaccess" "${BACKUP_ROOT}/configs/.htaccess.root.backup"
fi

# 2. Back up SQLite Database (ensuring WAL consistency)
echo "[2/5] Backing up SQLite database..."
if [ -f "${SITE_DIR}/data/avc.sqlite" ]; then
    if command -v sqlite3 &> /dev/null; then
        sqlite3 "${SITE_DIR}/data/avc.sqlite" ".backup '${BACKUP_ROOT}/database/avc.sqlite'"
        sqlite3 "${SITE_DIR}/data/avc.sqlite" ".dump" > "${BACKUP_ROOT}/database/avc_dump.sql"
    else
        cp -p "${SITE_DIR}/data/avc.sqlite" "${BACKUP_ROOT}/database/"
        [ -f "${SITE_DIR}/data/avc.sqlite-wal" ] && cp -p "${SITE_DIR}/data/avc.sqlite-wal" "${BACKUP_ROOT}/database/"
        [ -f "${SITE_DIR}/data/avc.sqlite-shm" ] && cp -p "${SITE_DIR}/data/avc.sqlite-shm" "${BACKUP_ROOT}/database/"
    fi
    echo "SQLite database safely backed up."
fi

# 3. Export MySQL database (if MySQL is configured in .env)
echo "[3/5] Checking for MySQL databases..."
if [ -n "${DB_DATABASE:-}" ] && [ -n "${DB_USERNAME:-}" ]; then
    echo "Found MySQL configuration for database: ${DB_DATABASE}"
    mysqldump -u "${DB_USERNAME}" -p"${DB_PASSWORD:-}" "${DB_DATABASE}" > "${BACKUP_ROOT}/database/mysql_${DB_DATABASE}_${TIMESTAMP}.sql"
    echo "MySQL database exported successfully."
else
    echo "No direct MySQL environment variables detected. If Hostinger MySQL was used, export via phpMyAdmin or hPanel -> Databases."
fi

# 4. Create compressed archive of all website files
echo "[4/5] Archiving website files, public_html, and storage..."
if [ -d "${PUBLIC_DIR}" ]; then
    tar --exclude='node_modules' --exclude='.git' -czf "${BACKUP_ROOT}/files/site_files_${TIMESTAMP}.tar.gz" -C "${SITE_DIR}" .
    echo "Files archived to: ${BACKUP_ROOT}/files/site_files_${TIMESTAMP}.tar.gz"
fi

# 5. Verify backup integrity
echo "[5/5] Verifying backup integrity..."
cd "${BACKUP_ROOT}"
find . -type f -exec ls -lh {} +
sha256sum $(find . -type f) > "${BACKUP_ROOT}/checksums.sha256"

echo "========================================================"
echo "Backup completed successfully!"
echo "Backup Directory: ${BACKUP_ROOT}"
echo "Checksums saved to: ${BACKUP_ROOT}/checksums.sha256"
echo "========================================================"
