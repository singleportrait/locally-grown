import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { firestore, functions } from '../firebase';
import {
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import consoleLog from '../helpers/consoleLog';
import debounce from 'lodash/debounce';
import { v4 as uuidv4 } from 'uuid';

import { addDonationtoScreening } from '../firestore/screenings.js';

import { UserContext } from "../providers/UserProvider";

import { formatAmount, formatAmountForStripe } from '../helpers/stripeHelpers';

import styled from '@emotion/styled';
import { css } from 'emotion';

import { ButtonDiv, Button, errorColor, successColor } from '../styles';

function StripeCheckoutForm(props) {
  const { user } = useContext(UserContext);
  const screeningId = props.screening.id;

  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState(null);

  const [amount, setAmount] = useState(10);
  const [amountIsFocused, setAmountIsFocused] = useState(false);
  const [cardIsFocused, setCardIsFocused] = useState(false);
  const currency = "usd";

  const [customerId, setCustomerId] = useState(null);
  /* Get Stripe customer */
  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    async function getStripeCustomerId() {
      try {
        const userDoc = await firestore.doc(`users/${user.uid}`).get();

        if (userDoc?.data().customer_id) {
          if (isMounted) {
            setCustomerId(userDoc.data().customer_id);
          }
        } else {
          console.warn(`No Stripe customer found in Firestore for user: ${user.uid}`);
        }
      } catch (error) {
        console.error("No user doc exists!");
      }
    }

    getStripeCustomerId();
    return () => isMounted = false;
  }, [user]);

  /* Create Payment Intent */
  const [clientSecret, setClientSecret] = useState(null);
  const [resetPaymentIntent, setResetPaymentIntent] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState('');
  useEffect(() => {
    if (resetPaymentIntent || !customerId) return;
    let isMounted = true;

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
      // consoleLog("Setting client secret", result.data.client_secret);
      if (isMounted) {
        setClientSecret(result.data.client_secret);
        setPaymentIntent(result.data.payment_intent_id);
        setResetPaymentIntent(true);
      }
    }).catch((error) => {
      consoleLog(error);
      setError(error.message);
    });
    return () => isMounted = false;
  }, [resetPaymentIntent, user.email, screeningId, props.contentfulScreeningTitle, customerId]);

  const [processing, setProcessing] = useState('');
  // const [succeeded, setSucceeded] = useState(false);

  /* Mostly copied from Stripe's demo page */
  /* Listening for CardElement form event changes */
  const [disabled, setDisabled] = useState(true);
  const handleChange = async (event) => {
    // consoleLog("Handling changes within the card element", event);
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setProcessing(true);
    // setSucceeded(false);

    if (!clientSecret) {
      setError("We're having trouble with your payment; developers have been alerted.");
      return;
    }

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });
    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
    } else {
      consoleLog("Payload:", payload);
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
      consoleLog("Payload id", payload.paymentIntent.id);
      await addDonationtoScreening(screeningId, user, paymentInfo);

      props.setPayment(`✅ Your payment of ${formatAmount(paymentInfo.amount, payload.paymentIntent.currency)} has been processed via Stripe. A receipt has been sent to ${user.email}.`);
    }
  };

  const idempotencyKey = useRef();

  const debouncedUpdate = useCallback(debounce((paymentIntent, key, formattedAmount) => {
    const updatePaymentIntent = functions.httpsCallable('stripe-updatePaymentIntent');
    updatePaymentIntent({
      payment_intent: paymentIntent,
      idempotencyKey: key,
      amount: formattedAmount
    }).then(result => {
      // consoleLog("Amount change updated:", result, formattedAmount);
      // If this request's idempotency key doesn't match the current ref for the key, don't re-enable the submit button
      // consoleLog("Comparing keys", result.data.idempotencyKey, idempotencyKey.current);
      if (result.data.idempotencyKey !== idempotencyKey.current) {
        consoleLog("The old key doesn't match the updated one, not allowing button to be submitted");
        return;
      }
      setProcessing(false);
    }).catch(error => {
      setError(error.message);
    });
  }, 1000), []);

  const handleAmountChange = (event) => {
    setProcessing(true);
    setAmount(event.target.value);
    // Set fresh idempotency key
    const key = uuidv4();
    idempotencyKey.current = key;
    consoleLog("Id key", key);

    const formAmount = Number(event.target.value);
    // consoleLog("Handling amount change", formAmount);
    if (formAmount <= 0) {
      setAmount(event.target.value);
      setProcessing(true);
      return;
    }
    const formattedAmount = formatAmountForStripe(formAmount, currency);
    // consoleLog("Formmated amount for stripe", formattedAmount);

    debouncedUpdate(paymentIntent, key, formattedAmount);
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div>
        <label>
          My Donation:
          <br />
          <AmountContainer isFocused={amountIsFocused}>
            <div className={dollarStyle}>$</div>
            <input
              name="amount"
              type="number"
              min="1"
              max="999999"
              step="any"
              value={amount}
              onChange={handleAmountChange}
              required
              className={amountInputStyle}
              onFocus={() => setAmountIsFocused(true)}
              onBlur={() => setAmountIsFocused(false)}
            />
          </AmountContainer>
        </label>
      </div>
      <br />
      <CardContainer isFocused={cardIsFocused}>
        <CardElement
          id="card-element"
          options={cardElementStyle}
          onChange={handleChange}
          onFocus={() => setCardIsFocused(true)}
          onBlur={() => setCardIsFocused(false)}
        />
      </CardContainer>
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
          focusColor={successColor}
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

const InputContainer = styled('div')`
  border: 1px solid ${props => props.isFocused ? successColor : "#666" };
  border-radius: 2rem;
  background-color: #fff;
`;

const AmountContainer = styled(InputContainer)`
  padding: 0 1rem;
  font-weight: 500;
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const dollarStyle = css`
  padding: .7rem 0 .6rem;
`;

const amountInputStyle = css`
  font-weight: 500;
  width: 100%;
  border: none;
  padding: .6rem 0 .6rem .2rem;
  border-radius: 2rem;
  outline: none;
`;

const CardContainer = styled(InputContainer)`
  padding: .8rem 1rem .67rem;
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
