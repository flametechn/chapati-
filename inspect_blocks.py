from pathlib import Path

clean = Path("App_clean_git.jsx").read_text(encoding="utf-8-sig").splitlines()
unified = Path("src/App.jsx.backup-before-unified-login-2.bak").read_text(encoding="utf-8-sig").splitlines()

pairs = [
    (6, 12, 14, 20),
    (18, 30, 36, 48),
    (36, 48, 64, 76),
    (128, 135, 263, 270),
    (141, 152, 286, 297),
    (182, 189, 339, 346),
    (200, 212, 362, 374),
]

for ca, cb, ua, ub in pairs:
    print()
    print("=" * 80)
    print(f"CLEAN {ca}..{cb}  <->  UNIFIED {ua}..{ub}")
    print("=" * 80)

    for c, u in zip(clean[ca-1:cb], unified[ua-1:ub]):
        print()
        print("CLEAN  :", repr(c))
        print("UNIFIED:", repr(u))
