from pathlib import Path
import difflib

clean = Path("App_clean_git.jsx").read_text(encoding="utf-8-sig").splitlines()
unified = Path("src/App.jsx.backup-before-unified-login-2.bak").read_text(encoding="utf-8-sig").splitlines()

# Compare only the ASCII/code structure by masking text that is likely corrupted.
def normalize(s):
    # Replace mojibake and question-mark runs with a common token.
    import re
    s = re.sub(r'Ø|Ù|Ã|Â|â|†|™|[\x80-\x9f]', '#', s)
    s = re.sub(r'\?+', '#', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

a = [normalize(x) for x in clean]
b = [normalize(x) for x in unified]

sm = difflib.SequenceMatcher(None, a, b)

print("===== STRUCTURE MATCH =====")
print("Clean lines  :", len(clean))
print("Unified lines:", len(unified))
print()

matches = sm.get_matching_blocks()

for m in matches:
    if m.size >= 5:
        print(
            f"clean {m.a+1:4}..{m.a+m.size:4}  "
            f"<-> unified {m.b+1:4}..{m.b+m.size:4}  "
            f"({m.size} lines)"
        )

print()
print("===== LARGE MATCHES =====")

for m in matches:
    if m.size >= 15:
        print()
        print("MATCH")
        print("Clean  :", m.a + 1, "to", m.a + m.size)
        print("Unified:", m.b + 1, "to", m.b + m.size)
        print("Lines  :", m.size)

print()
print("===== END =====")
