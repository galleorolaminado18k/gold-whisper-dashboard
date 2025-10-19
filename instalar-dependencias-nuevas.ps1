# =============================================================================
# SCRIPT DE INSTALACIÓN - Dependencias de NUEVO-CURSOR
# =============================================================================
# Este script instala todas las dependencias necesarias para la migración
# =============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTALACIÓN DE DEPENDENCIAS NUEVAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: No se encontró package.json" -ForegroundColor Red
    Write-Host "Por favor ejecuta este script desde la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Directorio correcto detectado" -ForegroundColor Green
Write-Host ""

# Lista de dependencias a instalar
$dependencies = @(
    "axios",
    "chart.js",
    "react-chartjs-2",
    "leaflet",
    "react-leaflet",
    "uuid"
)

$devDependencies = @(
    "@types/leaflet",
    "@types/uuid"
)

Write-Host "📦 Instalando dependencias principales..." -ForegroundColor Cyan
Write-Host ""

foreach ($dep in $dependencies) {
    Write-Host "  → Instalando $dep..." -ForegroundColor Yellow
    npm install $dep
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ $dep instalado correctamente" -ForegroundColor Green
    } else {
        Write-Host "    ❌ Error instalando $dep" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔧 Instalando dependencias de desarrollo..." -ForegroundColor Cyan
Write-Host ""

foreach ($dep in $devDependencies) {
    Write-Host "  → Instalando $dep..." -ForegroundColor Yellow
    npm install --save-dev $dep
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ $dep instalado correctamente" -ForegroundColor Green
    } else {
        Write-Host "    ❌ Error instalando $dep" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ INSTALACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dependencias instaladas:" -ForegroundColor Yellow
Write-Host "  • axios - Para llamadas HTTP a MiPaquete" -ForegroundColor White
Write-Host "  • chart.js - Gráficos avanzados" -ForegroundColor White
Write-Host "  • react-chartjs-2 - Wrapper de Chart.js" -ForegroundColor White
Write-Host "  • leaflet - Mapas interactivos" -ForegroundColor White
Write-Host "  • react-leaflet - Wrapper de Leaflet" -ForegroundColor White
Write-Host "  • uuid - Generación de IDs únicos" -ForegroundColor White
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Crea tu archivo .env.local basado en .env.local.example" -ForegroundColor Yellow
Write-Host "  2. Configura todas las variables de entorno" -ForegroundColor Yellow
Write-Host "  3. Sigue el PLAN_MIGRACION.md paso a paso" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 ¡Listo para comenzar la migración!" -ForegroundColor Green
Write-Host ""

