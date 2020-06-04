import admin, { ServiceAccount, database, auth as fbaseAuth } from "firebase-admin";
// Fetch the service account key JSON file contents, PUT YOUR ADMIN SDK CREDENTIALS JSON
// import serviceAccount from "./firebase-adminsdk.json";

// Uncomment this when you are using your actual firebase
const serviceAccount = {};

console.log("import firebase.config");

export function initializeFirebase(): void {
  // Initialize the app with a custom auth variable, limiting the server's access
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
    databaseURL: "https://<your firebse url>"
  });
}

// The app only has access as defined in the Security Rules
export const db: database.Database = admin.database();
export const auth: fbaseAuth.Auth = admin.auth();