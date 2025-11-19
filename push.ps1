# Script de push rapide vers GitHub
# Usage: .\push.ps1 "Message de commit"

param(
    [string]$message = "Update"
)

Write-Host "🚀 Push vers GitHub..." -ForegroundColor Green

# Ajouter tous les fichiers
git add .

# Commit
git commit -m $message

# Push vers GitHub
git push origin main

Write-Host "✅ Push terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Pour déployer sur le serveur:" -ForegroundColor Cyan
Write-Host "ssh root@78.46.160.115" -ForegroundColor White
Write-Host "./deploy.sh" -ForegroundColor White
