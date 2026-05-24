import firebase_admin
from firebase_admin import credentials, messaging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlmodel import Session, select
from database import engine
from models import FCMToken
from scraper import get_ktu_announcements

# Init Firebase once
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

last_seen_id = None   # tracks the latest announcement ID

def send_push(title: str, body: str, tokens: list[str]):
    if not tokens:
        return
    messages = [
        messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            token=t,
            android=messaging.AndroidConfig(priority="high"),
            webpush=messaging.WebpushConfig(
                notification=messaging.WebpushNotification(icon="/logo192.png")
            ),
        )
        for t in tokens
    ]
    response = messaging.send_each(messages)
    print(f"Sent {response.success_count}/{len(tokens)} notifications")

def poll_and_notify():
    global last_seen_id
    announcements = get_ktu_announcements()
    if not announcements:
        return

    latest_id = announcements[0]["id"]
    if last_seen_id is None:           # first run — just record, don't spam
        last_seen_id = latest_id
        return

    # Find all announcements newer than last seen
    new_ones = [a for a in announcements if a["id"] != last_seen_id]
    if not new_ones:
        return

    last_seen_id = latest_id

    with Session(engine) as session:
        tokens = session.exec(select(FCMToken.token)).all()

    for ann in new_ones[:3]:          # cap at 3 to avoid burst
        send_push(
            title=f"{'🚨 URGENT — ' if ann['is_urgent'] else ''}KTU Notice",
            body=ann["summary"][:120],
            tokens=list(tokens),
        )

def start_scheduler():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(poll_and_notify, "interval", minutes=5, id="ktu_poll")
    scheduler.start()
    return scheduler