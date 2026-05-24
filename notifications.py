# -*- coding: utf-8 -*-
import os
import json
import firebase_admin
from firebase_admin import credentials, messaging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlmodel import Session, select
from database import engine

last_seen_id = None


# Initialize Firebase — loads from env variable on Render, file on local
if not firebase_admin._apps:
    try:
        creds_json = os.getenv("FIREBASE_CREDENTIALS")
        if creds_json:
            creds_dict = json.loads(creds_json)
            cred = credentials.Certificate(creds_dict)
            print("[Notifications] Firebase loaded from environment variable")
        else:
            cred = credentials.Certificate("serviceAccountKey.json")
            print("[Notifications] Firebase loaded from serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
        print("[Notifications] Firebase initialized successfully")
    except Exception as e:
        print(f"[Notifications] Firebase init failed: {e}")


def send_push(title: str, body: str, tokens: list):
    if not tokens:
        print("[Notifications] No tokens to send to")
        return
    try:
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
        print(f"[Notifications] Sent {response.success_count}/{len(tokens)} notifications")
    except Exception as e:
        print(f"[Notifications] Send error: {e}")


def poll_and_notify():
    global last_seen_id
    try:
        from scraper import get_ktu_announcements
        from models import FCMToken
        announcements = get_ktu_announcements()
        if not announcements:
            return

        latest_id = announcements[0]["id"]
        if last_seen_id is None:
            last_seen_id = latest_id
            print(f"[Notifications] Polling started, latest ID: {latest_id}")
            return

        new_ones = [a for a in announcements if a["id"] != last_seen_id]
        if not new_ones:
            return

        last_seen_id = latest_id

        with Session(engine) as session:
            tokens = session.exec(select(FCMToken.token)).all()

        for ann in new_ones[:3]:
            send_push(
                title=f"{'🚨 URGENT — ' if ann['is_urgent'] else ''}KTU Notice",
                body=ann["summary"][:120],
                tokens=list(tokens),
            )
    except Exception as e:
        print(f"[Notifications] Poll error: {e}")


def start_scheduler():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(poll_and_notify, "interval", minutes=5, id="ktu_poll")
    scheduler.start()
    print("[Notifications] Scheduler started — polling every 5 minutes")
    return scheduler