from pathlib import Path

src = Path("src/App.jsx")
text = src.read_text(encoding="utf-8-sig")

replacements = {
    # format price
    'return `${value.toLocaleString("fr-DZ")} ??`;':
        'return `${value.toLocaleString("fr-DZ")} دج`;',

    # Free extras
    'name: "???"':
        'name: "بصل"',
    'name: "????"':
        'name: "دبشة"',
    'name: "ف?ف?"':
        'name: "فلفل"',

    # Close buttons
    '                �':
        '                ×',

    # Story
    '''            ??? ????? ?? ????? ???ف?ف ???
            ?????? ???????? ?????? ?????
            ???? ????? ??? ???? ??????
            ???????.''':
        '''            يتم إعداد كل شباتي وملفوف عند
            الطلب، باستخدام مكونات طازجة
            وطهي متقن، حتى يصلك طلبك ساخناً
            ولذيذاً.''',
}

for old, new in replacements.items():
    if old not in text:
        print("NOT FOUND:", repr(old))
    else:
        count = text.count(old)
        print(f"REPLACE {count}x:", repr(old), "=>", repr(new))
        text = text.replace(old, new)

out = Path("src/App.jsx.repair-test-8.jsx")
out.write_text(text, encoding="utf-8")

print()
print("Created:", out)
