import React, { useState, useEffect, useContext } from 'react';
import firebase, { firestore } from '../firebase';
import {
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

import { UserContext } from "../providers/UserProvider";

import { formatAmount, formatAmountForStripe } from '../helpers/stripeHelpers';

import styled from '@emotion/styled';
import { css } from 'emotion';

import { ButtonDiv, Button, errorColor } from '../styles';

function StripeCheckoutForm(props) {
  const { user } = useContext(UserContext);
  const { setPayment } = props;

  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState(null);

  const [amount, setAmount] = useState(10);
  const [paymentMessage, setPaymentMessage] = useState();

  const [customerData, setCustomerData] = useState({});

  const [paymentId, setPaymentId] = useState();

  /* Listener for customer data */
  useEffect(() => {
    console.log("[User changed in StripeCheckoutForm]", user?.uid);
    if (!user) return;

    /* Mostly copied from Firebase's Stripe demo page */
    const stripeCustomerUnsubscribe = firestore
        .collection('stripe_customers')
        .doc(user.uid)
        .onSnapshot((snapshot) => {
          if (snapshot.data()) {
            setCustomerData(snapshot.data());
          } else {
            console.warn(
              `No Stripe customer found in Firestore for user: ${user.uid}`
            );
          }
        });

    return () => {
      if (user) {
        stripeCustomerUnsubscribe();
      }
    }
  }, [user]);

  /* Listener for any individual payments */
  const [processing, setProcessing] = useState('');
  const [succeeded, setSucceeded] = useState(false);
  useEffect(() => {
    if (!paymentId) return;
    console.log("Running useEffect for payment ID");

    // Handle card actions like 3D Secure
    async function handleCardAction(payment, docId) {
      console.log("Handling 3D security");
      const { error, paymentIntent } = await stripe.handleCardAction(
        payment.client_secret
      );
      if (error) {
        alert(error.message);
        payment = error.payment_intent;
      } else if (paymentIntent) {
        payment = paymentIntent;
      }

      await firebase
        .firestore()
        .collection('stripe_customers')
        .doc(user.uid)
        .collection('payments')
        .doc(docId)
        .set(payment, { merge: true });
    }

    const paymentUnsubscribe = firestore
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payments')
      .doc(paymentId)
      .onSnapshot((doc) => {
        const payment = doc.data();
        console.log("Checking individual payment", payment);

        let content = '';
        const amount = formatAmount(payment.amount, payment.currency);
        switch (payment.status) {
          case 'new':
          case 'requires_confirmation':
            setProcessing(true);
            content = `Creating Payment for ${amount}`;
            break;
          case 'succeeded':
            setProcessing(false);
            setSucceeded(true);
            const card = payment.charges.data[0].payment_method_details.card;
            content = `✅ Payment processed for ${amount} on ${card.brand} card •••• ${card.last4}.`;
            setPayment(content);
            // Returning here on success because we're ready to be done with this component
            return;
            break;
          case 'requires_action':
            setProcessing(true);
            setError(`🚨 Payment for ${amount} ${payment.status}`);
            content = `🚨 Payment for ${amount} ${payment.status}`;
            handleCardAction(payment, doc.id);
            break;
          default:
            setProcessing(false);
            setError(`⚠️  Payment for ${amount} ${payment.status}`);
            content = `⚠️  Payment for ${amount} ${payment.status}`;
        }

        console.log("Setting payment message", content);
        setPaymentMessage(content);
      });

    return () => {
      console.log("Cleaning up individual payment listener");
      paymentUnsubscribe();
    }
  }, [paymentId, setPayment, stripe, user.uid]);

  /* Mostly copied from Stripe's demo page */
  const [disabled, setDisabled] = useState(true);
  const handleChange = async (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setProcessing(true);
    setSucceeded(false);

    /* This section from Firebase demo */
    /* ------- */
    /* First, create card in Stripe */
    const { setupIntent, error } = await stripe.confirmCardSetup(
      customerData.setup_secret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      }
    );

    if (error) {
      setError(error.message);
      setDisabled(false);
      setProcessing(false);
      return;
    }

    /* Then add payment method to Firestore */
    await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payment_methods')
      .add({ id: setupIntent.payment_method }).then(() => {
        console.log("Payment method added");
      });

    /* Then, handle the form itself */
    // const form = new FormData(event.target);
    const formAmount = Number(amount);
    const currency = "usd";
    // console.log("Amount", formAmount, currency);
    const data = {
      payment_method: setupIntent.payment_method,
      // payment_method: form.get('payment-method'), // Originally, this would be a payment method ID
      // payment_method: {
      //   card: elements.getElement(CardElement)
      // },
      currency,
      amount: formatAmountForStripe(formAmount, currency),
      status: 'new',
      // Include screenings information here
      metadata: {
        reason_id: "black-archives-recorder",
        reason_title: "Recorder: The Marion Stokes Project",
        reason_type: "screening"
      }
    };

    // console.log("Payment data", data);
    const paymentRef = await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payments')
      .add(data);
    /* ------- */
    /* End Firebase demo */

    // console.log("Payment written with ID", paymentRef.id);
    setPaymentId(paymentRef.id);
    // Add donation to screenings/{screeningId}/members/{userId}
  };

  const handleAmountChange = (event) => {
    // console.log("Handling amount change");
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
      {/* Show a success message upon completion */}
      {/* paymentMessage && paymentMessage */}
      <ResultMessage hidden={!succeeded}>
        Payment succeeded, see the result in your
        <a
          href={`https://dashboard.stripe.com/test/payments`}
        >
          {" "}
          Stripe dashboard.
        </a>
      </ResultMessage>
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

const ResultMessage = styled('div')`
  display: ${props => props.hidden ? "none" : "block" };
  margin: 1rem 0;
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
