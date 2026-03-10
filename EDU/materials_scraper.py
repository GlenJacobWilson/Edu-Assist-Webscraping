"""
materials_scraper.py
Scrapes ktunotes.in for KTU 2019 Scheme notes and previous year question papers.
Uses direct branch+semester URLs — no ambiguous index pages.
"""

import requests
from bs4 import BeautifulSoup
import re
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE = "https://www.ktunotes.in"

# ── DIRECT BRANCH+SEMESTER URL MAPS ───────────────────────────────────────────
# Notes: ktu-s{N}-{slug}-notes-2019-scheme/
# QP:    ktu-s{N}-{slug}-question-papers/
# S1/S2 are common for all branches.

NOTES_URLS = {
    ("S1", "ALL"):    "/ktu-s1-s2-notes-2019-scheme/",
    ("S2", "ALL"):    "/ktu-s1-s2-notes-2019-scheme/",
    ("S3", "CSE"):    "/ktu-s3-cse-notes-2019-scheme/",
    ("S3", "ECE"):    "/ktu-s3-ece-notes-2019-scheme/",
    ("S3", "MECH"):   "/ktu-s3-me-notes-2019-scheme/",
    ("S3", "CIVIL"):  "/ktu-s3-civil-notes-2019-scheme/",
    ("S3", "IT"):     "/ktu-s3-it-notes-2019-scheme/",
    ("S3", "EEE"):    "/ktu-s3-eee-notes-2019-scheme/",
    ("S4", "CSE"):    "/ktu-s4-cse-notes-2019-scheme/",
    ("S4", "ECE"):    "/ktu-s4-ece-notes-2019-scheme/",
    ("S4", "MECH"):   "/ktu-s4-me-notes-2019-scheme/",
    ("S4", "CIVIL"):  "/ktu-s4-civil-notes-2019-scheme/",
    ("S4", "IT"):     "/ktu-s4-it-notes-2019-scheme/",
    ("S4", "EEE"):    "/ktu-s4-eee-notes-2019-scheme/",
    ("S5", "CSE"):    "/ktu-s5-cse-notes-2019-scheme/",
    ("S5", "ECE"):    "/ktu-s5-ece-notes-2019-scheme/",
    ("S5", "MECH"):   "/ktu-s5-me-notes-2019-scheme/",
    ("S5", "CIVIL"):  "/ktu-s5-civil-notes-2019-scheme/",
    ("S5", "IT"):     "/ktu-s5-it-notes-2019-scheme/",
    ("S5", "EEE"):    "/ktu-s5-eee-notes-2019-scheme/",
    ("S6", "CSE"):    "/ktu-s6-cse-notes-2019-scheme/",
    ("S6", "ECE"):    "/ktu-s6-ece-notes-2019-scheme/",
    ("S6", "MECH"):   "/ktu-s6-me-notes-2019-scheme/",
    ("S6", "CIVIL"):  "/ktu-s6-civil-notes-2019-scheme/",
    ("S6", "IT"):     "/ktu-s6-it-notes-2019-scheme/",
    ("S6", "EEE"):    "/ktu-s6-eee-notes-2019-scheme/",
    ("S7", "CSE"):    "/ktu-s7-cse-notes-2019-scheme/",
    ("S7", "ECE"):    "/ktu-s7-ece-notes-2019-scheme/",
    ("S7", "MECH"):   "/ktu-s7-me-notes-2019-scheme/",
    ("S7", "CIVIL"):  "/ktu-s7-civil-notes-2019-scheme/",
    ("S7", "IT"):     "/ktu-s7-it-notes-2019-scheme/",
    ("S7", "EEE"):    "/ktu-s7-eee-notes-2019-scheme/",
    ("S8", "CSE"):    "/ktu-s8-cse-notes-2019-scheme/",
    ("S8", "ECE"):    "/ktu-s8-ece-notes-2019-scheme/",
    ("S8", "MECH"):   "/ktu-s8-me-notes-2019-scheme/",
    ("S8", "CIVIL"):  "/ktu-s8-civil-notes-2019-scheme/",
    ("S8", "IT"):     "/ktu-s8-it-notes-2019-scheme/",
    ("S8", "EEE"):    "/ktu-s8-eee-notes-2019-scheme/",
}

