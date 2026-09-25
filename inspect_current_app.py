from pathlib import Path

current = Path("src/App.jsx").read_text(encoding="utf-8-sig").splitlines()

print("===== CURRENT APP IMPORTANT AREAS =====")

ranges = [
    (1, 30),
    (125, 240),
    (290, 500),
    (620, 860),
    (1080, 1145),
    (1215, 1300),
    (1400, 1490),
    (1635, 1690),
    (2535, 2585),
    (2600, 2640),
    (2705, 2740),
    (2750, 2860),
    (2870, 3150),
]

for start, end in ranges:
    print()
    print("=" * 70)
    print(f"LINES {start} - {end}")
    print("=" * 70)

    for n in range(start, min(end, len(current)) + 1):
        print(f"{n:4}: {current[n-1]}")
