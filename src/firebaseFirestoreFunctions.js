import * as firebase from "firebase/app";
import { firestore } from './firebase';

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

/* Get a user's event registration */
export const getEventRegistration = async (event, uid) => {
  if (!event || !uid) {
    console.log("Missing user or event in getEventRegistration");
  }

  try {
    const memberDocument = await firestore.doc(`events/${event}/members/${uid}`).get();
    if (memberDocument.exists) {
      console.log("Member is registered!", memberDocument.data());
      return memberDocument.data();
    } else {
      console.log("Member isn't registered");
      return null;
    }
  } catch (error) {
    console.log("Error fetching registration", error);
  }
}

/* Register a user for an event */
export const registerForEvent = async (event, uid) => {
  console.log("In registerForEvent");
  if (!event) {
    console.log("Missing event in unregister");
  }
  if (!uid) {
    console.log("Missing uid in unregister");
  }

  try {
    const memberRef = firestore.doc(`events/${event}/members/${uid}`);
    const memberDocument = await memberRef.get();

    if (!memberDocument.exists) {
      try {
        await memberRef.set({
          registered: true,
          registeredAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.log("Error creating member in event: \n", error);
      }
    } else {
      console.log("This user is already registered!");
    }
  } catch (error) {
    console.log("Error getting member: \n", error);
  }

  return getEventRegistration(event, uid);
}

/* Unregister a user for an event */
export const unregisterForEvent = async (event, uid) => {
  console.log("In unregisterForEvent");
  if (!event) {
    console.log("Missing event in unregister");
  }
  if (!uid) {
    console.log("Missing uid in unregister");
  }

  try {
    await firestore.doc(`events/${event}/members/${uid}`).delete();
    console.log("Successfully unregistered for event!");
    return getEventRegistration(event, uid);
  } catch (error) {
    console.log("Error unregistering for event: \n", error);
  }
}
