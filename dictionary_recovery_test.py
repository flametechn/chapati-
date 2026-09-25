from pathlib import Path
import re
import difflib

unified_path = Path("src/App.jsx.backup-before-unified-login-2.bak")
clean_path = Path("App_clean_git.jsx")
out_path = Path("src/App.jsx.dictionary-test.jsx")

unified = unified_path.read_text(encoding="utf-8-sig")
clean = clean_path.read_text(encoding="utf-8-sig")

# ------------------------------------------------------------
# 1. Known correct Arabic phrases from the clean Git version.
#    Extract all Arabic-containing strings.
# ------------------------------------------------------------

def arabic_chunks(text):
    # Capture quoted/template chunks containing Arabic.
    pattern = re.compile(
        r'(["`])((?:\\.|(?!\1).)*[\u0600-\u06ff](?:\\.|(?!\1).)*)\1',
        re.S
    )

    result = []

    for m in pattern.finditer(text):
        value = m.group(2)
        if re.search(r"[\u0600-\u06ff]", value):
            result.append(value)

    return result


clean_chunks = arabic_chunks(clean)

# Keep unique values.
clean_chunks = list(dict.fromkeys(clean_chunks))


# ------------------------------------------------------------
# 2. Robust mojibake decoder.
# ------------------------------------------------------------

def quality(s):
    arabic = len(re.findall(r"[\u0600-\u06ff]", s))
    mojibake = len(re.findall(r"[ØÙÃÂâ™†]", s))
    controls = len(re.findall(r"[\x80-\x9f]", s))
    question = len(re.findall(r"\?{2,}", s))

    return (
        arabic * 30
        - mojibake * 4
        - controls * 10
        - question * 8
    )


def decode_candidate(s):
    candidates = [s]
    current = s

    for _ in range(8):
        variants = []

        for enc in ("latin1", "cp1252"):
            try:
                variants.append(
                    current.encode(enc).decode("utf-8")
                )
            except Exception:
                pass

        if not variants:
            break

        candidate = max(variants, key=quality)

        if quality(candidate) <= quality(current):
            break

        current = candidate
        candidates.append(current)

    return max(candidates, key=quality)


# ------------------------------------------------------------
# 3. Build dictionary:
#    corrupted form -> known clean Arabic.
# ------------------------------------------------------------

dictionary = {}

for correct in clean_chunks:

    decoded = decode_candidate(correct)

    # Also generate the common mojibake representation by
    # encoding UTF-8 and decoding as Latin-1.
    variants = []

    try:
        variants.append(
            correct.encode("utf-8").decode("latin1")
        )
    except Exception:
        pass

    try:
        variants.append(
            correct.encode("utf-8").decode("cp1252")
        )
    except Exception:
        pass

    for bad in variants:
        if bad != correct and len(bad) >= 2:
            dictionary[bad] = correct


# ------------------------------------------------------------
# 4. Add known multi-layer corruptions observed in this file.
# ------------------------------------------------------------

