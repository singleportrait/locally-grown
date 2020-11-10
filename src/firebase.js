import * as firebase from "firebase/app";
import 'firebase/functions';
import 'firebase/auth';
import 'firebase/firestore';

import { generateUserDocument } from './firestore/users';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

/* Using local emulator for functions */
if (process.env.NODE_ENV === 'development') {
  firebase.functions().useFunctionsEmulator('http://localhost:5001')
}

export default firebase;
export const auth = firebase.auth();
export const firestore = firebase.firestore();

/* Using local emulator for Firestore */
if (window.location.hostname === "localhost") {
  firestore.settings({
    host: "localhost:8080",
    ssl: false
  });
}

const handleSignin = (authResult) => {
  console.log("Handling sign in");
  try {
    generateUserDocument(authResult.user);
  } catch (error) {
    console.log("Error signing in", error);
  }
};

export const handleUiConfig = (signinCallback) => {
  const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      // firebase.auth.FacebookAuthProvider.PROVIDER_ID
    ],
    // Prevent redirect to accountchooser.com
    // Could also be written `firebaseui.auth.CredentialHelper.NONE`
    // But don't want to have to import `firebaseui` just for that one line
    // Can implement one-tap sign-in here: https://github.com/firebase/firebaseui-web#credential-helper
    credentialHelper: 'none',
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: (authResult) => {
        handleSignin(authResult);
        if (signinCallback) {
          console.log("Handling additional signin callback");
          signinCallback();
        }
      }
    }
  };

  return uiConfig;
}
