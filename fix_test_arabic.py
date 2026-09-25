from pathlib import Path

p = Path("App_arabic_test.jsx")
t = p.read_text(encoding="utf-8")

bad_chars = "ØÙÃâð"
def score(s):
    return sum(s.count(c) for c in bad_chars)

print("BEFORE:", score(t))

for i in range(8):
    old_score = score(t)

    try:
        candidate = t.encode("cp1252").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        try:
            candidate = t.encode("latin1", errors="ignore").decode("utf-8", errors="ignore")
        except Exception:
            break

    new_score = score(candidate)

    if new_score >= old_score:
        break

    t = candidate
    print(f"PASS {i + 1}: {new_score}")

p.write_text(t, encoding="utf-8", newline="")

print("AFTER:", score(t))
print("تم حفظ App_arabic_test.jsx")
