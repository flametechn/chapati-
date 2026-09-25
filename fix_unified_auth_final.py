from pathlib import Path
import shutil
import re

path = Path(r".\src\App.jsx")
backup = path.with_name("App.jsx.before-unified-auth-final.bak")

shutil.copy2(path, backup)

text = path.read_text(encoding="utf-8")


# =========================================================
# 1) REMOVE OLD CUSTOMER AUTH STATE
# =========================================================

old_customer_state = r'''  /* =====================================================
     CUSTOMER AUTH
     ===================================================== */

  const [customer, setCustomer] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "chapati_customer"
          );

        return saved
          ? JSON.parse(saved)
          : null;
      } catch {
        return null;
      }
    });

  const [
    isCustomerLoginOpen,
    setIsCustomerLoginOpen,
  ] = useState(false);

  const [
    customerPhoneInput,
    setCustomerPhoneInput,
  ] = useState("");

  const [
    customerNameInput,
    setCustomerNameInput,
  ] = useState("");

  const [
    customerLoginLoading,
    setCustomerLoginLoading,
  ] = useState(false);

  const [
    customerLoginError,
    setCustomerLoginError,
  ] = useState("");

'''

if old_customer_state not in text:
    raise SystemExit("OLD CUSTOMER AUTH STATE NOT FOUND")

text = text.replace(old_customer_state, "", 1)


# =========================================================
# 2) UPDATE UNIFIED AUTH COMMENT
# =========================================================

text = text.replace(
'''  /* =====================================================
     UNIFIED AUTH
     OWNER + DRIVER
     ===================================================== */''',
'''  /* =====================================================
     UNIFIED AUTH
     OWNER + DRIVER + CUSTOMER
     ===================================================== */''',
1
)


# =========================================================
# 3) ALLOW CUSTOMER IN authUser INITIAL STATE
# =========================================================

old_auth_user = '''        return parsed?.role === "owner" ||
          parsed?.role === "driver"
          ? parsed
          : null;'''

new_auth_user = '''        return parsed?.role === "owner" ||
          parsed?.role === "driver" ||
          parsed?.role === "customer"
          ? parsed
          : null;'''

if old_auth_user not in text:
    raise SystemExit("AUTH USER ROLE BLOCK NOT FOUND")

text = text.replace(old_auth_user, new_auth_user, 1)


# =========================================================
# 4) UPDATE authStep INITIAL STATE
# =========================================================

old_auth_step = '''        return parsed?.role === "owner" ||
          parsed?.role === "driver"
          ? "dashboard"
          : "login";'''

new_auth_step = '''        if (
          parsed?.role === "owner" ||
          parsed?.role === "driver"
        ) {
          return "dashboard";
        }

        if (parsed?.role === "customer") {
          return "customer";
        }

        return "login";'''

if old_auth_step not in text:
    raise SystemExit("AUTH STEP ROLE BLOCK NOT FOUND")

text = text.replace(old_auth_step, new_auth_step, 1)


# =========================================================
# 5) REMOVE OLD CUSTOMER FUNCTIONS
# =========================================================

start_marker = '''  /* =====================================================
     CUSTOMER FUNCTIONS
     ===================================================== */

'''

end_marker = '''  /* =====================================================
     UNIFIED AUTH FUNCTIONS
     ===================================================== */

'''

start = text.find(start_marker)
end = text.find(end_marker)

if start == -1 or end == -1 or end <= start:
    raise SystemExit("CUSTOMER FUNCTIONS BLOCK NOT FOUND")

text = text[:start] + end_marker + text[end + len(end_marker):]


# =========================================================
# 6) UPDATE openAuthLogin
# =========================================================

old_open_auth = '''    if (
      authUser?.role === "owner" ||
      authUser?.role === "driver"
    ) {
      setAuthStep("dashboard");
    } else {
      setAuthStep("login");
    }'''

