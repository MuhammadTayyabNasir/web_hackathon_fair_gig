const admin = require('firebase-admin');

let initialized = false;

/**
 * Initialize Firebase Admin lazily from environment variables.
 * Uses GOOGLE_APPLICATION_CREDENTIALS when available, otherwise
 * can consume individual service account fields.
 */
function ensureFirebaseAdmin() {
  if (initialized) {
    return admin;
  }

  if (!admin.apps.length) {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      admin.initializeApp();
    }
  }

  initialized = true;
  return admin;
}

module.exports = { ensureFirebaseAdmin };
