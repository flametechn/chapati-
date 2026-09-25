$p = ".\src\OwnerDashboard.jsx"

$t = Get-Content $p -Raw

$old = @'
                      <span
                        className={`owner-badge owner-badge--${
                          STATUS_CLASS[order.status] || ""
                        "}
                      >
'@

$new = @'
                      <span
                        className={
                          "owner-badge owner-badge--" +
                          (STATUS_CLASS[order.status] || "")
                        }
                      >
'@

if (-not $t.Contains($old)) {
    Write-Host "OWNER_BADGE_BLOCK_NOT_FOUND"
    exit 1
}

$t = $t.Replace($old, $new)

Set-Content $p -Value $t -Encoding UTF8

Write-Host "OWNER_BADGE_FIXED"