new_open_auth = '''    if (
      authUser?.role === "owner" ||
      authUser?.role === "driver"
    ) {
      setAuthStep("dashboard");
    } else if (authUser?.role === "customer") {
      setAuthStep("customer");
    } else {
      setAuthStep("login");
    }'''

if old_open_auth not in text:
    raise SystemExit("OPEN AUTH BLOCK NOT FOUND")

text = text.replace(old_open_auth, new_open_auth, 1)


# =========================================================
# 7) CUSTOMER SUCCESS -> CUSTOMER ACCOUNT
# =========================================================

old_customer_success = '''  if (result.role === "customer") {
    localStorage.setItem(
      "chapati_customer_session",
      sessionToken
    );
    localStorage.removeItem("chapati_owner_session");
    localStorage.removeItem("chapati_driver_session");
    localStorage.removeItem("chapati_driver_session_token");
  }'''

new_customer_success = '''  if (result.role === "customer") {
    localStorage.setItem(
      "chapati_customer_session",
      sessionToken
    );
    localStorage.removeItem("chapati_owner_session");
    localStorage.removeItem("chapati_driver_session");
    localStorage.removeItem("chapati_driver_session_token");
  }'''

if old_customer_success not in text:
    raise SystemExit("CUSTOMER SESSION BLOCK NOT FOUND")

text = text.replace(old_customer_success, new_customer_success, 1)


# =========================================================
# 8) SET FINAL AUTH STEP AFTER LOGIN
# =========================================================

old_final_step = '''  setAuthPhoneInput("");
  setAuthPasswordInput("");
  setAuthLoginError("");
  setAuthStep("dashboard");
}'''

new_final_step = '''  setAuthPhoneInput("");
  setAuthPasswordInput("");
  setAuthLoginError("");

  if (result.role === "customer") {
    setAuthStep("customer");
    setIsAuthLoginOpen(false);
  } else {
    setAuthStep("dashboard");
  }
}'''

if old_final_step not in text:
    raise SystemExit("FINAL AUTH STEP BLOCK NOT FOUND")

text = text.replace(old_final_step, new_final_step, 1)


# =========================================================
# 9) UPDATE LOGOUT TO REMOVE ALL SESSION KEYS
# =========================================================

old_logout = '''  localStorage.removeItem("chapati_auth_user");
  localStorage.removeItem("chapati_driver_session_token");

  setAuthPhoneInput("");'''

new_logout = '''  localStorage.removeItem("chapati_auth_user");
  localStorage.removeItem("chapati_owner_session");
  localStorage.removeItem("chapati_driver_session");
  localStorage.removeItem("chapati_driver_session_token");
  localStorage.removeItem("chapati_customer_session");
  localStorage.removeItem("chapati_customer");

  setAuthPhoneInput("");'''

if old_logout not in text:
    raise SystemExit("LOGOUT STORAGE BLOCK NOT FOUND")

text = text.replace(old_logout, new_logout, 1)


# =========================================================
# 10) CHECKOUT CUSTOMER ID
# =========================================================

text = text.replace(
'''          p_customer_id:
            customer?.id || null,''',
'''          p_customer_id:
            authUser?.role === "customer" ? authUser.id : null,''',
1
)


# =========================================================
# 11) REPLACE HEADER AUTH BUTTONS
# =========================================================

old_header = '''        <div className="site-header__actions">
          <button
            type="button"
            className="site-header__customer"
            onClick={openCustomerSignup}
          >
            {customer
              ? "حسابي"
              : "تسجيل الدخول"}
          </button>

          <button
            type="button"
            className="site-header__customer"
            onClick={openAuthLogin}
          >
            {authUser
              ? `👤 ${authUser.name}`
              : "حساب الموظفين"}
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

new_header = '''        <div className="site-header__actions">
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

if old_header not in text:
    raise SystemExit("HEADER BLOCK NOT FOUND")

text = text.replace(old_header, new_header, 1)


# =========================================================
# 12) REMOVE OLD CUSTOMER MODAL
# =========================================================

