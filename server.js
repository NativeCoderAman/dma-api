const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const PORT = 8000;

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(cors());
app.use(bodyParser.json());



app.post('dma/api/save-fcm-token', async (req, res) => {
  const { userId, fcmToken } = req.body;

  if (!userId || !fcmToken) {
    return res.status(400).json({ message: 'Missing userId or fcmToken' });
  }

  try {
    const userRef = db.collection('fcmTokens').doc(String(userId));
    await userRef.set({
      token: fcmToken,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ message: 'FCM token saved' });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return res.status(500).json({ message: 'Failed to save token' });
  }
});

// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });





app.post('dma/api/send-notification', async (req, res) => {
    const { userId, title, body } = req.body;

    console.log('Received request:', req.body); 
  
    if (!userId || !title || !body) {
      return res.status(400).json({ message: 'Missing userId, title, or body' });
    }
  
    try {
       const userRef = await db.collection('fcmTokens').doc(String(userId)).get();
      
      if (!userRef.exists) {
        return res.status(404).json({ message: 'User token not found' });
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
  
      return res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error) {
      console.error('Error sending notification:', error);
      return res.status(500).json({ message: 'Failed to send notification' });
    }
  });
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
  
