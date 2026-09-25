$p = ".\src\App.jsx"

$t = Get-Content $p -Raw -Encoding UTF8

for ($i = 0; $i -lt 3; $i++) {
    if ($t -notmatch "Ø|Ù|Ã|â|ðŸ") {
        break
    }

    $bytes = [System.Text.Encoding]::GetEncoding(1252).GetBytes($t)
    $fixed = [System.Text.Encoding]::UTF8.GetString($bytes)

    if ($fixed -eq $t) {
        break
    }

    $t = $fixed
}

Set-Content $p -Value $t -Encoding UTF8

Write-Host "APP_ARABIC_FIXED"
