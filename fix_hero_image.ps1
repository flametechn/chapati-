$p = ".\src\App.jsx"
$t = Get-Content $p -Raw -Encoding UTF8

$old = 'backgroundImage: `url(${import.meta.env.BASE_URL}videos/t%C3%A9l%C3%A9charger.webp)`'
$new = 'backgroundImage: `url(${heroImage})`'

if ($t.Contains($old)) {
    $t = $t.Replace($old, $new)
    Set-Content $p -Value $t -Encoding UTF8
    Write-Host "HERO_IMAGE_RESTORED"
}
else {
    Write-Host "HERO_IMAGE_LINE_NOT_FOUND"
}