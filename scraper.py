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
CURRENT_TOKEN = 'cq3Cmtn0K/0cAFcWeA7RRZf8TW749NaCmYtVZMNSbcUnaM9neEYwUq_Y2aGgN3Vn-Vv_16PS5-tmOgcFjNrLO5mFzlJ6Ji7JTaQlBn_LrGxQXkm0XjVPPsgxnpcnTimi3u4GVUKB4OtX6rbOHNm8SMcL2_6eJOfLFjvi9q6xzQEdPMimLcmUqqq_NMtPtTg8Hc3-q_5yOa2ZuK55BNALXXonkK6k0Erm_9K0mWcEtzltr8K5U93axzuTpsFpRFe1e_Kvo7DCFo3y3qKsGm1aGMcvnTLonKRZQZPU2MIMzKYKI4hzC_u8M_BZoyxiJjqmtAtBTy6mCUyLV4k2cBzZZEvVn2_p9yOhJI8DE_dfoT8-Gz8iuuv9Ih-q5TgGoanrMhoS_kt9LtJlVN4vAEJm2cgetTAvD0v5SIhlz_VDtyGJ2-eOmM0q8XRDVxo9MXRgToMJKoapdk8AJ5_8-WNmnj9iaoRfdI-V2h0Qoj0lOYZjyONnyt5XHcnWo-rcJxlia2K4ro06czOiM1tne5ukayNWf1V92wXAQMxoOzEWizQ5anjepT-MGCVdEJ-L3ih_6qgqdNz663DKwWfqo3Bc_8P3cDvU2t7S0b-kxwJMwTGA5yo4eoPL5CUAUokIzgthj1-ZvtfJ_7sJkSvnOurz4KpC7txeEZlH4EFAQvC8_jfDHCFqym35JWsJKM1PU5vmDNFP-0DpZ7sqTDMuIFEbGlbnb-RvXFUKWqO3Y7dvyPGt3awhICJZi-fsGHkKZLkHZ_9GffRFlgFGTiTXs5m1E8ZcmVJ7AsG2WKI5evsveCHpgvyObtrC08vDP3IFNN8AdIHP8G2BcHp_zU0-BjW2wU04JItzYCNYr1lACrnBaNBgKnquv1wvVOVtsRjbn1cmvoZjlcNzq_S0TU3EQHaMIGf9L8KpePLw1JUeTpAs3P-Csf7ST_p3eGWzJD-LJM4mH0Pyn01Ee86-DamPblr3n8qpovitgf8TZxHb5n0DQxFsFDxhAzQdzJmpzfZMApj9jNNLoIzJjVJzjumBzEnDMLOEU1-mTDYYms1hvexpdos04Bx3hmfMDLCH4HxnlohUQ3bvT317A6JGtOCIVbCxnXVWqoIiyvcwm7knDXwOC2-CvQTkIs8Oqy8deltmA6BYSJnr3hjmkBTyAbK6m6m5SloppMTusorMf7zDW_pcgKE7bZgMxUNbTRTwY35alOwirYbj1p3o7SJwqSUj3HFQFxPm_vc7b-CbFJgGNVz0PIg8ctZN3s7rpwogU86yfCztB9wNEctUpQYdvArhAe6Rt3xTYK51w1kHvzlTsZpzjRotYkpTdHwYRnlxcwPg4xkMYGp26Fuw583ItKBgLCZ6A3Rv8YKmkgiXl3AdgUNbjCZUzv32RugjJMzSWGjh5cLMe2qfAL4KVy22z4BXiRfFAtlW1f7M8Zr2m0BS1dNQ0vp4yCsb0R2TXs6dn8PVDL-twT5fBoUhyqAH6wD9vQ0tJF7F4mt2ZUzUpUhWnJyS8rIuPnhL7WPCfw6i1vYF0W819TNFhKoZAl6YsB_UCgC1Sr_TS0qApmbvnTe5x4JFb-NoSLVjBxL1P9M8o2EhRSNqROsFNP0OKgDYrwVd31DIOJI_b16kyjF6A5hmEcX790Mv7Q9i7D3vgxMHMfGXgX9x3vIe-R1vuj7RswWox0WPHzYK5is7a9EKb5ArDu3YMmkMPjBXOyHOR43DCyijnQiauxCjzbrG7wbOU4ndA2Aid8hYL2jF53WcBSrvZZSiUC-X99ik3xzyVK3lD0qBb9E4ps71eBksjUKC96fga84fBdYCi60Lstxcfc-pUPDBDacxmNVGurs0pU38e3PJJ2vnGOJKAcjTU4q19koSd76MudRYzaKZjci9nH_pHtbsaPwL3aUicMm65OV6XHBrxJUbYTSOGZpt40Yz5N26ZkAkSk2XrB5Jl1ISl8bvxLUEfiBCEbCP5qU3DB4aIMVrb9aT7_qlos2RMm_tb8bwSmxw7mi_hDDlV1A2JmoIeu8RN4uS81aw2rM-VyvRCHPVQbYD9BMGRyBC7_-ThDY8mk21PLXILz0CmM5dyxqSzEdAxoYz8yC4rx0GInIjxzmnH_Xjd0MrMqgM3CS3hsJ67M5hrL6I8BDULlPt8WDqf58NG6lKe-rQXLTFPpT48d70W4WJQrJYB5+ldzDhzl++6LfKyPAqAAAAAGBsUvD6QfSnqOyFFuzzVxT3s9dx' 

