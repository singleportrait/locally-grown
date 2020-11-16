import * as firebase from "firebase/app";
import { firestore } from '../firebase';
import consoleLog from '../helpers/consoleLog';

const handleError = (customMessage, error) => {
  if (error.name === "FirebaseError") {
    throw new Error(`${customMessage} ${error.code}`);
  } else {
    throw new Error(`${customMessage} ${error.message}`);
  }
};

export const makeTestScreening = async (screeningId) => {
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
    // consoleLog("Trying to get members collection");
    const membersDoc = await firestore.doc(`screenings/${screeningId}`).collection("members").get();
    if (!membersDoc.size) {
      consoleLog("There are no members registered for this screening");
      return;
    } else {
      consoleLog("Found members for this screening");

      const membersMap = membersDoc.docs.map(member => {
        return {
          id: member.id,
          ...member.data()
        }
      })

      const sortedMembers = membersMap.sort((a, b) => (a.registeredAt.seconds > b.registeredAt.seconds) ? 1 : -1);
      return sortedMembers;
    }
  } catch (error) {
    handleError("Couldn't fetch members because", error);
  }
}

export const getScreening = async (screeningId, uid = null) => {
  consoleLog("[getScreening]");
  if (!screeningId) return;

  // consoleLog("[in getScreening]");
  try {
    const screeningDoc = await firestore.doc(`screenings/${screeningId}`).get();
    if (screeningDoc.exists) {
      const screeningData = screeningDoc.data();
      // consoleLog("Got screening", screeningData);

      // Logic to check for admin IDs and user info
      let members;
      if (uid && screeningData.adminIds.includes(uid)) {
        consoleLog("User has permission to get event members");
        members = await getScreeningMembers(screeningId, uid);
      } else {
        if (!uid) {
          consoleLog("No user");
        } else if (uid && !screeningData.adminIds.includes(uid)) {
          consoleLog("User doesn't have permission to get event members");
        }
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
      consoleLog("Screening doesn't exist");
      return null;
    }
  } catch (error) {
    handleError("Error fetching screening", error);
  }
}

/* Get the private info about a screening, which only registered users can access */
export const getRegisteredInfo = async (screeningId) => {
  // consoleLog("[getRegisteredInfo]");
  if (!screeningId) return;

  try {
    const registeredInfoDoc = await firestore.doc(`screenings/${screeningId}/registeredInfo/${screeningId}`).get();
    if (registeredInfoDoc.exists) {
      return registeredInfoDoc.data();
    } else {
      consoleLog("Registered info doesn't exist");
      return;
    }
  } catch (error) {
    handleError("Error fetching registered info", error);
  }
};

/* Get a user's screening registration */
export const getScreeningRegistration = async (screeningId, uid) => {
  consoleLog("[getScreeningRegistration]");
  if (!screeningId || !uid) {
    consoleLog("Missing user or screening in getScreeningRegistration");
  }

  try {
    const memberDocument = await firestore.doc(`screenings/${screeningId}/members/${uid}`).get();
    if (memberDocument.exists) {
      consoleLog("Member is registered!", memberDocument.data());
      return memberDocument.data();
    } else {
      consoleLog("Member isn't registered");
      return null;
    }
  } catch (error) {
    throw new Error(`Error fetching registration: ${error}`);
  }
}

export const getScreeningAndRegistration = async (screeningId, uid = null) => {
  const screening = await getScreening(screeningId, uid);

  let registration = null;
  if (uid) {
    registration = await getScreeningRegistration(screeningId, uid);
  }

  return {
    screening: screening,
    registration: registration
  }
}

/* Register a user for a screening */
export const registerForScreening = async (screeningId, user) => {
  consoleLog("[registerForScreening]");
  if (!screeningId || !user) {
    consoleLog("Missing screening or user");
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

      const screeningData = screeningDoc.data();
      if (screeningData.totalRegistered + 1 > screeningData.totalAllowed) {
        throw new Error("this event is already full!");
      }

      if (!memberDoc.exists) {
        consoleLog("Creating memeber");
        t.update(screeningRef, {
          totalRegistered: firebase.firestore.FieldValue.increment(1),
          registrationUpdatedAt: serverTimestamp,
        });
        t.set(memberRef, {
          displayName: user.displayName,
          email: user.email,
          registeredAt: serverTimestamp,
        });
      } else {
        throw new Error("User is already registered!");
      }
    });
  } catch (error) {
    handleError("Transaction failed because", error);
  }

  return getScreeningRegistration(screeningId, user.uid);
}

/* Unregister a user for a screening */
export const unregisterForScreening = async (screeningId, user) => {
  consoleLog("[unregisterForScreening]");
  if (!screeningId || !user) {
    consoleLog("Missing screening or user id");
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
        consoleLog("[Firebase transaction: Unregistering member...]");
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

export const deleteUserFromAllScreenings = async (user) => {
  consoleLog("[deleteUserFromAllScreenings]");

  const querySnapshot = await firestore.collection('screenings').get();
  querySnapshot.forEach(async (doc) => {
    try {
      const userDoc = await firestore.doc(`screenings/${doc.id}/members/${user.uid}`).get();
      if (userDoc.exists) {
        // Transaction to update screening & delete member
        unregisterForScreening(doc.id, user);
      }
    } catch {
      throw new Error("No screenings");
    }
  });
}

export const addDonationtoScreening = async (screeningId, user, paymentInfo) => {
  consoleLog("[addDonationtoScreening]");

  // Get member from screening
  const memberRef = firestore.doc(`screenings/${screeningId}/members/${user.uid}`);
  try {
    const memberDoc = await memberRef.get();
    if (memberDoc.exists) {
      // consoleLog("Member doc exists");
      // Update by adding payment ID from Stripe
      memberRef.update({
        payments: firebase.firestore.FieldValue.arrayUnion(paymentInfo)
      });
    } else {
      // consoleLog("No member doc");
    }

  } catch (error) {
    throw new Error("Unable to update screening member donation", error);
  }
}
