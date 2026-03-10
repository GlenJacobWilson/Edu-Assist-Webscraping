import requests
import urllib3
import json
import base64
from bs4 import BeautifulSoup 

# --- AI IMPORTS ---
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer
import nltk

# Download necessary NLTK data (Run once automatically)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    nltk.download('punkt_tab')

# 1. Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 2. Create a Persistent Session
session = requests.Session()

# 3. CONFIGURE HEADERS & TOKEN
# ⚠️ IMPORTANT: Replace this with your NEW x-Token from the browser ⚠️
CURRENT_TOKEN = 'Lror+qZVNY0cAFcWeA56lfC2f05b_HdyVjQc9w6SLB5pg7wl3q2aORpW16MiFZARU3FwcyzTNddOU2wIRVJCIDR470Spzyu2OSAFTUvkwV_Tc333YVD2MUJegSljUfkzskYbuGdIK9wiDAB_AwpHjePfxKv5b0Oh16sZFbg9kWMYQiA88z3uHtNnwuYf49y2MSC1o0Nwo2U8JDf7RaJlExv7HoBJe69Y3k433Wp8DQxS9k_xr_JUGsFwFUF5ByFk8xc0Oi0n9942Rzl4YV-ZQz6-8ziMRvyYAWtBnezyBOBuRZAUNnd-BU6OatONL835CdD2CN7uBgVPvefZXTjf_eDV_2eW_21Gq0F8D0waPOVwP-6lDzyaI-4sqKAr40SbBgBJ9W4pPO18CXaHTd5ZU5tbl29cGl9aVLu7gktPJTBrn_nTfeVoheK6gXKVjbeQJBy0TM0IobPDHauZ60rqK76PIIAo7g5PREJFOeuKHUMSl6BRgTW1TwOvOYPV0MeFrSWA2JNLbB8MOCVl0LtIFSvDOOPO50VHU30MY7zJvpsFBsVHEtLHM6b_P9gIzCfLi6TO3DnoJtWo1_dODl8o5zFtB9OI3fNlWqqBXjPygvPcFunlkpB6CAgdHuRJGFohdOvr-fVKjCusC3Qth0NMF0GxRLw626p7B71Z6-R-DyaeSS7ajm_do2l9rHJmEYD0ruJon9uhr7Ef8R0VcZIEVRYNx26L5jRqbfndckwsZzNT1SP06DHc-hTPuWQX65WO1WQ5puiQpVbN-gNA90xxcGSzDjdHvArChUvNe8jtxZuAbvpgekJvemBVBfjT-AHByebFOZxHVe8CWg1pl_9HBZt7L1blLqKX3X0vlfinxUfp20G4m0nWcWLRP1hgD4OfeYzVgY1fG7y2F26IgpGCVVnEvI91j-Cg8Qz0BT95Xrk5wYB-cZXXe-cnVgkx5MVmZP17OFdOpq03WY9jVXRT36Vhbg7AUPjD0i1_QlNZ1fESgq60G0B5U0Jh-Uukbr-5AqWuarLq8P3Ujw5mUZTAmjwZ6eEvKbcYrJ4ClYWeOgRUI4InWSydqSqgrfQVfG2z0R81pN_Sq47sxAEWfmcdTbQ0mizcYwvcpx6_rn02M4ur3MjuBUrntFuYvcKgemClI8CkwKyQR8O-6BmqRMflz2-Ey9ojOWiAG9murhXNzv7_Q3zLIZROkkJnOG21C979oOeqE8cT9BbnzIUWlOgfGiVkeIbvmtz453bmPqwRB_t0j1dTVIk6n-vmFiccadO8_Qoh38OTad7oQOvzTcxUTofJ1Fgsgo7BjwW53huC5NFdh1l2TZ100u-XPnBYaJFFa-w0CIrub9TRI-HARgI1PC0VbfxxAhGBisIzSv88NNHgUUn5briM6Eaizd0BNuxJycxZhsa4ieMT8nbLLhEim42DJKASabrbxuj8UCcqQZFcalVJuy3Cbwbj_g7lO6OLd8wM6qT1Nfit_Yj6mTMtOEA83iDWqR0YUK-CtTh_Y2SPMZY3qXXwRgX1Rw39A-8kcu48QSqSX0QHxVxwFgqXLhbv4vqWwPiaUg63wKzf6CvYVyTnBXMB6pPhLSbRjkf7eDNnL6EUgHRv-vfMPXKN7yXAQUZinnuTMBPab73ttxoocIbG5L1k7FSR3SVXimeyROu9zXkW33Ba-_j_XX2iSFdXDZwCKsql0RNtKoHVXq8xvslVIn1nUBtGkSnA2BxhFjS25_EZp6sL3WtK3F45z4bT2KNfOFXi0NsWPDkrW0Igk82c-RJKxdwx8Y-WvyNpsPXQb3f4a4vGrvjz9hvCIX9fYm3amctimDPQKmKWkV9BGcPZMyJoj8--X0mZhoRkafEv7mLgYul2cg7CFl3CdAk7rkN5VgGedTE0_AFgjnd6vECVKt18IMz-GNdcokiYoI0Y2BREmA-oAeZIrqMKNl8sfVpYMdnWnZOyOaxRL1ju96nRQC2TLQggYwGcizVAB3yN3-QBQ9hIcva_YxABgXRsk7tLVGL6ZX4kQOnpElf_zgV_WpSP-C5xvit_WBJ7Hbg9EPzbhMID84-LKRNEzLjIJ3nimX-AmswB1g2ll_1Fl6m9PNHuoJJiOYG4QKM19650n4Ky88L4QY++6LfKyPAqAAAAAGBsUvD6QfSnqOyFFuzzVxT3s9dx'

