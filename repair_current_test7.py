from pathlib import Path
import re

src = Path("src/App.jsx")
text = src.read_text(encoding="utf-8-sig")
lines = text.splitlines()

def u(s):
    return s.encode("ascii").decode("unicode_escape")

fixes = {
    21:  '  return `${value.toLocaleString("fr-DZ")} ' + u(r'\u062f\u062c') + '`;',

    225: '      name: "' + u(r'\u0628\u0635\u0644') + '",',
    229: '      name: "' + u(r'\u062f\u0628\u0634\u0629') + '",',
    233: '      name: "' + u(r'\u0641\u0644\u0641\u0644') + '",',

    1310: '      setAuthLoginError("' + u(r'\u062a\u0639\u0630\u0631 \u0625\u0646\u0634\u0627\u0621 \u062c\u0644\u0633\u0629 \u0627\u0644\u062f\u062e\u0648\u0644.') + '");',

    1737: '        /* ' + u(r'\u0627\u0644\u0625\u0636\u0627\u0621\u0629 \u0627\u0644\u0645\u062a\u0648\u0647\u062c\u0629') + ' */',
    1762: '        /* ' + u(r'\u0647\u0627\u0644\u0629 \u0627\u0644\u0645\u0646\u062a\u062c') + ' */',
    1783: '        /* ' + u(r'\u062a\u0623\u062b\u064a\u0631 \u0627\u0644\u0644\u0645\u0639\u0627\u0646') + ' */',
    1821: '        /* ' + u(r'\u062a\u062d\u0631\u064a\u0643 \u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0646\u062a\u062c') + ' */',
    1830: '        /* ' + u(r'\u0646\u0628\u0636 Glow') + ' */',
    1843: '        /* ' + u(r'\u0647\u0627\u0644\u0629 \u0627\u0644\u0645\u0646\u062a\u062c') + ' */',
    1856: '        /* ' + u(r'\u0644\u0645\u0639\u0627\u0646 \u0627\u0644\u0645\u0646\u062a\u062c') + ' */',

    2782: '                ×',
    2915: '                ×',
}

for n, replacement in fixes.items():
    if 1 <= n <= len(lines):
        lines[n - 1] = replacement

# STORY
story = {
    2685: '            ' + u(r'\u064a\u062a\u0645 \u0625\u0639\u062f\u0627\u062f \u0643\u0644 \u0634\u0628\u0627\u062a\u064a \u0648\u0645\u0644\u0641\u0648\u0641 \u0639\u0646\u062f'),
    2686: '            ' + u(r'\u0627\u0644\u0637\u0644\u0628\u060c \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0645\u0643\u0648\u0646\u0627\u062a \u0637\u0627\u0632\u062c\u0629'),
    2687: '            ' + u(r'\u0648\u0637\u0647\u064a \u0645\u062a\u0642\u0646\u060c \u062d\u062a\u0649 \u064a\u0635\u0644\u0643 \u0637\u0644\u0628\u0643 \u0633\u0627\u062e\u0646\u0627\u064b'),
    2688: '            ' + u(r'\u0648\u0644\u0630\u064a\u0630\u0627\u064b.'),
}

for n, replacement in story.items():
    if 1 <= n <= len(lines):
        lines[n - 1] = replacement

out = Path("src/App.jsx.repair-test-7.jsx")
out.write_text("\n".join(lines) + "\n", encoding="utf-8")

result = out.read_text(encoding="utf-8")

arabic = len(re.findall(r"[\u0600-\u06ff]", result))
moji = len(re.findall(r"[ØÙÃÂâ]", result))
controls = len(re.findall(r"[\x80-\x9f]", result))
qmarks = len(re.findall(r"\?{2,}", result))
replacement_char = result.count("\ufffd")

print("===== REPAIR TEST 7 =====")
print("Output:", out)
print()
print("Arabic characters   :", arabic)
print("Mojibake characters :", moji)
print("Control characters  :", controls)
print("Replacement char    :", replacement_char)
print("???? sequences      :", qmarks)

print()
print("===== FEATURES =====")
for name in [
    "OwnerDashboard",
    "DriverDashboard",
    "unified_login",
    "loginUnified",
    "session_token",
    "chapati_auth_user",
    "driver_session_token",
]:
    print(f"{name:24} = {name in result}")

print()
print("===== JS STRUCTURE =====")
for pattern, label in [
    (r"function\s+\w+\s*\(", "functions"),
    (r"const\s+\w+\s*=", "const"),
    (r"<button\b", "buttons"),
    (r"<input\b", "inputs"),
    (r"<form\b", "forms"),
]:
    print(f"{label:12} = {len(re.findall(pattern, result))}")

print()
print("===== IMPORTANT STRINGS =====")
for s in [
    u(r'\u062f\u062c'),
    u(r'\u0628\u0635\u0644'),
    u(r'\u062f\u0628\u0634\u0629'),
    u(r'\u0641\u0644\u0641\u0644'),
    "×",
    u(r'\u064a\u062a\u0645 \u0625\u0639\u062f\u0627\u062f \u0643\u0644 \u0634\u0628\u0627\u062a\u064a \u0648\u0645\u0644\u0641\u0648\u0641 \u0639\u0646\u062f'),
    "unified_login",
    "const identifier = authPhoneInput.trim();",
    "const password = authPasswordInput;",
    'const sessionToken = result.session_token || "";',
    "item.unitPrice ?? item.price",
    "item.quantity ?? 1",
]:
    print(f"{s:55} = {s in result}")

print()
print("===== REMAINING CORRUPTION =====")

pattern = re.compile(r"[ØÙÃÂâ]|[\x80-\x9f]|\?{2,}|\ufffd")
count = 0

for i, line in enumerate(result.splitlines(), 1):
    if pattern.search(line):
        print(f"LINE {i}: {line}")
        count += 1
        if count >= 100:
            break

print()
print("Displayed:", count)
print()
print("NO App.jsx WAS MODIFIED.")
