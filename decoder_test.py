from pathlib import Path
import re

src = Path("src/App.jsx.backup-before-unified-login-2.bak")
text = src.read_text(encoding="utf-8-sig")

# Explicit reverse mapping for the CP1252 characters that appeared
# during the corruption.
cp1252 = {
    "\u20ac": "\x80",
    "\u201a": "\x82",
    "\u0192": "\x83",
    "\u201e": "\x84",
    "\u2026": "\x85",
    "\u2020": "\x86",
    "\u2021": "\x87",
    "\u02c6": "\x88",
    "\u2030": "\x89",
    "\u0160": "\x8a",
    "\u2039": "\x8b",
    "\u0152": "\x8c",
    "\u017d": "\x8e",
    "\u2018": "\x91",
    "\u2019": "\x92",
    "\u201c": "\x93",
    "\u201d": "\x94",
    "\u2022": "\x95",
    "\u2013": "\x96",
    "\u2014": "\x97",
    "\u02dc": "\x98",
    "\u2122": "\x99",
    "\u0161": "\x9a",
    "\u203a": "\x9b",
    "\u0153": "\x9c",
    "\u017e": "\x9e",
    "\u0178": "\x9f",
}

def undo_cp1252_chars(s):
    for a, b in cp1252.items():
        s = s.replace(a, b)
    return s

def try_utf8(s):
    try:
        return s.encode("latin1").decode("utf-8")
    except Exception:
        return s

def repair_once(s):
    s = undo_cp1252_chars(s)
    return try_utf8(s)

def score(s):
    arabic = len(re.findall(r"[\u0600-\u06ff]", s))
    bad = len(re.findall(r"[ØÙÃÂâ™†]", s))
    replacement = s.count("\ufffd")
    return arabic * 10 - bad - replacement * 20

def repair(s):
    best = s
    best_score = score(s)

    # Try several combinations because the file has multiple
    # layers of corruption.
    for _ in range(8):
        candidate = repair_once(best)
        candidate_score = score(candidate)

        if candidate_score > best_score:
            best = candidate
            best_score = candidate_score
        else:
            break

    return best

print("===== DECODER TEST =====")
print("Original size:", len(text))

samples = [
    'Ø£Ø¶Ã™Â\x81 Ø¥Ù„Ù‰ Ø§Ù„³Ù„Ø©',
    'Ø³ÙƒØ§Ù„ÙˆØ¨',
    'ÙƒØ¨Ø¯Ø©',
    'Ø§Ù„ØµÙ„ØµØ©',
    'Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ø³Ù„Ø©',
    'Ù…Ø«Ø§Ù„: Ø£Ø­Ù…Ø¯',
]

for sample in samples:
    print()
    print("INPUT :", repr(sample))
    result = repair(sample)
    print("OUTPUT:", repr(result))

print()
print("===== WHOLE FILE TEST =====")

lines = text.splitlines()
repaired = [repair(x) for x in lines]
final = "\n".join(repaired) + "\n"

arabic = len(re.findall(r"[\u0600-\u06ff]", final))
qmarks = len(re.findall(r"\?{2,}", final))
moji = len(re.findall(r"[ØÙÃÂâ™†]", final))

print("Lines:", len(lines))
print("Arabic characters   :", arabic)
print("???? sequences      :", qmarks)
print("Mojibake characters :", moji)

print()
print("===== IMPORTANT LINES =====")

for i, (old, new) in enumerate(zip(lines, repaired), 1):
    if old != new and (
        re.search(r"[ØÙÃÂâ™†]|\?{2,}", old)
        or re.search(r"[\u0600-\u06ff]", new)
    ):
        print()
        print("LINE", i)
        print("OLD:", old)
        print("NEW:", new)

        if i > 600:
            break

test = Path("src/App.jsx.decoder-test.jsx")
test.write_text(final, encoding="utf-8")

print()
print("TEST FILE:", test)
