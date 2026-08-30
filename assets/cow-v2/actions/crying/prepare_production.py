from pathlib import Path
import json
import hashlib

import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[4]
ASSET_ROOT = ROOT / "assets" / "cow-v2"
SOURCE_DIR = ASSET_ROOT / "candidates" / "crying"
ACTION_DIR = ASSET_ROOT / "actions" / "crying"
ALPHA_DIR = ACTION_DIR / "alpha_hr"
ALIGNED_DIR = ACTION_DIR / "aligned"
PRODUCTION_DIR = ACTION_DIR / "production_192"
QA_DIR = ACTION_DIR / "qa"
FRAMES = [f"f{i:02d}" for i in range(1, 9)]
TARGET = (192, 208)
HR_SCALE = 0.15
HR_CANVAS = (169, 209)


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def near_background(pixel, reference, tolerance=24):
    return max(abs(pixel[i] - reference[i]) for i in range(3)) <= tolerance and max(pixel) >= 220


def alpha_extract(source):
    rgb = source.convert("RGB")
    arr = np.asarray(rgb, dtype=np.int16)
    h, w = arr.shape[:2]
    border = np.concatenate((arr[0], arr[-1], arr[:, 0], arr[:, -1]), axis=0)
    reference = np.median(border, axis=0)
    distance = np.max(np.abs(arr - reference), axis=2)
    candidate = (distance <= 24) & (arr.max(axis=2) >= 220)
    background = np.zeros((h, w), dtype=bool)
    background[0] = candidate[0]
    background[-1] = candidate[-1]
    background[:, 0] |= candidate[:, 0]
    background[:, -1] |= candidate[:, -1]
    # Vectorized 4-connected flood fill; this preserves enclosed white tear highlights.
    while True:
        grown = background.copy()
        grown[1:] |= background[:-1]
        grown[:-1] |= background[1:]
        grown[:, 1:] |= background[:, :-1]
        grown[:, :-1] |= background[:, 1:]
        grown &= candidate
        if np.array_equal(grown, background):
            break
        background = grown

    out = Image.new("RGBA", (w, h))
    result = np.zeros((h, w, 4), dtype=np.uint8)
    result[:, :, :3] = np.asarray(rgb)
    result[:, :, 3] = np.where(background, 0, 255).astype(np.uint8)
    out = Image.fromarray(result, "RGBA")
    return out


def make_frame(frame):
    source_path = SOURCE_DIR / f"crying_{frame}_candidate_hr.png"
    alpha_path = ALPHA_DIR / f"crying_{frame}_alpha_hr.png"
    aligned_path = ALIGNED_DIR / f"crying_{frame}_aligned_hr.png"
    production_path = PRODUCTION_DIR / f"crying_{frame}_production_192.png"
    source = Image.open(source_path)
    alpha = alpha_extract(source)
    alpha.save(alpha_path)
    # All HR frames use one global scale and the same bottom/right placement.
    scaled = alpha.resize(HR_CANVAS, Image.Resampling.LANCZOS)
    aligned = Image.new("RGBA", (1344, 1456), (0, 0, 0, 0))
    aligned.alpha_composite(scaled, (587, 1247))
    aligned.save(aligned_path)
    production = Image.new("RGBA", TARGET, (0, 0, 0, 0))
    small = alpha.resize(HR_CANVAS, Image.Resampling.LANCZOS)
    production.alpha_composite(small.resize((169, 209), Image.Resampling.LANCZOS), (11, -1))
    production.save(production_path)
    return {
        "frame": frame.upper(),
        "source_path": str(source_path.relative_to(ROOT)),
        "source_sha256": sha256(source_path),
        "alpha_path": str(alpha_path.relative_to(ROOT)),
        "aligned_path": str(aligned_path.relative_to(ROOT)),
        "production_path": str(production_path.relative_to(ROOT)),
        "production_sha256": sha256(production_path),
        "canvas": list(TARGET),
        "mode": "RGBA",
        "global_scale_factor": HR_SCALE,
        "per_frame_scale_variation": False,
    }


