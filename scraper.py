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
CURRENT_TOKEN = 'wklt54NMnN0cAFcWeA7jBaXqpNwAQr998uAv-bY5PIsDHdUzgMSdTO2OGIFEVjLwTQA-Poz0c3w7OMmmiAPQQZPPqzHwjAfEk5tOWJd1TlC_sZvKzrHy7Vt3BSYhWtu2GSQn_5WAaPc3L4zmzvWc1DibHzSmNF2wpf6w-RYZIK56ZDp3_XD8UhwPFBmmyizfSQMvkNRoGCkUGpTC2n_B-4so1s5B6hwGmwBMePBsayS0AetAA99ecJeSHzBoIhyQkUGB2auEUvhmVmiqBc7sLsS4S4gHSRtXmvQiuOJI21EbmdN0rhZe7BZIao8x1I9TL4lNVb0vQaruxQVCuXJHZpQn11gvRTAOZd0Uv76b3qZ8z1Gj3_3FJmnh9bymrMzgjHiDOz7EHjZmuX7soOUTDXFgj_ll6iGh6KlZymtvLcC2R2c0914lcYffvgZ3NYYliU9ptTQlumduGMMPgZiV-UtXNbr3zfhSVBZAhgVB5VF7D5JFHE7tvnmA1nCEr6yI6nGvkEAwPlVPntCBBqi6b8cgvZLl3hdxrha79pF8rduZLVtZkWejZjmQoUrpexm86GX7CkNs4VYmV700DDa94GWxrmLDDF_YRXpAIRIXoRQn5sK4WX-aF2uyCTRo9CI_7ACXW4NB_1EILeaqRYNYeCbAud5i-pQALRUvQj1c_nV4-YdwhChgITUbgSnHyXcbM4QPpUFNLBO-N9-pYO2g7K4uyqsgfeXJ55Q1zIdSjwlBAc_hz3meVpxHQ7bRgzj3ZoE-FMFk-Xp0uY9-BC5cPr8tjZZgvWUyKQDikSdbhv-TVL4w2rfIOzER34WcGxul9Vz_4hFBDEPXXTFaRWGyqZ-Or7tpkfRZaGFH4l9CLSNfrsYIbDZQdM4DK21f8bRH5zftyHSoACpOQkKIZqkAwUUswjhDtJOV_MIMM7Ap4201JDup8ZKr9ol-aqpOKnIJ6FeJL8Udjy3Tvsp_UnApAMLVaS4tNe1N-uIZ6zwhI_PONXIOMtKJRjsMz7czxymiIaSKD6K5_Mc1ARqbINsb7VQEQR8FjK1l8zI_Euhnn9EGoqTrPqg8zN3BBeHiAEDRA4t2XvOHNu-uqn5-mqVtlHJ96hJj_FT7RLJqECYZEDY04UgHJnrNAvrGOacackPNfQW3fi9lcjYMWHJSHRzHCLvvarsuiWuMy98FGMJk__EJsSPysEHN3CYvWfG501xaax0azW7GksgUXXcxunKYxhre2KKCeoqqX27yV6CfUM455nqli55Ml4pMavW8pXo9KAev4aFa-soiC727FxXX3XwQg-eBToRGP6HHpbfBfYFTf777LeizHTFTA201q17BNaHofsJVvrj7lWlx4EkcjXFDlKAe-QltMufFbkdHV10dkPYS8PUfAjXVG8yAK91Dmri6ReY5Q6Qj-4HN6HEM6PfK2I26Z74gBqvMbknnI2lO6DOZLOfiOjgFq0gd_DEtOsxrZl0-vcKeCIbZBbRP5ft2ihKHdyuUiKytT7fGqR9ETde2eCG71XDCJDQ6AGclaevnaheaUSA-X_JrfG01Yunhve0SdGe7cZvHyr3DGSqt0RzrNQgWfmMNDZ-cKwt8QBrg1azO88M2mTypELAryvqQpZtJn9l0kD_i8oSuk-PUynYdzgWLLvH4O8vJCLX2hFhtBIcRj8X--3oP1C_Dx4aJBbOtlkE7QvqZFliddAQIODY9I_Nzao250BG0-7N9p5AYTyM8JrFUdGLAC9qfC21F9QOagTKMbPyRguhwGNVlaTS_ApOuQbtHqGqVqk60NXz2Fq9i-PmgY46sf9kKhLdKAu39yc13JLL-3XqBoec4eyodaZvbxgOaaeV2R_tNvgkbxbn1M3KRtMmEp9WWj-LGhvfTsgln204cStjGcnC-0EEQGPkPfWfUKT28pB53P91LWTmADH3zR_W0CUTWfmYYbhtbsW9nc3HLdzhUADxvtMTjwGs9aSoIriO0lQjL5qCb1WfzrdV9m8AlfdkLcYQz1jsSGuSYh_hG5JCCmHfcjhxc1NLhO4Jf0Tc4TnNgKY-BsVqOQlI13qQpDaWBwZTy6SMPbem8bfXMZyZssLVyW6gi1U=======++6LfKyPAqAAAAAGBsUvD6QfSnqOyFFuzzVxT3s9dx'

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