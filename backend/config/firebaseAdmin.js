import admin from 'firebase-admin';

const initFirebaseAdmin = () => {
  if (admin.apps.length > 0) return;

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle newline characters in the private key safely
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      console.log('✔ Firebase Admin SDK initialized successfully!');
    } catch (err) {
      console.error(`[FIREBASE ERROR] Failed to initialize Admin SDK: ${err.message}`);
    }
  } else {
    console.log('[FIREBASE WARNING] Credentials missing. Running in simulated offline verification mode.');
  }
};

export default initFirebaseAdmin;
