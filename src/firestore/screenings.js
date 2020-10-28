import * as firebase from "firebase/app";
import { firestore } from '../firebase';

export const makeTestHotIronsScreening = async (screeningId) => {
  const testScreeningRef = firestore.doc(`screenings/${screeningId}`);
  const testScreeningDoc = await testScreeningRef.get();

  if (!testScreeningDoc.exists) {
    try {
      await testScreeningRef.set({
        totalAllowed: 100,
        totalRegistered: 0,
        adminIds: [],
        registrationUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      throw new Error("Error creating screening", error);
    }
  }

  return getScreening(screeningId);
};

export const getScreening = async (screeningId) => {
  if (!screeningId) return null;

  try {
    const screeningDoc = await firestore.doc(`screenings/${screeningId}`).get();
    if (screeningDoc.exists) {
      console.log("Got screening", screeningDoc.data());
      return {
        id: screeningDoc.id,
        ...screeningDoc.data()
      }
    } else {
      console.log("Screening doesn't exist");
      return null;
    }
  } catch (error) {
    throw new Error("Error fetching screening", error);
  }
}

/* Get a user's screening registration */
export const getScreeningRegistration = async (screeningId, uid) => {
  if (!screeningId || !uid) {
    console.log("Missing user or screening in getScreeningRegistration");
  }

  try {
    const memberDocument = await firestore.doc(`screenings/${screeningId}/members/${uid}`).get();
    if (memberDocument.exists) {
      console.log("Member is registered!", memberDocument.data());
      return memberDocument.data();
    } else {
      console.log("Member isn't registered");
      return null;
    }
  } catch (error) {
    throw new Error("Error fetching registration", error);
  }
}

/* Register a user for a screening */
export const registerForScreening = async (screeningId, uid) => {
  console.log("In registerForScreening");
  if (!screeningId || !uid) {
    console.log("Missing screening or uid");
  }

  const screeningRef = firestore.doc(`screenings/${screeningId}`);
  const memberRef = firestore.doc(`screenings/${screeningId}/members/${uid}`);

  const memberDoc = await memberRef.get();

  try {
    await firestore.runTransaction(async t => {
      const screeningDoc = await t.get(screeningRef);
      // const memberDoc = await t.get(memberRef);
      const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp();

      if (!screeningDoc.exists) { throw new Error("Screening doesn't exist!"); }

      // TODO: Add logic to check that current totalAllowed is greater than totalRegistered

      if (!memberDoc.exists) {
        console.log("Craeting memeber");
        t.update(screeningRef, {
          totalRegistered: firebase.firestore.FieldValue.increment(1),
          registrationUpdatedAt: serverTimestamp,
        });
        t.set(memberRef, {
          registeredAt: serverTimestamp,
        });
      } else {
        throw new Error("User is already registered!");
      }
    });
  } catch (error) {
    throw new Error("Transaction failed", error);
  }

  return getScreeningRegistration(screeningId, uid);
}

/* Unregister a user for a screening */
export const unregisterForScreening = async (screeningId, uid) => {
  console.log("In unregisterForScreening");
  if (!screeningId || !uid) {
    console.log("Missing screening or user id");
  }

  const screeningRef = firestore.doc(`screenings/${screeningId}`);
  const memberRef = firestore.doc(`screenings/${screeningId}/members/${uid}`);

  try {
    await firestore.runTransaction(async t => {
      const screeningDoc = await t.get(screeningRef);
      const memberDoc = await t.get(memberRef);
      const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp();

      if (!screeningDoc.exists) { throw new Error("Screening doesn't exist!"); }

      if (memberDoc.exists) {
        console.log("Unregistering member...");
        t.delete(memberRef);
        t.update(screeningRef, {
          totalRegistered: firebase.firestore.FieldValue.increment(-1),
          registrationUpdatedAt: serverTimestamp
        });
      } else {
        throw new Error("User isn't registered!");
      }
    });
  } catch (error) {
    throw new Error("Transaction failed", error);
  }
  return getScreeningRegistration(screeningId, uid);
}
