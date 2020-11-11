const functions = require('firebase-functions');
const admin = require('firebase-admin');

const stripe = require('stripe')(functions.config().stripe.secret, {
  apiVersion: '2020-08-27',
});

/**
 * When the donation form is visible, create a new Payment Intent
 */
exports.createPaymentIntent = functions.https.onCall((data, context) => {
  // Perhaps later: save customer on user auth
  // let customer;
  // stripe.customers.create({ email: data.email })
  //   .then(result => {
  //     customer = result;
  //   });

  return stripe.paymentIntents.create({
    amount: 1000,
    currency: "usd",
    // status: "new",
    receipt_email: data.email,
    description: `${data.metadata.reason_title} Donation`,
    metadata: data.metadata,
  }).then((paymentIntent) => {
    // functions.logger.info("Received payment intent", paymentIntent);
    return {
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    }
  }).catch(error => {
    snap.ref.set({ error: userFacingMessage(error) }, { merge: true });
    reportError(error, { user: context.params.userId });
  });
});

exports.updatePaymentIntent = functions.https.onCall((data, context) => {
  return stripe.paymentIntents.update(
    data.payment_intent,
  {
    amount: data.amount,
    currency: "usd"
  }).then((paymentIntent) => {
    // functions.logger.info("Updated payment intent", paymentIntent);
    return {
      client_secret: paymentIntent.client_secret,
    }
  });
});

/**
 * To keep on top of errors, we should raise a verbose error report with Stackdriver rather
 * than simply relying on console.error. This will calculate users affected + send you email
 * alerts, if you've opted into receiving them.
 */

// [START reporterror]

function reportError(err, context = {}) {
  const metadata = {
    resource: {
      type: 'cloud_function',
      labels: { function_name: process.env.FUNCTION_NAME },
    },
  };

  // https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
  const errorEvent = {
    message: err.stack,
    serviceContext: {
      service: process.env.FUNCTION_NAME,
      resourceType: 'cloud_function',
    },
    context: context,
  };

  functions.logger.error("Stripe error", {
    metadata: metadata,
    errorEvent: errorEvent
  });
}

/**
 * Sanitize the error message for the user.
 */
function userFacingMessage(error) {
  return error.type
    ? error.message
    : 'An error occurred, developers have been alerted';
}
