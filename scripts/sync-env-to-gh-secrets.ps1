# Sync .env (or provided file) VITE_* entries to GitHub Actions repository secrets using gh CLI.
# Usage: ./scripts/sync-env-to-gh-secrets.ps1 [-Path .env]
param(
  [string]$Path = ".env"
)

if (!(Test-Path -Path $Path)) {
  Write-Error "Env file not found: $Path"
  exit 1
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "GitHub CLI (gh) is not installed or not in PATH."
  exit 1
}

$lines = Get-Content -Path $Path | Where-Object { $_ -match '^\s*VITE_[A-Z0-9_]+\s*=\s*.+$' }
if ($lines.Count -eq 0) {
  Write-Warning "No VITE_* entries found in $Path. Nothing to sync."
  exit 0
}

foreach ($line in $lines) {
  # Preserve value including special characters; split only on first =
  $idx = $line.IndexOf('=')
  if ($idx -lt 1) { continue }
  $key = $line.Substring(0, $idx).Trim()
  $val = $line.Substring($idx + 1).Trim()
  if ([string]::IsNullOrWhiteSpace($key)) { continue }

  # Set or update the secret without printing the value
  Write-Host "Setting secret $key ..."
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($val)
  $stdin = New-Object System.IO.MemoryStream(,$bytes)
  $pinfo = New-Object System.Diagnostics.ProcessStartInfo
  $pinfo.FileName = "gh"
  $pinfo.Arguments = "secret set $key"
  $pinfo.RedirectStandardInput = $true
  $pinfo.RedirectStandardOutput = $true
  $pinfo.RedirectStandardError = $true
  $pinfo.UseShellExecute = $false
  $proc = New-Object System.Diagnostics.Process
  $proc.StartInfo = $pinfo
  $null = $proc.Start()
  $stdin.CopyTo($proc.StandardInput.BaseStream)
  $proc.StandardInput.Close()
  $proc.WaitForExit()
  if ($proc.ExitCode -ne 0) {
    $err = $proc.StandardError.ReadToEnd()
    Write-Error "Failed to set secret $key: $err"
    exit $proc.ExitCode
  }
}

Write-Host "Done syncing secrets from $Path"