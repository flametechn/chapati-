from pathlib import Path
import re

src = Path("src/App.jsx")
text = src.read_text(encoding="utf-8-sig")
lines = text.splitlines()

# ============================================================
# إصلاحات نصية فقط — بدون تغيير أي منطق أو بنية
# ============================================================

fixes = {
    21:  '  return `${value.toLocaleString("fr-DZ")} دج`;',
    
    225: '      name: "بصل",',
    229: '      name: "دبشة",',
    233: '      name: "فلفل",',

    1310: '      setAuthLoginError("لم يتم استلام رمز الجلسة.");',

    1737: '        /* الإضاءة المحيطة */',
    1762: '        /* الهالة الخارجية */',
    1783: '        /* تأثير اللمعان */',
    1821: '        /* تكبير الصورة عند التحويم */',
    1830: '        /* حركة Glow */',
    1843: '        /* حركة الهالة */',
    1856: '        /* حركة اللمعان */',

    2782: '                ×',
    2915: '                ×',
}

for n, replacement in fixes.items():
    if 1 <= n <= len(lines):
        lines[n - 1] = replacement

# ============================================================
# STORY
# نحذف فقط النص المشوه ونبقي النص الموجود الصحيح
# ============================================================

# الأسطر الحالية 2685-2688 هي النص المشوه.
# نستبدلها بالنص العربي الصحيح، مع الحفاظ على نفس عدد الأسطر.
story_lines = {
    2685: '            يتم إعداد كل شباتي وملفوف عند',
    2686: '            الطلب، باستخدام مكونات طازجة',
    2687: '            وطهي متقن، حتى يصلك طلبك ساخناً',
    2688: '            ولذيذاً.',
}

for n, replacement in story_lines.items():
    if 1 <= n <= len(lines):
        lines[n - 1] = replacement

out = Path("src/App.jsx.repair-test-6.jsx")
out.write_text("\n".join(lines) + "\n", encoding="utf-8")

# ============================================================
# فحص
# ============================================================

result = out.read_text(encoding="utf-8")

arabic = len(re.findall(r"[\u0600-\u06ff]", result))
moji = len(re.findall(r"[ØÙÃÂâ]", result))
controls = len(re.findall(r"[\x80-\x9f]", result))
replacement_char = result.count("�")
qmarks = len(re.findall(r"\?{2,}", result))

print("===== REPAIR TEST 6 =====")
print("Output:", out)
print()
print("Arabic characters   :", arabic)
print("Mojibake characters :", moji)
print("Control characters  :", controls)
print("Replacement �       :", replacement_char)
print("???? sequences      :", qmarks)

print()
print("===== FEATURES =====")

features = [
    "OwnerDashboard",
    "DriverDashboard",
    "unified_login",
    "loginUnified",
    "session_token",
    "chapati_auth_user",
    "driver_session_token",
]

for name in features:
    print(f"{name:24} = {name in result}")

print()
print("===== JS STRUCTURE =====")

for pattern, label in [
    (r"function\s+\w+\s*\(", "functions"),
    (r"const\s+\w+\s*=", "const"),
    (r"<button\b", "buttons"),
    (r"<input\b", "inputs"),
    (r"<form\b", "forms"),
]:
    print(f"{label:12} = {len(re.findall(pattern, result))}")

print()
print("===== IMPORTANT STRINGS =====")

for s in [
    "دج",
    "بصل",
    "دبشة",
    "فلفل",
    "×",
    "يتم إعداد كل شباتي وملفوف عند",
    "unified_login",
    "const identifier = authPhoneInput.trim();",
    "const password = authPasswordInput;",
    "const sessionToken = result.session_token || \"\";",
    "item.unitPrice ?? item.price",
    "item.quantity ?? 1",
]:
    print(f"{s:50} = {s in result}")

print()
print("NO App.jsx WAS MODIFIED.")
