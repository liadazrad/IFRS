$ErrorActionPreference = "Stop"

$scriptsRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

& (Join-Path $scriptsRoot "build-ifric-dataset.ps1")
& (Join-Path $scriptsRoot "build-esma-dataset.ps1")

Write-Host "Finished updating IFRIC and ESMA datasets."
