from pathlib import Path
import shutil
import re

path = Path(r".\src\App.jsx")
backup = path.with_name("App.jsx.before-unified-auth-v2.bak")

text = path.read_text(encoding="utf-8")
shutil.copy2(path, backup)


# =========================================================
# 1. REMOVE OLD CUSTOMER AUTH STATE
# =========================================================

pattern = re.compile(
    r'\s*/\* =====================================================\s*'
    r'CUSTOMER AUTH\s*'
    r'===================================================== \*/\s*'
    r'.*?'
    r'(?=\s*/\* =====================================================\s*'
    r'UNIFIED AUTH\s*'
    r')',
    re.S,
)

new_text, count = pattern.subn(
    '\n\n  /* =====================================================\n'
    '     UNIFIED AUTH\n'
    '     OWNER + DRIVER + CUSTOMER\n'
    '     ===================================================== */\n\n',
    text,
    count=1,
)

if count != 1:
    shutil.copy2(backup, path)
    raise SystemExit("لم أجد قسم CUSTOMER AUTH القديم.")

text = new_text


# =========================================================
# 2. FIX authUser RESTORE
# =========================================================

text = text.replace(
'''        return parsed?.role === "owner" ||
          parsed?.role === "driver"
          ? parsed
          : null;''',
'''        return parsed?.role === "owner" ||
          parsed?.role === "driver" ||
          parsed?.role === "customer"
          ? parsed
          : null;''',
1
)


# =========================================================
# 3. FIX authStep RESTORE
# =========================================================

text = text.replace(
'''        return parsed?.role === "owner" ||
          parsed?.role === "driver"
          ? "dashboard"
          : "login";''',
'''        if (
          parsed?.role === "owner" ||
          parsed?.role === "driver"
        ) {
          return "dashboard";
        }

        if (parsed?.role === "customer") {
          return "customer";
        }

        return "login";''',
1
)


# =========================================================
# 4. REMOVE OLD CUSTOMER FUNCTIONS
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

if start != -1 and end != -1 and end > start:
    text = text[:start] + end_marker + text[end + len(end_marker):]


# =========================================================
# 5. FIX openAuthLogin
# =========================================================

text = text.replace(
'''    if (
      authUser?.role === "owner" ||
      authUser?.role === "driver"
    ) {
      setAuthStep("dashboard");
    } else {
      setAuthStep("login");
    }''',
'''    if (
      authUser?.role === "owner" ||
      authUser?.role === "driver"
    ) {
      setAuthStep("dashboard");
    } else if (authUser?.role === "customer") {
      setAuthStep("customer");
    } else {
      setAuthStep("login");
    }''',
1
)


# =========================================================
# 6. FIX CUSTOMER LOGIN RESULT
# =========================================================

old = '''  setAuthPhoneInput("");
  setAuthPasswordInput("");
  setAuthLoginError("");
  setAuthStep("dashboard");'''

new = '''  setAuthPhoneInput("");
  setAuthPasswordInput("");
  setAuthLoginError("");

  if (result.role === "customer") {
    setAuthStep("customer");
    setIsAuthLoginOpen(false);
  } else {
    setAuthStep("dashboard");
  }'''

if old in text:
    text = text.replace(old, new, 1)
else:
    print("تنبيه: لم أجد نهاية loginUnified المتوقعة.")


# =========================================================
# 7. FIX LOGOUT STORAGE
# =========================================================

old = '''  localStorage.removeItem("chapati_auth_user");
  localStorage.removeItem("chapati_driver_session_token");'''

new = '''  localStorage.removeItem("chapati_auth_user");
  localStorage.removeItem("chapati_owner_session");
  localStorage.removeItem("chapati_driver_session");
  localStorage.removeItem("chapati_driver_session_token");
  localStorage.removeItem("chapati_customer_session");
  localStorage.removeItem("chapati_customer");'''

if old in text:
    text = text.replace(old, new, 1)


# =========================================================
# 8. FIX CHECKOUT CUSTOMER ID
# =========================================================

text = text.replace(
'''          p_customer_id:
            customer?.id || null,''',
'''          p_customer_id:
            authUser?.role === "customer" ? authUser.id : null,''',
1
)


# =========================================================
# 9. REPLACE HEADER
# =========================================================

header_pattern = re.compile(
    r'        <div className="site-header__actions">\s*'
    r'.*?'
    r'        </div>',
    re.S,
)

