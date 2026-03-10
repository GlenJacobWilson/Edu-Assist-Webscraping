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
CURRENT_TOKEN = '8gXSrYd6w50cAFcWeA4GQI75BjBrjGdw6_bjYN_8lP9mNzcQhw8nkZYoiyuo_aLDWW0T-mDE-lHioyvW-nwJdIxcy-52RsVrSB9xFqPweFoTVlD1Hp5zSeGhns3FrDVaSOVI1HAP3d07CP6JxiZteKMQUqvtsMgzS1JgosMLJcENtmRXQUYkKJCiWtdu7vYVqgmvRjyI8mZ3qmVD2pxrQJ87yUlyakig1gMU4UUJrF2oVVCD1JpxURQz7k15na3218ZdX6AIKckMs3KfsM6EmYwS03sJDkGX8OJuLXMkk8Dh05Gc-3KiBRPYPFnh9jDiz_wXdnSKFtl7RxM8cq8-GKRLob6AXO17IvbRXGY1eqHu59-LNESTWbKFqKk73eJe4yNFB_D9sXJgNcU5UVala-OukUegWNFlkBkXl2XtVcH44uFDaYtwTjZm-OMoOqsWI0XsKAa8h2ySk_2MQWFbQpjwAtK2t8YeBP3DvtLDTOq5TyzPd70awFqTqj3TVX3y-1P_GtwjpUWbCyuotH8LSbNgdmr0R3EDdeSn5sqwClXvVXhW8wOc1IBKfehpscSdSPwoyCMlDChuY9ANcBV_NxYbPJ6e_t7l1JK0tYRQO3rIe9l3n7xGOQI9C50_k2mg3wTDSzya6vEogmr16KOwWANQsQu3no7S3qNsRZugKAW8IeL6A9NqBdX7L23yOM8IOVXrfVIX-khF3Lev0YkXllJ7UYX20xBxT9G6AKMgT_lHLxHdAk_3OeSro9wgu3vqCyqxAnu6MPDh9jlQYFsQP2X9PcqSUF2dby1GVMDfEiYdWZ2lwvLo3PbjvbcVCF6r_dkRam1-ii75xDJLO5VLBOlh3Odcr_7YBtsHn0FPAg2C3RORGKZ-XIyZWCQaqv5IGXZoOsOPie3IegbGXpFOQfzMsRy4I2AU16GaGy1qRqe14OP9h-QuKb0V9kh1AahG-7HGFmFaere0-iFyOBIniKE-YXJtpvlBP83AsXluA7SKQfu85IShI4xfxI7tSeNoL9o5HMU9Qc-P3CZucev0crIE26canQOoQ4X9O4UnB1pnGIk89esjO5tk3JYFtlPELujVB7avK8UwaC9pij4NutUdpIe-0OhqVfR0fiS_cxWB2Z_3ZL27zwua4bu53dEf7t0ijT_3ae8eq1P0-juGpGvYgQRAqk77pjR7ElUwh4kWy3Ic4WwQgHSYOBOmbsrSF4oC22qkAy1lJ7CVURbGvmX1NB362hLR5yqVsON6nOZbJmQsHV5TYZsivLs27yfBDsfmtqjuMe9rJxntEE6YqbB7J7YpWJOm02MuQ5cLoQyNIYSaVSu7xJk4-yYSSgMpsrL8AVRPDxNy583EsEqtfrKsWglgMkD5F6aKompZ3Clm8T7cpBHJbrDeaNA7YS2gKRvD9cASp5H1eZwvQKSrui0mgCxqwkyxSu-mBW_3EM8GG7MmLtMazVJU6W8zQWBMbBlPgdHrOv8iJdptDpX-CFp1cv9zsERf0pchwwX8d4AK2_u3T_SHhJWLCvQ8v2V1BE-iMDc-Gfvg0XDFER9q24bgNKQL2W4vrnKkCsVMeE9yFgkd0gJyRg6HLpn74BGdqQErwsH3WMNIDvaGyo8_p-YlkD84EzRKuBAGDNmDsAhm6q9n5O8C5MYw3J4nok78s_scNZwyRMXaUg2rX9esj7cS0FaE80GUqOBoSvjNJrd6qv2YvIG6VfxuqnerhxYCRTGKgU3ZFiuFA0gcxNghmT0Olbbp5gB7t0IQfGGMnbhBuVV-mPfLcGd8EnoLW27e9Bgi7y3P2yNaO92QWdMv3dBTOrEhauCroeNFynvyhg7s3efFJ9_m2spbi59_6JIrnhJjXQWAaQ6oj5-reZf8z5B_p8tcbErR2deEWltgB08HaoZl8-3X5_HbswUz2njMVYQ0-vRyvFq3Ua143mjX6U3G57t-8Nx3jZX9q7dyx8a-p0101NjpbuBYLsgX9lAB7ZtrsMVH5uvpd3jjQhdaoEuNpIsgBLv5MA9rW_eW34T4rZ3qClRh9uC61_jyBKb4d_ND0y8zkMNUOjXBhr1OFiFfi6Pk_c8ONUnRIjKa7bTX3L5Rqm0jVLeb6xR5epNLjCN8sIo=======++6LfKyPAqAAAAAGBsUvD6QfSnqOyFFuzzVxT3s9dx'

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