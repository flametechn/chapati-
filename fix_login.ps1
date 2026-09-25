$path = ".\src\App.jsx"

Copy-Item $path ".\src\App.jsx.backup-loginUnified-final.bak" -Force

$content = Get-Content $path -Raw -Encoding UTF8

$start = $content.IndexOf("  async function loginUnified(event) {")
$end = $content.IndexOf("  async function loadOwnerOrders()", $start)

if ($start -lt 0 -or $end -lt 0) {
    Write-Host "ERROR: loginUnified boundaries not found."
    exit 1
}

$newFunction = @'
  async function loginUnified(event) {
    event.preventDefault();

    setAuthLoginError("");

    const identifier = authPhoneInput.trim();
    const password = authPasswordInput;

    if (!identifier) {
      setAuthLoginError("يرجى إدخال رقم الهاتف أو اسم السائق.");
      return;
    }

    if (!password) {
      setAuthLoginError("يرجى إدخال كلمة المرور.");
      return;
    }

    if (!supabase) {
      setAuthLoginError("خدمة تسجيل الدخول غير متاحة حالياً.");
      return;
    }

    setAuthLoginLoading(true);

    const { data, error } = await supabase.rpc(
      "unified_login",
      {
        p_identifier: identifier,
        p_password: password,
      }
    );

    setAuthLoginLoading(false);

    if (error) {
      console.error("Unified login RPC error:", error);
      setAuthLoginError("تعذر الاتصال بخدمة تسجيل الدخول.");
      return;
    }

    const result = data || {};

    if (!result.success) {
      setAuthLoginError(
        result.message || "معلومات تسجيل الدخول غير صحيحة."
      );
      return;
    }

    if (
      result.role !== "owner" &&
      result.role !== "driver" &&
      result.role !== "customer"
    ) {
      setAuthLoginError("نوع الحساب غير معروف.");
      return;
    }

    const account =
      result.owner ||
      result.driver ||
      result.customer ||
      result.user ||
      {};

    const id =
      account.id ||
      result.owner_id ||
      result.driver_id ||
      result.customer_id ||
      result.user_id ||
      result.id ||
      null;

    const name =
      account.name ||
      result.owner_name ||
      result.driver_name ||
      result.customer_name ||
      result.user_name ||
      result.name ||
      "";

    const returnedPhone =
      account.phone ||
      result.owner_phone ||
      result.driver_phone ||
      result.customer_phone ||
      result.phone ||
      identifier;

    const sessionToken = result.session_token || "";

    if (!sessionToken) {
      setAuthLoginError("تعذر إنشاء جلسة تسجيل الدخول.");
      return;
    }

    const loggedUser = {
      id,
      name,
      phone: returnedPhone,
      role: result.role,
      sessionToken,
    };

    setAuthUser(loggedUser);

    localStorage.setItem(
      "chapati_auth_user",
      JSON.stringify(loggedUser)
    );

    setAuthSessionToken(sessionToken);

    if (result.role === "owner") {
      localStorage.setItem(
        "chapati_owner_session",
        sessionToken
      );

      localStorage.removeItem(
        "chapati_driver_session"
      );

      localStorage.removeItem(
        "chapati_driver_session_token"
      );
    }

    if (result.role === "driver") {
      localStorage.setItem(
        "chapati_driver_session",
        sessionToken
      );

      localStorage.setItem(
        "chapati_driver_session_token",
        sessionToken
      );

      localStorage.removeItem(
        "chapati_owner_session"
      );
    }

    if (result.role === "customer") {
      localStorage.setItem(
        "chapati_customer_session",
        sessionToken
      );

      localStorage.removeItem(
        "chapati_owner_session"
      );

      localStorage.removeItem(
        "chapati_driver_session"
      );

      localStorage.removeItem(
        "chapati_driver_session_token"
      );
    }

    setAuthPhoneInput("");
    setAuthPasswordInput("");
    setAuthLoginError("");
    setAuthStep("dashboard");
  }

'@

$content = $content.Substring(0, $start) + $newFunction + $content.Substring($end)

Set-Content $path $content -Encoding UTF8

Write-Host "LOGIN_UNIFIED_UPDATED"