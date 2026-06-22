# Auto-start launcher for TOS Tracker backend + Cloudflare tunnel.
# Run at logon via Scheduled Task or manually.
$ErrorActionPreference = 'SilentlyContinue'

# --- Node backend ---
if (-not (Get-NetTCPConnection -State Listen -LocalPort 4000 -ErrorAction SilentlyContinue)) {
    $serverDir = Resolve-Path (Join-Path $PSScriptRoot '..\server')
    $log = Join-Path $serverDir 'runtime.log'
    Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' `
        -ArgumentList 'dist\index.js' `
        -WorkingDirectory $serverDir `
        -RedirectStandardOutput $log `
        -RedirectStandardError ($log -replace '\.log$', '-err.log') `
        -WindowStyle Hidden
}

# --- Cloudflare named tunnel → api.teslacadd.com ---
$cfRunning = Get-Process -Name 'cloudflared' -ErrorAction SilentlyContinue
if (-not $cfRunning) {
    $cfOut = 'C:\Users\PC-090\.cloudflared\tunnel-out.log'
    $cfErr = 'C:\Users\PC-090\.cloudflared\tunnel-err.log'
    Start-Process -FilePath 'C:\Users\PC-090\cloudflared.exe' `
        -ArgumentList 'tunnel run tos-backend' `
        -RedirectStandardOutput $cfOut `
        -RedirectStandardError $cfErr `
        -WindowStyle Hidden
}
