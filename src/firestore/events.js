import * as firebase from "firebase/app";
import { firestore } from '../firebase';

export const makeTestHotIronsEvent = async (eventId) => {
  const testEventRef = firestore.doc(`events/${eventId}`);
  const testEventDoc = await testEventRef.get();

  if (!testEventDoc.exists) {
    try {
      await testEventRef.set({
        totalAllowed: 100,
        totalRegistered: 0,
        adminIds: [],
        registrationUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      throw new Error("Error creating event", error);
    }
  }

  return getEvent(eventId);
};

export const getEvent = async (eventId) => {
  if (!eventId) return null;

  try {
    const eventDoc = await firestore.doc(`events/${eventId}`).get();
    if (eventDoc.exists) {
      console.log("Got event", eventDoc.data());
      return {
        id: eventDoc.id,
        ...eventDoc.data()
      }
    } else {
      console.log("Event doesn't exist");
      return null;
    }
  } catch (error) {
    throw new Error("Error fetching event", error);
  }
}

/* Get a user's event registration */
export const getEventRegistration = async (eventId, uid) => {
  if (!eventId || !uid) {
    console.log("Missing user or event in getEventRegistration");
  }

  try {
    const memberDocument = await firestore.doc(`events/${eventId}/members/${uid}`).get();
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

/* Register a user for an event */
export const registerForEvent = async (eventId, uid) => {
  console.log("In registerForEvent");
  if (!eventId || !uid) {
    console.log("Missing event or uid");
  }

  const eventRef = firestore.doc(`events/${eventId}`);
  const memberRef = firestore.doc(`events/${eventId}/members/${uid}`);

  const memberDoc = await memberRef.get();

  try {
    await firestore.runTransaction(async t => {
      const eventDoc = await t.get(eventRef);
      // const memberDoc = await t.get(memberRef);
      const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp();

      if (!eventDoc.exists) { throw new Error("Event doesn't exist!"); }

      // TODO: Add logic to check that current totalAllowed is greater than totalRegistered

      if (!memberDoc.exists) {
        console.log("Craeting memeber");
        t.update(eventRef, {
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

  return getEventRegistration(eventId, uid);
}

/* Unregister a user for an event */
export const unregisterForEvent = async (eventId, uid) => {
  console.log("In unregisterForEvent");
  if (!eventId || !uid) {
    console.log("Missing event or user id");
  }

  const eventRef = firestore.doc(`events/${eventId}`);
  const memberRef = firestore.doc(`events/${eventId}/members/${uid}`);

  try {
    await firestore.runTransaction(async t => {
      const eventDoc = await t.get(eventRef);
      const memberDoc = await t.get(memberRef);
      const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp();

      if (!eventDoc.exists) { throw new Error("Event doesn't exist!"); }

      if (memberDoc.exists) {
        console.log("Unregistering member...");
        t.delete(memberRef);
        t.update(eventRef, {
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
  return getEventRegistration(eventId, uid);
}
