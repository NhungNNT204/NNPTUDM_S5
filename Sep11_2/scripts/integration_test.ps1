# Integration test for posts: create -> soft-delete -> restore
# Usage: run from project root in PowerShell

$port = 3000
$base = "http://localhost:$port"
$db = Join-Path (Get-Location) 'db.json'

# Start json-server if not already running
$check = $false
try {
    $resp = Invoke-WebRequest -Uri "$base/posts" -UseBasicParsing -Method Head -ErrorAction Stop
    $check = $true
} catch {
    $check = $false
}

if (-not $check) {
    Write-Host "Starting json-server..."
    $npm = Get-Command json-server -ErrorAction SilentlyContinue
    if (-not $npm) {
        Write-Host "json-server not found. Please install globally with: npm install -g json-server"
        exit 1
    }
    $startInfo = Start-Process -FilePath json-server -ArgumentList "--watch", "$db", "--port", "$port" -PassThru
    Start-Sleep -Seconds 1
}

function Wait-Server {
    param($url, $timeoutSeconds=10)
    $start = Get-Date
    while ((Get-Date) - $start).TotalSeconds -lt $timeoutSeconds) {
        try {
            Invoke-WebRequest -Uri $url -UseBasicParsing -Method Head -TimeoutSec 2 | Out-Null
            return $true
        } catch {
            Start-Sleep -Milliseconds 200
        }
    }
    return $false
}

if (-not (Wait-Server "$base/posts" 10)) {
    Write-Host "Server did not respond in time"
    exit 1
}

# 1) Create new post (no id)
$payload = @{ title = "int-test"; views = 1; isDelete = $false } | ConvertTo-Json
$create = Invoke-RestMethod -Uri "$base/posts" -Method Post -Body $payload -ContentType 'application/json'
Write-Host "Created:" $create

# 2) Confirm exists
$all = Invoke-RestMethod -Uri "$base/posts" -Method Get
$found = $all | Where-Object { $_.title -eq 'int-test' }
if (-not $found) { Write-Host "Create failed"; exit 1 }

# 3) Soft-delete
$id = $found.id
$found.isDelete = $true
Invoke-RestMethod -Uri "$base/posts/$id" -Method Put -Body ($found | ConvertTo-Json) -ContentType 'application/json'
Write-Host "Soft-deleted id=$id"

# 4) Confirm moved to trash
$all = Invoke-RestMethod -Uri "$base/posts" -Method Get
$trash = $all | Where-Object { $_.id -eq $id -and $_.isDelete -eq $true }
if (-not $trash) { Write-Host "Delete not persisted"; exit 1 }
Write-Host "Confirmed in trash"

# 5) Restore
$trash.isDelete = $false
Invoke-RestMethod -Uri "$base/posts/$id" -Method Put -Body ($trash | ConvertTo-Json) -ContentType 'application/json'
Write-Host "Restored id=$id"

# 6) Confirm restored
$all = Invoke-RestMethod -Uri "$base/posts" -Method Get
$restored = $all | Where-Object { $_.id -eq $id -and ($_.isDelete -eq $false -or -not $_.isDelete) }
if (-not $restored) { Write-Host "Restore failed"; exit 1 }
Write-Host "Integration test passed"

# Optionally stop json-server (not implemented)
