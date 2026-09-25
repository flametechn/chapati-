from pathlib import Path
import re
import difflib

clean_path = Path("App_clean_git.jsx")
unified_path = Path("src/App.jsx.backup-before-unified-login-2.bak")
test_path = Path("App_arabic_repair_test.jsx")

clean = clean_path.read_text(encoding="utf-8-sig").splitlines()
unified = unified_path.read_text(encoding="utf-8-sig").splitlines()

def skeleton(line):
    # Remove all Arabic/mojibake/question-mark text.
    s = re.sub(r'[\u0600-\u06ff]', '', line)
    s = re.sub(r'[ØÙÃÂâ†™�]', '', s)
    s = re.sub(r'\?{2,}', '', s)

    # Normalize whitespace.
    s = re.sub(r'\s+', ' ', s).strip()
    return s

# Build candidates from clean Git.
clean_candidates = []

for i, line in enumerate(clean):
    if re.search(r'[\u0600-\u06ff]', line):
        clean_candidates.append((i, line, skeleton(line)))

replacements = {}
used = set()

for ui, uline in enumerate(unified):
    if not re.search(r'Ø|Ù|Ã|Â|â|†|\?{2,}', uline):
        continue

    us = skeleton(uline)

    if not us:
        continue

    best = None

    for ci, cline, cs in clean_candidates:
        if ci in used:
            continue
        if not cs:
            continue

        ratio = difflib.SequenceMatcher(None, us, cs).ratio()

        if best is None or ratio > best[0]:
            best = (ratio, ci, cline)

    if best and best[0] >= 0.72:
        ratio, ci, cline = best
        replacements[ui] = cline
        used.add(ci)

result = unified[:]

for ui, cline in replacements.items():
    result[ui] = cline

test_path.write_text(
    "\n".join(result) + "\n",
    encoding="utf-8"
)

print("===== ARABIC REPAIR TEST =====")
print("Original unified lines :", len(unified))
print("Clean Git lines        :", len(clean))
print("Arabic clean candidates:", len(clean_candidates))
print("Lines repaired         :", len(replacements))
print("Test file size         :", test_path.stat().st_size)

final_text = "\n".join(result)

arabic = len(re.findall(r'[\u0600-\u06ff]', final_text))
qmarks = len(re.findall(r'\?{2,}', final_text))
moji = len(re.findall(r'[ØÙÃÂâ†]', final_text))

print()
print("Arabic characters :", arabic)
print("???? sequences    :", qmarks)
print("Mojibake chars    :", moji)

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
    print(f"{name:20} =", name in final_text)

print()
print("===== FIRST REPAIRS =====")

shown = 0

for ui in sorted(replacements):
    print()
    print("UNIFIED :", unified[ui])
    print("REPAIRED:", result[ui])

    shown += 1

    if shown >= 20:
        break

print()
print("TEST FILE:", test_path)
