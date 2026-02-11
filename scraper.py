import requests
import urllib3
import json
import base64

# 1. Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 2. Create a Persistent Session
# This makes Python act like a real browser that "remembers" cookies
session = requests.Session()

# 3. CONFIGURE HEADERS & TOKEN
# Paste your fresh token below.
CURRENT_TOKEN = 'lXP4Yb2mcu0cAFcWeA7OeQrI0NN8SWYcQrBGsv1ETO83m7Sn7wQih73MMiC-6GiL5YUVgQMoQWXuOc0CNynburz-h5W6KsWyHL8KOYmKgnc-JOTQTX5_B9Mqq0muf56q_df8N0CkPueVUtJ6dI_eaZLb0LiD7wbqp28WCeLK7ANNO36iwN3xA2-g5Ww9MjOea-RVsiZ1HtcSFzO6OEDg_P-lHKikAQ88a7EKayPo6zKGw_Ai1c4bzSmFtRHcvhDU5kruH5gpH65nT8yaO9bArlBASMGjmcOtcsMQYhsUsTL4CoDj44E8OVoH2M2DWxYk3veC-gZVqWMznVm_Orrf-hvfv7Xd2AQSRTf9LVKf5vpKjXRtAVmq00qBOF9B1buNtDMJGtHf9GN48GjaD0zv75x8X9X_SqK5HMAL2lpvam-U63iZiGMsuHwaJIJR_IP_2WTmExQD7ZIZTwFFmjxz3v3EwL9B9bnSpQzhczpgrX-rRx0Yo2woVhoMo2jc_cyeu6HOtHHojdUrAeSRXiavj7R45IfF8qz1kcGvK1HrYgdwXpDQXqOo25qjD6Z6M7axEIX4W7jRj7KoRYkw7chB4aXWMxrW_Alpk6rRlBIl7WMPJzpYRdydgUX4ihi16LF2-3-BzJ4yzLp8HygeSfJSSCQL2vuqV1ux5QpoUkXF3Ij9m1Oyvo-nzDn0cVXYNQXF7AST8xjnZbIvQw787nTavFkdEgEoxhvMd8RJfi-v6I1FojC6mNHgHpxJ3GEaGj_SK1__dIsYqCE0dEpoNqCaVPrimRIolfTyXP10j5U3XVG1DBWtifhCEawo-5DYMbT7sYNxF6HHX1kCA8ivdzclviEp-cQMur6WSwCJVJRRXrEE3giOCUQKln7DcvTRrUvgfukySaOTdIyuiHjk-q-z661Y4YB95lNKYciNPv6KHyG5ochGifk0tfjJSXXjLWk8bcIM5a4tRmpdIwlrN-89dI2BslHJOsdw9nn3R-aoFPGzslm1GxJXNWxjM5LcJ13qeAl_nmsMJQNL9dZJ--oHlYhY6vhxBO_R5-lFaVrhFjJyPoVo6KUNCZRLEkMzQcPTBvfmUltGofhjdyLjNqcwBZ_f8UZEx-blVDfJLFqnzXZ-4Gf7ztYYCFJBhPh7hseOiZ26AM15nj9IEeyzGp7gDPj6fWDsjPxhyKpBGCRtwiuwLk_c3x-EvCQNy9HEgAlgRXUDLT1sHPZe50es1zGBl_R_0rg0DQWcdKcdfJ4hJNk_GhVydJdf5jubCdaI3fycmEdlGC0RYX6VTon1HpLjnrqU5o7-1uekjgs51a6Aw7E01a6v2aWWdtQEAZd9UvsKrT15L1mxwy06USEY9lJFbMFmg49GEGJ-zIecvjeilpqQuTdXoEwpXFWcbNtCtph9qvoX1Tpm4zIvuj6GYZ9ryT9Mx0xpndlzBbY1cCptEhUN6z1olOSk0l2Hz7ZQp1TwXVa4_WpOIcZA-xPbKjQMQCznhzXG0FIWCgkNLZVp2ajx5Wuiz17Js6I9-WyLA9UjUoGk_LXxwKNKqf5H_SqydUp9-syOYCUBcQ4KEmfVPgiCPwneB3seZOqDKjJnnA3zfExUyzftruPadfeZ6GahDHSKy3S0i4PntN5X6NW3z5gOn4mauQjm_AJMgDW_n6wlB2ekTR3eVvmYn-m-PIbAQfreU4c9Ej_f0s5caYOKOPyKemvop6PgdVx_E4rdVhSh-Sgu3JP3kyhoamt9p8_LkdV9lCvEi35159QXTDZBlEAkbyo4OTf66dcXctG--cK4JWgCrUUyR9ksXtaYL6zNGpUt2xbjuYBjctc3eiNF56JxZTtHEbUYiuADMSaj6cmkGUUl3ZDIJP18v-O8Ocdl0OHfEs0qj6clJwVCB_vuZ_cVRondZuxUdGqexzbTiUH9AoXVDQodcnaMFBdSmvHYDUQyh_VqCamiyoifqX7Ge93G6roWqcKigIy3-DAKUrqc1U07rkUKkOjVj7L-d8e79n-_NgEircGCCKGNd3BxOUWf2XdpdkWbnSfsxYorJoEoV0C77Yehp6nHRF-FZNofGH3u7n-rbZuJyuryuSD-70frOgQMuQ494sO1J++6LfKyPAqAAAAAGBsUvD6QfSnqOyFFuzzVxT3s9dx'

session.headers.update({
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'Origin': 'https://ktu.edu.in',
    'Referer': 'https://ktu.edu.in/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    'x-Token': CURRENT_TOKEN
})

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

                # Create clean dictionary
                cleaned_list.append({
                    "id": item.get('id'),
                    "date": item.get('announcementDate').split(" ")[0],
                    "title": item.get('subject'),
                    "message": item.get('message'),
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
    print(json.dumps(get_ktu_announcements()[:1], indent=2))