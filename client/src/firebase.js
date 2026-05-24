import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBaT7MnB7ZCE168xV_Hn8NS3HhPsxBWbTs",
  authDomain: "edu-assistmessage.firebaseapp.com",
  projectId: "edu-assistmessage",
  storageBucket: "edu-assistmessage.firebasestorage.app",
  messagingSenderId: "275452814968",
  appId: "1:275452814968:web:963c34ee69e83992d26f8d",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export async function requestAndRegisterToken(authToken) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const fcmToken = await getToken(messaging, {
      vapidKey: "BClvucw2eppby5AAYyXjua0nZBNwS48CtYxptDne0JBcLnxZaGrOlozICSEJiQgPERJGu8UGKTFbqq1FrrHKWFU",
    });

    await fetch("http://172.30.12.235:8000/register-token", {   // ← fixed
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: fcmToken }),
    });

    console.log("FCM token registered successfully");
  } catch (err) {
    console.error("Notification setup failed:", err);
  }
}

export function listenForForegroundMessages(onNotification) {
  onMessage(messaging, (payload) => {
    onNotification(payload.notification);
  });
}