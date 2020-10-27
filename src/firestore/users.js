import * as firebase from "firebase/app";
import { firestore } from '../firebase';

/* Create a new user */
export const generateUserDocument = async (user) => {
  if (!user) return;

  const userRef = firestore.doc(`users/${user.uid}`);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    const { email, displayName } = user;
    try {
      await userRef.set({
        email,
        displayName
      });
    } catch (error) {
      console.log("Error creating user document", error);
    }
  }
  return getUserDocument(user.uid);
}

/* Get a user's document */
const getUserDocument = async (uid) => {
  if (!uid) return null;

  try {
    const userDocument = await firestore.doc(`users/${uid}`).get();
    return {
      uid,
      ...userDocument.data()
    }
  } catch (error) {
    console.log("Error fetching user document", error);
  }
}
