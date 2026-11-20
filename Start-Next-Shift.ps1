param(
    [switch]$NoBrowser,
    [ValidateRange(0, 65535)][int]$Port
)

$ErrorActionPreference = 'Stop'

function Find-WorkingNode {
    param([string[]]$Candidates)
    foreach ($candidate in ($Candidates | Select-Object -Unique)) {
        if (-not $candidate -or -not (Test-Path -LiteralPath $candidate -PathType Leaf)) { continue }
        try {
            $versionText = & $candidate --version 2>$null
            if ($LASTEXITCODE -eq 0 -and "$versionText" -match '^v(\d+)\.' -and [int]$Matches[1] -ge 20) {
                return $candidate
            }
        } catch { }
    }
}

try {
    $serverPath = Join-Path $PSScriptRoot 'server.mjs'
    $indexPath = Join-Path $PSScriptRoot 'dist\index.html'
    if (-not (Test-Path -LiteralPath $serverPath) -or -not (Test-Path -LiteralPath $indexPath)) {
        throw 'The website files are incomplete. Extract the entire ZIP before opening Start-Next-Shift.cmd.'
    }

    $candidates = @((Get-Command node.exe -CommandType Application -All -ErrorAction SilentlyContinue).Source)
    foreach ($installRoot in @($env:ProgramFiles, ${env:ProgramFiles(x86)}, $env:LOCALAPPDATA, $env:NVM_SYMLINK)) {
        if ($installRoot) {
            $candidates += Join-Path $installRoot 'nodejs\node.exe'
            $candidates += Join-Path $installRoot 'Programs\nodejs\node.exe'
            $candidates += Join-Path $installRoot 'node.exe'
        }
    }
    $nodePath = Find-WorkingNode -Candidates $candidates

    if (-not $nodePath) {
        # Ask Windows for the current package location so app updates cannot stale the path.
        $runtimePackages = @()
        try {
            $runtimePackages = @(Get-AppxPackage -Name '*CodexPrimaryRuntime*' -ErrorAction SilentlyContinue |
                Sort-Object { [version]$_.Version } -Descending)
        } catch { }
        $nodePath = Find-WorkingNode -Candidates @($runtimePackages | ForEach-Object {
            Join-Path $_.InstallLocation 'dependencies\node\bin\node.exe'
        })
    }

    if (-not $nodePath) {
        throw 'Node.js 20 or newer was not found. Install the LTS version from https://nodejs.org, then reopen this launcher. No website packages need installing.'
    }

    if ($PSBoundParameters.ContainsKey('Port')) { $env:PORT = [string]$Port }
    $serverArguments = @($serverPath)
    if (-not $NoBrowser) { $serverArguments += '--open' }
    Write-Host 'Starting The Next Shift. Keep this window open while using the website.'
    & $nodePath @serverArguments
    exit $LASTEXITCODE
} catch {
    Write-Host ''
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
