#!/bin/bash
# One-time setup of the deploy hook on the web server. Run it on the server, as a user with sudo.
# It needs deploy/update-site.sh in the same directory.
#
#   scp deploy/update-site.sh deploy/setup-webhook.sh staffan@ludo.tomtebo.org:/tmp/
#   ssh -t staffan@ludo.tomtebo.org 'bash /tmp/setup-webhook.sh'
#
# The hook `update-phoropter` in /etc/webhook.conf and the GitHub webhook that calls it
# are from the old site. This script only replaces the command that the hook runs.
set -euo pipefail

HERE=$(cd "$(dirname "$0")" && pwd)

sudo install -m 755 "$HERE/update-site.sh" /var/www/update-phoropter.sh
sudo sed -i 's|"/var/www/phoropter.dev"|"/var/www/phoropter.org"|' /etc/webhook.conf
sudo systemctl restart webhook

echo "Done. A push to the main branch on GitHub now deploys the site."
