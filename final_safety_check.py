from pathlib import Path
import re

current = Path("src/App.jsx").read_text(encoding="utf-8-sig")
candidate = Path("src/App.jsx.repair-test-5.jsx").read_text(encoding="utf-8")

print("===== FINAL SAFETY CHECK =====")
print()

# 1. Basic size
print("Current size   :", len(current))
print("Candidate size :", len(candidate))
print()

# 2. Important application features
features = [
    "OwnerDashboard",
    "DriverDashboard",
    "unified_login",
    "loginUnified",
    "session_token",
    "chapati_auth_user",
    "owner_session_token",
    "driver_session_token",
]

print("===== FEATURES =====")
for name in features:
    c = name in current
    n = name in candidate
    print(f"{name:24} CURRENT={c}  CANDIDATE={n}")

print()

# 3. Count important React/JS structures
patterns = [
    r"function\s+\w+\s*\(",
    r"const\s+\w+\s*=",
    r"return\s*\(",
    r"<button\b",
    r"<input\b",
    r"<form\b",
]

print("===== STRUCTURE COUNTS =====")
for p in patterns:
    a = len(re.findall(p, current))
    b = len(re.findall(p, candidate))
    print(f"{p:25} CURRENT={a}  CANDIDATE={b}")

print()

# 4. Check candidate encoding
arabic = len(re.findall(r"[\u0600-\u06ff]", candidate))
moji = len(re.findall(r"[ØÙÃÂâ]", candidate))
controls = len(re.findall(r"[\x80-\x9f]", candidate))

print("===== ENCODING =====")
print("Arabic characters   :", arabic)
print("Mojibake characters :", moji)
print("Control characters  :", controls)

print()

# 5. Check JavaScript nullish operators are still present
print("===== JS OPERATORS =====")
for token in [
    "item.unitPrice ?? item.price",
    "item.quantity ?? 1",
]:
    print(f"{token:35} = {token in candidate}")

print()

# 6. Check important Arabic strings
print("===== ARABIC CHECK =====")
arabic_strings = [
    "أضف إلى السلة",
    "سكالوب",
    "كبدة",
    "ميكس",
    "بصل",
    "شيزي",
    "كوموبير",
    "الإضافة الخاصة",
    "إضافات مجانية",
    "سلة الطلب",
    "مجموع المنتجات",
    "مصاريف التوصيل",
    "المجموع النهائي",
    "تسجيل الدخول",
    "إنشاء حساب",
    "المالك",
    "السائق",
]

for s in arabic_strings:
    print(f"{s:25} = {s in candidate}")

print()
print("NO App.jsx WAS MODIFIED.")
