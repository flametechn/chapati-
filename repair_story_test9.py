from pathlib import Path

p = Path("src/App.jsx.repair-test-8.jsx")
lines = p.read_text(encoding="utf-8").splitlines()

# STORY — exact current lines 2685-2688
lines[2684] = "            يتم إعداد كل شباتي وملفوف عند"
lines[2685] = "            الطلب، باستخدام مكونات طازجة"
lines[2686] = "            وطهي متقن، حتى يصلك طلبك ساخناً"
lines[2687] = "            ولذيذاً."

out = Path("src/App.jsx.repair-test-9.jsx")
out.write_text("\n".join(lines) + "\n", encoding="utf-8")

print("Created:", out)
print()
print("STORY:")
for n in range(2683, 2690):
    print(f"{n}: {lines[n-1]}")
