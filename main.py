from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from scraper import get_ktu_announcements, download_ktu_file 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/notifications")
def get_notifications():
    return get_ktu_announcements()

# Note: The file_id contains special characters like '=' and '+'
# FastAPI might decode them incorrectly if we just use {file_id}.
# But for now, let's try the direct path.
@app.get("/download/{file_id}")
def download_file(file_id: str):
    # Important: In URLs, '+' might become a space. We might need to handle that if it fails.
    # But first, let's try the direct pass.
    
    file_content, content_type = download_ktu_file(file_id)
    
    if file_content:
        return Response(
            content=file_content, 
            media_type=content_type or "application/pdf",
            headers={"Content-Disposition": f"attachment; filename=ktu_document.pdf"}
        )
    else:
        return {"error": "Could not download file. Check Token expiration."}