from pathlib import Path
import difflib
import re

clean_path = Path("App_clean_git.jsx")
unified_path = Path("src/App.jsx.backup-before-unified-login-2.bak")
test_path = Path("src/App.jsx.recovered-test.jsx")

clean = clean_path.read_text(encoding="utf-8-sig").splitlines()
unified = unified_path.read_text(encoding="utf-8-sig").splitlines()

# Characters commonly appearing in the corrupted Arabic.
BAD = r"ØÙÃÂâ†™\u0080-\u009f"

def has_corruption(s):
    return bool(re.search(
        rf"(?:[{BAD}]|\?{{2,}})",
        s
    ))

def arabic(s):
    return bool(re.search(r"[\u0600-\u06ff]", s))

def code_skeleton(s):
    """
    Remove only Arabic/mojibake/question marks.
    Keep JavaScript identifiers, punctuation, numbers and strings'
    structural parts.
    """
    s = re.sub(r"[\u0600-\u06ff]", "#", s)
    s = re.sub(rf"[{BAD}]", "#", s)
    s = re.sub(r"\?+", "#", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

# Find strong contiguous blocks based on structure.
clean_norm = [code_skeleton(x) for x in clean]
unified_norm = [code_skeleton(x) for x in unified]

sm = difflib.SequenceMatcher(None, clean_norm, unified_norm)

result = unified[:]

candidate_pairs = []
blocks = []

for block in sm.get_matching_blocks():
    ca = block.a
    ub = block.b
    size = block.size

    if size < 5:
        continue

    blocks.append((ca, ub, size))

    for j in range(size):
        ci = ca + j
        ui = ub + j

        if ci >= len(clean) or ui >= len(unified):
            continue

        c = clean[ci]
        u = unified[ui]

        # We only repair a corrupted Unified line when
        # the corresponding clean Git line contains Arabic.
        if has_corruption(u) and arabic(c):
            candidate_pairs.append((ci, ui, c, u))

# Additional safety:
# Require the normalized structure to be identical.
safe_pairs = []

for ci, ui, c, u in candidate_pairs:
    cs = code_skeleton(c)
    us = code_skeleton(u)

    if cs == us:
        safe_pairs.append((ci, ui, c, u))

        # Replace ONLY this line with the clean Arabic version.
        result[ui] = c

final_text = "\n".join(result) + "\n"

test_path.write_text(final_text, encoding="utf-8")

print("===== SAFE ARABIC RECOVERY TEST =====")
print("Clean lines              :", len(clean))
print("Unified lines            :", len(unified))
print("Strong blocks            :", len(blocks))
print("Candidate Arabic lines   :", len(candidate_pairs))
print("SAFE lines repaired      :", len(safe_pairs))
print("Test size                :", test_path.stat().st_size)

print()
print("===== QUALITY =====")

arabic_count = len(re.findall(r"[\u0600-\u06ff]", final_text))
qmarks = len(re.findall(r"\?{2,}", final_text))
moji = len(re.findall(r"[ØÙÃÂâ†™]", final_text))

print("Arabic characters        :", arabic_count)
print("???? sequences           :", qmarks)
print("Mojibake characters      :", moji)

print()
print("===== FEATURES =====")

features = [
    "OwnerDashboard",
    "DriverDashboard",
    "unified_login",
    "loginUnified",
    "session_token",
    "chapati_auth_user",
]

for name in features:
    print(f"{name:24} = {name in final_text}")

print()
print("===== REPAIRED LINES =====")

for ci, ui, c, u in safe_pairs:
    print()
    print(f"Git line     {ci+1}")
    print(f"Unified line {ui+1}")
    print("OLD :", u)
    print("NEW :", c)

print()
print("TEST FILE:", test_path)
