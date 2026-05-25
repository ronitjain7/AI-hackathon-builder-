param(
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Args
  )

  & git @Args
  if ($LASTEXITCODE -ne 0) {
    throw "git $($Args -join ' ') failed with exit code $LASTEXITCODE"
  }
}

Invoke-Git -Args @("fetch", "origin")
Invoke-Git -Args @("checkout", $Branch)
Invoke-Git -Args @("pull", "--ff-only", "origin", $Branch)

Write-Output "Sync complete for branch '$Branch' at $(Get-Date -Format o)"
