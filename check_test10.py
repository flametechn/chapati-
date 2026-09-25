from pathlib import Path
import re

p = Path("src/App.jsx.repair-test-10.jsx")
text = p.read_text(encoding="utf-8")

print("===== TEST 10 CHECK =====")
print("Size:", len(text))
print("Arabic:", len(re.findall(r"[\u0600-\u06ff]", text)))
print("Mojibake:", len(re.findall(r"[ØÙÃÂâ]", text)))
print("Controls:", len(re.findall(r"[\x80-\x9f]", text)))
print("Replacement char:", text.count("\ufffd"))

bad_q = re.findall(r"\?{3,}", text)
print("3+ question marks:", len(bad_q))

print()
print("===== STRUCTURE =====")

for pattern, label in [
    (r"function\s+\w+\s*\(", "functions"),
    (r"const\s+\w+\s*=", "const"),
    (r"<button\b", "buttons"),
    (r"<input\b", "inputs"),
    (r"<form\b", "forms"),
]:
    print(f"{label:12} =", len(re.findall(pattern, text)))

print()
print("===== FEATURES =====")

for s in [
    "OwnerDashboard",
    "DriverDashboard",
    "unified_login",
    "loginUnified",
    "session_token",
    "chapati_auth_user",
    "driver_session_token",
]:
    print(f"{s:24} =", s in text)

print()
print("===== IMPORTANT ARABIC =====")

for s in [
    "دج",
    "بصل",
    "دبشة",
    "فلفل",
    "تعذر إنشاء جلسة الدخول.",
    "يتم إعداد كل شباتي وملفوف عند",
    "الطلب، باستخدام مكونات طازجة",
    "وطهي متقن، حتى يصلك طلبك ساخناً",
    "ولذيذاً.",
    "×",
]:
    print(f"{s:50} =", s in text)

print()
print("===== BAD LINES =====")

pattern = re.compile(r"[ØÙÃÂâ]|[\x80-\x9f]|\ufffd|\?{3,}")

count = 0

for i, line in enumerate(text.splitlines(), 1):
    if pattern.search(line):
        print(f"{i:4}: {line}")
        count += 1

print()
print("Total bad lines:", count)
print()
print("NO App.jsx WAS MODIFIED.")