manual = {
    "Ø£Ø¶Ã™Â\x81": "أضف",
    "Ø£Ø¶Ã™Â": "أضف",
    "أضÙ\x81": "أضف",
    "أضÙ": "أضف",

    "Ã™Â\x81": "ف",
    "Ã™Â": "ف",
    "Ù\x81": "ف",
    "Ù": "ف",

    "Ã™ÂÙ„Ã™ÂÙ„": "فلفل",
    "ÙÙ„ÙÙ„": "فلفل",
    "فÙ„فÙ„": "فلفل",

    "Ø§Ù„Ø¥Ø¶Ø§Ã™ÂØ§Øª": "الإضافات",
    "إضاÙ\x81ات": "إضافات",
    "إضاÙات": "إضافات",

    "Ø§Ø®ØªØ± Ø§Ù„Ø¥Ø¶Ø§Ã™ÂØ§Øª Ø§Ù„ØªÙŠ ØªØ±ÙŠØ¯Ù‡Ø§":
        "اختر الإضافات التي تريدها",

    "Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ù†Ø§Ã™ÂØ°Ø©":
        "إغلاق النافذة",

    "ØªØ¹Ø°Ø± Ø­Ã™ÂØ¸ Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÃ™Â":
        "تعذر حفظ رقم الهاتف",

    "Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÃ™Â":
        "رقم الهاتف",

    "ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø±Ù‚Ù… Ù‡Ø§ØªÃ™Â ØµØ­ÙŠØ­.":
        "يرجى إدخال رقم هاتف صحيح.",

    "ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø±Ù‚Ù… Ù‡Ø§ØªÃ™Â Ø¬Ø²Ø§Ø¦Ø±ÙŠ ØµØ­ÙŠØ­ Ù…Ø«Ù„ 0550000000.":
        "يرجى إدخال رقم هاتف جزائري صحيح مثل 0550000000.",

    "ÙŠØ±Ø¬Ù‰ ØªØ¹Ø¨Ø¦Ø© Ø§Ù„Ø§Ø³Ù… ÙˆØ±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÃ™Â ÙˆØ§Ù„Ø¹Ù†ÙˆØ§Ù† ÙƒØ§Ù…Ù„ÙŠÙ†.":
        "يرجى تعبئة الاسم ورقم الهاتف والعنوان كاملين.",
}


dictionary.update(manual)


# ------------------------------------------------------------
# 5. Replace longest strings first.
# ------------------------------------------------------------

for bad in sorted(dictionary, key=len, reverse=True):
    if bad in unified:
        unified = unified.replace(bad, dictionary[bad])


# ------------------------------------------------------------
# 6. Remaining simple mojibake:
#    Try decoding individual text segments.
# ------------------------------------------------------------

def repair_segment(match):
    value = match.group(0)

    # Don't touch normal ASCII.
    if not re.search(r"[ØÙÃÂâ™†]", value):
        return value

    candidate = decode_candidate(value)

    # Only accept if Arabic increased significantly.
    if (
        len(re.findall(r"[\u0600-\u06ff]", candidate))
        >
        len(re.findall(r"[\u0600-\u06ff]", value))
    ):
        return candidate

    return value


# Apply only inside quoted strings.
def repair_quoted(match):
    quote = match.group(1)
    body = match.group(2)

    repaired = repair_segment(
        re.match(r".*", body, re.S)
    ) if False else decode_candidate(body)

    # Accept only when it actually improves quality.
    if quality(repaired) > quality(body):
        return quote + repaired + quote

    return match.group(0)


unified = re.sub(
    r'(["`])((?:\\.|(?!\1).)*)\1',
    repair_quoted,
    unified,
    flags=re.S
)


# ------------------------------------------------------------
# 7. Output.
# ------------------------------------------------------------

out_path.write_text(unified, encoding="utf-8")


# ------------------------------------------------------------
# 8. Statistics.
# ------------------------------------------------------------

arabic = len(re.findall(r"[\u0600-\u06ff]", unified))
qmarks = len(re.findall(r"\?{2,}", unified))
moji = len(re.findall(r"[ØÙÃÂâ™†]", unified))
controls = len(re.findall(r"[\x80-\x9f]", unified))

print("===== DICTIONARY RECOVERY TEST =====")
print("Clean Arabic chunks :", len(clean_chunks))
print("Dictionary entries  :", len(dictionary))
print("Output size         :", out_path.stat().st_size)

print()
print("===== QUALITY =====")
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
    print(f"{name:24} = {name in unified}")

print()
print("===== IMPORTANT REMAINING MOJIBAKE =====")

lines = unified.splitlines()

count = 0

for i, line in enumerate(lines, 1):
    if re.search(r"[ØÙÃÂâ™†]|\?{2,}|[\x80-\x9f]", line):
        print()
        print("LINE", i)
        print(line)
        count += 1

        if count >= 80:
            break

print()
print("TEST FILE:", out_path)
