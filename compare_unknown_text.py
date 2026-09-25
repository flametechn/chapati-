from pathlib import Path

files = [
    "src/App.jsx",
    "src/App.jsx.repair-test-5.jsx",
]

for filename in files:
    p = Path(filename)

    if not p.exists():
        continue

    lines = p.read_text(encoding="utf-8-sig").splitlines()

    print()
    print("=" * 80)
    print(filename)
    print("=" * 80)

    for start, end in [(1288,1315), (2678,2692)]:
        print()
        print(f"--- LINES {start}-{end} ---")
        for n in range(start, min(end, len(lines)) + 1):
            print(f"{n:4}: {lines[n-1]}")
