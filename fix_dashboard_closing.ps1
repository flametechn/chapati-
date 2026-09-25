$path = ".\src\App.jsx"
$content = Get-Content $path -Raw -Encoding UTF8

$marker = '      {/* =====================================================' + "`r`n" + '          FLOATING CART'

$insert = @'
          </div>
        </div>
      )}

'@

$index = $content.IndexOf($marker)

if ($index -lt 0) {
    Write-Host "ERROR: FLOATING CART marker not found."
    exit 1
}

$content = $content.Substring(0, $index) + $insert + $content.Substring($index)

[System.IO.File]::WriteAllText(
    $path,
    $content,
    [System.Text.UTF8Encoding]::new($false)
)

Write-Host "DASHBOARD_CLOSING_RESTORED"