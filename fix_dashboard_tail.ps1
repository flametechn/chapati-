$path = ".\src\App.jsx"
$content = Get-Content $path -Raw -Encoding UTF8

$startMarker = '                  )}'
$endMarker = '      {/* ====================================================='
$start = $content.IndexOf($startMarker, $content.IndexOf('{authStep === "dashboard"'))

if ($start -lt 0) {
    Write-Host "ERROR: old dashboard tail start not found."
    exit 1
}

$end = $content.IndexOf($endMarker, $start)

if ($end -lt 0) {
    Write-Host "ERROR: floating cart marker not found."
    exit 1
}

$content = $content.Substring(0, $start) + $content.Substring($end)

[System.IO.File]::WriteAllText(
    $path,
    $content,
    [System.Text.UTF8Encoding]::new($false)
)

Write-Host "DASHBOARD_TAIL_REMOVED"