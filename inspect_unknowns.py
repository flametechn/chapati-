from pathlib import Path

lines = Path("src/App.jsx").read_text(encoding="utf-8-sig").splitlines()

for start, end in [(220,235), (1300,1315), (1728,1862), (2678,2692)]:
    print()
    print("=" * 70)
    print(f"LINES {start} - {end}")
    print("=" * 70)
    for n in range(start, min(end, len(lines)) + 1):
        print(f"{n:4}: {lines[n-1]}")
