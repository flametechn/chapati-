from pathlib import Path
import re
import shutil

path = Path(r".\src\App.jsx")

if not path.exists():
    raise SystemExit("ERROR: src\\App.jsx غير موجود.")

backup = path.with_name("App.jsx.before-unified-auth.bak")
shutil.copy2(path, backup)

text = path.read_text(encoding="utf-8")

original = text


# ============================================================
# 1) استبدال حالات CUSTOMER AUTH + UNIFIED AUTH
# ============================================================

pattern = re.compile(
    r'''  /\* =====================================================
     CUSTOMER AUTH
     ===================================================== \*/.*?  /\* =====================================================
     CLICK SOUND
     ===================================================== \*/''',
    re.S,
)

replacement = '''  /* =====================================================
     UNIFIED AUTH
     OWNER + DRIVER + CUSTOMER
     ===================================================== */

  const [
    isAuthLoginOpen,
    setIsAuthLoginOpen,
  ] = useState(false);

  const [
    authPhoneInput,
    setAuthPhoneInput,
  ] = useState("");

  const [
    authPasswordInput,
    setAuthPasswordInput,
  ] = useState("");

  const [
    authLoginLoading,
    setAuthLoginLoading,
  ] = useState(false);

  const [
    authLoginError,
    setAuthLoginError,
  ] = useState("");

  const [authUser, setAuthUser] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "chapati_auth_user"
          );

        if (!saved) return null;

        const parsed =
          JSON.parse(saved);

        return [
          "owner",
          "driver",
          "customer",
        ].includes(parsed?.role)
          ? parsed
          : null;
      } catch {
        return null;
      }
    });

  const [authStep, setAuthStep] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "chapati_auth_user"
          );

        if (!saved) return "login";

        const parsed =
          JSON.parse(saved);

        if (
          parsed?.role === "owner" ||
          parsed?.role === "driver"
        ) {
          return "dashboard";
        }

        if (parsed?.role === "customer") {
          return "customer";
        }

        return "login";
      } catch {
        return "login";
      }
    });

  const [
    authSessionToken,
    setAuthSessionToken,
  ] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem(
          "chapati_auth_user"
        );

      if (savedUser) {
        const parsed =
          JSON.parse(savedUser);

        if (parsed?.sessionToken) {
          return parsed.sessionToken;
        }
      }

      return (
        localStorage.getItem(
          "chapati_driver_session_token"
        ) ||
        localStorage.getItem(
          "chapati_owner_session"
        ) ||
        localStorage.getItem(
          "chapati_customer_session"
        ) ||
        ""
      );
    } catch {
      return "";
    }
  });

  const [authPhoneError, setAuthPhoneError] =
    useState("");

  const [
    authSavePhoneLoading,
    setAuthSavePhoneLoading,
  ] = useState(false);

  const [
    ownerOrdersToday,
    setOwnerOrdersToday,
  ] = useState(null);

  const [
    ownerOrdersLoading,
    setOwnerOrdersLoading,
  ] = useState(false);

  /* =====================================================
     CLICK SOUND
     ===================================================== */'''

text, count = pattern.subn(replacement, text, count=1)

if count != 1:
    raise SystemExit(
        "ERROR: لم أجد قسم CUSTOMER AUTH المتوقع. لم يتم حفظ أي تعديل."
    )


# ============================================================
# 2) استبدال دوال CUSTOMER + UNIFIED AUTH
# ============================================================

pattern = re.compile(
    r'''  /\* =====================================================
     CUSTOMER FUNCTIONS
     ===================================================== \*/.*?  /\* =====================================================
     CART
     ===================================================== \*/''',
    re.S,
)

