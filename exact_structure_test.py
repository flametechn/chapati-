from pathlib import Path
import re

clean = Path("App_clean_git.jsx").read_text(encoding="utf-8-sig")
current = Path("src/App.jsx.backup-before-unified-login-2.bak").read_text(encoding="utf-8-sig")

clean_lines = clean.splitlines()
current_lines = current.splitlines()

# كلمات/رموز التخريب التي نعتبرها جزءاً من النص التالف
BAD = r"ØÙÃÂâ™†\x80-\x9f"

def arabic_count(s):
    return len(re.findall(r"[\u0600-\u06ff]", s))

def bad_count(s):
    return len(re.findall(rf"[{BAD}]|\?{{2,}}", s))

def normalize_text(s):
    """
    نحذف فقط أجزاء النص العربي/المشوّه للمقارنة،
    ونُبقي كود JavaScript و JSX والأرقام والرموز.
    """
    s = re.sub(r"[\u0600-\u06ff]", "§", s)
    s = re.sub(rf"[{BAD}]", "§", s)
    s = re.sub(r"\?{2,}", "§", s)
    return s

# نبحث عن أزواج الأسطر التي لها نفس البنية البرمجية
# مع اختلاف النص العربي فقط.
matches = []

for ci, c in enumerate(clean_lines):
    nc = normalize_text(c)

    if arabic_count(c) == 0:
        continue

    best = None

    for ui, u in enumerate(current_lines):
        if bad_count(u) == 0:
            continue

        nu = normalize_text(u)

        if nc == nu:
            best = ui
            break

    if best is not None:
        matches.append((ci, best))

print("===== EXACT STRUCTURE ARABIC MATCH TEST =====")
print("Clean lines   :", len(clean_lines))
print("Current lines :", len(current_lines))
print("Matches       :", len(matches))

print()
print("===== FIRST MATCHES =====")

for ci, ui in matches[:80]:
    print()
    print(f"CLEAN   LINE {ci+1}:")
    print(clean_lines[ci])
    print(f"CURRENT LINE {ui+1}:")
    print(current_lines[ui])

print()
print("===== IMPORTANT =====")
print("This is ONLY a diagnostic.")
print("No App.jsx was modified.")
