import * as firebase from "firebase/app";
import { firestore } from '../firebase';

const handleError = (customMessage, error) => {
  if (error.name === "FirebaseError") {
    throw new Error(`${customMessage} ${error.code}`);
  } else {
    throw new Error(`${customMessage} ${error.message}`);
  }
};

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
      throw new Error(`Error creating screening: ${error}`);
    }
  }
};

const getScreeningMembers = async(screeningId, uid) => {
  if (!screeningId || !uid) return;

  try {
    // console.log("Trying to get members collection");
    const membersDoc = await firestore.doc(`screenings/${screeningId}`).collection("members").get();
    if (!membersDoc.size) {
      console.log("There are no members registered for this screening");
      return;
    } else {
      console.log("Found members for this screening");

      const membersData = membersDoc.docs.map(member => {
        return {
          id: member.id,
          ...member.data()
        }
      })

      return membersData;
    }
  } catch (error) {
    handleError("Couldn't fetch members because", error);
  }
}

export const getScreening = async (screeningId, uid = null) => {
  if (!screeningId) return;

  // console.log("[in getScreening]");
  try {
    const screeningDoc = await firestore.doc(`screenings/${screeningId}`).get();
    if (screeningDoc.exists) {
      const screeningData = screeningDoc.data();
      // console.log("Got screening", screeningData);

      // Logic to check for admin IDs and user info
      let members;
      if (uid && screeningData.adminIds.includes(uid)) {
        console.log("User has permission to get event members");
        members = await getScreeningMembers(screeningId, uid);
      } else {
        console.log("No user, or user doesn't have permission to get event members");
      }

      const returnedData = {
        id: screeningDoc.id,
        ...screeningData,
      }

      if (members) {
        returnedData.members = members;
      }

      return returnedData;
    } else {
      console.log("Screening doesn't exist");
      return null;
    }
  } catch (error) {
    handleError("Error fetching screening", error);
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
    throw new Error(`Error fetching registration: ${error}`);
  }
}

/* Register a user for a screening */
export const registerForScreening = async (screeningId, user) => {
  console.log("In registerForScreening");
  if (!screeningId || !user) {
    console.log("Missing screening or user");
  }

  const screeningRef = firestore.doc(`screenings/${screeningId}`);
  const memberRef = firestore.doc(`screenings/${screeningId}/members/${user.uid}`);

  const memberDoc = await memberRef.get();

  try {
    await firestore.runTransaction(async t => {
      const screeningDoc = await t.get(screeningRef);
      // const memberDoc = await t.get(memberRef);
      const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp();

      if (!screeningDoc.exists) { throw new Error("Screening doesn't exist!"); }

      // TODO: Add logic to check that current totalAllowed is greater than totalRegistered
      const screeningData = screeningDoc.data();
      if (screeningData.totalRegistered + 1 > screeningData.totalAllowed) {
        throw new Error("this event is already full!");
      }

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
    // TODO: More structured checks depending on error type, especially for
    // handling Firebase errors
    // `error.code` comes from Firestore's response if it fails server-side
    // `error.message` comes if we set it ourselves in the `try` block
    handleError("Transaction failed because", error);
  }

  return getScreeningRegistration(screeningId, user.uid);
}

/* Unregister a user for a screening */
export const unregisterForScreening = async (screeningId, user) => {
  console.log("In unregisterForScreening");
  if (!screeningId || !user) {
    console.log("Missing screening or user id");
  }

  const screeningRef = firestore.doc(`screenings/${screeningId}`);
  const memberRef = firestore.doc(`screenings/${screeningId}/members/${user.uid}`);

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
    handleError("Transaction failed because", error);
  }
  return getScreeningRegistration(screeningId, user.uid);
}
