from pathlib import Path
import re

src = Path(r".\src\App.jsx.backup-before-unified-login-2.bak")
dst = Path(r".\src\App.jsx.repaired-test")

t = src.read_text(encoding="utf-8-sig")

# استبدال نمط mojibake الشائع الذي ظهر في الملف
patterns = [
    (r"Ø£Ø¶Ã.*?Â\x81", "أضف"),
]

r = t

for pattern, replacement in patterns:
    r = re.sub(pattern, replacement, r)

dst.write_text(r, encoding="utf-8")

print("TEST CREATED")
print("Arabic:", len(re.findall(r"[\u0600-\u06ff]", r)))
print("Ø:", r.count("Ø"))
print("Ù:", r.count("Ù"))
print("Ã:", r.count("Ã"))
print("�:", r.count("�"))

print("\nSAMPLE:")
pos = r.find("أضف")
print(repr(r[pos:pos+30]) if pos >= 0 else "NOT FOUND")
