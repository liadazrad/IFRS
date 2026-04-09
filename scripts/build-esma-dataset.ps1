$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$dataDir = Join-Path $root "data"
if (-not (Test-Path -LiteralPath $dataDir)) {
  New-Item -ItemType Directory -Path $dataDir | Out-Null
}
$outputPath = Join-Path $dataDir "esma.json"
$pageUrl = "https://www.esma.europa.eu/issuer-disclosure/financial-reporting"

$summaryMap = @{
  "30" = @{
    tags = @("goodwill", "deferred tax", "business combinations", "principal vs agent", "control")
    shortSummary = "Covers goodwill impairment, deferred tax assets, business combinations, principal vs. agent and control."
  }
  "29" = @{
    tags = @("significant influence", "related parties", "ECL", "fair value", "APM")
    shortSummary = "Focuses on significant influence, related parties, interim disclosures, expected credit losses and fair value disclosures."
  }
  "28" = @{
    tags = @("business combinations", "loss of control", "principal vs agent", "lease disclosures")
    shortSummary = "Includes earn-outs in business combinations, put-option liabilities, loss of control, principal vs. agent and lease disclosures."
  }
  "27" = @{
    tags = @("sale and leaseback", "segments", "intangibles", "climate", "SPAC")
    shortSummary = "Covers sale and leaseback, segment aggregation, internally generated intangibles, climate-risk disclosures and SPAC warrants."
  }
  "26" = @{
    tags = @("ECL", "inventory", "revenue", "impairment", "segments")
    shortSummary = "Includes expected credit losses, inventory issues, revenue over time, significant financing components and impairment."
  }
  "25" = @{
    tags = @("ECL", "IFRS 16", "COVID-19", "liabilities", "credit risk")
    shortSummary = "Focuses on expected credit losses, IFRS 16 first-time application, COVID-19 presentation issues and credit risk disclosures."
  }
  "24" = @{
    tags = @("performance obligations", "liquidity risk", "deferred tax", "control", "revenue")
    shortSummary = "Includes performance obligations, liquidity risk, deferred tax on IFRS 9 transition, de-facto control and revenue issues."
  }
  "23" = @{
    tags = @("cash flows", "financing liabilities", "cash equivalents", "fair value", "impairment")
    shortSummary = "Covers cash-flow presentation, financing liabilities disclosures, fair value disclosures and impairment indicators."
  }
  "22" = @{
    tags = @("held for sale", "restricted cash", "PPA", "control", "hyperinflation")
    shortSummary = "Includes held-for-sale classification, restricted cash, purchase price allocation, control and hyperinflation."
  }
}

function Get-ExtractNumber {
  param([string]$Title)
  $match = [regex]::Match($Title, '(?<num>\d+)(st|nd|rd|th)\s+Extract', 'IgnoreCase')
  if ($match.Success) { return $match.Groups["num"].Value }
  return ""
}

function To-Id {
  param([datetime]$Date, [string]$Number)
  return "{0}-esma-{1}th-extract" -f $Date.ToString("yyyy-MM"), $Number
}

$response = Invoke-WebRequest -Uri $pageUrl -UseBasicParsing
$matches = [regex]::Matches(
  $response.Content,
  '<tr>\s*<td>(?<date>\d{1,2}\s+[A-Za-z]+\s+\d{4})</td>\s*<td><a[^>]*href="(?<href>[^"]+)"[^>]*>(?<num>\d+)<sup>[^<]+</sup>\s*extract\s*\((?<code>[^)]+)\)</a></td>\s*</tr>',
  'IgnoreCase'
)

$items = foreach ($match in $matches) {
  $extractNumber = $match.Groups["num"].Value
  $publishedAt = [datetime]::Parse($match.Groups["date"].Value, [System.Globalization.CultureInfo]::InvariantCulture)
  $href = $match.Groups["href"].Value
  $sourceUrl = if ($href.StartsWith("http")) { $href } else { "https://www.esma.europa.eu$href" }
  $meta = if ($summaryMap.ContainsKey($extractNumber)) { $summaryMap[$extractNumber] } else { $null }
  $title = "{0}th Extract from the EECS's Database of Enforcement" -f $extractNumber
  if ($extractNumber -eq "23") { $title = "23rd Extract from the EECS's Database of Enforcement" }
  if ($extractNumber -eq "22") { $title = "22nd Extract from the EECS's Database of Enforcement" }

  [pscustomobject]@{
    id = if ($extractNumber) { To-Id -Date $publishedAt -Number $extractNumber } else { "{0}-esma-extract" -f $publishedAt.ToString("yyyy-MM") }
    title = $title
    shortSummary = if ($meta) { $meta.shortSummary } else { "ESMA extract from the EECS database of enforcement decisions on financial statements." }
    standard = if ($extractNumber) { "Extract $extractNumber" } else { "ESMA Extract" }
    publishedAt = $publishedAt.ToString("yyyy-MM-dd")
    volume = "ESMA / EECS"
    tags = if ($meta) { $meta.tags } else { @("enforcement", "IFRS", "ESMA") }
    sourceUrl = $sourceUrl
    sourceType = "ESMA"
  }
}

$json = ($items | Sort-Object {[datetime]$_.publishedAt} -Descending | ConvertTo-Json -Depth 4)
[System.IO.File]::WriteAllText($outputPath, $json, [System.Text.UTF8Encoding]::new($false))

Write-Host "Generated esma.json with $(@($items).Count) extracts."
