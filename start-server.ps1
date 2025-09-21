$projectPath = "C:\Users\gayat\OneDrive - Mahindra University\Desktop\Cardano\cardano-options-nft"

Write-Host "🚀 Starting NFT Options Trading App..." -ForegroundColor Green
Write-Host "📁 Navigating to: $projectPath" -ForegroundColor Yellow

Set-Location $projectPath

Write-Host "📦 Current directory:" -ForegroundColor Cyan
Get-Location

Write-Host "🔧 Starting development server..." -ForegroundColor Magenta
npm run dev

Write-Host "✅ Server should be running at http://localhost:3000" -ForegroundColor Green
Write-Host "Press any key to continue..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")