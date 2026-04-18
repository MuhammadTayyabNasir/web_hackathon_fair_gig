$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$anomalyServiceDir = Join-Path $repoRoot 'services\anomaly-service'
Set-Location $repoRoot

function Resolve-PythonExe {
  $candidates = @(
    'C:\Users\dell\AppData\Local\Programs\Python\Python310\python.exe',
    (Join-Path $repoRoot '.venv\\Scripts\\python.exe'),
    'python'
  )

  foreach ($candidate in $candidates) {
    if ($candidate -eq 'python') {
      try {
        $null = & python --version
        return 'python'
      } catch {
        continue
      }
    }
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  throw 'Python executable not found. Install Python or create .venv first.'
}

$pythonExe = Resolve-PythonExe
$anomalyProc = $null

try {
  Write-Host '[1/5] Starting Postgres (docker compose)...' -ForegroundColor Cyan
  docker compose up -d postgres | Out-Null

  Write-Host '[2/5] Ensuring anomaly-service Python deps are installed...' -ForegroundColor Cyan
  & $pythonExe -m pip install -r (Join-Path $anomalyServiceDir 'requirements.txt')

  Write-Host '[3/5] Starting anomaly-service locally on :8001...' -ForegroundColor Cyan
  $anomalyProc = Start-Process -FilePath $pythonExe -ArgumentList @('-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8001') -WorkingDirectory $anomalyServiceDir -PassThru

  $maxAttempts = 60
  $healthUrl = 'http://localhost:8001/api/v1/anomaly/health'
  $healthy = $false
  for ($i = 1; $i -le $maxAttempts; $i++) {
    try {
      $health = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 3
      if ($health.status -eq 'ok') {
        $healthy = $true
        break
      }
    } catch {
      Start-Sleep -Milliseconds 1000
    }
  }

  if (-not $healthy) {
    throw "anomaly-service did not become healthy at $healthUrl"
  }

  Write-Host '[4/5] Posting anomaly detection payload...' -ForegroundColor Cyan
  $payload = @{
    worker_id = '11111111-1111-1111-1111-111111111111'
    earnings = @(
      @{
        id = 's-001'
        date = '2026-03-02'
        platform = 'Careem'
        hours = 8.0
        gross = 2400.0
        deductions = 600.0
        net = 1800.0
        shift_start = '09:00'
        shift_end = '17:00'
      },
      @{
        id = 's-002'
        date = '2026-03-10'
        platform = 'Careem'
        hours = 8.0
        gross = 2200.0
        deductions = 550.0
        net = 1650.0
        shift_start = '10:00'
        shift_end = '18:00'
      },
      @{
        id = 's-003'
        date = '2026-04-04'
        platform = 'Careem'
        hours = 10.0
        gross = 1600.0
        deductions = 400.0
        net = 1200.0
        shift_start = '09:00'
        shift_end = '17:00'
      },
      @{
        id = 's-004'
        date = '2026-04-11'
        platform = 'Careem'
        hours = 7.0
        gross = 2400.0
        deductions = 2040.0
        net = 360.0
        shift_start = '09:00'
        shift_end = '17:30'
      }
    )
    context = @{
      city = 'Lahore'
      category = 'ride_hailing'
    }
  } | ConvertTo-Json -Depth 10

  $response = Invoke-RestMethod -Uri 'http://localhost:8001/api/v1/anomaly/detect' -Method Post -ContentType 'application/json' -Body $payload

  Write-Host '[5/5] Result' -ForegroundColor Cyan
  Write-Host ("anomalies_found: {0}" -f $response.anomalies_found) -ForegroundColor Green
  Write-Host ("summary: {0}" -f $response.summary) -ForegroundColor Green

  if ($response.anomalies_found -gt 0) {
    $response.anomalies | Select-Object shift_id, type, severity, expected_value, actual_value | Format-Table -AutoSize
  }

  $response | ConvertTo-Json -Depth 10 | Out-File -FilePath (Join-Path $repoRoot 'anomaly-smoke-response.json') -Encoding utf8
  Write-Host 'Saved full response to anomaly-smoke-response.json' -ForegroundColor Yellow
}
finally {
  if ($anomalyProc -and -not $anomalyProc.HasExited) {
    Stop-Process -Id $anomalyProc.Id -Force
    Write-Host 'Stopped temporary anomaly-service process.' -ForegroundColor DarkGray
  }
}
