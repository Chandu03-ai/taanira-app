function Write-Info($msg) {
    Write-Host "`n[INFO] $msg" -ForegroundColor Cyan
}

function Write-ErrorAndExit($msg) {
    Write-Host "`n[ERROR] $msg" -ForegroundColor Red
    exit 1
}

# Ask user for registry info once
$registryHost = Read-Host "Enter the registry host IP (default: 192.168.0.189)"
if ([string]::IsNullOrWhiteSpace($registryHost)) {
    $registryHost = "192.168.0.189"
}

$registryPortInput = Read-Host "Enter the registry port (default: 5000)"
if ([string]::IsNullOrWhiteSpace($registryPortInput)) {
    $registryPort = 5000
}
else {
    $registryPort = [int]$registryPortInput
}

# Step 1: Check if registry is running
Write-Info "Checking if Docker registry is running at ${registryHost}:${registryPort}..."
$registryUrl = "http://${registryHost}:${registryPort}/v2/_catalog"
try {
    $response = Invoke-WebRequest -Uri $registryUrl -UseBasicParsing -TimeoutSec 5
    Write-Info "Registry is already running. Status: $($response.StatusCode)"
}
catch {
    Write-Info "Registry is not reachable. Starting local Docker registry..."
    docker run -d -p ${registryPort}:5000 --restart always --name registry registry:2 | Out-Null
    Start-Sleep -Seconds 3

    # Recheck after 3 seconds
    Write-Info "Rechecking registry status..."
    try {
        $response = Invoke-WebRequest -Uri $registryUrl -UseBasicParsing -TimeoutSec 5
        Write-Info "Registry started successfully."
    }
    catch {
        Write-ErrorAndExit "Failed to start Docker registry at ${registryHost}:${registryPort}"
    }
}

# Get current script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$envFilePath = Join-Path $scriptDir ".env"

# --- Run API deployment ---
Write-Info "Starting API image build and push..."
$apiScript = Join-Path $scriptDir 'Build-And-Push-ApiImage.ps1'
if (Test-Path $apiScript) {
    & $apiScript -registryHost $registryHost -registryPort $registryPort -registryAlreadyChecked $true
}
else {
    Write-ErrorAndExit "API deployment script not found: $apiScript"
}

# --- Run UI deployment ---
Write-Info "Starting UI image build and push..."
$uiScript = Join-Path $scriptDir 'Build-And-Push-UiImage.ps1'
if (Test-Path $uiScript) {
    & $uiScript -registryHost $registryHost -registryPort $registryPort -registryAlreadyChecked $true
}
else {
    Write-ErrorAndExit "UI deployment script not found: $uiScript"
}

# --- Check if .env file exists before running containers ---
if (-not (Test-Path $envFilePath)) {
    Write-ErrorAndExit ".env file not found at: $envFilePath. Skipping local container run."
}