replacement = '''  /* =====================================================
     UNIFIED AUTH FUNCTIONS
     OWNER + DRIVER + CUSTOMER
     ===================================================== */

  function openAuthLogin() {
    setAuthLoginError("");
    setAuthPhoneError("");
    setAuthPhoneInput("");
    setAuthPasswordInput("");

    if (
      authUser?.role === "owner" ||
      authUser?.role === "driver"
    ) {
      setAuthStep("dashboard");
    } else if (
      authUser?.role === "customer"
    ) {
      setAuthStep("customer");
    } else {
      setAuthStep("login");
    }

    setIsAuthLoginOpen(true);

    if (authUser?.role === "owner") {
      loadOwnerOrders();
    }
  }

  async function loginUnified(event) {
    event.preventDefault();

    setAuthLoginError("");

    const identifier =
      authPhoneInput.trim();

    const password =
      authPasswordInput;

    if (!identifier) {
      setAuthLoginError(
        "يرجى إدخال رقم الهاتف أو اسم السائق."
      );
      return;
    }

    if (!password) {
      setAuthLoginError(
        "يرجى إدخال كلمة المرور."
      );
      return;
    }

    if (!supabase) {
      setAuthLoginError(
        "خدمة تسجيل الدخول غير متوفرة حاليًا."
      );
      return;
    }

    setAuthLoginLoading(true);

    const { data, error } =
      await supabase.rpc(
        "unified_login",
        {
          p_identifier:
            identifier,
          p_password:
            password,
        }
      );

    setAuthLoginLoading(false);

    if (error) {
      console.error(
        "Unified login RPC error:",
        error
      );

      setAuthLoginError(
        "حدث خطأ أثناء تسجيل الدخول."
      );

      return;
    }

    const result = data || {};

    if (!result.success) {
      setAuthLoginError(
        result.message ||
          "بيانات الدخول غير صحيحة."
      );

      return;
    }

    if (
      result.role !== "owner" &&
      result.role !== "driver" &&
      result.role !== "customer"
    ) {
      setAuthLoginError(
        "نوع الحساب غير معروف."
      );

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
      (
        result.role === "driver"
          ? ""
          : identifier
      );

    const sessionToken =
      result.session_token || "";

    if (!sessionToken) {
      setAuthLoginError(
        "تعذر إنشاء جلسة الدخول."
      );

      return;
    }

    if (!id) {
      setAuthLoginError(
        "تعذر تحديد حسابك."
      );

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

    setAuthSessionToken(
      sessionToken
    );

    /* إزالة الجلسات القديمة */
    localStorage.removeItem(
      "chapati_owner_session"
    );

    localStorage.removeItem(
      "chapati_driver_session"
    );

    localStorage.removeItem(
      "chapati_driver_session_token"
    );

    localStorage.removeItem(
      "chapati_customer_session"
    );

    /* إزالة نظام الزبون القديم */
    localStorage.removeItem(
      "chapati_customer"
    );

    if (result.role === "owner") {
      localStorage.setItem(
        "chapati_owner_session",
        sessionToken
      );

      setAuthStep("dashboard");
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

      setAuthStep("dashboard");
    }

    if (result.role === "customer") {
      localStorage.setItem(
        "chapati_customer_session",
        sessionToken
      );

      setAuthStep("customer");

      /*
       * الزبون يدخل للمتجر مباشرة،
       * ولا نفتح له لوحة الموظفين.
       */
      setIsAuthLoginOpen(false);
    }

    setAuthPhoneInput("");
    setAuthPasswordInput("");
    setAuthLoginError("");
  }

  async function loadOwnerOrders() {
    if (!supabase) return;

    setOwnerOrdersLoading(true);

    const { data, error } =
      await supabase.rpc(
        "get_orders_today_count"
      );

    setOwnerOrdersLoading(false);

    if (error || !data?.success) {
      console.error(
        "Owner orders count error:",
        error
      );

      setOwnerOrdersToday(null);

      return;
    }

    setOwnerOrdersToday(
      data.count
    );
  }

  async function saveAuthDriverPhone(event) {
    event.preventDefault();

    setAuthPhoneError("");

    const phone =
      authPhoneInput.trim();

    if (!/^0[5-7][0-9]{8}$/.test(phone)) {
      setAuthPhoneError(
        "يرجى إدخال رقم هاتف جزائري صحيح مثل 0550000000."
      );

      return;
    }

    if (
      !authUser?.id ||
      authUser.role !== "driver"
    ) {
      setAuthPhoneError(
        "بيانات السائق غير صالحة. يرجى تسجيل الدخول مجددًا."
      );

      return;
    }

    if (!authSessionToken) {
      setAuthPhoneError(
        "جلسة الدخول غير صالحة. يرجى تسجيل الدخول مجددًا."
      );

      return;
    }

    if (!supabase) {
      setAuthPhoneError(
        "خدمة تحديث الهاتف غير متوفرة حاليًا."
      );

      return;
    }

    setAuthSavePhoneLoading(
      true
    );

    const { data, error } =
      await supabase.rpc(
        "set_driver_phone",
        {
          p_driver_id:
            authUser.id,
          p_session_token:
            authSessionToken,
          p_phone: phone,
        }
      );

    setAuthSavePhoneLoading(
      false
    );

    if (error) {
      console.error(
        "set_driver_phone RPC error:",
        error
      );

      setAuthPhoneError(
        "تعذر حفظ رقم الهاتف."
      );

      return;
    }

    if (!data?.success) {
      setAuthPhoneError(
        data?.message ||
          "تعذر حفظ رقم الهاتف."
      );

      return;
    }

    const updatedUser = {
      ...authUser,
      phone,
    };

    setAuthUser(updatedUser);

    localStorage.setItem(
      "chapati_auth_user",
      JSON.stringify(updatedUser)
    );

    setAuthPhoneInput("");
    setAuthPhoneError("");
    setAuthStep("dashboard");
  }

  function logoutUnified() {
    setAuthUser(null);
    setAuthStep("login");
    setAuthSessionToken("");

    localStorage.removeItem(
      "chapati_auth_user"
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

    localStorage.removeItem(
      "chapati_customer_session"
    );

    localStorage.removeItem(
      "chapati_customer"
    );

    setAuthPhoneInput("");
    setAuthPasswordInput("");
    setAuthLoginError("");
    setAuthPhoneError("");
    setOwnerOrdersToday(null);
    setIsAuthLoginOpen(false);
  }

  /* =====================================================
     CART
     ===================================================== */'''

