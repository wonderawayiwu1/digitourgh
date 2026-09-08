#!/usr/bin/env python3
"""Re-export DigiTour data with PHP-identical sources/ image resolution."""
import json
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(r"C:\wamp64\www\DigiTour\DigiTour_Frontend")
SQL_PATH = Path(r"C:\wamp64\www\DigiTour\sql\digitour_db.sql")
OUT_DIR = ROOT / "data"
DEST_IMG_DIR = ROOT / "sources" / "images" / "all_tourist_sites"
HOTEL_IMG_DIR = DEST_IMG_DIR / "Hotels"
UPLOADS_DIR = ROOT / "assets" / "uploads"

FALLBACK_DEST = "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80"
FALLBACK_HOTEL = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"


def split_sql_values(s: str):
    rows = []
    i = 0
    n = len(s)
    while i < n:
        while i < n and s[i] in " \t\r\n,":
            i += 1
        if i >= n:
            break
        if s[i] != "(":
            i += 1
            continue
        i += 1
        fields = []
        while i < n:
            while i < n and s[i] in " \t\r\n":
                i += 1
            if i >= n:
                break
            if s[i] == ")":
                i += 1
                break
            if s[i] == ",":
                i += 1
                continue
            if s[i] == "'":
                i += 1
                buf = []
                while i < n:
                    ch = s[i]
                    if ch == "\\" and i + 1 < n:
                        nxt = s[i + 1]
                        escapes = {"n": "\n", "r": "\r", "t": "\t", "'": "'", '"': '"', "\\": "\\", "0": "\0"}
                        buf.append(escapes.get(nxt, nxt))
                        i += 2
                        continue
                    if ch == "'" and i + 1 < n and s[i + 1] == "'":
                        buf.append("'")
                        i += 2
                        continue
                    if ch == "'":
                        i += 1
                        break
                    buf.append(ch)
                    i += 1
                fields.append("".join(buf))
            elif s[i:i+4].upper() == "NULL" and (i + 4 >= n or s[i + 4] in ",)"):
                fields.append(None)
                i += 4
            else:
                buf = []
                while i < n and s[i] not in ",)":
                    buf.append(s[i])
                    i += 1
                raw = "".join(buf).strip()
                if raw.upper() == "NULL":
                    fields.append(None)
                elif re.fullmatch(r"-?\d+", raw):
                    fields.append(int(raw))
                elif re.fullmatch(r"-?\d+\.\d+", raw):
                    fields.append(float(raw))
                else:
                    fields.append(raw)
        rows.append(fields)
    return rows


def extract_inserts(sql: str, table: str):
    pattern = re.compile(
        rf"INSERT INTO `{table}`\s*\(([^)]+)\)\s*VALUES\s*(.*?);",
        re.IGNORECASE | re.DOTALL,
    )
    all_rows = []
    cols = None
    for m in pattern.finditer(sql):
        cols = [c.strip().strip("`") for c in m.group(1).split(",")]
        all_rows.extend(split_sql_values(m.group(2)))
    return cols or [], all_rows


def rows_to_dicts(cols, rows):
    return [{c: (r[i] if i < len(r) else None) for i, c in enumerate(cols)} for r in rows]


def build_image_map(directory: Path):
    """Mirror PHP dt_get_image_map — exact basename (lowercase) -> filename."""
    exact = {}
    files = []
    if not directory.is_dir():
        return exact, files
    for f in directory.iterdir():
        if not f.is_file():
            continue
        name = f.name
        files.append(name)
        base = f.stem.lower().strip()
        if base not in exact:
            exact[base] = name
    return exact, files


def url_encode_path(rel: str) -> str:
    """Encode each path segment like PHP rawurlencode on filename only."""
    parts = rel.replace("\\", "/").split("/")
    return "/".join(quote(p, safe="") if i == len(parts) - 1 else p for i, p in enumerate(parts))


