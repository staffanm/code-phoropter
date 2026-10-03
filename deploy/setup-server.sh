#!/bin/bash
# One-time setup of phoropter.org on the web server. Run it on the server, as a user with sudo.
# It needs deploy/phoropter.org.nginx in the same directory.
#
#   scp deploy/phoropter.org.nginx deploy/setup-server.sh staffan@ludo.tomtebo.org:/tmp/
#   ssh -t staffan@ludo.tomtebo.org 'bash /tmp/setup-server.sh'
#
# Then, from the repository: npm run deploy
set -euo pipefail

SITE=phoropter.org
OLD_SITE=phoropter.dev
ROOT=/var/www/$SITE
OWNER=$(id -un)
HERE=$(cd "$(dirname "$0")" && pwd)

# 1. Site directory, owned by the deploying user so that rsync needs no sudo
sudo mkdir -p "$ROOT"
sudo chown "$OWNER": "$ROOT"

# 2. Move the font files from the old site. Both directories are on the same disk, so this is a rename.
if [ -d "/var/www/$OLD_SITE/fonts" ] && [ ! -e "$ROOT/fonts" ]; then
    sudo mv "/var/www/$OLD_SITE/fonts" "$ROOT/fonts"
fi
sudo chown -R "$OWNER": "$ROOT/fonts"

# 3. Disable the old site. The domain is no longer ours, so its certificate cannot renew.
sudo rm -f "/etc/nginx/sites-enabled/$OLD_SITE"
if sudo test -d "/etc/letsencrypt/live/$OLD_SITE"; then
    sudo certbot delete --non-interactive --cert-name "$OLD_SITE"
fi

# 4. Enable the new site
sudo cp "$HERE/$SITE.nginx" "/etc/nginx/sites-available/$SITE"
sudo ln -sf "/etc/nginx/sites-available/$SITE" "/etc/nginx/sites-enabled/$SITE"
sudo nginx -t
sudo systemctl reload nginx

# 5. TLS certificate. certbot edits the nginx site and adds the HTTPS redirect.
sudo certbot --nginx -d "$SITE" -d "www.$SITE"

echo "Done. Now run 'npm run deploy' in the repository."
