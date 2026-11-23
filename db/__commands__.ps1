$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$envFile = Join-Path $rootDir "backend/.env"

if (-not (Test-Path $envFile)) {
    throw "backend .env file not found at $envFile"
}

$databaseUrlLine = Get-Content $envFile | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -Last 1
if (-not $databaseUrlLine) {
    throw "DATABASE_URL is missing in $envFile"
}

$databaseUrl = $databaseUrlLine -replace '^DATABASE_URL=', ''
$databaseUrl = $databaseUrl.Trim('"').Trim("'")

$env:PGCLIENTENCODING = 'UTF8'

& psql $databaseUrl -v ON_ERROR_STOP=1 -f (Join-Path $scriptDir "reset.sql")
& psql $databaseUrl -v ON_ERROR_STOP=1 -f (Join-Path $scriptDir "schema.sql")
& psql $databaseUrl -v ON_ERROR_STOP=1 -f (Join-Path $scriptDir "indexes.sql")
& psql $databaseUrl -v ON_ERROR_STOP=1 -f (Join-Path $scriptDir "big_fake_seed.sql")
