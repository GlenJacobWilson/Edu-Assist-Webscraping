import os
import resend
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

# ── Twilio setup ───────────────────────────────────────────
twilio_client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)
TWILIO_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

# ── Resend setup ───────────────────────────────────────────
resend.api_key = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@yourdomain.com")


def send_whatsapp(to_number: str, message: str) -> bool:
    """
    Send WhatsApp message via Twilio.
    to_number format: "+919876543210"
    """
    try:
        twilio_client.messages.create(
            from_=TWILIO_FROM,
            to=f"whatsapp:{to_number}",
            body=message
        )
        return True
    except Exception as e:
        print(f"[Twilio] Error: {e}")
        return False


def send_email_resend(to_email: str, subject: str, html_body: str) -> bool:
    """Send email via Resend."""
    try:
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": to_email,
            "subject": subject,
            "html": html_body,
        })
        return True
    except Exception as e:
        print(f"[Resend] Error: {e}")
        return False


def build_notification_email(title: str, summary: str, date: str, is_urgent: bool) -> str:
    """Build a styled HTML email for a KTU notification."""
    urgency_banner = """
        <div style="background:#fee2e2;border-left:4px solid #ef4444;padding:12px 16px;
                    margin-bottom:20px;border-radius:4px;">
            <strong style="color:#991b1b;">⚠️ URGENT — Action Required</strong>
        </div>
    """ if is_urgent else ""

    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;
                background:#ffffff;border-radius:12px;overflow:hidden;
                box-shadow:0 4px 20px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1e3c72,#2563eb);
                    padding:28px 32px;color:#fff;">
            <h1 style="margin:0;font-size:22px;font-weight:700;">
                🎓 EduAssist — KTU Alert
            </h1>
            <p style="margin:6px 0 0;opacity:0.85;font-size:14px;">{date}</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
            {urgency_banner}

            <h2 style="color:#1e293b;font-size:18px;margin:0 0 16px;">{title}</h2>

            <div style="background:#f1f5f9;border-left:4px solid #2563eb;
                        padding:14px 18px;border-radius:4px;margin-bottom:24px;">
                <p style="margin:0;color:#334155;font-size:15px;line-height:1.7;">
                    {summary}
                </p>
            </div>

            <a href="http://localhost:3000/dashboard"
               style="display:inline-block;background:#2563eb;color:#fff;
                      padding:12px 28px;border-radius:8px;font-weight:600;
                      font-size:15px;text-decoration:none;">
                View on Dashboard →
            </a>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;padding:18px 32px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
                EduAssist · Independent KTU Student Platform ·
                <a href="#" style="color:#94a3b8;">Unsubscribe</a>
            </p>
        </div>
    </div>
    """


def build_whatsapp_message(title: str, summary: str, date: str, is_urgent: bool) -> str:
    prefix = "🚨 *URGENT KTU NOTICE*" if is_urgent else "📢 *KTU Notice*"
    return (
        f"{prefix}\n\n"
        f"*{title}*\n"
        f"📅 {date}\n\n"
        f"{summary}\n\n"
        f"🔗 Check your EduAssist dashboard for full details."
    )