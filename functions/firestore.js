const functions = require('firebase-functions');
const admin = require('firebase-admin');

/* Similar to the function in firestore/screenings.js/unregisterForScreening,
 * but we need to run here when any authenticated users get deleted */
exports.cleanupUser = functions.auth.user().onDelete(async (user) => {
  /* Remove member and update all screenings */
  try {
    const screeningsSnapshot = await admin.firestore().collection('screenings').get();

    screeningsSnapshot.forEach(async (doc) => {
      const screeningId = doc.id;
      const screeningRef = admin.firestore().doc(`screenings/${screeningId}`);
      const memberRef = admin.firestore().doc(`screenings/${screeningId}/members/${user.uid}`);

      try {
        await admin.firestore().runTransaction(async t => {
          const screeningDoc = await t.get(screeningRef);
          const memberDoc = await t.get(memberRef);
          const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

          if (!screeningDoc.exists) { functions.logger.error("Screening doesn't exist!", screeningId); }

          if (memberDoc.exists) {
            t.delete(memberRef);
            t.update(screeningRef, {
              totalRegistered: admin.firestore.FieldValue.increment(-1),
              registrationUpdatedAt: serverTimestamp
            });
          }
        });
      } catch (error) {
        functions.logger.error("Transaction failed because", error);
      }
    });
  } catch(error) {
    functions.logger.error("Error getting screenings", error);
  }

  /* Then, delete user from /users/{userId} */
  const userRef = admin.firestore().collection('users').doc(user.uid);

  try {
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      userRef.delete();
    }
  } catch (error) {
    functions.logger.error("Error deleting member", error);
  }

  return;
});
