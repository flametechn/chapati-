$path = ".\src\App.jsx"
$content = Get-Content $path -Raw -Encoding UTF8

$startMarker = '            {/* DASHBOARD */}'
$endMarker = '          </div>'

$start = $content.IndexOf($startMarker)

if ($start -lt 0) {
    Write-Host "ERROR: dashboard start not found."
    exit 1
}

$end = $content.IndexOf($endMarker, $start)

if ($end -lt 0) {
    Write-Host "ERROR: dashboard end not found."
    exit 1
}

$end = $end + $endMarker.Length

$newBlock = @'
            {/* DASHBOARD */}

            {authStep === "dashboard" &&
              authUser?.role === "owner" && (
                <OwnerDashboard />
              )}

            {authStep === "dashboard" &&
              authUser?.role === "driver" && (
                <DriverDashboard />
              )}
'@

$content = $content.Substring(0, $start) +
           $newBlock +
           $content.Substring($end)

[System.IO.File]::WriteAllText(
    $path,
    $content,
    [System.Text.UTF8Encoding]::new($false)
)

Write-Host "DASHBOARD_ROUTING_UPDATED"