session.headers.update({
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'Origin': 'https://ktu.edu.in',
    'Referer': 'https://ktu.edu.in/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    'x-Token': CURRENT_TOKEN
})

# --- URGENCY CHECK FUNCTION ---
def check_urgency(title, message):
    # Ensure inputs are strings (Fixes "NoneType" error)
    title = title or "" 
    message = message or ""
    
    urgent_keywords = ['exam', 'registration', 'fee', 'time table', 'deadline', 'result', 'postponed', 'hall ticket']
    
    combined_text = (title + " " + message).lower()
    
    for keyword in urgent_keywords:
        if keyword in combined_text:
            return True
    return False

# --- AI SUMMARY FUNCTION ---
def generate_summary(html_content, title):
    # Ensure inputs are strings
    html_content = html_content or ""
    title = title or ""

    # 1. Clean HTML to Text
    soup = BeautifulSoup(html_content, 'html.parser') 
    text = soup.get_text(" ", strip=True) 
    
    # 2. INTELLIGENT FALLBACK
    if len(text) < 50: 
        return f"📌 {title}"

    # 3. Run TextRank AI on longer text
    try:
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = TextRankSummarizer()
        summary = summarizer(parser.document, 1) 
        
        if summary:
            return str(summary[0])
        return text[:100] + "..."
    except Exception as e:
        return text[:100] + "..."

def get_ktu_announcements():
    url = 'https://api.ktu.edu.in/ktu-web-portal-api/anon/announcemnts'
    json_data = {'number': 0, 'searchText': '', 'size': 20}

    try:
        response = session.post(url, json=json_data, verify=False)
        
        if response.status_code == 200:
            raw_data = response.json()
            cleaned_list = []
            
            for item in raw_data.get('content', []):
                # Extract attachments
                files = []
                for attachment in item.get('attachmentList', []):
                    files.append({
                        "name": attachment.get('attachmentName'),
                        "id": attachment.get('encryptId')
                    })

                # --- SAFETY FIX: Use 'or ""' to prevent NoneType errors ---
                original_msg = item.get('message') or "" 
                title = item.get('subject') or ""
                
                # 1. Generate Summary
                ai_summary = generate_summary(original_msg, title)
                
                # 2. Check Urgency
                is_urgent = check_urgency(title, original_msg)

                cleaned_list.append({
                    "id": item.get('id'),
                    "date": item.get('announcementDate').split(" ")[0],
                    "title": title,
                    "message": original_msg, 
                    "summary": ai_summary,   
                    "is_urgent": is_urgent,
                    "files": files
                })
                
            return cleaned_list
        else:
            return []

    except Exception as e:
        print(f"Scraper Error: {e}")
        return []

def download_ktu_file(file_id):
    url = "https://api.ktu.edu.in/ktu-web-portal-api/anon/getAttachment"
    payload = { 'encryptId': file_id }

    try:
        response = session.post(url, json=payload, verify=False)
        if response.status_code == 200:
            if response.text.startswith("JVBERi"):
                return base64.b64decode(response.text), "application/pdf"
            try:
                data = response.json()
                if 'dataBytes' in data:
                    return base64.b64decode(data['dataBytes']), "application/pdf"
            except:
                pass
            return response.content, "application/pdf"
        else:
            return None, None
    except Exception:
        return None, None

if __name__ == "__main__":
    print("Testing Announcement Fetch...")
    print(json.dumps(get_ktu_announcements()[:1], indent=2))