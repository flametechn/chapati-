from pathlib import Path

src = Path("src/App.jsx")
text = src.read_text(encoding="utf-8-sig")

def u(s):
    return s.encode("ascii").decode("unicode_escape")

replacements = {
    # ============================================================
    # PRODUCT OPTIONS
    # ============================================================
    'name: "???"':
        'name: "' + u(r'\u0628\u0635\u0644') + '"',

    'name: "????"':
        'name: "' + u(r'\u062f\u0628\u0634\u0629') + '"',

    'name: "ف?ف?"':
        'name: "' + u(r'\u0641\u0644\u0641\u0644') + '"',

    # ============================================================
    # PRICE
    # ============================================================
    'return `${value.toLocaleString("fr-DZ")} ??`;':
        'return `${value.toLocaleString("fr-DZ")} ' +
        u(r'\u062f\u062c') + '`;',

    # ============================================================
    # CLOSE BUTTONS
    # ============================================================
    '                �':
        '                ×',

    # ============================================================
    # STORY
    # ============================================================
}

for old, new in replacements.items():
    if old not in text:
        print("NOT FOUND:", repr(old))
    else:
        count = text.count(old)
        print("REPLACE", count, "x:", repr(old))
        text = text.replace(old, new)

# ============================================================
# SESSION ERROR
# ============================================================
old = 'setAuthLoginError("???? ????? ???? ????? ??????.");'

new = (
    'setAuthLoginError("' +
    u(r'\u062a\u0639\u0630\u0631 \u0625\u0646\u0634\u0627\u0621 \u062c\u0644\u0633\u0629 \u0627\u0644\u062f\u062e\u0648\u0644.') +
    '");'
)

if old in text:
    print("REPLACE session error")
    text = text.replace(old, new, 1)
else:
    print("NOT FOUND session error")

# ============================================================
# GLOW COMMENTS
# ============================================================
comments = {
    '/* ?????? ???????? */':
        '/* ' + u(r'\u0627\u0644\u0625\u0636\u0627\u0621\u0629 \u0627\u0644\u0645\u062a\u0648\u0647\u062c\u0629') + ' */',

    '/* ???? ???? ????? */':
        '/* ' + u(r'\u0647\u0627\u0644\u0629 \u0627\u0644\u0645\u0646\u062a\u062c') + ' */',

    '/* ????? ??? ??? ?????? */':
        '/* ' + u(r'\u062a\u0623\u062b\u064a\u0631 \u0627\u0644\u0644\u0645\u0639\u0627\u0646') + ' */',

    '/* ???? ?????? */':
        '/* ' + u(r'\u062a\u062d\u0631\u064a\u0643 \u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0646\u062a\u062c') + ' */',

    '/* ??? ????? ?????? */':
        '/* ' + u(r'\u062a\u062d\u0631\u064a\u0643 \u0635\u0648\u0631\u0629 \u0627\u0644\u0644\u0645\u0646\u062a\u062c') + ' */',

    '/* ??? ?? Glow */':
        '/* ' + u(r'\u0646\u0628\u0636 Glow') + ' */',

    '/* ???? ?????? ???????? */':
        '/* ' + u(r'\u0647\u0627\u0644\u0629 \u0627\u0644\u0645\u0646\u062a\u062c') + ' */',

    '/* ???? ?????? */':
        '/* ' + u(r'\u0644\u0645\u0639\u0627\u0646 \u0627\u0644\u0645\u0646\u062a\u062c') + ' */',
}

for old, new in comments.items():
    if old in text:
        print("REPLACE COMMENT:", repr(old))
        text = text.replace(old, new)

# ============================================================
# STORY - replace by section, not fragile whole-text matching
# ============================================================
story_start = '<section className="story">'
story_end = '</section>'

pos = text.find(story_start)

if pos != -1:
    end = text.find(story_end, pos)

    if end != -1:
        section = text[pos:end]

        story_text_start = '<p className="story__text balance">'
        a = section.find(story_text_start)

        if a != -1:
            b = section.find('</p>', a)

            if b != -1:
                before = section[:a + len(story_text_start)]
                after = section[b:]

                story = (
                    '\n'
                    '            ' + u(r'\u064a\u062a\u0645 \u0625\u0639\u062f\u0627\u062f \u0643\u0644 \u0634\u0628\u0627\u062a\u064a \u0648\u0645\u0644\u0641\u0648\u0641 \u0639\u0646\u062f') + '\n'
                    '            ' + u(r'\u0627\u0644\u0637\u0644\u0628\u060c \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0645\u0643\u0648\u0646\u0627\u062a \u0637\u0627\u0632\u062c\u0629') + '\n'
                    '            ' + u(r'\u0648\u0637\u0647\u064a \u0645\u062a\u0642\u0646\u060c \u062d\u062a\u0649 \u064a\u0635\u0644\u0643 \u0637\u0644\u0628\u0643 \u0633\u0627\u062e\u0646\u0627\u064b') + '\n'
                    '            ' + u(r'\u0648\u0644\u0630\u064a\u0630\u0627\u064b.') + '\n'
                    '          '
                )

                section = before + story + after
                text = text[:pos] + section + text[end + len(story_end):]

                print("STORY: REPAIRED")
            else:
                print("STORY </p>: NOT FOUND")
        else:
            print("STORY <p>: NOT FOUND")
    else:
        print("STORY </section>: NOT FOUND")
else:
    print("STORY SECTION: NOT FOUND")

# ============================================================
# WRITE TEST ONLY
# ============================================================
out = Path("src/App.jsx.repair-test-10.jsx")
out.write_text(text, encoding="utf-8")

print()
print("Created:", out)
print("Original size:", len(src.read_text(encoding="utf-8-sig")))
print("Test size    :", len(text))
print()
print("NO App.jsx WAS MODIFIED.")
