# Kullanıcı ayarları
param(
    [string]$token
)
$username = "EnesCodes-Sync"
$repo = "tetris"
$repoDesc = "Tetris oyunu"
$localPath = "C:\EnesCodes-Sync\Oyunlar\Tetris"

if (-not $token) {
    Write-Host "Lütfen token parametresi ile çalıştırın: powershell -ExecutionPolicy Bypass -File github-otomatik.ps1 -token 'GITHUB_TOKEN'"
    exit 1
}

# GitHub API ile depo oluştur
$headers = @{
    Authorization = "token $token"
    Accept = "application/vnd.github.v3+json"
}
$body = @{
    name = $repo
    description = $repoDesc
    private = $false
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body
} catch {
    Write-Host "Depo zaten var veya oluşturulamadı. Devam ediliyor..."
}

Set-Location $localPath
git remote remove origin 2>$null
git remote add origin "https://$token@github.com/$username/$repo.git"

git add .
git commit -m "Otomatik güncelleme" 2>$null
git push -u origin master
