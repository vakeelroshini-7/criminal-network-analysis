$ErrorActionPreference = 'Stop'
$appPage = Join-Path $PSScriptRoot 'index.html'

if (-not (Test-Path -LiteralPath $appPage)) {
    Write-Host 'TRACE app page was not found.' -ForegroundColor Red
    exit 1
}

Write-Host ''
Write-Host '  TRACE | Network Intelligence Workspace' -ForegroundColor Cyan
Write-Host '  Local demo with synthetic data only.' -ForegroundColor DarkGray
Write-Host ''
Write-Host 'Opening the app in your default browser...' -ForegroundColor Green
Start-Process $appPage
