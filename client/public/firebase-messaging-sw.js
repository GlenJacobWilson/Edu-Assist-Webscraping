importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBaT7MnB7ZCE168xV_Hn8NS3HhPsxBWbTs",
  authDomain: "edu-assistmessage.firebaseapp.com",
  projectId: "edu-assistmessage",
  messagingSenderId: "275452814968",
  appId: "1:275452814968:web:963c34ee69e83992d26f8d",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo192.png",
    badge: "/logo192.png",
  });
});