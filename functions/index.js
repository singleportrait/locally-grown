const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://locally-grown-tv.firebaseio.com'
});

exports.new = require('./app');

/* Export Stripe routes from functions/stripe.js
 * These will look like `stripe-createStripeCustomer` when deployed */
exports.stripe = require('./stripe');

/* Firebase Auth triggers:
 * - Add users to users/{userId}, and create Stripe customer
 * - Remove users from users/{userId}, screenings/{screeningId}/members/{userId}, and Stripe
 *   when authenticated users are deleted. */
exports.auth = require('./auth');

exports.mailchimp = require('./mailchimp');

/* VdoCipher authentication function
*/
exports.vdoCipher = require('./vdoCipher');
