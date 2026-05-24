# -*- coding: utf-8 -*-
import requests
import urllib3
import json
import base64
import os
from bs4 import BeautifulSoup
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer
import nltk

for resource, path in [("punkt", "tokenizers/punkt"), ("punkt_tab", "tokenizers/punkt_tab")]:
    try:
        nltk.data.find(path)
    except LookupError:
        nltk.download(resource, quiet=True)

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Load token from environment variable (for deployment)
# Falls back to hardcoded token for local development
KTU_TOKEN = os.getenv("KTU_TOKEN", "kCxCho5yR30cAFcWeA7ZIlwyaz96il62Tq63HxXN-z8WjhpbzoV_-I6hYatZZOsXTgqrfZsoGgRpBkvBYGxvNK-oRPaeqXv38JY3pNcf0FNraYfjsOscAtWdMtJ07FxYZm8tsoQjS0i94z8jIoNyitijhIFLqN_ILSS2yjsbSL2xhx70CI1tEsUjRY9qogGrFbqAbHuAvm1myKngyrANhSo7NwsfN1aYDiMCUSe_Rs4jwQpQjtsGD_1tkDZdAWh7XLSkZ0bY3TTkKZ4-0Ljzin_LzmObLPDoZTRySjiRvqR4ZuL_9vwiW6WnwSEFcqUoYEEBdDi1yvKnTf16WFxBU-UXMjKYGpCbDy1BhlO8tsljkpOKQxablfAhzVTzN5ItWHYtY0AfzqHruySc-UkMhXs6s2EPH73IbEvZ88usAct9fqVCJGNZLkMancX1bhvrXk6FWNwidLaf2aNoT_2h35CdYTkQrAVvaVrAAvjZ9xgCsnNnvwohYXiiOtGr0lKTYBE92rnFIaQoNFNLQEhIQyes8xn4Fl2ZBIVvpXH3W0izdUoP_PvzNo7wu7KXSRaG2GR_ko9DzdRDHBb56GMp0nKkLSFjbwME-s4uRbs2ZLZNqw0zJ46An6xxK5ObHIJVb7IkOh-WdMjyx3Jyv4HnRp1Ht0tI2SPNagmlaXyPlKlbj_GYwecKw-mkITcNzFIfE9bHG2Agp4nxjOQeX6m2SPZ2xHNuJGfyusbLsSRNiJ-4ZdaNkyvuTJmuTsiQGO5yheW30pn2wOhZkpIFD1n1iPAEM19gt8UWsjVmplVqTcw9gdY7etJtW1uvcLNgcVNEJp2g1rENSjvx31cvE34nDhCFUtoPdmb4KEsAw0f3JIYxUD59hnLUOdt0_QhAPpiLJDfdCAFq3GTEczRNo5lwHSa5BQ5QKXXa6XzUpbhrh8YFZ7fuy8ImLjcDdS8IOvhCTxeg9AlmPj_Zl5l3Zzka0EduAOf3t53eraQgsqWH_GGsEB15UVqoq961r4MbN2H7tS-DX40IR4b50xZOgS-XLsWAE9x2Uv56QlLzHqhDv_-PP7R5blFgoz1mInGhF_cXBavfEbvgV8oyKVDtJVb40dEG9qMit1Tg5BerB6-vwTLVmtgAuimBBKRxeMwYnBNW8PhScfM62IkZxShhYO3P8PiG7-K8sMyJICclKLaQM2uVJngPaPREetkj3OFmAKST_SBnYZ_kHp6N3m8Pdk2r5MWSWL6M4h70iVsUTIWgf-J04capspRQqmNtbSSRYhWVd_daK_5F4G6t-TEsLoQ7P9FZwd5YWkJh1YT-VA59TP_hhtfcNFi0w-gUxyokA-ePo6s47xZ5VHoLGVLy9uQKOb3ru6S9kd6fTnVYz6reIWiASdrclj9Lobf6opbS1R2YrnwmnSboI9h9CIKfS1jUH5MVyPmEB8-7qSU7vMBx_YjDGiwwQmcRrrDZpHCLWoqHgdlgFfEppXfwHup8fbjfpcEP-NZ5PRALBbE-L1KMfVUMKf_qfcUNJ97vr9a2M1DI_lgvMuueMOokUISlBM_YkzLUJI0L9fC6W81CHBzGjx_i8hlI5QQ8jd0xN8ZlgD1j7I1tF6FKxlkfAL9ON-gDEEBoVF6a-TUfrsr2B2ER3yhPSySgHXyymk8g75WHeRk91zpnlW9b_Wgf58LsR1KGz5bao3UMBi7VPBeaGlvKd60avBVzdfFvzmKmTmzP45p2t7_NMSiYFMQ09o1j2rIXgJEmW9tbHcEbLhGNTipbt8XLjY9UAmPh_2_9WEwhxG9I2lslRP07RZfIdJssRTVdRey8umS1OIoWIxIEa66_oAl1X1d_vBg6cn6jrrfEYy34avcN0FmAoOWyH4UdouigInzb89g912KqfPyd1Y2LLewBV2Vmt2XknxBxDymKpzg_eKWhmteT9pEBboOAqbpK5biYco7ba6RxjW5eV-Od3JhdbOhLhrIf8_4GR-3_jZXD_pxyUfXSgr8PxTxpxf15qUkbeNE9Vtuo4kL9Fl1EfOqHZW07gqvGEGtaPJNZ3PNPqedTNWc1qIox3Pe_EEk5B7lLIINNDl_6kFjo1dSXo51hHRMA0Rp1x3b7-G7JiK3ohj2D8ZY6bdP7GRxemUuejdV1iVBLtLkbLVjZ9GqB_oMj9ohj3r1cm_N8PBbPLyEKMy3jkqw0_Z5P7896_tqcsw-3oslY46BBpJd++6LfKyPAqAAAAAGBsUvD6QfSnqOyFFuzzVxT3s9dx")