customer_modal_start = '''      {/* =====================================================
          CUSTOMER SIGNUP
          ===================================================== */}

'''

customer_modal_end = '''      {/* =====================================================
          UNIFIED AUTH
          OWNER + DRIVER
          ===================================================== */}

'''

start = text.find(customer_modal_start)
end = text.find(customer_modal_end)

if start == -1 or end == -1 or end <= start:
    raise SystemExit("CUSTOMER MODAL BLOCK NOT FOUND")

text = text[:start] + customer_modal_end + text[end + len(customer_modal_end):]


# =========================================================
# 13) UPDATE UNIFIED MODAL TITLE / DESCRIPTION
# =========================================================

old_title = '''                  {authStep === "dashboard"
                    ? authUser?.role ===
                      "owner"
                      ? "مرحباً بك يا مالك المحل"
                      : "مرحباً بك يا سائق"
                    : authStep ===
                        "phone"
                      ? "أدخل رقم هاتفك"
                      : "🔐 تسجيل الدخول"}'''

new_title = '''                  {authStep === "dashboard"
                    ? authUser?.role ===
                      "owner"
                      ? "مرحباً بك يا مالك المحل"
                      : "مرحباً بك يا سائق"
                    : authStep === "customer"
                      ? "حسابي"
                      : authStep === "phone"
                        ? "أدخل رقم هاتفك"
                        : "🔐 تسجيل الدخول"}'''

if old_title not in text:
    raise SystemExit("AUTH TITLE BLOCK NOT FOUND")

text = text.replace(old_title, new_title, 1)


old_description = '''                <p>
                  {authStep === "dashboard"
                    ? "تم تسجيل دخولك بنجاح."
                    : authStep === "phone"
                      ? "أدخل رقم هاتفك لإكمال إعداد الحساب."
                      : "أدخل بيانات الدخول الخاصة بك."}
                </p>'''

new_description = '''                <p>
                  {authStep === "dashboard"
                    ? "تم تسجيل دخولك بنجاح."
                    : authStep === "customer"
                      ? "يمكنك استخدام حسابك للطلبات."
                      : authStep === "phone"
                        ? "أدخل رقم هاتفك لإكمال إعداد الحساب."
                        : "المالك والزبون يستعملان رقم الهاتف، والسائق يستعمل اسم السائق."}
                </p>'''

if old_description not in text:
    raise SystemExit("AUTH DESCRIPTION BLOCK NOT FOUND")

text = text.replace(old_description, new_description, 1)


# =========================================================
# 14) UPDATE LOGIN FORM LABEL / INPUT
# =========================================================

old_login_label = '''            رقم الهاتف'''

new_login_label = '''            رقم الهاتف أو اسم السائق'''

# Only replace the first occurrence after unified modal
pos = text.find('      {isAuthLoginOpen && (')
if pos == -1:
    raise SystemExit("UNIFIED MODAL NOT FOUND")

after_modal = text[pos:]

if old_login_label not in after_modal:
    raise SystemExit("LOGIN LABEL NOT FOUND")

after_modal = after_modal.replace(old_login_label, new_login_label, 1)


old_input_type = '''              type="tel"
              inputMode="tel"
              value={authPhoneInput}'''

new_input_type = '''              type="text"
              value={authPhoneInput}'''

if old_input_type not in after_modal:
    raise SystemExit("AUTH INPUT BLOCK NOT FOUND")

after_modal = after_modal.replace(old_input_type, new_input_type, 1)

after_modal = after_modal.replace(
'''              placeholder="0550000000"''',
'''              placeholder="0550000000 أو اسم السائق"''',
1
)

after_modal = after_modal.replace(
'''              autoComplete="tel"''',
'''              autoComplete="username"''',
1
)

text = text[:pos] + after_modal


# =========================================================
# 15) ADD CUSTOMER ACCOUNT STATE
# =========================================================

