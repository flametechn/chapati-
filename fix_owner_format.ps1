$p = ".\src\OwnerDashboard.jsx"

$t = Get-Content $p -Raw

$old = 'function formatPrice(value) {'
$start = $t.IndexOf($old)

if ($start -lt 0) {
    Write-Host "FORMAT_FUNCTION_NOT_FOUND"
    exit 1
}

$end = $t.IndexOf("}", $start)

if ($end -lt 0) {
    Write-Host "FORMAT_FUNCTION_END_NOT_FOUND"
    exit 1
}

$new = @'
function formatPrice(value) {
  return Number(value || 0).toLocaleString("fr-DZ") + " دج";
}
'@

$t = $t.Substring(0, $start) + $new + $t.Substring($end + 1)

Set-Content $p -Value $t -Encoding UTF8

Write-Host "FORMAT_PRICE_FIXED"