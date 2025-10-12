#!/usr/bin/env bash
set -euo pipefail

DOMAIN="dashboard.galle18k.com"
WEBROOT="/var/www/${DOMAIN}"
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}.conf"

echo "[+] Install certbot and nginx plugin"
if command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo apt-get install -y certbot python3-certbot-nginx nginx
elif command -v dnf >/dev/null 2>&1; then
  sudo dnf install -y certbot python3-certbot-nginx nginx
fi

echo "[+] Ensure webroot exists"
sudo mkdir -p "$WEBROOT"
sudo chown -R www-data:www-data "$WEBROOT" || true

echo "[+] Install nginx config"
if [ -f "$(pwd)/nginx-dashboard.conf" ]; then
  sudo cp "$(pwd)/nginx-dashboard.conf" "$NGINX_CONF"
fi
sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/${DOMAIN}.conf
sudo nginx -t
sudo systemctl reload nginx

echo "[+] Obtain/renew certificate for ${DOMAIN}"
sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@${DOMAIN} --redirect || true

echo "[+] Enable auto-renewal"
sudo systemctl enable --now certbot.timer || true

echo "[✓] HTTPS configured for https://${DOMAIN}"
