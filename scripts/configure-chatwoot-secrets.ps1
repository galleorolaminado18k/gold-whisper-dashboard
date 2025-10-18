Param(
  [string]$Repo = "",
  [string]$AppName = "gold-whisper-api",
  [string]$Region = "dfw"
)

Write-Host "Configurar secretos de GitHub para Chatwoot y Bridge" -ForegroundColor Cyan

# Verificar gh CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "No se encontró GitHub CLI (gh). Instálalo desde https://cli.github.com/ y ejecuta 'gh auth login'."
  exit 1
}

# Resolver repo si no se pasó
if (-not $Repo) {
  try {
    $origin = git config --get remote.origin.url
    if ($origin -match "github.com[:/](.+?)/(.+?)(?:\.git)?$") {
      $Repo = "$($Matches[1])/$($Matches[2])"
    }
  } catch {}
}
if (-not $Repo) {
  Write-Host "No se pudo detectar el repo. Ingresa owner/repo (ej: galleorolaminado18k/gold-whisper-dashboard):" -ForegroundColor Yellow
  $Repo = Read-Host "Repo"
}

Write-Host "Usando repo: $Repo" -ForegroundColor Green

# Pedir valores
$ChatwootUrl = Read-Host "CHATWOOT_URL (default: https://app.chatwoot.com)"
if (-not $ChatwootUrl) { $ChatwootUrl = "https://app.chatwoot.com" }
$CwApiToken = Read-Host "CHATWOOT_API_TOKEN (token de API de Chatwoot)"
$CwAccountId = Read-Host "CHATWOOT_ACCOUNT_ID (ej: 138167)"
$WebsiteToken = Read-Host "VITE_CHATWOOT_WEBSITE_TOKEN (Website token del Inbox)"
$FrontendUrl = Read-Host "FRONTEND_URL (default: https://dashboard.galle18k.com)"
if (-not $FrontendUrl) { $FrontendUrl = "https://dashboard.galle18k.com" }
$Allowed = Read-Host "ALLOWED_ORIGINS (default: https://dashboard.galle18k.com)"
if (-not $Allowed) { $Allowed = "https://dashboard.galle18k.com" }
$FlyApiToken = Read-Host "FLY_API_TOKEN (token de Fly.io)"

if (-not $CwApiToken -or -not $CwAccountId -or -not $WebsiteToken -or -not $FlyApiToken) {
  Write-Error "Faltan valores obligatorios. Vuelve a ejecutar el script."
  exit 1
}

Write-Host "Estableciendo secrets en GitHub…" -ForegroundColor Cyan

function Set-Secret([string]$Name, [string]$Value) {
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
  $base64 = [Convert]::ToBase64String($bytes)
  # Evitar eco en consola del valor crudo
  [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($base64)) | gh secret set $Name -R $Repo | Out-Null
}

# Frontend secrets
Set-Secret -Name "VITE_CHATWOOT_ENABLED" -Value "true"
Set-Secret -Name "VITE_CHATWOOT_URL" -Value $ChatwootUrl
Set-Secret -Name "VITE_CHATWOOT_WEBSITE_TOKEN" -Value $WebsiteToken
Set-Secret -Name "VITE_CHATWOOT_ACCOUNT_ID" -Value $CwAccountId

# Bridge secrets (para workflow Fly)
Set-Secret -Name "FLY_API_TOKEN" -Value $FlyApiToken
Set-Secret -Name "CHATWOOT_URL" -Value $ChatwootUrl
Set-Secret -Name "CHATWOOT_API_TOKEN" -Value $CwApiToken
Set-Secret -Name "CHATWOOT_ACCOUNT_ID" -Value $CwAccountId
Set-Secret -Name "FRONTEND_URL" -Value $FrontendUrl
Set-Secret -Name "ALLOWED_ORIGINS" -Value $Allowed

Write-Host "Secrets establecidos correctamente." -ForegroundColor Green

Write-Host "Ejecutando workflow de despliegue del Bridge (Fly.io)…" -ForegroundColor Cyan
gh workflow run "Deploy Chatwoot Bridge (Fly.io)" -R $Repo -f app_name=$AppName -f region=$Region | Out-Null

Write-Host "Listo. Revisa Actions en GitHub para ver el progreso." -ForegroundColor Green
Write-Host "Cuando termine, configura VITE_BRIDGE_API_URL = https://$AppName.fly.dev (ya puedes agregarlo con este script o manualmente)." -ForegroundColor Yellow