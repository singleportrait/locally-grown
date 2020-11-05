import React, { useState, useEffect } from 'react';
import firebase, { auth } from '../firebase';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import StripeCheckoutForm from './StripeCheckoutForm';

function StripePayment(props) {
  const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

  return (
    <>
      Stripe form!
      <Elements stripe={stripePromise}>
        <StripeCheckoutForm />
      </Elements>
    </>
  );
}

export default StripePayment;
