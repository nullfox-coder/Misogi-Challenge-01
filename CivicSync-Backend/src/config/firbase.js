const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../../firebase-service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const bucket = admin.storage().bucket();

module.exports = {
    bucket
};