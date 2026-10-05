#!/bin/bash
# Run by the `update-phoropter` hook in /etc/webhook.conf on each push to GitHub.
# Copies the `deploy` branch (the build output from .github/workflows/deploy.yml)
# to the web root. Installed as /var/www/update-phoropter.sh by deploy/setup-webhook.sh.
set -euo pipefail

REPO=https://github.com/staffanm/code-phoropter.git
CLONE=/home/staffan/.cache/phoropter-deploy
ROOT=/var/www/phoropter.org

mkdir -p "$CLONE"
cd "$CLONE"

# The hook runs for a push to any branch, and two runs can overlap
exec 9>"$CLONE.lock"
flock 9

git init -q
git fetch -q --depth 1 "$REPO" deploy
git reset -q --hard FETCH_HEAD

# The font files are not in the build output. `npm run fonts:push` copies them.
rsync -r --delete --exclude /.git/ --exclude /fonts/ ./ "$ROOT/"
echo "$(date): Updated phoropter.org to $(git log -1 --format=%s)" >> /var/log/webhook-updates.log