session.headers.update({
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'Origin': 'https://ktu.edu.in',
    'Referer': 'https://ktu.edu.in/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    'x-Token': CURRENT_TOKEN
})

# --- AI SUMMARY FUNCTION ---
def generate_summary(html_content, title):
    # 1. Clean HTML to Text
    soup = BeautifulSoup(html_content or "", 'html.parser') 
    text = soup.get_text(" ", strip=True) 
    
    # 2. INTELLIGENT FALLBACK
    # If the message is basically empty (just "Refer attachment" or nothing),
    # use the Title as the summary context.
    if len(text) < 50: 
        return f"📌 {title}" # Just return the title with an icon

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
    
    json_data = {
        'number': 0,
        'searchText': '',
        'size': 20, 
    }

    try:
        # Use session.post to maintain connection
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

                # --- GENERATE AI SUMMARY ---
                original_msg = item.get('message', '')
                title = item.get('subject', '') # Get title
                
                # FIX: Pass BOTH message and title to the function
                ai_summary = generate_summary(original_msg, title)

                # Create clean dictionary
                cleaned_list.append({
                    "id": item.get('id'),
                    "date": item.get('announcementDate').split(" ")[0],
                    "title": title,
                    "message": original_msg, # Keep full original
                    "summary": ai_summary,   # NEW AI FIELD
                    "files": files
                })
                
            return cleaned_list
        else:
            return {"error": f"Failed with status: {response.status_code}"}

    except Exception as e:
        return {"error": str(e)}

def download_ktu_file(file_id):
    url = "https://api.ktu.edu.in/ktu-web-portal-api/anon/getAttachment"
    payload = { 'encryptId': file_id }

    try:
        # Use session.post here too!
        response = session.post(url, json=payload, verify=False)
        
        if response.status_code == 200:
            # OPTION 1: Raw Base64 string (Standard for your token)
            if response.text.startswith("JVBERi"):
                print(f"Decoding Raw PDF for ID: {file_id[:10]}...")
                return base64.b64decode(response.text), "application/pdf"
            
            # OPTION 2: JSON Wrapper
            try:
                data = response.json()
                if 'dataBytes' in data:
                    return base64.b64decode(data['dataBytes']), "application/pdf"
            except:
                pass

            # OPTION 3: Binary
            return response.content, "application/pdf"
            
        else:
            print(f"Download Error: {response.status_code}")
            return None, None

    except Exception as e:
        print(f"Error downloading: {e}")
        return None, None

if __name__ == "__main__":
    print("Testing Announcement Fetch...")
    # This will print the first result to console so you can check if it works
    print(json.dumps(get_ktu_announcements()[:1], indent=2))