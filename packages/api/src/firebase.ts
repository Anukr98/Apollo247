import * as firebaseAdmin from 'firebase-admin';

const config = {
  credential: firebaseAdmin.credential.applicationDefault(),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
};
export const admin = !firebaseAdmin.apps.length
  ? firebaseAdmin.initializeApp(config)
  : firebaseAdmin.app();
