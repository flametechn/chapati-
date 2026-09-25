from pathlib import Path
import re

src = Path(r".\src\App.jsx.backup-before-unified-login-2.bak")
dst = Path(r".\src\App.jsx.repaired-test")

t = src.read_text(encoding="utf-8-sig")

# محاولة إصلاح mojibake باستخدام bytes بشكل آمن
try:
    r = t.encode("cp1252", errors="replace").decode("utf-8")
except Exception as e:
    print("ERROR:", e)
    raise

dst.write_text(r, encoding="utf-8")

print("REPAIRED TEST CREATED")
print("QuestionMarks:", len(re.findall(r"\?{2,}", r)))
print("BadEncoding:", len(re.findall(r"Ø|Ù|Ã|â|ð|†", r)))
print("Arabic:", len(re.findall(r"[\u0600-\u06ff]", r)))
