from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageChops

ROOT = Path(__file__).resolve().parents[5]
OUT = Path(__file__).resolve().parent
SIL = ROOT / "assets/cow-v2/candidates/celebration-dance/silhouette-v2-1/celebration_left_peak_silhouette_v2_1.png"
IDLE = ROOT / "assets/cow-v2/reference/idle_master.png"

W, H = 192, 208
sil = Image.open(SIL).convert("RGBA")
mask = sil.getchannel("A")
canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(canvas)

# Warm, deliberately simple blockout palette: volume and occlusion first.
base = (220, 157, 25, 255)
light = (245, 183, 38, 255)
mid = (194, 126, 19, 255)
shadow = (137, 78, 18, 235)
deep = (92, 54, 25, 210)
hoof = (125, 116, 153, 255)
hoof_hi = (166, 153, 190, 255)

# One continuous torso: neck, shoulder, rib cage, belly and pelvis overlap.
d.ellipse((68, 22, 130, 93), fill=base)
d.polygon([(70, 52), (122, 49), (139, 83), (133, 125), (126, 151),
           (111, 166), (73, 162), (54, 143), (47, 108), (51, 78)], fill=base)
d.ellipse((46, 78, 133, 163), fill=base)
d.ellipse((39, 104, 136, 167), fill=base)

# Head grows out of a neck cylinder; no rectangular identity paste.
d.ellipse((73, 7, 121, 51), fill=light)
d.polygon([(77, 39), (117, 38), (126, 67), (113, 79), (78, 72), (67, 58)], fill=base)
d.ellipse((69, 51, 125, 79), fill=base)
d.ellipse((78, 59, 116, 76), fill=light)
d.ellipse((83, 60, 112, 74), fill=(220, 200, 178, 255))
d.ellipse((91, 64, 96, 69), fill=(75, 56, 50, 255))
d.ellipse((101, 64, 106, 69), fill=(75, 56, 50, 255))
d.arc((88, 67, 108, 75), 10, 170, fill=(104, 72, 64, 255), width=1)
# horns and ears, kept small so they read as identity anchors not surface finish.
d.polygon([(76, 16), (68, 8), (70, 6), (80, 13)], fill=deep)
d.polygon([(118, 15), (127, 7), (128, 10), (121, 20)], fill=deep)
d.polygon([(73, 22), (62, 17), (65, 27), (77, 29)], fill=light)
d.polygon([(119, 22), (130, 17), (127, 28), (118, 29)], fill=light)

# Left raised arm: shoulder -> thick upper arm -> elbow -> forearm -> fist.
d.ellipse((42, 42, 76, 78), fill=base)
d.polygon([(47, 48), (61, 45), (67, 65), (56, 81), (44, 73)], fill=mid)
d.ellipse((42, 65, 61, 91), fill=base)
d.polygon([(43, 74), (54, 66), (63, 77), (55, 93), (43, 89)], fill=light)
d.ellipse((36, 85, 55, 105), fill=base)
d.ellipse((35, 89, 50, 104), fill=hoof)
d.ellipse((37, 89, 45, 96), fill=hoof_hi)

# Right arm is a wide foreground volume crossing the belly, not a line.
d.ellipse((116, 56, 143, 96), fill=mid)
d.polygon([(119, 69), (137, 72), (145, 91), (137, 111), (124, 109), (114, 91)], fill=base)
d.ellipse((108, 91, 145, 116), fill=light)
d.polygon([(110, 94), (143, 94), (145, 108), (133, 117), (112, 111)], fill=mid)
d.ellipse((101, 99, 119, 117), fill=hoof)
d.ellipse((103, 100, 111, 107), fill=hoof_hi)

# Pelvis and legs overlap the torso with explicit large thigh masses.
d.ellipse((50, 133, 91, 177), fill=mid)
d.ellipse((93, 135, 131, 174), fill=base)
# Left load-bearing leg: compact, vertical, planted.
d.polygon([(53, 143), (82, 145), (80, 177), (73, 199), (53, 199), (48, 175)], fill=base)
d.ellipse((51, 169, 80, 192), fill=light)
d.polygon([(55, 181), (77, 180), (75, 201), (55, 201)], fill=mid)
d.ellipse((48, 195, 78, 207), fill=hoof)
d.ellipse((54, 196, 65, 202), fill=hoof_hi)
# Right leg: a separate side-extended thigh/knee/calf with a grounded foot.
d.polygon([(95, 143), (125, 141), (139, 153), (151, 164), (146, 179),
           (129, 181), (113, 170), (96, 166)], fill=base)
d.ellipse((126, 158, 153, 183), fill=light)
d.polygon([(140, 168), (158, 171), (166, 188), (157, 197), (144, 190)], fill=mid)
d.polygon([(154, 184), (169, 187), (170, 199), (157, 202), (149, 194)], fill=base)
d.ellipse((151, 195, 176, 207), fill=hoof)
d.ellipse((157, 196, 166, 202), fill=hoof_hi)

# A few broad planes clarify overlap; no skeleton or guide strokes.
d.polygon([(52, 109), (75, 119), (88, 151), (70, 160), (52, 145)], fill=shadow)
d.polygon([(89, 78), (121, 82), (129, 121), (118, 143), (91, 135)], fill=light)
d.polygon([(84, 145), (105, 143), (111, 161), (99, 173), (82, 166)], fill=shadow)
d.polygon([(116, 96), (143, 98), (143, 110), (121, 115)], fill=light)

# Hard-lock the approved V2.1 outer boundary while retaining only internal volume work.
canvas.putalpha(ImageChops.multiply(canvas.getchannel("A"), mask))
canvas.save(OUT / "celebration_left_peak_volume_blockout_v1.png")

up = canvas.resize((W * 4, H * 4), Image.Resampling.NEAREST)
up.save(OUT / "celebration_left_peak_volume_blockout_v1_4x.png")

def label(im, title, color=(250, 246, 235, 255)):
    layer = Image.new("RGBA", (im.width, im.height + 28), (34, 30, 27, 255))
    layer.alpha_composite(im, (0, 28))
    ld = ImageDraw.Draw(layer)
    ld.text((8, 7), title, fill=color)
    return layer

v2 = Image.open(SIL).convert("RGBA")
comparison = Image.new("RGBA", (W * 2 + 12, H + 28), (34, 30, 27, 255))
comparison.alpha_composite(label(v2, "V2.1 Silhouette"), (0, 0))
comparison.alpha_composite(label(canvas, "Volume Blockout V1"), (W + 12, 0))
comparison.save(OUT / "v2_1_silhouette_vs_volume_blockout_v1.png")

ref = Image.open(IDLE).convert("RGBA")
refcomp = Image.new("RGBA", (W * 2 + 12, H + 28), (34, 30, 27, 255))
refcomp.alpha_composite(label(ref, "Volume / identity reference"), (0, 0))
refcomp.alpha_composite(label(canvas, "Volume Blockout V1"), (W + 12, 0))
refcomp.save(OUT / "volume_reference_vs_volume_blockout_v1.png")

# Pure-character preview is intentionally identical to the main candidate and has no guides.
canvas.save(OUT / "volume_blockout_v1_character_preview.png")
