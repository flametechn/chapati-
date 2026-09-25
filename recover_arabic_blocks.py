from pathlib import Path
import difflib
import re

clean_path = Path("App_clean_git.jsx")
unified_path = Path("src/App.jsx.backup-before-unified-login-2.bak")
test_path = Path("src/App.jsx.recovered-test.jsx")

clean = clean_path.read_text(encoding="utf-8-sig").splitlines()
unified = unified_path.read_text(encoding="utf-8-sig").splitlines()

def normalize(s):
    # Normalize only whitespace.
    # Mojibake characters remain represented as part of the line,
    # allowing the surrounding JavaScript structure to match.
    s = re.sub(r"\s+", " ", s).strip()
    return s

a = [normalize(x) for x in clean]
b = [normalize(x) for x in unified]

sm = difflib.SequenceMatcher(None, a, b)

result = unified[:]

repaired_blocks = []
repaired_lines = 0

for block in sm.get_matching_blocks():
    ca = block.a
    ub = block.b
    size = block.size

    # Only use substantial blocks.
    # This avoids dangerous one-line accidental matches.
    if size >= 5:
        for j in range(size):
            ci = ca + j
            ui = ub + j

            # Replace only if the Unified line appears corrupted.
            if re.search(r"Ø|Ù|Ã|Â|â|†|™|\?{2,}", unified[ui]):
                result[ui] = clean[ci]
                repaired_lines += 1

        repaired_blocks.append((ca + 1, ca + size, ub + 1, ub + size, size))

final_text = "\n".join(result) + "\n"

test_path.write_text(final_text, encoding="utf-8")

print("===== RECOVERY TEST =====")
print("Clean lines       :", len(clean))
print("Unified lines     :", len(unified))
print("Blocks used       :", len(repaired_blocks))
print("Lines repaired    :", repaired_lines)
print("Test size         :", test_path.stat().st_size)

arabic = len(re.findall(r"[\u0600-\u06ff]", final_text))
qmarks = len(re.findall(r"\?{2,}", final_text))
moji = len(re.findall(r"[ØÙÃÂâ†]", final_text))

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
    print(f"{name:20} = {name in final_text}")

print()
print("===== USED BLOCKS =====")

for x in repaired_blocks:
    print(
        f"clean {x[0]}..{x[1]}  "
        f"<-> unified {x[2]}..{x[3]}  "
        f"({x[4]} lines)"
    )

print()
print("TEST FILE:", test_path)