QP_URLS = {
    ("S1", "ALL"):    "/ktu-s1-s2-question-papers-2019-scheme/",
    ("S2", "ALL"):    "/ktu-s1-s2-question-papers-2019-scheme/",
    ("S3", "CSE"):    "/ktu-s3-cse-question-papers/",
    ("S3", "ECE"):    "/ktu-s3-ece-question-papers/",
    ("S3", "MECH"):   "/ktu-s3-me-question-papers/",
    ("S3", "CIVIL"):  "/ktu-s3-civil-question-papers/",
    ("S3", "IT"):     "/ktu-s3-it-question-papers/",
    ("S3", "EEE"):    "/ktu-s3-eee-question-papers/",
    ("S4", "CSE"):    "/ktu-s4-cse-question-papers/",
    ("S4", "ECE"):    "/ktu-s4-ece-question-papers/",
    ("S4", "MECH"):   "/ktu-s4-me-question-papers/",
    ("S4", "CIVIL"):  "/ktu-s4-civil-question-papers/",
    ("S4", "IT"):     "/ktu-s4-it-question-papers/",
    ("S4", "EEE"):    "/ktu-s4-eee-question-papers/",
    ("S5", "CSE"):    "/ktu-s5-cse-question-papers/",
    ("S5", "ECE"):    "/ktu-s5-ece-question-papers/",
    ("S5", "MECH"):   "/ktu-s5-me-question-papers/",
    ("S5", "CIVIL"):  "/ktu-s5-civil-question-papers/",
    ("S5", "IT"):     "/ktu-s5-it-question-papers/",
    ("S5", "EEE"):    "/ktu-s5-eee-question-papers/",
    ("S6", "CSE"):    "/ktu-s6-cse-question-papers/",
    ("S6", "ECE"):    "/ktu-s6-ece-question-papers/",
    ("S6", "MECH"):   "/ktu-s6-me-question-papers/",
    ("S6", "CIVIL"):  "/ktu-s6-civil-question-papers/",
    ("S6", "IT"):     "/ktu-s6-it-question-papers/",
    ("S6", "EEE"):    "/ktu-s6-eee-question-papers/",
    ("S7", "CSE"):    "/ktu-s7-cse-question-papers/",
    ("S7", "ECE"):    "/ktu-s7-ece-question-papers/",
    ("S7", "MECH"):   "/ktu-s7-me-question-papers/",
    ("S7", "CIVIL"):  "/ktu-s7-civil-question-papers/",
    ("S7", "IT"):     "/ktu-s7-it-question-papers/",
    ("S7", "EEE"):    "/ktu-s7-eee-question-papers/",
    ("S8", "CSE"):    "/ktu-s8-cse-question-papers/",
    ("S8", "ECE"):    "/ktu-s8-ece-question-papers/",
    ("S8", "MECH"):   "/ktu-s8-me-question-papers/",
    ("S8", "CIVIL"):  "/ktu-s8-civil-question-papers/",
    ("S8", "IT"):     "/ktu-s8-it-question-papers/",
    ("S8", "EEE"):    "/ktu-s8-eee-question-papers/",
}

# Department code from DB → branch key
DEPT_TO_BRANCH = {
    "CS": "CSE", "CSE": "CSE",
    "EC": "ECE", "ECE": "ECE",
    "ME": "MECH","MECH":"MECH",
    "CE": "CIVIL","CIVIL":"CIVIL",
    "IT": "IT",
    "EE": "EEE","EEE": "EEE",
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.ktunotes.in/",
}

# Words that appear in nav/footer — skip anchors with these exact texts
_NAV_SKIP = {
    "home","notes","syllabus","question papers","exam timetable","alerts",
    "upload notes","more","lab","ktu faqs","contact us","2024 scheme",
    "2019 scheme","2015 scheme","m-tech","mca","upload","contact","login",
    "register","share","send","solved qp (2019)","solved qp (2015)",
    "2019","2015","s1","s2","s3","s4","s5","s6","s7","s8",
    "mech","civil","cse","ece","eee","it","auto","i - t",
    "curriculum","credit transfer","learn more","university qp (2019)",
    "university qp (2015)","lab","mini projects",
}

# URL path fragments that indicate non-subject pages
_URL_SKIP_FRAGS = [
    "/category/","/tag/","upload","contact","faq","syllabus","examtimetable",
    "ktu-btech","ktu-mca","ktu-m-tech","ktu-2019-scheme","ktu-2015-scheme",
    "ktu-2024-scheme","ktu-announcements","ktu-s1-s2","ktu-s3-2019",
    "ktu-s4-question-papers/","ktu-s5-question-papers/",
    "ktu-s6-question-papers/","ktu-s7-question-papers/",
    "ktu-s6-notes-2019-scheme","ktu-s5-notes-2019-scheme",
    "ktu-s4-notes-2019-scheme","ktu-s3-notes","ktu-s7-notes","ktu-s8-notes",
    "ktu-2019-new-scheme-notes","ktu-s1-s2-notes",
    "ktu-solved","ktu-btech-lab","whatsapp","facebook","instagram",
    "youtube","telegram","linkedin","#","javascript:",
]


