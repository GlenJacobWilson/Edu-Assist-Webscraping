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

# --- THE FIX IS HERE ---
# We removed "{file_id}" from the path. 
# FastAPI will now look for it as a query parameter automatically.
@app.get("/download")
def download_file(file_id: str):
    print(f"Attempting to download ID: {file_id}") # Debug print
    
    file_content, content_type = download_ktu_file(file_id)
    
    if file_content:
        return Response(
            content=file_content, 
            media_type=content_type or "application/pdf",
            # We set a generic filename, or you could pass the name from frontend too
            headers={"Content-Disposition": "attachment; filename=ktu_document.pdf"}
        )
    else:
        return {"error": "Could not download file. Token might be expired or ID is invalid."}