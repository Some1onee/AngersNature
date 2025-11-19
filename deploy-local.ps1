# Script de déploiement local (Windows)
# Usage: .\deploy-local.ps1 "Message de commit"

param(
    [string]$message = "Update"
)

Write-Host "🚀 Déploiement en cours..." -ForegroundColor Green

# Vérifier qu'on est dans le bon dossier
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json non trouvé. Êtes-vous dans le bon dossier?" -ForegroundColor Red
    exit 1
}

# Git add
Write-Host "📦 Ajout des fichiers..." -ForegroundColor Yellow
git add .

# Git commit
Write-Host "💾 Commit: $message" -ForegroundColor Yellow
git commit -m $message

# Git push
Write-Host "⬆️  Push vers GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Déploiement local terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Connectez-vous à votre serveur: ssh user@votre-serveur" -ForegroundColor White
Write-Host "2. Exécutez: ./deploy-angers.sh" -ForegroundColor White
Write-Host ""
Write-Host "💡 Ou configurez le webhook pour déploiement automatique!" -ForegroundColor Cyan
