import os
from PIL import Image, ImageOps

src_dir = r'c:\Users\rishi\OneDrive\Documents\portfolio\brand logos'
out_dir = r'c:\Users\rishi\OneDrive\Documents\portfolio\assets\brands'
os.makedirs(out_dir, exist_ok=True)

# 1. SAMSUNG: Trim and ensure pure black
def process_samsung():
    im = Image.open(os.path.join(src_dir, 'samsung.png'))
    bbox = im.getbbox()
    cropped = im.crop(bbox)
    # Convert non-transparent pixels to dark monochrome #111111 (17, 17, 17)
    r, g, b, a = cropped.split()
    # Create black RGB image with same alpha
    black = Image.new('RGB', cropped.size, (17, 17, 17))
    out = Image.merge('RGBA', (black.split()[0], black.split()[1], black.split()[2], a))
    out.save(os.path.join(out_dir, 'samsung.png'))
    print("Processed samsung.png:", out.size)

# 2. LEAF: Trim and ensure pure black
def process_leaf():
    im = Image.open(os.path.join(src_dir, 'leaf.png'))
    bbox = im.getbbox()
    cropped = im.crop(bbox)
    r, g, b, a = cropped.split()
    black = Image.new('RGB', cropped.size, (17, 17, 17))
    out = Image.merge('RGBA', (black.split()[0], black.split()[1], black.split()[2], a))
    out.save(os.path.join(out_dir, 'leaf.png'))
    print("Processed leaf.png:", out.size)

# 3. AADHAAR: Yellow sun + red fingerprint + red text -> all to solid #111 with alpha
def process_aadhar():
    im = Image.open(os.path.join(src_dir, 'aadhar.png'))
    bbox = im.getbbox()
    cropped = im.crop(bbox)
    # Any colored pixel with alpha > 30 should become #111 with its alpha
    datas = cropped.getdata()
    new_data = []
    for item in datas:
        r, g, b, a = item
        if a > 20 and (r < 250 or g < 250 or b < 250 or (r > 200 and g > 200 and b < 50)): # colored
            new_data.append((17, 17, 17, a))
        else:
            new_data.append((17, 17, 17, 0))
    out = Image.new('RGBA', cropped.size)
    out.putdata(new_data)
    out.save(os.path.join(out_dir, 'aadhar.png'))
    print("Processed aadhar.png:", out.size)

# 4. KOTAK: Blue circle + red bar + red/blue text -> #111, white infinity loop -> cutout / transparent
def process_kotak():
    im = Image.open(os.path.join(src_dir, 'Kotak_Mahindra_Bank_logo 1.png'))
    bbox = im.getbbox()
    cropped = im.crop(bbox)
    datas = cropped.getdata()
    new_data = []
    for item in datas:
        r, g, b, a = item
        if a < 20:
            new_data.append((17, 17, 17, 0))
        elif r > 240 and g > 240 and b > 240:
            # White infinity inner loop -> transparent cutout
            new_data.append((17, 17, 17, 0))
        else:
            # Colored logo elements (red & blue) -> #111
            new_data.append((17, 17, 17, a))
    out = Image.new('RGBA', cropped.size)
    out.putdata(new_data)
    out.save(os.path.join(out_dir, 'kotak.png'))
    print("Processed kotak.png:", out.size)

# 5. MONEYCONTROL: Green flag -> #111, white 'm' -> transparent cutout
def process_moneycontrol():
    im = Image.open(os.path.join(src_dir, 'money control.png'))
    bbox = im.getbbox()
    cropped = im.crop(bbox)
    datas = cropped.getdata()
    new_data = []
    for item in datas:
        r, g, b, a = item
        if a < 20:
            new_data.append((17, 17, 17, 0))
        elif r > 220 and g > 220 and b > 220:
            # White 'm' cutout
            new_data.append((17, 17, 17, 0))
        else:
            # Green flag -> #111
            new_data.append((17, 17, 17, a))
    out = Image.new('RGBA', cropped.size)
    out.putdata(new_data)
    out.save(os.path.join(out_dir, 'moneycontrol.png'))
    print("Processed moneycontrol.png:", out.size)

# 6. MMC (Maharashtra Medical Council): Blue outer ring & symbol -> #111, light grayish inner background -> cutout
def process_mmc():
    im = Image.open(os.path.join(src_dir, 'maharashtra medical council.png'))
    bbox = im.getbbox()
    cropped = im.crop(bbox)
    datas = cropped.getdata()
    new_data = []
    for item in datas:
        r, g, b, a = item
        if a < 20:
            new_data.append((17, 17, 17, 0))
        else:
            # Check brightness: dark pixels (< 130) are the blue text/rings/symbols
            brightness = 0.299 * r + 0.587 * g + 0.114 * b
            if brightness < 125:
                # dark emblem elements
                new_data.append((17, 17, 17, a))
            else:
                # light background of seal -> transparent cutout
                new_data.append((17, 17, 17, 0))
    out = Image.new('RGBA', cropped.size)
    out.putdata(new_data)
    out.save(os.path.join(out_dir, 'mmc.png'))
    print("Processed mmc.png:", out.size)

process_samsung()
process_leaf()
process_aadhar()
process_kotak()
process_moneycontrol()
process_mmc()