def _fetch(url: str):
    try:
        r = requests.get(url, headers=HEADERS, timeout=14, verify=False)
        if r.status_code == 200:
            return BeautifulSoup(r.text, "html.parser")
    except Exception as e:
        print(f"[materials_scraper] {e}")
    return None


def _valid_subject(href: str, text: str) -> bool:
    if not href or not href.startswith(BASE):
        return False
    t = text.strip().lower()
    if not t or len(t) < 4:
        return False
    if t in _NAV_SKIP:
        return False
    for frag in _URL_SKIP_FRAGS:
        if frag in href.lower():
            return False
    path = href.replace(BASE, "").strip("/")
    if len(path) < 8:
        return False
    return True


def get_subject_list(semester: str, branch: str, content_type: str) -> list[dict]:
    """
    Fetch subjects for semester+branch from ktunotes.in.
    content_type: "qp" | "notes"
    branch:       "CSE" | "ECE" | "MECH" | "CIVIL" | "IT" | "EEE"
    """
    sem = semester.upper()
    br  = DEPT_TO_BRANCH.get(branch.upper(), branch.upper())
    if sem in ("S1", "S2"):
        br = "ALL"

    url_map = QP_URLS if content_type == "qp" else NOTES_URLS
    slug = url_map.get((sem, br))
    if not slug:
        return []

    soup = _fetch(BASE + slug)
    if not soup:
        return []

    content = (
        soup.find("div", class_=re.compile(r"entry-content|post-content")) or
        soup.find("article") or
        soup
    )

    subjects, seen = [], set()
    for a in content.find_all("a", href=True):
        href = a["href"].rstrip("/") + "/"
        if href.startswith("//"):
            href = "https:" + href
        elif href.startswith("/") and not href.startswith("//"):
            href = BASE + href

        text = a.get_text(strip=True)
        if href in seen or not _valid_subject(href, text):
            continue

        code_m = re.search(r"\b([A-Z]{2,4}\d{3,4}[A-Z]?)\b", text.upper())
        subjects.append({
            "name": text,
            "url":  href,
            "code": code_m.group(1) if code_m else "",
        })
        seen.add(href)

    return subjects


def get_subject_downloads(page_url: str) -> dict:
    """Scrape a subject page and return download links."""
    soup = _fetch(page_url)
    if not soup:
        return {"name": "", "downloads": []}

    h1 = soup.find("h1") or soup.find("h2")
    name = h1.get_text(strip=True) if h1 else page_url.split("/")[-2].replace("-", " ").title()

    downloads, seen = [], set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "drive.google.com" not in href and "docs.google.com" not in href:
            continue

        m = re.search(r"/d/([a-zA-Z0-9_-]{20,})", href)
        if not m:
            m = re.search(r"[?&]id=([a-zA-Z0-9_-]{20,})", href)
        if not m:
            continue

        fid = m.group(1)
        if fid in seen:
            continue
        seen.add(fid)

        label = a.get_text(strip=True)
        if not label or label.lower() == "download":
            parent, label = a.parent, ""
            for _ in range(5):
                if parent is None:
                    break
                ctx = parent.get_text(" ", strip=True)
                ym = re.search(r"\b(20\d{2})\b", ctx)
                mm = re.search(r"\b(module\s*\d|solved|model|important|set\s*\d)\b", ctx, re.I)
                if ym:
                    label = f"{ym.group(1)} Paper"; break
                if mm:
                    label = mm.group(0).title(); break
                parent = parent.parent
            label = label or "Download"

        downloads.append({
            "label":      label,
            "gdrive_url": f"https://drive.google.com/file/d/{fid}/view",
            "direct_url": f"https://drive.google.com/uc?export=download&id={fid}",
        })

    return {"name": name, "downloads": downloads}


# ── Quick test ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import json
    for br in ["CSE", "MECH", "ECE"]:
        subs = get_subject_list("S6", br, "notes")
        print(f"S6 {br} notes: {len(subs)} subjects")
        for s in subs[:3]:
            print(f"  [{s['code']}] {s['name']}")
        print()
