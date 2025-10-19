# =============================================================================
# SCRIPT DE VERIFICACIÓN - Configuración del Proyecto
# =============================================================================
# Este script verifica que todo esté configurado correctamente antes de migrar
# =============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICACIÓN DE CONFIGURACIÓN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errores = 0
$advertencias = 0

# 1. Verificar package.json
Write-Host "1️⃣  Verificando package.json..." -ForegroundColor Cyan
if (Test-Path "package.json") {
    Write-Host "   ✅ package.json encontrado" -ForegroundColor Green
} else {
    Write-Host "   ❌ package.json NO encontrado" -ForegroundColor Red
    $errores++
}
Write-Host ""

# 2. Verificar node_modules
Write-Host "2️⃣  Verificando node_modules..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules existe" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  node_modules NO existe - Ejecuta: npm install" -ForegroundColor Yellow
    $advertencias++
}
Write-Host ""

# 3. Verificar dependencias necesarias
Write-Host "3️⃣  Verificando dependencias necesarias..." -ForegroundColor Cyan
$requiredDeps = @("axios", "chart.js", "react-chartjs-2", "leaflet", "react-leaflet", "uuid")
$packageJsonContent = Get-Content "package.json" -Raw | ConvertFrom-Json

$missingDeps = @()
foreach ($dep in $requiredDeps) {
    if ($packageJsonContent.dependencies.$dep) {
        Write-Host "   ✅ $dep instalado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $dep NO instalado" -ForegroundColor Red
        $missingDeps += $dep
        $errores++
    }
}
Write-Host ""

# 4. Verificar .env.local
Write-Host "4️⃣  Verificando archivo .env.local..." -ForegroundColor Cyan
if (Test-Path ".env.local") {
    Write-Host "   ✅ .env.local encontrado" -ForegroundColor Green
    
    # Verificar variables críticas
    $envContent = Get-Content ".env.local" -Raw
    $criticalVars = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "MIPAQUETE_API_KEY",
        "XAI_API_KEY"
    )
    
    Write-Host "   Verificando variables críticas:" -ForegroundColor Yellow
    foreach ($var in $criticalVars) {
        if ($envContent -match "$var=.+") {
            Write-Host "     ✅ $var configurado" -ForegroundColor Green
        } else {
            Write-Host "     ⚠️  $var NO configurado o vacío" -ForegroundColor Yellow
            $advertencias++
        }
    }
} else {
    Write-Host "   ⚠️  .env.local NO encontrado" -ForegroundColor Yellow
    Write-Host "   Crea uno basado en .env.local.example" -ForegroundColor Yellow
    $advertencias++
}
Write-Host ""

# 5. Verificar estructura de carpetas
Write-Host "5️⃣  Verificando estructura de carpetas..." -ForegroundColor Cyan
$requiredFolders = @("app", "components", "lib", "public")
foreach ($folder in $requiredFolders) {
    if (Test-Path $folder) {
        Write-Host "   ✅ Carpeta $folder existe" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Carpeta $folder NO existe" -ForegroundColor Red
        $errores++
    }
}
Write-Host ""

# 6. Verificar Git
Write-Host "6️⃣  Verificando Git..." -ForegroundColor Cyan
if (Test-Path ".git") {
    Write-Host "   ✅ Repositorio Git inicializado" -ForegroundColor Green
    
    # Verificar rama actual
    $branch = git rev-parse --abbrev-ref HEAD 2>$null
    if ($branch) {
        Write-Host "   📍 Rama actual: $branch" -ForegroundColor Cyan
        if ($branch -eq "main" -or $branch -eq "master") {
            Write-Host "   ⚠️  Estás en la rama principal" -ForegroundColor Yellow
            Write-Host "   Considera crear una rama de migración: git checkout -b migracion-nuevo-cursor" -ForegroundColor Yellow
            $advertencias++
        }
    }
} else {
    Write-Host "   ⚠️  Git NO inicializado" -ForegroundColor Yellow
    Write-Host "   Considera inicializar: git init" -ForegroundColor Yellow
    $advertencias++
}
Write-Host ""

# 7. Verificar archivos de documentación
Write-Host "7️⃣  Verificando documentación..." -ForegroundColor Cyan
$docs = @(
    "CONFIGURACIONES_EXTRAIDAS_NUEVO_CURSOR.md",
    "PLAN_MIGRACION.md",
    ".env.local.example"
)
foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "   ✅ $doc encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $doc NO encontrado" -ForegroundColor Yellow
        $advertencias++
    }
}
Write-Host ""

# 8. Verificar Next.js
Write-Host "8️⃣  Verificando Next.js..." -ForegroundColor Cyan
if ($packageJsonContent.dependencies.next) {
    $nextVersion = $packageJsonContent.dependencies.next
    Write-Host "   ✅ Next.js instalado (versión: $nextVersion)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Next.js NO encontrado" -ForegroundColor Red
    $errores++
}
Write-Host ""

# Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errores -eq 0 -and $advertencias -eq 0) {
    Write-Host "🎉 ¡TODO PERFECTO!" -ForegroundColor Green
    Write-Host "Tu proyecto está listo para la migración." -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Lee PLAN_MIGRACION.md" -ForegroundColor Yellow
    Write-Host "  2. Crea una rama Git para la migración" -ForegroundColor Yellow
    Write-Host "  3. Comienza con la FASE 1" -ForegroundColor Yellow
} elseif ($errores -eq 0) {
    Write-Host "⚠️  HAY ADVERTENCIAS" -ForegroundColor Yellow
    Write-Host "Total de advertencias: $advertencias" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Puedes continuar, pero revisa las advertencias arriba." -ForegroundColor Yellow
} else {
    Write-Host "❌ HAY ERRORES CRÍTICOS" -ForegroundColor Red
    Write-Host "Total de errores: $errores" -ForegroundColor Red
    Write-Host "Total de advertencias: $advertencias" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Debes corregir los errores antes de continuar." -ForegroundColor Red
    Write-Host ""
    
    if ($missingDeps.Count -gt 0) {
        Write-Host "📦 Dependencias faltantes:" -ForegroundColor Yellow
        Write-Host "Ejecuta: .\instalar-dependencias-nuevas.ps1" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