def labeled_sheet(images, path, columns, cell_size, scale=1):
    width = columns * cell_size[0] * scale
    rows = (len(images) + columns - 1) // columns
    height = rows * (cell_size[1] + 20) * scale
    sheet = Image.new("RGB", (width, height), (238, 238, 238))
    draw = ImageDraw.Draw(sheet)
    for idx, (label, image) in enumerate(images):
        x = (idx % columns) * cell_size[0] * scale
        y = (idx // columns) * (cell_size[1] + 20) * scale
        bg = Image.new("RGB", image.size, (238, 238, 238))
        bg.paste(image, mask=image.getchannel("A") if image.mode == "RGBA" else None)
        sheet.paste(bg.resize((cell_size[0] * scale, cell_size[1] * scale), Image.Resampling.NEAREST), (x, y + 20 * scale))
        draw.text((x + 3 * scale, y + 2 * scale), label, fill=(20, 20, 20))
    sheet.save(path)


def main():
    for directory in (ALPHA_DIR, ALIGNED_DIR, PRODUCTION_DIR, QA_DIR):
        directory.mkdir(parents=True, exist_ok=True)
    records = [make_frame(frame) for frame in FRAMES]
    images = [(r["frame"], Image.open(ROOT / r["production_path"])) for r in records]
    labeled_sheet(images, QA_DIR / "crying_production_contact_sheet.png", 4, TARGET, 2)
    # Alpha backgrounds: representative frames on light, mid-gray and dark backgrounds.
    reps = []
    for label, color in (("LIGHT", (245, 245, 245)), ("MID", (128, 128, 128)), ("DARK", (32, 32, 32))):
        for frame in ("F1", "F4", "F6", "F8"):
            im = Image.open(PRODUCTION_DIR / f"crying_f{int(frame[1:]):02d}_production_192.png").convert("RGBA")
            bg = Image.new("RGBA", TARGET, (*color, 255))
            bg.alpha_composite(im)
            reps.append((f"{label} {frame}", bg.convert("RGB")))
    labeled_sheet(reps, QA_DIR / "crying_alpha_background_qa.png", 4, TARGET, 2)
    # Alignment guide: all frames on one transparent strip with a common baseline.
    strip = Image.new("RGBA", (8 * 192, 208), (0, 0, 0, 0))
    draw = ImageDraw.Draw(strip)
    for i, frame in enumerate(FRAMES):
        im = Image.open(PRODUCTION_DIR / f"crying_{frame}_production_192.png")
        strip.alpha_composite(im, (i * 192, 0))
        draw.line((i * 192, 202, (i + 1) * 192 - 1, 202), fill=(255, 0, 255, 220), width=1)
        draw.line((i * 192 + 96, 0, i * 192 + 96, 207), fill=(0, 180, 255, 170), width=1)
    strip.save(QA_DIR / "crying_alignment_qa.png")
    comparison = Image.new("RGB", (4 * 384, 2 * 416), (238, 238, 238))
    draw = ImageDraw.Draw(comparison)
    for j, frame in enumerate((1, 4, 6, 8)):
        failed_cell = Image.open(ROOT / "spritesheet.webp").convert("RGBA").crop((j * 192, 5 * 208, (j + 1) * 192, 6 * 208))
        crying_cell = Image.open(PRODUCTION_DIR / f"crying_f{frame:02d}_production_192.png").convert("RGBA")
        for cell, label, y in ((failed_cell, "FAILED", 0), (crying_cell, "CRYING", 416)):
            bg = Image.new("RGBA", cell.size, (238, 238, 238, 255))
            bg.alpha_composite(cell)
            comparison.paste(bg.convert("RGB").resize((384, 416), Image.Resampling.NEAREST), (j * 384, y))
            draw.text((j * 384 + 8, y + 8), f"{label} F{frame}", fill=(20, 20, 20))
    comparison.save(QA_DIR / "crying_failed_comparison_qa.png")
    # QA-only GIF; transparent source is preserved in PNG candidates.
    images[0][1].save(QA_DIR / "crying_production_120ms_3loops.gif", save_all=True, append_images=[im for _, im in images[1:]], duration=120, loop=2, disposal=2, transparency=0)
    manifest = {
        "action": "crying",
        "status": "production_candidate_human_review_pending",
        "source_stage": "approved_hr_rgb",
        "alpha_method": "deterministic_border_connected_near_white_flood_fill",
        "alignment_method": "global_scale_plus_integer_translation",
        "global_scale_factor": HR_SCALE,
        "target_canvas": "192x208",
        "mode": "RGBA",
        "frame_order": "F1→F8",
        "frame_count": 8,
        "human_review_status": "PENDING",
        "frames": records,
        "qa_assets": [str(p.relative_to(ROOT)) for p in QA_DIR.iterdir()],
    }
    (ACTION_DIR / "production_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