customer_state = '''        {authStep === "customer" &&
          authUser?.role === "customer" && (
            <div className="driver-login__form">
              <div className="driver-login__info">
                مرحباً{" "}
                <strong>
                  {authUser.name || "الزبون"}
                </strong>
                <br />
                رقم الهاتف:{" "}
                {authUser.phone || "غير مسجل"}
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

'''

# Insert before owner dashboard block
owner_dashboard_marker = '''        {authStep === "dashboard" &&
          authUser?.role === "owner" && (
            <OwnerDashboard />'''

if owner_dashboard_marker not in text:
    raise SystemExit("OWNER DASHBOARD MARKER NOT FOUND")

text = text.replace(
    owner_dashboard_marker,
    customer_state + owner_dashboard_marker,
    1
)


# =========================================================
# 16) ADD LOGOUT FOR STAFF DASHBOARD
# =========================================================

driver_dashboard_end = '''        {authStep === "dashboard" &&
          authUser?.role === "driver" && (
            <DriverDashboard />
          )}'''

if driver_dashboard_end not in text:
    raise SystemExit("DRIVER DASHBOARD BLOCK NOT FOUND")

staff_logout = '''        {authStep === "dashboard" &&
          (authUser?.role === "owner" ||
            authUser?.role === "driver") && (
            <button
              type="button"
              className="driver-login__submit"
              onClick={logoutUnified}
              style={{ marginTop: "12px" }}
            >
              تسجيل الخروج
            </button>
          )}

'''

text = text.replace(
    driver_dashboard_end,
    driver_dashboard_end + "\n" + staff_logout,
    1
)


# =========================================================
# 17) CART MODAL CUSTOMER PROP
# =========================================================

old_cart_customer = '''    customer={customer}'''

new_cart_customer = '''    customer={
      authUser?.role === "customer"
        ? authUser
        : null
    }'''

if old_cart_customer not in text:
    raise SystemExit("CART CUSTOMER PROP NOT FOUND")

text = text.replace(old_cart_customer, new_cart_customer, 1)


# =========================================================
# 18) VERIFY NO LEGACY CUSTOMER AUTH
# =========================================================

legacy = [
    "customer_login",
    "loginCustomer",
    "logoutCustomer",
    "openCustomerSignup",
    "isCustomerLoginOpen",
    "setIsCustomerLoginOpen",
    "customerPhoneInput",
    "customerNameInput",
    "customerLoginLoading",
    "customerLoginError",
    "setCustomerPhoneInput",
    "setCustomerNameInput",
    "setCustomerLoginLoading",
    "setCustomerLoginError",
    "chapati_customer",
    "customer?.id",
]

remaining = [
    item for item in legacy
    if item in text
]

if remaining:
    print("ERROR: Legacy references still exist:")
    for item in remaining:
        print(" -", item)

    print("\nتم استرجاع النسخة الاحتياطية.")
    shutil.copy2(backup, path)
    raise SystemExit(1)


# =========================================================
# 19) VERIFY UNIFIED AUTH
# =========================================================

required = [
    'unified_login',
    'result.role === "customer"',
    'authUser?.role === "customer"',
    'p_customer_id:',
    'setAuthStep("customer")',
]

missing = [
    item for item in required
    if item not in text
]

if missing:
    print("ERROR: Required unified-auth references missing:")
    for item in missing:
        print(" -", item)

    print("\nتم استرجاع النسخة الاحتياطية.")
    shutil.copy2(backup, path)
    raise SystemExit(1)


# =========================================================
# 20) WRITE UTF-8
# =========================================================

path.write_text(text, encoding="utf-8")

print("")
print("==============================================")
print("تم توحيد تسجيل الدخول بنجاح")
print("==============================================")
print("")
print("Backup:")
print(backup)
print("")
print("تم حذف نظام تسجيل الزبون القديم.")
print("تم توحيد Owner + Driver + Customer.")
print("تم ربط الطلبات بـ authUser للزبون.")
print("")
print("لا تشغل Build الآن.")