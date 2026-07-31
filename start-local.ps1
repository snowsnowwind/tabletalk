$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendRoot = Join-Path $projectRoot "backend"
$logRoot = Join-Path $projectRoot "tmp"

New-Item -ItemType Directory -Path $logRoot -Force | Out-Null

function Test-ListeningPort {
    param([int]$Port)

    return [bool](
        Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
            Select-Object -First 1
    )
}

function Wait-ForUrl {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 30
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        try {
            $response = Invoke-WebRequest $Url -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                return $true
            }
        } catch {
            Start-Sleep -Milliseconds 500
        }
    } while ((Get-Date) -lt $deadline)

    return $false
}

Write-Host "TableTalk local startup" -ForegroundColor Cyan

if (Test-ListeningPort 8570) {
    Write-Host "[Backend] Port 8570 is already in use. Reusing the running service." -ForegroundColor Yellow
} else {
    Write-Host "[Backend] Starting FastAPI..."
    Start-Process `
        -FilePath "python" `
        -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8570" `
        -WorkingDirectory $backendRoot `
        -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $logRoot "backend-local.log") `
        -RedirectStandardError (Join-Path $logRoot "backend-local-error.log")
}

if (-not (Wait-ForUrl "http://127.0.0.1:8570/health")) {
    Write-Host "[Backend] Startup failed. Check tmp/backend-local-error.log." -ForegroundColor Red
    exit 1
}
Write-Host "[Backend] http://127.0.0.1:8570 is ready." -ForegroundColor Green

if (Test-ListeningPort 3000) {
    Write-Host "[Frontend] Port 3000 is already in use. Reusing the running service." -ForegroundColor Yellow
} else {
    Write-Host "[Frontend] Starting React + Vite..."
    Start-Process `
        -FilePath "npm.cmd" `
        -ArgumentList "run", "dev", "--", "--host", "127.0.0.1" `
        -WorkingDirectory $projectRoot `
        -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $logRoot "frontend-local.log") `
        -RedirectStandardError (Join-Path $logRoot "frontend-local-error.log")
}

if (-not (Wait-ForUrl "http://127.0.0.1:3000")) {
    Write-Host "[Frontend] Startup failed. Check tmp/frontend-local-error.log." -ForegroundColor Red
    exit 1
}

Write-Host "[Frontend] http://127.0.0.1:3000 is ready." -ForegroundColor Green
Write-Host ""
Write-Host "Website:  http://127.0.0.1:3000"
Write-Host "Swagger:  http://127.0.0.1:8570/docs"
Write-Host "Stop:     .\stop-local.ps1"
