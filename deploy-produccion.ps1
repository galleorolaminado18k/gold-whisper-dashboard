# =============================================================================
# SCRIPT DE DESPLIEGUE A PRODUCCIÓN
# Dashboard: https://dashboard.galle18k.com/
# =============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE A PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "  dashboard.galle18k.com" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: No se encontró package.json" -ForegroundColor Red
    Write-Host "Ejecuta este script desde la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Directorio correcto" -ForegroundColor Green
Write-Host ""

# Opción de despliegue
Write-Host "¿Cómo quieres desplegar?" -ForegroundColor Cyan
Write-Host "1. Vercel (Recomendado - Rápido y automático)" -ForegroundColor White
Write-Host "2. Netlify (Alternativa rápida)" -ForegroundColor White
Write-Host "3. Build manual (para subir a Hostinger/VPS)" -ForegroundColor White
Write-Host "4. Cancelar" -ForegroundColor Gray
Write-Host ""

$option = Read-Host "Selecciona una opción (1-4)"

switch ($option) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Desplegando a Vercel..." -ForegroundColor Cyan
        Write-Host ""
        
        # Verificar si Vercel CLI está instalado
        $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
        
        if (-not $vercelInstalled) {
            Write-Host "⚠️  Vercel CLI no está instalado" -ForegroundColor Yellow
            Write-Host "Instalando Vercel CLI..." -ForegroundColor Cyan
            npm i -g vercel
        }
        
        Write-Host "✅ Vercel CLI listo" -ForegroundColor Green
        Write-Host ""
        Write-Host "📦 Desplegando a producción..." -ForegroundColor Cyan
        Write-Host ""
        
        vercel --prod
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  ✅ DEPLOY COMPLETADO" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🌐 Configura tu dominio en Vercel Dashboard:" -ForegroundColor Yellow
        Write-Host "   1. Ve a https://vercel.com/dashboard" -ForegroundColor White
        Write-Host "   2. Selecciona tu proyecto" -ForegroundColor White
        Write-Host "   3. Settings → Domains" -ForegroundColor White
        Write-Host "   4. Agrega: dashboard.galle18k.com" -ForegroundColor White
        Write-Host ""
    }
    
    "2" {
        Write-Host ""
        Write-Host "🚀 Desplegando a Netlify..." -ForegroundColor Cyan
        Write-Host ""
        
        # Verificar si Netlify CLI está instalado
        $netlifyInstalled = Get-Command netlify -ErrorAction SilentlyContinue
        
        if (-not $netlifyInstalled) {
            Write-Host "⚠️  Netlify CLI no está instalado" -ForegroundColor Yellow
            Write-Host "Instalando Netlify CLI..." -ForegroundColor Cyan
            npm i -g netlify-cli
        }
        
        Write-Host "✅ Netlify CLI listo" -ForegroundColor Green
        Write-Host ""
        Write-Host "📦 Desplegando a producción..." -ForegroundColor Cyan
        Write-Host ""
        
        netlify deploy --prod
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  ✅ DEPLOY COMPLETADO" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
    }
    
    "3" {
        Write-Host ""
        Write-Host "📦 Haciendo build de producción..." -ForegroundColor Cyan
        Write-Host ""
        
        npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "  ✅ BUILD COMPLETADO" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "📁 Archivos de producción en:" -ForegroundColor Yellow
            Write-Host "   .next/" -ForegroundColor White
            Write-Host ""
            Write-Host "📤 Próximos pasos:" -ForegroundColor Cyan
            Write-Host "   1. Sube la carpeta .next/ a tu servidor" -ForegroundColor White
            Write-Host "   2. Sube package.json y package-lock.json" -ForegroundColor White
            Write-Host "   3. En el servidor ejecuta: npm install --production" -ForegroundColor White
            Write-Host "   4. Inicia con: npm start" -ForegroundColor White
            Write-Host ""
            Write-Host "O usa el script de Hostinger:" -ForegroundColor Yellow
            Write-Host "   .\desplegar-hostinger-automatico.ps1" -ForegroundColor White
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "❌ ERROR en el build" -ForegroundColor Red
            Write-Host "Revisa los errores arriba" -ForegroundColor Yellow
            Write-Host ""
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "❌ Despliegue cancelado" -ForegroundColor Yellow
        Write-Host ""
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Opción inválida" -ForegroundColor Red
        Write-Host ""
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 ¡Listo!" -ForegroundColor Green
Write-Host ""

