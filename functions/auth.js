const functions = require('firebase-functions');
const admin = require('firebase-admin');

const stripe = require('stripe')(process.env.STRIPE_SECRET_LIVE, {
  apiVersion: '2020-08-27',
});

/**
 * When a user is created, create a Stripe customer object for them.
 * Note: onCreate() only has access to a user email and UID (not display name), so we set this in the UserProvider when adding the user to the store
 *
 * @see https://stripe.com/docs/payments/save-and-reuse#web-create-customer
 */
exports.createUser = functions.auth.user().onCreate(async (user) => {
  const customer = await stripe.customers.create({ email: user.email });
  await admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    displayName: '',
    customer_id: customer.id,
  });
  return;
});

/* Similar to the function in firestore/screenings.js/unregisterForScreening,
 * but we need to run here when any authenticated users get deleted,
 * and also delete the Stripe customer data */
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

  const userRef = admin.firestore().collection('users').doc(user.uid);

  /* Then, delete user from /users/{userId} */
  try {
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      /* Remove customer from Stripe */
      const customer = userDoc.data();
      try {
        await stripe.customers.del(customer.customer_id);
      } catch (error) {
        functions.logger.error("Error deleting Stripe customer", error);
      }

      userRef.delete();
    }
  } catch (error) {
    functions.logger.error("Error deleting member", error);
  }

  return;
});
