import requests
import urllib3
import json

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_ktu_announcements():
    url = 'https://api.ktu.edu.in/ktu-web-portal-api/anon/announcemnts'

    # --- YOUR UPDATED HEADERS ---
    headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Origin': 'https://ktu.edu.in',
        'Referer': 'https://ktu.edu.in/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
        # NEW TOKEN ADDED BELOW
        'x-Token': 'wVE=======0cAFcWeA72k58TBPrUdwWzVK0RFBPaMntqmh38NovJBtcJrsutMruAqJj5gR1zqZOSODvlgMt_hdl29jTCHMWJ8onigtaBlkfgeL9B2m--ndY_c7dSmwc6h6n3Xu-PQLGS7PWkUWybANQdrbivMs7QKBPddgSd9feN15JNabxLUAVwjXKEra8UnG1z9mlbieQt4NMIYwSYOLurXxiZwpB9YcMaPeV0k2Ka5Ap1CJB9ky1FrEwKU6JqGD_vxd4V4KLGc-0Ux9vZWpHLHxPZOVqST93PmQR1yqcWIXHnRHsjajryvOKNE1LArBB-nJfAIERySW4RplxEItMf0Jwvbtqrm0pP9-7PiGrdRYGCtjt9lrnC8gRqv5mccQohbB0ZBRxh1IXsv0K1dlIpYfJtOIwmO9S6FM-zuSOIb8QTzBsPHaGwEz9lTVDNGd48vktOLf2SvsA6nvAwD9rW-RZirFOTkMYVbZEYyRLr_ytEp_EcG5F5YK6D4gcFA7223Z5xFONYE_cqBzvDRdydlVwKKSIArc3dR8ycZdagbERx6WsKgFDu-cWVYRJDJMSXQEEzP1V_LlSV2jUdohvkTXEUxrLHNbPJijimG2o6uARTi9O-Da4MLJp35pRav2-Fcs19YmhRdNyAMVC_4DxOO6M200bNGMzB1Gx1KpxgkRXKhQSCCmeCmX_CrvWmT190zxR152hSGUU4ZvDEFSjwBiZ-QecLGrIIWvK1vLoTyhgcugejgtfKC-4-OdMFGyj07luGDA-l8U17WUidlEtq72JFrsfns6gBNNDo9rLPD_HCojNVS0bYJXqkgyCXw30akCnILyGxlepCEQEjlL6DBEtDycdweQopwAHMHY33At_i-4ZJc5BYfWAA03s2-c_cg38sNLbrmu9vaFfQh1mDC-R9ZAggV8oLGbwbOE8Q-aym_5LYPDnP3gpBn-lf80dbj8ZaD8edvV88Q9OMorjDfjkkfyvVwd76hLMA-LuKIo3pylq5PZhppjpoJj3PVNwYyA_n28C909HcVyoVpFXr8T9iefPUDjSAXX397NRVbmkiX66VV98pO-mvgJbLQy19xP7tWByUe8ncuGezOKjYJBFOdViU6MxKV9E_g94sShjQiGrpJsQOSMLD9pFmW5G5EPpEn0qECBPEVbgBVc2VhGNPjhbagWdf0EcTqQZhrtiAbGQAjazG_wkC62T5KmK-95ZEqYsB0BvWHcAdREFKe-V0vbM4LJZaYhL3fPv8Dkjh_XFA4Ax5GJbF2nggSKOPCHsEUD6BD6kzW8mc_3UAa2LYAYOYLLU2RA2C-l81j3CWoTvLkai8sfnkPU1JjAQXrHH10o1d8QeIkhxAhWnkoJT995ImPBp-uU7KIyXETBnUou6dU8dlJfmLmm52sLEPlLaVzgrznkrsIVBTyXlMC5CV1-dvDIXdg724mqgM7otUb76C6M0nkp1wenr1dTpqp0ij7YBRTjR9XYdydtXSMKJLCDrYu3QJ1VzIfb1QunYxVLSqRY6Pbov6NoUXHsFBO5Aj75_y5h6A50SoFRJxKe1t70PrIfPijIVHz6_yAV0MrneEHxND9XJ1EIGpI1AllToKdUF6ugeud1N3Ba4_4SVN5E3lu7WVtndBOBxMw4omKunfyIw3mVL8By1tE6kIhNWEiYbtNCewUkf4H_fYA_OroRdwb3pK7s5WHFq0CpSuN4J2UmSTbhxnWeNjB8_dFNnnsfCZBYacD5_k_H9uKtuGqAh949lAB_V5k6d9723eSSaHipguAN-iPP3g7il96iI7ComkzAIJkPdGFEPXcwY0OJ2dpVYgbg3cvEMEOE8vckY2fXtXDkVHtCB7JyQ1Fmxx2qwuZGS0WyHI8BF4BsE-atBb53TbePBps5GXJlrdDt9If743qIy1xr7cJVHyJNZ-8hxdq1ZQYZlrrIu1D6fp6ZdTDeoyrcLLXmkv4Pz7Yhe2l0FvLeHaMq4Jvt-innYqD3sdmi4iGfK0gvlaRCKep0fqeibqAP8QyykD2PzIK2l80ohbkj6-esQBrONF4ZjOVT-i2RTuTEor7LBSwWIJdduFV_Q_pO1ciziKm8PnA4CP9yntQ89IjHVkKFZcThqCglodtl++6LfKyPAqAAAAAGBsUvD6QfSnqOyFFuzzVxT3s9dx',
    }

    json_data = {
        'number': 0,
        'searchText': '',
        'size': 20, # Fetches top 20 items
    }

    try:
        response = requests.post(url, headers=headers, json=json_data, verify=False)
        
        if response.status_code == 200:
            raw_data = response.json()
            cleaned_list = []
            
            # --- DATA CLEANING LOGIC ---
            for item in raw_data.get('content', []):
                
                # Extract attachments (PDFs)
                files = []
                for attachment in item.get('attachmentList', []):
                    files.append({
                        "name": attachment.get('attachmentName'),
                        "id": attachment.get('encryptId') # We need this ID to download the file
                    })

                # Create a clean dictionary for our Frontend
                cleaned_list.append({
                    "id": item.get('id'),
                    "date": item.get('announcementDate').split(" ")[0], # Removes the time part
                    "title": item.get('subject'),
                    "message": item.get('message'), # This might contain HTML tags
                    "files": files
                })
                
            return cleaned_list
        else:
            return {"error": f"Failed with status: {response.status_code}"}

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    # Test the function
    print(json.dumps(get_ktu_announcements(), indent=2))

