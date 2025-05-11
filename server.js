const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
const PORT = 8000;

const serviceAccount = {
  type: "service_account",
  project_id: "myapp-notifications-71968",
  "private_key_id": "0d27a173c53767151fac5010c2b8bfa9d9a8460b",
  private_key: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCzXwXo6Mot3Eam\nVBdtJYJMxxn5lFN/rWfdzZ1Xjtv0c/yGF/ET4uNH5Mx1mganz8wfN3nCyNjYRJqc\n+wHCc5nyEZgJaFbFnZMP9f9Zk5K2AF1+5Zvj+qXOVSSigD3/n/JozOaqFoYB32l4\nAxhacFffLdmryq84QuQ90iKZzNVJ29xyJkY9Mc88J2GV64kzsyLsCBDrwJWc5/l6\n7weS9dD/LkcoP9FzrWij0ZBXqyr3d2btli2aM5/VDVIjYBc3lwXl0vpmlpq0+vSN\nIwnvIaMgg2P3jbXxnvgEKZp9GgjxetKLY7SuLNsonYGHqT+bSHf1qziaO8j2d/8T\nQKexhQ97AgMBAAECggEAD+II/hk9lzcAozIiCuj93eTpdhH+HM79j1npe1CBReb5\nWY8IKrMgs1kys50qcV9Im2EIV/OnTpXbPQL1om17GGtvaNyDhnx6rQ34M6CKJrHn\nQC5+Zym8LIZEjVvJYaJyTs5fWc35xXOuJ/wvgrPyS/xdixqSTms567F48ovSkndj\n+duYIpMfdkI97gHs27+UUXuZVqRx2CSHtyRXzxcsB/yv9IiXNDp81b9sDeSYgpWa\ntJ61pjnzMyZicWW+XXBMFzzbgh4sRsoQQS4TgrzcR8fQ8VOcXJlUKSg+cB61NcAo\nkOWILzEmamx2Gkll3qPedOyOSpy1/fsZ/ykGlv5h7QKBgQDiN87mlGsW+RDfnbqt\nUdPWIA/W/MLGf5hEwNypB6HCLEA0D6LBmFRONieSZHh+/SCVFNv4yYxIzVysyzKZ\na0kUDqXPP7kxV/Nplpg1k8yZskVE5F9oJkQWMvTJg6IlEoCMy5wv27uDBfbYat1P\na7WC1z6+FwNnEQDqKsixvfkn9QKBgQDK/FfyjQoQty3hNSe9mQznRfo76HUbsTkn\nxKYuqV7nkB4Fg5hNR1SOhK4cVJ3jLazdnXbTQpaHSyTLJRmv+hSDt1QaVpLIcBB1\nkH/urctC2nE7bS2Y3AlN3Ch5lWeCY3q3z3cB60V9iIXNTecVWZ5ktsU2HxEnOy58\naOArLmNjrwKBgBbQ7itPeOWeRVdofzWP9T+5iB906ug+Yks88IST4nrFH8ygbxf7\nlzU0PRWE0KpuOWUP74fOPDnzjI9ZB0d2DK7bM1oN4U3awxA5QizVNWOjGV1zczP7\n+A4NIadZgXcfwJtyxdQF44m5hkYZsSybfnkt4IQnqg4xJth3bDqRIJopAoGBAK6q\nDt92f2e8x+zW+XhLH3BOpbExKLwIdp8CtuDF+xUUzNB/2Oj+bQMppkxYf3fBkNMt\nsNa+oJqQjXuEVCM59LcWZHc5cZqp22/eREdUIuhG4VJ6ctbq19K4k9dzORtYkHtk\nOQpcsXIArOnpk+OqNwKAxxf4CaGRakHBWMuvYfSfAoGAQ5PfejxlhB1tgSzEXQFY\nYfMU7Khjh6eCa2fOYcr5gGBK/HfkuZ/tb0ktBsrOUUYL0D0YgRBnpGiFeiDFjvxH\nNvyizar8VEJeqRB3WnNcwkvnh3N63SQG7J+36Jraf2gaquE2hC2seXBf80C/mLeo\nLFjUv/ePB2Cf6UedseKxtjc=\n-----END PRIVATE KEY-----\n`,
  client_email:
    "firebase-adminsdk-fbsvc@myapp-notifications-71968.iam.gserviceaccount.com",
  client_id: "115563897287133692451",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40myapp-notifications-71968.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(cors());
app.use(bodyParser.json());

app.get("/get", async (req, res) => {
  res.send("Hello World!");
});

app.post("/api/save-fcm-token", async (req, res) => {
  const { userId, fcmToken } = req.body;

  if (!userId || !fcmToken) {
    return res.status(400).json({ message: "Missing userId or fcmToken" });
  }

  try {
    const userRef = db.collection("fcmTokens").doc(String(userId));
    await userRef.set({
      token: fcmToken,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ message: "FCM token saved" });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return res.status(500).json({ message: "Failed to save token" });
  }
});

// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });

app.post("/api/send-notification", async (req, res) => {
  const { userId, title, body } = req.body;

  console.log("Received request:", req.body);

  if (!userId || !title || !body) {
    return res.status(400).json({ message: "Missing userId, title, or body" });
  }

  try {
    const userRef = await db.collection("fcmTokens").doc(String(userId)).get();

    if (!userRef.exists) {
      return res.status(404).json({ message: "User token not found" });
    }

    const fcmToken = userRef.data().token;

    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: fcmToken,
    };

    await admin.messaging().send(message);

    return res.status(200).json({ message: "Notification sent successfully" });
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({ message: "Failed to send notification" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