text, count = pattern.subn(replacement, text, count=1)

if count != 1:
    raise SystemExit(
        "ERROR: لم أجد قسم CUSTOMER FUNCTIONS المتوقع. لم يتم حفظ أي تعديل."
    )


# ============================================================
# 3) checkoutOrder: ربط الطلب بالزبون الموحد
# ============================================================

old = '''          p_customer_id:
            customer?.id || null,'''

new = '''          p_customer_id:
            authUser?.role === "customer"
              ? authUser.id
              : null,'''

if old not in text:
    raise SystemExit(
        "ERROR: لم أجد p_customer_id القديم."
    )

text = text.replace(old, new, 1)


# ============================================================
# 4) استبدال Header buttons
# ============================================================

header_pattern = re.compile(
    r'''<div className="site-header__actions">.*?</div>''',
    re.S,
)

header_replacement = '''<div className="site-header__actions">
          <button
            type="button"
            className="site-header__customer"
            onClick={openAuthLogin}
          >
            {authUser
              ? `👤 ${authUser.name}`
              : "تسجيل الدخول"}
          </button>

          <button
            type="button"
            className="site-header__cta"
            onClick={() =>
              setIsCartOpen(true)
            }
          >
            السلة{" "}
            {totalItems > 0 &&
              `(${totalItems})`}
          </button>
        </div>'''

text, count = header_pattern.subn(
    header_replacement,
    text,
    count=1,
)

if count != 1:
    raise SystemExit(
        "ERROR: لم أجد site-header__actions."
    )


# ============================================================
# 5) استبدال نافذتي Customer + Unified بنافذة واحدة
# ============================================================

modal_pattern = re.compile(
    r'''\{/\* =====================================================
          CUSTOMER SIGNUP
          ===================================================== \*/\}.*?\{/\* =====================================================
          FLOATING CART
          ===================================================== \*/\}''',
    re.S,
)

