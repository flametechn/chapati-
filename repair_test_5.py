from pathlib import Path
import re

src = Path("src/App.jsx.repair-test-4.jsx")
text = src.read_text(encoding="utf-8")
lines = text.splitlines()

fixes = {
    86:  '              −',

    135: '    item.name?.includes("سكالوب")',
    136: '      ? "سكالوب"',
    137: '      : item.name?.includes("كبدة")',
    138: '        ? "كبدة"',
    139: '        : item.name?.includes("ميكس")',
    140: '          ? "ميكس"',
    144: '    ["سكالوب", "كبدة", "ميكس"].includes(item.type)',
    146: '      : detectedFilling || "سكالوب";',
    167: '    ? ["سكالوب", "كبدة", "ميكس"].includes(type)',
    200: '          ? "شيزي"',
    201: '          : "كوموبير",',
    212: '        fillingType === "سكالوب"',
    214: '          : fillingType === "كبدة"',
    225: '      name: "بصل",',
    233: '      name: "فلفل",',
    298: '        aria-label={`خيارات المنتج ${item.name}`}',
    318: '            ×',
    330: '                    "سكالوب",',
    331: '                    "كبدة",',
    332: '                    "ميكس",',
    384: '                    شيزي — {formatPrice(50)}',
    408: '                    كوموبير — {formatPrice(100)}',
    489: '          <h3>الصلصة</h3>',

    2776: '                aria-label="إغلاق"',
    2778: '                ×',
    2787: '                الاسم',
    2803: '                رقم الهاتف',
    2849: '                تسجيل الخروج',

    2885: '                      : "🚚 لوحة السائق"',
    2888: '                      ? "📱 رقم هاتف السائق"',
    2889: '                      : "🔐 تسجيل الدخول"}',

    2894: '                    ? "تم تسجيل الدخول بنجاح."',
    2896: '                      ? "أدخل رقم هاتفك لإكمال حساب السائق."',
    2897: '                      : "أدخل رقم الهاتف وكلمة المرور."',

    2909: '                aria-label="إغلاق"',
    2911: '                ×',
    2923: '                  رقم الهاتف',
    2941: '                  كلمة المرور',
    2951: '                    placeholder="كلمة المرور"',
    2970: '                    ? "جاري التحقق..."',
    2971: '                    : "تسجيل الدخول"}',

    2986: '                  مرحباً{" "}',
    2989: '                      "السائق"}',
    2992: '                  لإكمال حساب السائق،',
    2993: '                  يجب تسجيل رقم الهاتف.',

    2997: '                  رقم الهاتف',

    3028: '                    ? "جاري حفظ الرقم..."',
    3029: '                    : "حفظ رقم الهاتف"}',

    3050: '                        ? "المالك"',
    3051: '                        : "السائق")}',

    3057: '                      "بدون رقم"}',

    3064: '                        👑 حساب المالك',

    3069: '                        ? "جاري تحميل عدد الطلبات..."',
    3074: '                                عدد الطلبات',
    3075: '                                اليوم:{" "}',
    3083: '                          : "تعذر تحميل عدد الطلبات."}',

    3090: '                      ✓ تم تسجيل دخول',
    3091: '                      السائق بنجاح',

    3102: '                    تسجيل الخروج',

    3121: '          aria-label="فتح سلة الطلب"',
    3130: '                سلة الطلب',
    3134: '                اضغط لمراجعة طلبك',
}

for n, replacement in fixes.items():
    if 1 <= n <= len(lines):
        lines[n - 1] = replacement

text = "\n".join(lines) + "\n"

out = Path("src/App.jsx.repair-test-5.jsx")
out.write_text(text, encoding="utf-8")

print("===== REPAIR TEST 5 =====")
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
print("===== REMAINING CORRUPTION =====")

pattern = re.compile(r"[ØÙÃÂâ]|[\x80-\x9f]|\?{2,}")
count = 0

for i, line in enumerate(text.splitlines(), 1):
    if pattern.search(line):
        # ?? المستخدمة في JavaScript مثل ?? ليست فساداً
        if "??" in line and not re.search(r"[ØÙÃÂâ]|[\x80-\x9f]", line):
            continue

        print()
        print("LINE", i)
        print(line)
        count += 1

        if count >= 100:
            break

print()
print("Displayed:", count)
print()
print("NO App.jsx WAS MODIFIED.")
