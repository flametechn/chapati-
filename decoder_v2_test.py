from pathlib import Path
import re

src = Path("src/App.jsx.backup-before-unified-login-2.bak")
out = Path("src/App.jsx.decoder-v2-test.jsx")

text = src.read_text(encoding="utf-8-sig")

def score(s):
    arabic = len(re.findall(r"[\u0600-\u06ff]", s))
    bad = len(re.findall(r"[ØÙÃÂâ€™™†]", s))
    controls = len(re.findall(r"[\x80-\x9f]", s))
    return arabic * 20 - bad * 3 - controls * 5

def try_decode(s):
    candidates = [s]

    # UTF-8 interpreted as Latin-1/CP1252 repeatedly.
    current = s

    for _ in range(8):
        variants = []

        # Latin-1
        try:
            variants.append(current.encode("latin1").decode("utf-8"))
        except Exception:
            pass

        # CP1252, when possible
        try:
            variants.append(current.encode("cp1252").decode("utf-8"))
        except Exception:
            pass

        if not variants:
            break

        best_variant = max(variants, key=score)

        if score(best_variant) <= score(current):
            break

        candidates.append(best_variant)
        current = best_variant

    return max(candidates, key=score)

def repair_text(s):
    # First repeatedly reverse mojibake.
    s = try_decode(s)

    # Some characters can remain from malformed CP1252 decoding.
    replacements = {
        "Ã™Â\x81": "ف",
        "Ù\x81": "ف",
        "Ù": "ف",
        "Ã™Â": "",
        "Ù": "ف",
        "إضاÙ": "إضا",
        "أضÙ": "أض",
    }

    for old, new in replacements.items():
        s = s.replace(old, new)

    # Targeted cleanup for the known malformed Arabic remnants.
    s = s.replace("إضاÙ", "إضاف")
    s = s.replace("أضÙ", "أضف")
    s = s.replace("ناÙ", "ناف")
    s = s.replace("الحشوة", "الحشوة")

    return s

lines = text.splitlines()

repaired = []
changed = []

for i, line in enumerate(lines, 1):
    new = repair_text(line)
    repaired.append(new)

    if new != line:
        changed.append((i, line, new))

final = "\n".join(repaired) + "\n"

out.write_text(final, encoding="utf-8")

print("===== DECODER V2 TEST =====")
print("Original lines :", len(lines))
print("Changed lines  :", len(changed))
print("Output size    :", out.stat().st_size)

arabic = len(re.findall(r"[\u0600-\u06ff]", final))
qmarks = len(re.findall(r"\?{2,}", final))
moji = len(re.findall(r"[ØÙÃÂâ€™™†]", final))
controls = len(re.findall(r"[\x80-\x9f]", final))

print()
print("Arabic characters   :", arabic)
print("???? sequences      :", qmarks)
print("Mojibake characters :", moji)
print("Control characters  :", controls)

print()
print("===== FEATURES =====")

for name in [
    "OwnerDashboard",
    "DriverDashboard",
    "unified_login",
    "loginUnified",
    "session_token",
    "chapati_auth_user",
]:
    print(f"{name:24} = {name in final}")

print()
print("===== FIRST 80 CHANGES =====")

for i, old, new in changed[:80]:
    print()
    print("LINE", i)
    print("OLD:", old)
    print("NEW:", new)

print()
print("TEST FILE:", out)