modal_replacement = '''{/* =====================================================
          UNIFIED AUTH
          OWNER + DRIVER + CUSTOMER
          ===================================================== */}

      {isAuthLoginOpen && (
        <div
          className="driver-login-backdrop"
          role="presentation"
          onClick={() =>
            setIsAuthLoginOpen(false)
          }
        >
          <div
            className="driver-login-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-login-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="driver-login__header">
              <div>
                <h2 id="auth-login-title">
                  {authStep === "dashboard"
                    ? authUser?.role === "owner"
                      ? "مرحباً بك يا مالك المحل"
                      : "مرحباً بك يا سائق"
                    : authStep === "customer"
                      ? "حسابي"
                      : authStep === "phone"
                        ? "أدخل رقم هاتفك"
                        : "🔐 تسجيل الدخول"}
                </h2>

                <p>
                  {authStep === "dashboard"
                    ? "تم تسجيل دخولك بنجاح."
                    : authStep === "customer"
                      ? "تم تسجيل دخولك بنجاح ويمكنك الآن إتمام طلباتك."
                      : authStep === "phone"
                        ? "أدخل رقم هاتفك لإكمال إعداد الحساب."
                        : "المالك والزبون يستعملان رقم الهاتف، والسائق يستعمل اسم السائق."}
                </p>
              </div>

              <button
                type="button"
                className="cart-modal__close"
                onClick={() =>
                  setIsAuthLoginOpen(false)
                }
                aria-label="إغلاق"
              >
                ×
              </button>
            </div>

            {/* LOGIN */}

            {authStep === "login" && (
              <form
                className="driver-login__form"
                onSubmit={loginUnified}
              >
                <label>
                  رقم الهاتف أو اسم السائق

                  <input
                    type="text"
                    value={authPhoneInput}
                    onChange={(event) =>
                      setAuthPhoneInput(
                        event.target.value
                      )
                    }
                    placeholder="0550000000 أو اسم السائق"
                    autoComplete="username"
                    autoFocus
                  />
                </label>

                <label>
                  كلمة المرور

                  <input
                    type="password"
                    value={authPasswordInput}
                    onChange={(event) =>
                      setAuthPasswordInput(
                        event.target.value
                      )
                    }
                    placeholder="كلمة المرور"
                    autoComplete="current-password"
                  />
                </label>

                {authLoginError && (
                  <small className="driver-login__error">
                    {authLoginError}
                  </small>
                )}

                <button
                  type="submit"
                  className="driver-login__submit"
                  disabled={
                    authLoginLoading
                  }
                >
                  {authLoginLoading
                    ? "جارٍ تسجيل الدخول..."
                    : "تسجيل الدخول"}
                </button>
              </form>
            )}

            {/* CUSTOMER ACCOUNT */}

            {authStep === "customer" &&
              authUser?.role === "customer" && (
                <div className="driver-login__form">
                  <div className="driver-login__info">
                    مرحباً{" "}
                    <strong>
                      {authUser.name ||
                        "الزبون"}
                    </strong>
                    <br />
                    رقم الهاتف:{" "}
                    {authUser.phone ||
                      "غير مسجل"}
                  </div>

                  <button
                    type="button"
                    className="driver-login__submit"
                    onClick={logoutUnified}
                  >
                    تسجيل الخروج
                  </button>
                </div>
              )}

            {/* DRIVER PHONE */}

            {authStep === "phone" && (
              <form
                className="driver-login__form"
                onSubmit={
                  saveAuthDriverPhone
                }
              >
                <div className="driver-login__info">
                  مرحباً{" "}
                  <strong>
                    {authUser?.name ||
                      "السائق"}
                  </strong>
                  <br />
                  يرجى إدخال رقم هاتفك
                  لاستكمال إعداد الحساب.
                </div>

                <label>
                  رقم الهاتف

                  <input
                    type="tel"
                    inputMode="tel"
                    value={authPhoneInput}
                    onChange={(event) =>
                      setAuthPhoneInput(
                        event.target.value
                      )
                    }
                    placeholder="0550000000"
                    autoComplete="tel"
                    autoFocus
                  />
                </label>

                {authPhoneError && (
                  <small className="driver-login__error">
                    {authPhoneError}
                  </small>
                )}

                <button
                  type="submit"
                  className="driver-login__submit"
                  disabled={
                    authSavePhoneLoading
                  }
                >
                  {authSavePhoneLoading
                    ? "جارٍ حفظ الرقم..."
                    : "حفظ رقم الهاتف"}
                </button>
              </form>
            )}

            {/* OWNER DASHBOARD */}

            {authStep === "dashboard" &&
              authUser?.role === "owner" && (
                <OwnerDashboard />
              )}

            {/* DRIVER DASHBOARD */}

            {authStep === "dashboard" &&
              authUser?.role === "driver" && (
                <DriverDashboard />
              )}

            {/* STAFF LOGOUT */}

            {authStep === "dashboard" && (
              <button
                type="button"
                className="customer-login__logout"
                onClick={logoutUnified}
              >
                تسجيل الخروج
              </button>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          FLOATING CART
          ===================================================== */}'''

text, count = modal_pattern.subn(
    modal_replacement,
    text,
    count=1,
)

if count != 1:
    raise SystemExit(
        "ERROR: لم أجد نافذتي تسجيل الدخول في JSX."
    )


# ============================================================
# 6) CartModal: تمرير الزبون الموحد
# ============================================================

old = '''          customer={customer}'''

new = '''          customer={
            authUser?.role === "customer"
              ? authUser
              : null
          }'''

if old not in text:
    raise SystemExit(
        "ERROR: لم أجد customer={customer} في CartModal."
    )

text = text.replace(old, new, 1)


# ============================================================
# 7) تحقق من عدم بقاء النظام القديم
# ============================================================

for forbidden in [
    "loginCustomer",
    "logoutCustomer",
    "openCustomerSignup",
    "isCustomerLoginOpen",
    "customerPhoneInput",
    "customerNameInput",
    "customerLoginLoading",
    "customerLoginError",
]:
    if forbidden in text:
        raise SystemExit(
            f"ERROR: ما زال المرجع القديم موجودًا: {forbidden}"
        )


# ============================================================
# 8) حفظ
# ============================================================

if text == original:
    raise SystemExit(
        "ERROR: لم يتغير الملف."
    )

path.write_text(
    text,
    encoding="utf-8",
    newline="\n",
)

print("")
print("==============================================")
print("تم إصلاح نظام تسجيل الدخول الموحد")
print("==============================================")
print(f"الملف: {path}")
print(f"Backup: {backup}")
print("")
print("تم توحيد:")
print("- Owner")
print("- Driver")
print("- Customer")
print("")
print("تم حذف نظام customer_login القديم من App.jsx")
print("تم ربط customer_id مع authUser")
print("تم جعل زر تسجيل الدخول واحدًا")
print("==============================================")