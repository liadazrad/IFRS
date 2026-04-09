$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$dataDir = Join-Path $root "data"
if (-not (Test-Path -LiteralPath $dataDir)) {
  New-Item -ItemType Directory -Path $dataDir | Out-Null
}
$outputPath = Join-Path $dataDir "ifric.json"
$baseUrl = "https://www.ifrs.org"
$indexUrl = "$baseUrl/supporting-implementation/supporting-materials-by-ifrs-standards/"

function To-PlainText {
  param([string]$Html)
  if ([string]::IsNullOrWhiteSpace($Html)) { return "" }
  $text = [regex]::Replace($Html, "<.*?>", " ")
  $text = [System.Net.WebUtility]::HtmlDecode($text)
  $text = $text.Replace([char]0x2019, "'").Replace([char]0x2018, "'").Replace([char]0x2014, "-").Replace([char]0x2013, "-")
  $text = [regex]::Replace($text, "\s+", " ").Trim()
  return $text
}

function Get-StandardFromSlug {
  param([string]$Slug)
  return $Slug.ToUpper().Replace("-", " ")
}

$index = Invoke-WebRequest -Uri $indexUrl -UseBasicParsing
$standardUrls = [regex]::Matches(
  $index.Content,
  'href="(?<href>/content/ifrs/home/supporting-implementation/supporting-materials-by-ifrs-standards/(ifrs|ias)-[^"]+?\.html)"',
  'IgnoreCase'
) | ForEach-Object { $_.Groups["href"].Value } | Sort-Object -Unique

$items = New-Object System.Collections.Generic.List[object]

foreach ($relativeUrl in $standardUrls) {
  $pageUrl = "$baseUrl$relativeUrl".Replace("/content/ifrs/home", "")
  $slug = [System.IO.Path]::GetFileNameWithoutExtension($relativeUrl)
  $standardLabel = Get-StandardFromSlug -Slug $slug

  try {
    $page = Invoke-WebRequest -Uri $pageUrl -UseBasicParsing
  }
  catch {
    continue
  }

  $sectionMatch = [regex]::Match(
    $page.Content,
    '<span class="cmp-accordion__title">IFRS Interpretations Committee agenda decisions</span>[\s\S]*?<tbody>(?<tbody>[\s\S]*?)</tbody>',
    'IgnoreCase'
  )

  if (-not $sectionMatch.Success) {
    continue
  }

  $tbody = $sectionMatch.Groups["tbody"].Value
  $rows = [regex]::Matches($tbody, '<tr[\s\S]*?</tr>', 'IgnoreCase')

  foreach ($row in $rows) {
    $dateMatch = [regex]::Match($row.Value, '<p[^>]*>\s*(?<date>\d{2}\s+[A-Za-z]{3}\s+\d{4})\s*</p>', 'IgnoreCase')
    $linkMatch = [regex]::Match($row.Value, '<a[^>]*href="(?<href>[^"]+)"[^>]*>[\s\S]*?<div>\s*(?<title>.*?)\s*</div>', 'IgnoreCase')

    if (-not $dateMatch.Success -or -not $linkMatch.Success) {
      continue
    }

    $publishedAt = [datetime]::ParseExact($dateMatch.Groups["date"].Value, "dd MMM yyyy", [System.Globalization.CultureInfo]::InvariantCulture)
    $title = To-PlainText $linkMatch.Groups["title"].Value
    $href = $linkMatch.Groups["href"].Value

    if (
      $title -match "[^\x00-\x7F]" -or
      $title -match "\b(Preparaci[oó]n|Informaci[oó]n|Fusi[oó]n|Comptabilisation|Informations|Paiements|Traitement|Evaluation|Economie|Garanties|Classement)\b"
    ) {
      continue
    }

    $sourceUrl = if ($href.StartsWith("http")) { $href } else { "$baseUrl$href" }
    $id = "{0}-{1}" -f $publishedAt.ToString("yyyy-MM-dd"), ([regex]::Replace($title.ToLowerInvariant(), "[^a-z0-9]+", "-").Trim("-"))

    $items.Add([pscustomobject]@{
      id = $id
      title = $title
      shortSummary = "Short summary: IFRIC agenda decision on $title."
      standard = $standardLabel
      publishedAt = $publishedAt.ToString("yyyy-MM-dd")
      volume = if ($publishedAt -ge [datetime]"2019-01-01") { "Official archive" } else { "Historical archive" }
      tags = @($slug.Replace("-", " "), "agenda decision")
      sourceUrl = $sourceUrl
    })
  }
}

$uniqueItems = $items |
  Sort-Object publishedAt, title |
  Group-Object id |
  ForEach-Object { $_.Group[0] } |
  Sort-Object {[datetime]$_.publishedAt}, title -Descending

$json = $uniqueItems | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText($outputPath, $json, [System.Text.UTF8Encoding]::new($false))

Write-Host "Generated ifric.json with $($uniqueItems.Count) decisions."