import base64

def download_ktu_file(file_id):
    url = "https://api.ktu.edu.in/ktu-web-portal-api/anon/getAttachment"
    
    headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Origin': 'https://ktu.edu.in',
        'Referer': 'https://ktu.edu.in/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
        'x-Token': 'btDcMvTI4i0cAFcWeA5kgT9rWq_xWUGnPg17MmEzIsryVKRMyp84i6GbEUPbwImYCxCnaANvADx-OF2J2tu8dCR-VSZzQZJVrDWevfB02zYjySmImoEQSP5rEuMEfQ_62o4C6pm1tfFG7AHYvuWtIBTVqVBetcWt0cMSsh9hZXtVIvlTOcqead2TJxw3fVYkzkrO_wjJjxDQeSeiLOlsJe1z4nI2B8xrNF_PlstXE45n7AonGOiiTqk8Pa76zwXMDQUQhu_ClBkd0bYdTobakSW1ya_vEXH70RKqKdEbIAxZMgdpl-1LnM_HilzGXFqrpzIinFHiae41jsvW5SQ3okdyWrmMm0b2aWi8AEWfN1j1gy2BNCSedTk8puWm_PYWdtUhb8N4azWZQpjxfBz124J-L-hV6QZo5bV51uykj1sP4GGuP-KCpoe9hmCIXnawQk5Gzx-pedXmmOgwPl61DvmXooftNdmn8_QEi6p8axqARRels7cfdzbfxA1P2kgEr2050Ua-ixCWi7PqbgIZiHj4LaaIdQu1sQ5nvYyD_Nm-A3CkEHV0a44ta8HxpMs5jVpkWAb9VRe2EB4zQm7jrMS62875RQ2i3PLTFA0u-UqG_7PeQA7bxG99i00whTkq1-Xl20LFXf4FHrBkjfpgZambleWl_Qrys9hWvchOUR9FP5FroMLPQTB6gQnzvYNocwX24Bnr8o-FZ1ycR-LmiO3BujsiTQTaljG5cMr6Ys6vIvGVHcnnHSxkGow6XiJVQykfWNhnE_TjLNUhn-5_ci_gH_-wrPaXbEzRCqaswQb7mKxc94nds_UjPhH1b56pb_O3-pY8SmOuSUyuXbz1i1siX3fro2qi_9e2sg89Pa7KUzVCOyBV49zSq0gwG4xouGd5H8Di0LT098kI82WKozGlYEXdITMbGcgzZt8kVBkxmEIuOTNjiw1FRhrZfms4S6as_JwzIgfnK8FYbCWWn6IhjhgG729PWhcoNRRG09-f4T0NlFWIqzpKWKrR9cUQ9ccfGfJeG0ycAClPrzZ12txMMxIFChK08HeRexZs2gkh6zp9DaJMI6cXA49MAPje1oylOzf0c5evlEKn5RhBffYTeUX46d0tFuPTV8EScZ_NiE-DCgA6fKXNLn9tMujin0Kbef7OuEjcYvt14-1wGuLjriW0ACVsnwaXeGttaaCWWK2hdsbe5wkcQ7QflGNhRZqieFjJfNnGspV5PZIEn6BtXdhS1H5qBt9vu7Cs2Fx82hVB_KiPL4aeDXWs9q9Zk8EG8JKD3079b9MDdwtShu21T8qQW8XNwM-ybdYyUP5B89MKDKSRrkl-uTqpksAjOasJIk47q4_TN8e3wTLQszhBDBjbDDoDml3DYKQCX8xjZb7ATrqWth1HgK5_zWhiii6wFAWVCXVppsKlHgDlePcj9Qqx18hMckGa7nfiPMJLIgsnxk-Oq-SeyIKE48uM55tK2KbOvobEkt8UuxvpKv0ZPKdHBX-dG9PIwTemyCY5tokWSN0hEWlj7Mu3gQvKpenbqy5WMkkXrZaMaY8_cNYxmsZXQuW3TkhnP4AaWfJ_y_lh_xHRYAp-Ji1jK4CQqXw86Ivq8BI5WPKkRVDljXVHlbptO_7o_zFOA5fCsMGnPuHXYHqnhEIP8L8Tjx2jYHmsKBcDLcc59bxZ5uucWcDNb810oOjT_rA7kExqhpSIT1d7T5vB4hZpIr07c3gHNXIxop3RJNN7phCcvQwrPkqGj4nUrtNFUlVAF7lff1UfXJweP7KH9nRA3D2Xz66OuWfhPhynjbJnBm-1A3T9H-2wrqN56tzKmfwE72z2XWGHhAa4W9_OpWjsC3B6J3WgoLq2dLWMTlV5zKbuOqBlyKyIipgxgyAlUCmdhkaUNfr5Pr-YesSHTJfm8BMZxccmddKdox4r2auZ1L6rXIJB5JFzRYpB6njKSHtRARtUD9evb07AZbyc7-A7YNJQJMKQ8Nb_ZUoqGGVC5LX-Dv55ecw-QuBDLmo0rzoVqDXDYKwNh6K3hOSiQS-_MvcW2cc72LZG3IrOR96BIp9HfRV6dZ06dhrq1kcZn7q0b_ZVV03cSUKmqMR5Cs-UExjXGsX-rH5CpGfGcYfYVBVVCfhQ2SpPaM5FeOtJwyfe_pZITVnG9bi0BSSnxaxQdJ36-qrQ0UU7IShj4CU9Y8cpSUMPkWrc-z0Qw33Q_84Qs3WI56EHT6DGh83H8rCiqyhu12YvMwYYqG-AZnaWsKjlHOdVt_8Sgo9YEx1LZE',
    }
    
    payload = { 'encryptId': file_id }

    try:
        response = requests.post(url, headers=headers, json=payload, verify=False)
        
        if response.status_code == 200:
            # CHECK: Is it JSON?
            content_type = response.headers.get('Content-Type', '')
            
            if 'application/json' in content_type:
                # SCENARIO: KTU sends JSON wrapper
                data = response.json()
                
                # We look for "dataBytes" or similar field. 
                # Based on previous logs, it's likely 'dataBytes' or 'fileContent'
                base64_string = data.get('dataBytes') 
                
                if base64_string:
                    # Decode the Base64 string back to binary PDF
                    file_content = base64.b64decode(base64_string)
                    return file_content, "application/pdf"
                else:
                    print("JSON received but no 'dataBytes' found:", data.keys())
                    return None, None
            else:
                # SCENARIO: KTU sends raw file directly
                return response.content, "application/pdf"
        else:
            print(f"Download Error: {response.status_code}")
            return None, None

    except Exception as e:
        print(f"Error downloading: {e}")
        return None, None