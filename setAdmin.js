/**
 * ONE-TIME SCRIPT: setAdmin.js
 * 
 * This script sets custom user claims 'admin: true' on a specific Firebase User UID.
 * This is used to grant administrative access to the Admin Panel in your application.
 * 
 * PREREQUISITES:
 * 1. Download your service account key JSON file from Firebase Console:
 *    Project Settings -> Service accounts -> Generate new private key.
 * 2. Save it in the same directory as this script and rename it to 'serviceAccountKey.json'.
 *    WARNING: Never commit this file to version control (Git)!
 * 3. Install firebase-admin dependency locally:
 *    npm install firebase-admin
 * 
 * TO RUN:
 * node setAdmin.js
 */

const admin = require('firebase-admin');

// Load service account credentials
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  console.log('================================================================');
  console.log('❌ ERROR: Missing serviceAccountKey.json!');
  console.log('----------------------------------------------------------------');
  console.log('Please follow these steps to download and set up the key:');
  console.log('1. Go to Firebase Console (https://console.firebase.google.com/)');
  console.log('2. Navigate to: Project Settings -> Service Accounts');
  console.log('3. Click "Generate new private key" at the bottom of the page');
  console.log('4. Save the downloaded JSON file in the root of this project');
  console.log('   with the filename: serviceAccountKey.json');
  console.log('5. Re-run this script: node setAdmin.js');
  console.log('================================================================');
  process.exit(1);
}

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Target Firebase user UID
const targetUid = 'KlSSLp05vSdk5JtJb4Xr0OVhkbH2';

async function grantAdminRole(uid) {
  try {
    // Set custom user claims representing role privileges
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    
    // Fetch the updated user record to verify
    const userRecord = await admin.auth().getUser(uid);
    console.log(`\n======================================================`);
    console.log(`🎉 SUCCESS: Admin claims successfully configured!`);
    console.log(`------------------------------------------------------`);
    console.log(`👤 User Email: ${userRecord.email}`);
    console.log(`🔑 User UID:   ${userRecord.uid}`);
    console.log(`📋 Claims:     `, userRecord.customClaims);
    console.log(`======================================================`);
    console.log(`NOTE: The user must sign out and sign back in for the new claims to take effect.\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting admin claims:', error);
    process.exit(1);
  }
}

// Execute
grantAdminRole(targetUid);
