$path = ".\src\OwnerDashboard.jsx"

$text = Get-Content $path -Raw -Encoding UTF8

for ($i = 0; $i -lt 3; $i++) {
    if ($text -notmatch "Ø|Ù|Ã|â|ð") {
        break
    }

    $bytes = [System.Text.Encoding]::GetEncoding(1252).GetBytes($text)
    $decoded = [System.Text.Encoding]::UTF8.GetString($bytes)

    if ($decoded -eq $text) {
        break
    }

    $text = $decoded
}

Set-Content $path -Value $text -Encoding UTF8

Write-Host "OWNER_ARABIC_FIXED"