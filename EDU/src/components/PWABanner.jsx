import { useState, useEffect } from "react";

export default function PWABanner() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("pwaDismissed")) return;
    const handler = e => { e.preventDefault(); setPrompt(e); setShow(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const res = await prompt.userChoice;
    if (res.outcome === "accepted") setShow(false);
  };

  const dismiss = () => { setShow(false); localStorage.setItem("pwaDismissed","1"); };

  if (!show) return null;
  return (
    <div className="pwa-banner">
      <p>📱 Install KTU EduAssist on your home screen for quick access!</p>
      <div style={{display:"flex",gap:"0.7rem"}}>
        <button className="pwa-install-btn" onClick={install}>Install</button>
        <button className="pwa-dismiss" onClick={dismiss}>✕</button>
      </div>
    </div>
  );
}
