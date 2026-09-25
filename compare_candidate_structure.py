from pathlib import Path
import difflib

current = Path("src/App.jsx").read_text(encoding="utf-8-sig").splitlines()
candidate = Path("src/App.jsx.repair-test-5.jsx").read_text(encoding="utf-8").splitlines()

print("===== STRUCTURAL DIFFERENCE =====")
print()

# نقارن الأسطر التي تحتوي على بنية HTML/React/JS
def structural(line):
    s = line.strip()

    if (
        "<button" in s
        or "</button>" in s
        or "<input" in s
        or "</input>" in s
        or "<form" in s
        or "</form>" in s
        or "function " in s
        or "const " in s
        or "return " in s
        or "useState" in s
        or "useEffect" in s
    ):
        return s

    return None

c_struct = [structural(x) for x in current]
n_struct = [structural(x) for x in candidate]

c_struct = [x for x in c_struct if x]
n_struct = [x for x in n_struct if x]

print("Current structural lines  :", len(c_struct))
print("Candidate structural lines:", len(n_struct))
print()

matcher = difflib.SequenceMatcher(None, c_struct, n_struct)

diff_count = 0

for tag, i1, i2, j1, j2 in matcher.get_opcodes():

    if tag == "equal":
        continue

    print("===== DIFFERENCE =====")
    print("TYPE:", tag)
    print()
    
    print("--- CURRENT ---")
    for x in c_struct[i1:i2]:
        print(x)

    print()
    print("--- CANDIDATE ---")
    for x in n_struct[j1:j2]:
        print(x)

    print()
    diff_count += 1

print("Total structural differences:", diff_count)
print()

# ابحث تحديداً عن button
print("===== BUTTONS =====")

print()
print("--- CURRENT BUTTONS ---")
for i, line in enumerate(current, 1):
    if "<button" in line or "</button>" in line:
        print(i, line.strip())

print()
print("--- CANDIDATE BUTTONS ---")
for i, line in enumerate(candidate, 1):
    if "<button" in line or "</button>" in line:
        print(i, line.strip())

print()
print("NO App.jsx WAS MODIFIED.")
