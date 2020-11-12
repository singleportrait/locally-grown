import React, { useState, useEffect, useContext } from 'react';
import { firestore, functions } from '../firebase';
import {
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

import { addDonationtoScreening } from '../firestore/screenings.js';

import { UserContext } from "../providers/UserProvider";

import { formatAmount, formatAmountForStripe } from '../helpers/stripeHelpers';

import styled from '@emotion/styled';
import { css } from 'emotion';

import { ButtonDiv, Button, errorColor } from '../styles';

function StripeCheckoutForm(props) {
  const { user } = useContext(UserContext);
  const screeningId = props.screening.id;

  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState(null);

  const [amount, setAmount] = useState(10);
  const currency = "usd";

  const [customerId, setCustomerId] = useState(null);
  /* Get Stripe customer */
  useEffect(() => {
    if (!user) return;
    async function getStripeCustomerId() {
      const userDoc = await firestore.doc(`users/${user.uid}`).get()
        .catch(e => console.log("No user doc exists!"));

      if (userDoc.data().customer_id) {
        setCustomerId(userDoc.data().customer_id);
      } else {
        console.warn(`No Stripe customer found in Firestore for user: ${user.uid}`);
      }
    }

    getStripeCustomerId();
  }, [user]);

  /* Create Payment Intent */
  const [clientSecret, setClientSecret] = useState(null);
  const [resetPaymentIntent, setResetPaymentIntent] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState('');
  useEffect(() => {
    if (resetPaymentIntent || !customerId) return;

    const intentData = {
      email: user.email,
      customerId: customerId,
      metadata: {
        reason_id: screeningId,
        reason_title: props.contentfulScreeningTitle,
        reason_type: "screening"
      }
    }
    const createPaymentIntent = functions.httpsCallable('stripe-createPaymentIntent');
    createPaymentIntent(intentData).then(result => {
      // console.log("Setting client secret", result.data.client_secret);
      setClientSecret(result.data.client_secret);
      setPaymentIntent(result.data.payment_intent_id);
      setResetPaymentIntent(true);
    }).catch((error) => {
      console.log(error);
    });
  }, [resetPaymentIntent, user.email, screeningId, props.contentfulScreeningTitle, customerId]);

  const [processing, setProcessing] = useState('');
  // const [succeeded, setSucceeded] = useState(false);

  /* Mostly copied from Stripe's demo page */
  const [disabled, setDisabled] = useState(true);
  const handleChange = async (event) => {
    // console.log("Handling changes within the card element");
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setProcessing(true);
    // setSucceeded(false);

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });
    if (payload.error) {
      setError(`Payment failed ${payload.error.message}`);
      setProcessing(false);
    } else {
      console.log("Payload:", payload);
      /* Reset the setup on the page if you want to enable further transactions */
      // setError(null);
      // setProcessing(false);
      // setSucceeded(true);

      /* Create new payment intent after this, if you want to enable
      * further transactions */
      // setResetPaymentIntent(false);

      const paymentInfo = {
        id: payload.paymentIntent.id,
        amount: payload.paymentIntent.amount,
        currency: currency,
        created: new Date(payload.paymentIntent.created*1000)
      }
      console.log("Payload id", payload.paymentIntent.id);
      await addDonationtoScreening(screeningId, user, paymentInfo);

      props.setPayment(`✅ Your payment of ${formatAmount(paymentInfo.amount, payload.paymentIntent.currency)} has been processed via Stripe. A receipt has been sent to ${user.email}.`);
    }
  };

  const handleAmountChange = (event) => {
    console.log("Handling amount change");
    const formAmount = Number(event.target.value);
    const formattedAmount = formatAmountForStripe(formAmount, currency);
    setProcessing(true);

    const updatePaymentIntent = functions.httpsCallable('stripe-updatePaymentIntent');
    updatePaymentIntent({
      payment_intent: paymentIntent,
      amount: formattedAmount
    }).then(result => {
      console.log("Amount change updated:", result);
      setProcessing(false);
    });
    setAmount(event.target.value);
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div>
        <label>
          My Donation:
          <br />
          <input
            name="amount"
            type="number"
            min="1"
            max="99999999"
            value={amount}
            onChange={handleAmountChange}
            required
            className={inputStyle}
          />
        </label>
      </div>
      <br />
      <div className={cardStyle}>
        <CardElement id="card-element" options={cardElementStyle} onChange={handleChange} />
      </div>
      {/* Show any error that happens when processing the payment */}
      { error &&
        <CardError role="alert">
          {error}
        </CardError>
      }
      <div className={flexRight}>
        <ButtonDiv className={skipButton} onClick={() => props.setSkipPayment(true)}>
          No thanks
        </ButtonDiv>
        <Button
          disabled={processing || disabled}
          color={(processing || disabled) ? "#ccc" : "#111"}
          focusColor="#333"
          textColor="#fff"
          id="submit"
        >
          {processing ? "Processing..." : "Donate"}
        </Button>
      </div>
      {/* { succeeded && "It worked!" } */}
    </form>
  )
}

const CardError = styled('div')`
  color: ${errorColor};
  margin: .5rem 0;
`;

const inputStyle = css`
  padding: 0.7rem 1rem 0.6rem;
  border: 1px solid #666;
  border-radius: 2rem;
  font-weight: 500;
  width: 100%;
`;

const cardStyle = css`
  padding: 0.8rem 1rem 0.6rem;
  border: 1px solid #666;
  border-radius: 2rem;
  background-color: #fff;
`;

const flexRight = css`
  display: flex;
  justify-content: flex-end;
`;

const skipButton = css`
  margin-right: 1rem;
  background-color: none;
  text-decoration: underline;
`;

const cardElementStyle = {
  style: {
    base: {
      fontFamily: "Larsseit, sans-serif",
      fontSize: "16px",
      "::placeholder": {
        color: "#999"
      }
    },
    invalid: {
      color: errorColor,
      iconColor: errorColor
    }
  },
}

export default StripeCheckoutForm;