session = requests.Session()
session.headers.update({
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Origin": "https://ktu.edu.in",
    "Referer": "https://ktu.edu.in/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "x-Token": KTU_TOKEN
})
print("[Scraper] Token loaded")


def check_urgency(title, message):
    title = title or ""
    message = message or ""
    urgent_keywords = ["exam","registration","fee","time table","deadline","result","postponed","hall ticket","supplementary","revaluation"]
    combined_text = (title + " " + message).lower()
    return any(kw in combined_text for kw in urgent_keywords)


def generate_summary(html_content, title):
    html_content = html_content or ""
    title = title or ""
    soup = BeautifulSoup(html_content, "html.parser")
    text = soup.get_text(" ", strip=True)
    if len(text) < 50:
        return f"📌 {title}"
    try:
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = TextRankSummarizer()
        summary = summarizer(parser.document, 1)
        if summary:
            return str(summary[0])
        return text[:100] + "..."
    except Exception:
        return text[:100] + "..."


def get_ktu_announcements():
    url = "https://api.ktu.edu.in/ktu-web-portal-api/anon/announcemnts"
    json_data = {"number": 0, "searchText": "", "size": 20}
    try:
        response = session.post(url, json=json_data, verify=False, timeout=15)
        if response.status_code in (400, 401, 403):
            print(f"[Scraper] Token expired ({response.status_code}). Update KTU_TOKEN environment variable.")
            return []
        if response.status_code == 200:
            raw_data = response.json()
            cleaned_list = []
            for item in raw_data.get("content", []):
                files = []
                for attachment in item.get("attachmentList", []):
                    files.append({"name": attachment.get("attachmentName"), "id": attachment.get("encryptId")})
                original_msg = item.get("message") or ""
                title = item.get("subject") or ""
                ai_summary = generate_summary(original_msg, title)
                is_urgent = check_urgency(title, original_msg)
                raw_date = item.get("announcementDate") or ""
                date = raw_date.split(" ")[0] if raw_date else ""
                cleaned_list.append({"id": item.get("id"), "date": date, "title": title, "message": original_msg, "summary": ai_summary, "is_urgent": is_urgent, "files": files})
            return cleaned_list
        print(f"[Scraper] API returned {response.status_code}")
        return []
    except Exception as e:
        print(f"[Scraper] Error: {e}")
        return []


def download_ktu_file(file_id):
    url = "https://api.ktu.edu.in/ktu-web-portal-api/anon/getAttachment"
    try:
        response = session.post(url, json={"encryptId": file_id}, verify=False, timeout=15)
        if response.status_code == 200:
            if response.text.startswith("JVBERi"):
                return base64.b64decode(response.text), "application/pdf"
            try:
                data = response.json()
                if "dataBytes" in data:
                    return base64.b64decode(data["dataBytes"]), "application/pdf"
            except Exception as e:
                print(f"[Scraper] Parse error: {e}")
            return response.content, "application/pdf"
        return None, None
    except Exception as e:
        print(f"[Scraper] Download error: {e}")
        return None, None


if __name__ == "__main__":
    print("Testing...")
    results = get_ktu_announcements()
    if results:
        print(f"Got {len(results)} announcements")
        print(json.dumps(results[0], indent=2))
    else:
        print("No results — update KTU_TOKEN environment variable")