s = "Ø£Ø¶Ã™Â\x81 Ø¥Ù„Ù‰ Ø§Ù„Ø³Ù„Ø©"

mp = {
    "€":0x80,"‚":0x82,"ƒ":0x83,"„":0x84,"…":0x85,"†":0x86,"‡":0x87,
    "ˆ":0x88,"‰":0x89,"Š":0x8A,"‹":0x8B,"Œ":0x8C,"Ž":0x8E,
    "‘":0x91,"’":0x92,"“":0x93,"”":0x94,"•":0x95,"–":0x96,"—":0x97,
    "˜":0x98,"™":0x99,"š":0x9A,"›":0x9B,"œ":0x9C,"ž":0x9E,"Ÿ":0x9F
}

def repair_once(x):
    b = bytearray()
    for c in x:
        n = ord(c)
        if n <= 255:
            b.append(n)
        elif c in mp:
            b.append(mp[c])
        else:
            return None
    try:
        return bytes(b).decode("utf-8")
    except:
        return None

print("ORIGINAL:", repr(s))

x = s
for i in range(5):
    y = repair_once(x)
    if y is None:
        break
    x = y
    print("PASS", i + 1, ":", repr(x))

print("FINAL:", x)