def resolve_main(title: str, files: list, exact: dict, rel_prefix: str, db_image: str, uploads_prefix: str, fallback: str):
    if db_image:
        if str(db_image).startswith("http://") or str(db_image).startswith("https://"):
            return db_image
        upload = UPLOADS_DIR / db_image
        if upload.is_file():
            return uploads_prefix + db_image

    title = (title or "").strip()
    if not title:
        return fallback

    lower = title.lower()
    if lower in exact:
        return url_encode_path(rel_prefix + exact[lower])

    for f in files:
        if f.lower().startswith(lower):
            return url_encode_path(rel_prefix + f)

    return fallback


def resolve_gallery(title: str, files: list, rel_prefix: str, main_url: str, db_gallery_paths: list):
    images = []
    if main_url and not main_url.startswith("http") and "uploads" in main_url:
        images.append(main_url)
    elif main_url and main_url.startswith("http"):
        # keep only if it's a real upload-style; skip generic unsplash until local found
        pass

    for g in db_gallery_paths or []:
        if not g:
            continue
        if str(g).startswith("http"):
            images.append(g)
        elif (UPLOADS_DIR / g).is_file():
            images.append("assets/uploads/" + g)
        else:
            images.append(g)

    title = (title or "").strip()
    if title:
        main = []
        nums = {}
        for f in files:
            if not f.lower().startswith(title.lower()):
                continue
            # Exact Title.ext
            if re.match(r"^" + re.escape(title) + r"\.[a-z0-9]+$", f, re.I):
                main.append(f)
            else:
                m = re.match(r"^" + re.escape(title) + r" -(\d+)\.", f, re.I)
                if m:
                    nums[int(m.group(1))] = f
        for f in main + [nums[k] for k in sorted(nums)]:
            images.append(url_encode_path(rel_prefix + f))

    # Prefer local sources over unsplash: if we resolved a local main, put it first
    if main_url and "sources/" in main_url:
        images.insert(0, main_url)
    elif main_url and "uploads/" in main_url:
        images.insert(0, main_url)

    # unique preserve order
    seen = set()
    out = []
    for u in images:
        if u and u not in seen:
            seen.add(u)
            out.append(u)

    if not out:
        out = [main_url or FALLBACK_DEST]
    return out


def short_desc(html, length=140):
    if not html:
        return ""
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= length:
        return text
    return text[: length - 1].rstrip() + "…"


def normalize_category(cat):
    if not cat:
        return "Nature & Wildlife"
    cat = str(cat).replace("&amp;", "&").strip()
    if "amp" in cat.lower() and "Wildlife" not in cat and "&" in cat and len(cat) < 20:
        return "Nature & Wildlife"
    return cat


