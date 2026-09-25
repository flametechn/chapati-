from pathlib import Path
import re

src = Path("src/App.jsx.backup-before-unified-login-2.bak")
dst = Path("App_arabic_test.jsx")

text = src.read_text(encoding="utf-8-sig")

# Repair the common UTF-8 -> mojibake layers.
def repair(s):
    for _ in range(3):
        try:
            fixed = s.encode("latin1").decode("utf-8")
            if fixed == s:
                break
            s = fixed
        except (UnicodeEncodeError, UnicodeDecodeError):
            break
    return s

# Only repair fragments containing obvious mojibake.
parts = re.split(r'("[^"\n]*"|`[^`]*`|\'[^\']*\')', text)

for i in range(len(parts)):
    if any(x in parts[i] for x in ("Ø", "Ù", "Ã", "Â", "â", "†")):
        parts[i] = repair(parts[i])

text = "".join(parts)

dst.write_text(text, encoding="utf-8")

print("TEST FILE CREATED")
print("Size:", dst.stat().st_size)

arabic = len(re.findall(r"[\u0600-\u06ff]", text))
qmarks = len(re.findall(r"\?{2,}", text))
moji = len(re.findall(r"[ØÙÃÂâ†]", text))

print("Arabic characters:", arabic)
print("???? sequences:", qmarks)
print("Mojibake characters:", moji)

print()
print("FEATURE CHECK:")
for name in [
    "OwnerDashboard",
    "DriverDashboard",
    "unified_login",
    "loginUnified",
    "session_token",
    "chapati_auth_user",
]:
    print(name, "=", name in text)
