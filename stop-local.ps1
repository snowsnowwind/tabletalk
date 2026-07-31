$ErrorActionPreference = "Stop"

Write-Host "Stop TableTalk local services" -ForegroundColor Cyan

foreach ($port in 3000, 8570) {
    $connections = @(
        Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    )

    if (-not $connections) {
        Write-Host "[Port $port] No running service."
        continue
    }

    foreach ($connection in $connections) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        if (-not $process) {
            continue
        }

        if ($process.ProcessName -notin "node", "python") {
            Write-Host (
                "[Port $port] Used by $($process.ProcessName). Skipped for safety."
            ) -ForegroundColor Yellow
            continue
        }

        Stop-Process -Id $process.Id
        Write-Host "[Port $port] Stopped $($process.ProcessName) (PID $($process.Id))." -ForegroundColor Green
    }
}