def main():
    sql = SQL_PATH.read_text(encoding="utf-8", errors="replace")
    d_cols, d_rows = extract_inserts(sql, "destinations")
    h_cols, h_rows = extract_inserts(sql, "hotels")
    r_cols, r_rows = extract_inserts(sql, "reviews")
    u_cols, u_rows = extract_inserts(sql, "users")
    b_cols, b_rows = extract_inserts(sql, "bookings")
    gi_cols, gi_rows = extract_inserts(sql, "destination_images")

    destinations = rows_to_dicts(d_cols, d_rows)
    hotels = rows_to_dicts(h_cols, h_rows)
    reviews = rows_to_dicts(r_cols, r_rows)
    users = rows_to_dicts(u_cols, u_rows)
    bookings = rows_to_dicts(b_cols, b_rows)
    gallery_rows = rows_to_dicts(gi_cols, gi_rows) if gi_cols else []

    dest_exact, dest_files = build_image_map(DEST_IMG_DIR)
    hotel_exact, hotel_files = build_image_map(HOTEL_IMG_DIR)

    gallery_by_dest = {}
    for g in gallery_rows:
        did = g.get("destination_id")
        gallery_by_dest.setdefault(did, []).append(g.get("image_path"))

    hotel_counts = {}
    for h in hotels:
        hotel_counts[h["destination_id"]] = hotel_counts.get(h["destination_id"], 0) + 1

    dest_rel = "sources/images/all_tourist_sites/"
    hotel_rel = "sources/images/all_tourist_sites/Hotels/"
    matched_d = 0
    matched_h = 0

    for d in destinations:
        d["category"] = normalize_category(d.get("category"))
        d["is_featured"] = int(d.get("is_featured") or 0)
        d["nearby_hotel_count"] = hotel_counts.get(d["id"], 0)
        d["short_desc"] = short_desc(d.get("description") or "", 140)
        main = resolve_main(
            d["title"], dest_files, dest_exact, dest_rel,
            d.get("image_main") or "", "assets/uploads/", FALLBACK_DEST
        )
        d["image_url"] = main
        d["images"] = resolve_gallery(
            d["title"], dest_files, dest_rel, main, gallery_by_dest.get(d["id"], [])
        )
        if "sources/" in main or "uploads/" in main:
            matched_d += 1

    for h in hotels:
        h["price_per_night"] = float(h.get("price_per_night") or 0)
        main = resolve_main(
            h["name"], hotel_files, hotel_exact, hotel_rel,
            h.get("image") or "", "assets/uploads/", FALLBACK_HOTEL
        )
        h["image_url"] = main
        h["images"] = resolve_gallery(h["name"], hotel_files, hotel_rel, main, [])
        if "sources/" in main:
            matched_h += 1

    dest_map = {d["id"]: d for d in destinations}
    for h in hotels:
        dest = dest_map.get(h["destination_id"])
        h["destination_title"] = dest["title"] if dest else ""
        h["region"] = dest["region"] if dest else ""

    user_map = {u["id"]: u for u in users}
    enriched_reviews = []
    for r in reviews:
        if (r.get("status") or "") != "Approved":
            continue
        u = user_map.get(r["user_id"], {})
        dest = dest_map.get(r.get("destination_id")) if r.get("destination_id") else None
        hotel = next((x for x in hotels if x["id"] == r.get("hotel_id")), None)
        enriched_reviews.append({
            "id": r["id"],
            "rating": int(r["rating"]),
            "comment": r["comment"],
            "full_name": u.get("full_name", "Traveller"),
            "dest_title": dest["title"] if dest else None,
            "hotel_name": hotel["name"] if hotel else None,
            "destination_id": r.get("destination_id"),
            "hotel_id": r.get("hotel_id"),
            "status": "Approved",
        })

    enriched_bookings = []
    for b in bookings:
        hotel = next((x for x in hotels if x["id"] == b["hotel_id"]), None)
        u = user_map.get(b["user_id"], {})
        enriched_bookings.append({
            **b,
            "hotel_name": hotel["name"] if hotel else "Hotel",
            "destination_title": hotel["destination_title"] if hotel else "",
            "user_name": u.get("full_name", ""),
            "total_price": float(b.get("total_price") or 0),
        })

    # Manifest of available source files (for client-side debugging)
    image_manifest = {
        "destinations": sorted(dest_files),
        "hotels": sorted(hotel_files),
        "videos": [p.name for p in (ROOT / "sources" / "videos").glob("*") if p.is_file()],
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "destinations.json").write_text(json.dumps(destinations, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT_DIR / "hotels.json").write_text(json.dumps(hotels, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT_DIR / "reviews.json").write_text(json.dumps(enriched_reviews, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT_DIR / "bookings.json").write_text(json.dumps(enriched_bookings, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT_DIR / "image-manifest.json").write_text(json.dumps(image_manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT_DIR / "meta.json").write_text(json.dumps({
        "site_name": "DigiTour Ghana",
        "tagline": "Smart Tourism & Accommodation Portal",
        "phone_local": "0546004395",
        "phone_e164": "233546004395",
        "tel": "tel:+233546004395",
        "whatsapp": "https://wa.me/233546004395",
        "email_info": "info@digitour.gh",
        "email_support": "support@digitour.gh",
        "address": "Tourism Board Building, Accra, Ghana",
        "total_destinations": len(destinations),
        "total_hotels": len(hotels),
        "matched_destination_images": matched_d,
        "matched_hotel_images": matched_h,
        "regions": sorted({d["region"] for d in destinations}),
        "categories": sorted({d["category"] for d in destinations}),
        "hero_slides": [
            {
                "label": "Kakum Rainforest",
                "title": "Walk Above the Rainforest Canopy",
                "desc": "Experience West Africa's iconic canopy walkway suspended above ancient tropical rainforest in Ghana's Central Region.",
                "url": "destination-detail.html?id=32",
                "video": "sources/videos/kakum-park.mp4",
                "poster": "sources/images/all_tourist_sites/Kakum%20National%20Park%20Canopy%20Walkway.jpg",
            },
            {
                "label": "Cape Coast Heritage",
                "title": "Stand Where History Echoes",
                "desc": "Walk UNESCO World Heritage fortresses overlooking the Atlantic — Cape Coast Castle and Elmina's storied walls.",
                "url": "destination-detail.html?id=33",
                "video": "sources/videos/cape-coast-catle-3.mp4",
                "poster": "sources/images/all_tourist_sites/Cape%20Coast%20Castle.jpg",
            },
            {
                "label": "Larabanga Legacy",
                "title": "Discover Ancient Mud Architecture",
                "desc": "Visit Ghana's oldest mosque (c. 1421) and the sacred Mystic Stone in the heart of the Savannah Region.",
                "url": "destination-detail.html?id=92",
                "video": "sources/videos/larabanga-mosque.mp4",
                "poster": "sources/images/all_tourist_sites/Larabanga%20Mosque.jpg",
            },
            {
                "label": "Nkrumah Memorial",
                "title": "Honor Ghana's Founding Vision",
                "desc": "Explore marble gardens, personal artifacts, and the story of independence at Kwame Nkrumah Memorial Park.",
                "url": "destination-detail.html?id=1",
                "video": "sources/videos/kwame-nkrumah-museum.mp4",
                "poster": "sources/images/all_tourist_sites/Kwame%20Nkrumah%20Memorial%20Park.jpg",
            },
        ],
        "page_bg": [
            "sources/images/all_tourist_sites/Kakum%20National%20Park%20Canopy%20Walkway.jpg",
            "sources/images/all_tourist_sites/Cape%20Coast%20Castle.jpg",
            "sources/images/all_tourist_sites/Wli%20Waterfalls.jpg",
            "sources/images/all_tourist_sites/Mole%20National%20Park.jpg",
        ],
        "demo_users": [
            {"email": "kwame@example.com", "password": "demo123", "name": "Kwame Mensah", "role": "tourist"},
            {"email": "adwoa@example.com", "password": "demo123", "name": "Adwoa Boateng", "role": "tourist"},
            {"email": "admin@digitour.gh", "password": "demo123", "name": "Ghana Tourism Admin", "role": "admin"},
        ],
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Destinations: {len(destinations)} (images matched: {matched_d})")
    print(f"Hotels: {len(hotels)} (images matched: {matched_h})")
    print(f"Source dest files: {len(dest_files)} | hotel files: {len(hotel_files)}")
    # show a few unmatched
    unmatched = [d["title"] for d in destinations if "sources/" not in d["image_url"] and "uploads/" not in d["image_url"]]
    print(f"Unmatched destinations ({len(unmatched)}):", unmatched[:12])
    unmatched_h = [h["name"] for h in hotels if "sources/" not in h["image_url"]]
    print(f"Unmatched hotels ({len(unmatched_h)}):", unmatched_h[:12])
    print("OK ->", OUT_DIR)


if __name__ == "__main__":
    main()