header_replacement = '''        <div className="site-header__actions">
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
    count=1
)

if count != 1:
    shutil.copy2(backup, path)
    raise SystemExit("لم أجد Header الصحيح.")


# =========================================================
# 10. REMOVE OLD CUSTOMER MODAL
# =========================================================

customer_modal_pattern = re.compile(
    r'      \{\s*/\* =====================================================\s*'
    r'CUSTOMER SIGNUP\s*'
    r'===================================================== \*/\s*'
    r'\}\s*'
    r'\{isCustomerLoginOpen &&.*?'
    r'\}\s*'
    r'\s*(?=      \{\s*/\* =====================================================\s*'
    r'UNIFIED AUTH)',
    re.S,
)

text, count = customer_modal_pattern.subn("", text, count=1)

if count != 1:
    print("تنبيه: نافذة الزبون القديمة لم تُحذف بواسطة النمط.")


# =========================================================
# 11. FIX UNIFIED MODAL TITLE
# =========================================================

text = text.replace(
'''                  {authStep === "dashboard"
                    ? authUser?.role ===
                      "owner"
                      ? "مرحباً بك يا مالك المحل"
                      : "مرحباً بك يا سائق"
                    : authStep ===
                        "phone"
                      ? "أدخل رقم هاتفك"
                      : "🔐 تسجيل الدخول"}''',
'''                  {authStep === "dashboard"
                    ? authUser?.role ===
                      "owner"
                      ? "مرحباً بك يا مالك المحل"
                      : "مرحباً بك يا سائق"
                    : authStep === "customer"
                      ? "حسابي"
                      : authStep === "phone"
                        ? "أدخل رقم هاتفك"
                        : "🔐 تسجيل الدخول"}''',
1
)


# =========================================================
# 12. FIX LOGIN DESCRIPTION
# =========================================================

text = text.replace(
'''                <p>
                  {authStep === "dashboard"
                    ? "تم تسجيل دخولك بنجاح."
                    : authStep === "phone"
                      ? "أدخل رقم هاتفك لإكمال إعداد الحساب."
                      : "أدخل بيانات الدخول الخاصة بك."}
                </p>''',
'''                <p>
                  {authStep === "dashboard"
                    ? "تم تسجيل دخولك بنجاح."
                    : authStep === "customer"
                      ? "يمكنك استخدام حسابك للطلبات."
                      : authStep === "phone"
                        ? "أدخل رقم هاتفك لإكمال إعداد الحساب."
                        : "المالك والزبون يستعملان رقم الهاتف، والسائق يستعمل اسم السائق."}
                </p>''',
1
)


# =========================================================
# 13. FIX LOGIN INPUT
# =========================================================

modal_pos = text.find("      {isAuthLoginOpen && (")

if modal_pos == -1:
    shutil.copy2(backup, path)
    raise SystemExit("لم أجد نافذة Unified Auth.")

before = text[:modal_pos]
modal = text[modal_pos:]

modal = modal.replace(
'''            رقم الهاتف''',
'''            رقم الهاتف أو اسم السائق''',
1
)

modal = modal.replace(
'''              type="tel"
              inputMode="tel"
              value={authPhoneInput}''',
'''              type="text"
              value={authPhoneInput}''',
1
)

modal = modal.replace(
'''              placeholder="0550000000"''',
'''              placeholder="0550000000 أو اسم السائق"''',
1
)

modal = modal.replace(
'''              autoComplete="tel"''',
'''              autoComplete="username"''',
1
)

text = before + modal


# =========================================================
# 14. ADD CUSTOMER ACCOUNT VIEW
# =========================================================

customer_view = '''        {authStep === "customer" &&
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

marker = '''        {authStep === "dashboard" &&
          authUser?.role === "owner" && (
            <OwnerDashboard />'''

if marker in text:
    text = text.replace(marker, customer_view + marker, 1)
else:
    print("تنبيه: لم أجد OwnerDashboard لإضافة حساب الزبون.")


# =========================================================
# 15. CART CUSTOMER
# =========================================================

text = text.replace(
'''    customer={customer}''',
'''    customer={
      authUser?.role === "customer"
        ? authUser
        : null
    }''',
1
)


# =========================================================
# 16. FINAL VALIDATION
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
    "customer?.id",
]

remaining = [x for x in legacy if x in text]

if remaining:
    print("")
    print("ERROR: مازالت مراجع قديمة:")
    for x in remaining:
        print(" - " + x)
    print("")
    print("لم يتم حفظ التعديل.")
    print("النسخة الاحتياطية موجودة هنا:")
    print(backup)
    raise SystemExit(1)


required = [
    "unified_login",
    'result.role === "customer"',
    'authUser?.role === "customer"',
    "p_customer_id:",
]

missing = [x for x in required if x not in text]

if missing:
    print("")
    print("ERROR: مراجع Unified Auth ناقصة:")
    for x in missing:
        print(" - " + x)
    print("")
    print("لم يتم حفظ التعديل.")
    raise SystemExit(1)


# =========================================================
# SAVE
# =========================================================

path.write_text(text, encoding="utf-8")

print("")
print("==============================================")
print("تم توحيد تسجيل الدخول بنجاح")
print("==============================================")
print("")
print("Owner + Driver + Customer")
print("تم حذف نظام الزبون القديم.")
print("تم ربط الطلبات بحساب الزبون الموحد.")
print("")
print("Backup:")
print(backup)
print("")
print("لا تشغل Build الآن.")