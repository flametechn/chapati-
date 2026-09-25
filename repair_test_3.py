from pathlib import Path
import re

src = Path("src/App.jsx.backup-before-unified-login-2.bak")
text = src.read_text(encoding="utf-8-sig")

# إصلاحات مؤكدة من النص الأصلي
replacements = {
    "Ø³ÙƒØ§Ù„ÙˆØ¨": "سكالوب",
    "ÙƒØ¨Ø¯Ø©": "كبدة",
    "Ù…ÙŠÙƒØ³": "ميكس",
    "Ø¨ØµÙ„": "بصل",
    "Ø´ÙŠØ²ÙŠ": "شيزي",
    "ÙƒÙˆÙ…ÙˆØ¨ÙŠØ±": "كوموبير",

    "Ø§Ù„³Ù„Ø©": "السلة",
    "Ø§Ù„Ø³Ù„Ø©": "السلة",
    "Ø§Ù„Ø·Ù„Ø¨": "الطلب",
    "Ø§Ù„ØµÙ„ØµØ©": "الصلصة",
    "Ø§Ù„Ø­Ø´ÙˆØ©": "الحشوة",
    "Ø§Ù„Ø§Ø³Ù…": "الاسم",
    "Ø§Ù„Ù‡Ø§ØªÃ™Â": "الهاتف",
    "Ø±Ù‚Ù…": "رقم",
    "Ø§Ù„Ø¹Ù†ÙˆØ§Ù†": "العنوان",
    "Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹": "المجموع",
    "Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª": "المنتجات",
    "Ø§Ù„ØªÙˆØµÙŠÙ„": "التوصيل",
    "Ø®ÙŠØ§Ø±Ø§Øª": "خيارات",
    "Ø§Ù„Ù…Ù†ØªØ¬": "المنتج",
    "Ø¥ØºÙ„Ø§Ù‚": "إغلاق",
    "Ø¥Ù†Ù‚Ø§Øµ": "إنقاص",
    "Ø²ÙŠØ§Ø¯Ø©": "زيادة",
    "Ø§Ù„ÙƒÙ…ÙŠØ©": "الكمية",
    "Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„": "الاسم الكامل",
    "Ø§Ù„Ø­ÙŠ / Ø§Ù„Ø¹Ù†ÙˆØ§Ù†": "الحي / العنوان",
    "Ø§Ù„Ù…Ø§Ù„Ùƒ": "المالك",
    "Ø§Ù„Ø³Ø§Ø¦Ù‚": "السائق",
    "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬": "تسجيل الخروج",
    "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„": "تسجيل الدخول",
    "Ø§Ù„ÙŠÙˆÙ…": "اليوم",
    "Ø¹Ø¯Ø¯ Ø§Ù„Ø·Ù„Ø¨Ø§Øª": "عدد الطلبات",
}

for bad, good in sorted(replacements.items(), key=lambda x: len(x[0]), reverse=True):
    text = text.replace(bad, good)

# إصلاحات مؤكدة للنصوص التي تضررت بأكثر من طبقة
exact = {
    "Ø£Ø¶Ã™Â Ø¥Ù„Ù‰ Ø§Ù„³Ù„Ø©": "أضف إلى السلة",
    "Ø£Ø¶Ã™Â Ø¥Ù„Ù‰ Ø§Ù„Ø³Ù„Ø©": "أضف إلى السلة",

    "Ø§Ù„Ø¥Ø¶Ø§Ã™ÂØ©": "الإضافة",
    "Ø§Ù„Ø¥Ø¶Ø§Ã™ÂØ§Øª": "الإضافات",

    "Ø­Ø°Ã™Â Ø§Ù„Ù…Ù†ØªØ¬": "حذف المنتج",

    "Ø§Ù„Ù‡Ø§ØªÃ™Â": "الهاتف",

    "Ã™ÂÙ„Ã™ÂÙ„": "فلفل",

    "Ã—": "×",
    "â€”": "—",
    "âˆ’": "−",
}

for bad, good in sorted(exact.items(), key=lambda x: len(x[0]), reverse=True):
    text = text.replace(bad, good)

out = Path("src/App.jsx.repair-test-3.jsx")
out.write_text(text, encoding="utf-8")

print("===== REPAIR TEST 3 =====")
print("Output:", out)

arabic = len(re.findall(r"[\u0600-\u06ff]", text))
moji = len(re.findall(r"[ØÙÃÂâ]", text))
controls = len(re.findall(r"[\x80-\x9f]", text))
qmarks = len(re.findall(r"\?{2,}", text))

print()
print("Arabic characters   :", arabic)
print("Mojibake characters :", moji)
print("Control characters  :", controls)
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
]:
    print(f"{name:24} = {name in text}")

print()
print("===== REMAINING =====")

pattern = re.compile(r"[ØÙÃÂâ]|[\x80-\x9f]|\?{2,}")
count = 0

for i, line in enumerate(text.splitlines(), 1):
    if pattern.search(line):
        print()
        print("LINE", i)
        print(line)
        count += 1

        if count >= 80:
            break

print()
print("Displayed:", count)
print()
print("NO App.jsx WAS MODIFIED.")
