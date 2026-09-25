from pathlib import Path

lines = Path("src/App.jsx.repair-current-test.jsx").read_text(encoding="utf-8").splitlines()

ranges = [
    (220, 235),
    (1300, 1315),
    (2678, 2692),
    (2780, 2784),
    (2912, 2917),
    (1734, 1860),
]

for start, end in ranges:
    print()
    print("=" * 70)
    print(f"LINES {start} - {end}")
    print("=" * 70)

    for n in range(start, min(end, len(lines)) + 1):
        print(f"{n:4}: {lines[n-1]}")
