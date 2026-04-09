param(
  [string]$LatestNewsUrl = "https://www.ifrs.org/supporting-implementation/how-we-help-support-consistent-application/#agenda-decisions"
)

$ErrorActionPreference = "Stop"

Write-Host "Checking IFRIC agenda decision update page..."

try {
  $response = Invoke-WebRequest -Uri $LatestNewsUrl -UseBasicParsing
}
catch {
  Write-Error "Failed to reach IFRS.org. Check your internet connection or URL."
  exit 1
}

$content = $response.Content
$matches = [regex]::Matches($content, "<li>\s*(?<title>[^<]+?)\s*<\/li>")

if ($matches.Count -eq 0) {
  Write-Host "No bullet list of agenda decisions was detected automatically."
  Write-Host "Open the page in a browser and copy the new titles into data.js."
  exit 0
}

Write-Host ""
Write-Host "Detected bullet items on the page:"
Write-Host ""

foreach ($match in $matches) {
  $title = ($match.Groups["title"].Value -replace "&nbsp;", " ").Trim()
  if ($title.Length -gt 8) {
    Write-Host "- $title"
  }
}

Write-Host ""
Write-Host "If a title above is not in data.js yet, add it as a new record and reload index.html."
