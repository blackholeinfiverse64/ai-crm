Write-Host "Starting Blackhole EMS Backend Server..." -ForegroundColor Cyan
Set-Location $PSScriptRoot
node index.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nServer exited with code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Press any key to close..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
