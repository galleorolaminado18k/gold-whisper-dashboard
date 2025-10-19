# =============================================================================
# DEPLOY A GITHUB PAGES
# https://dashboard.galle18k.com/
# =============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY A GITHUB PAGES" -ForegroundColor Cyan
Write-Host "  dashboard.galle18k.com" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Git
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitInstalled) {
    Write-Host "❌ Git no está instalado" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git detectado" -ForegroundColor Green
Write-Host ""

# Verificar cambios
Write-Host "📊 Verificando estado del repositorio..." -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "¿Hacer deploy a GitHub Pages?" -ForegroundColor Yellow
Write-Host "Esto hará push a la rama gh-pages" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Confirmar (s/n)"

if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Deploy cancelado" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "📦 Paso 1: Haciendo build..." -ForegroundColor Cyan
Write-Host ""

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build completado" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Paso 2: Preparando commit..." -ForegroundColor Cyan
Write-Host ""

# Agregar cambios
git add .

# Commit
$commitMsg = Read-Host "Mensaje del commit (Enter para default)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "deploy: actualizar dashboard $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

git commit -m "$commitMsg"

Write-Host ""
Write-Host "🚀 Paso 3: Desplegando a GitHub Pages..." -ForegroundColor Cyan
Write-Host ""

# Push a gh-pages
git push origin main:gh-pages

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  ✅ DEPLOY EXITOSO" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌐 Tu sitio estará disponible en:" -ForegroundColor Yellow
    Write-Host "   https://dashboard.galle18k.com/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⏱️  El deploy puede tardar 2-3 minutos" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Verifica el progreso en:" -ForegroundColor Yellow
    Write-Host "   https://github.com/galleorolaminado18k/gold-whisper-dashboard/actions" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Error en el deploy" -ForegroundColor Red
    Write-Host "Verifica tu configuración de Git" -ForegroundColor Yellow
    Write-Host ""
}

