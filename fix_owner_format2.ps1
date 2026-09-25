$p = ".\src\OwnerDashboard.jsx"

$t = Get-Content $p -Raw

$t = $t -replace '\} دج`;\r?\n\}', '}'

Set-Content $p -Value $t -Encoding UTF8

Write-Host "OWNER_FORMAT_CLEANED"