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

function StripeCheckoutForm(props) {
  const { user } = useContext(UserContext);

  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState('');
  const [disabled, setDisabled] = useState(true);
  // const [clientSecret, setClientSecret] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  const [amount, setAmount] = useState(10);
  const [paymentsMessage, setPaymentsMessage] = useState();

  const [customerData, setCustomerData] = useState({});

  /* Mostly copied from Firebase's Stripe demo page */

  useEffect(() => {
    console.log("[User changed in StripeCheckoutForm]", user?.uid);

    let stripeCustomerUnsubscribe;
    let paymentUnsubscribe;

    // Handle card actions like 3D Secure
    async function handleCardAction(payment, docId) {
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

    function listenForPayments() {
      /**
       * Get all payments for the logged in customer
       */
      paymentUnsubscribe = firestore
        .collection('stripe_customers')
        .doc(user.uid)
        .collection('payments')
        .onSnapshot((snapshot) => {
          const paymentsData = snapshot.docs.map(doc => {
            const payment = doc.data();
            console.log("Checking payment", payment);
            let content = '';
            const amount = formatAmount(payment.amount, payment.currency);
            switch (payment.status) {
              case 'new':
              case 'requires_confirmation':
                content = `Creating Payment for ${amount}`;
                break;
              case 'succeeded':
                const card = payment.charges.data[0].payment_method_details.card;
                content = `✅ Payment for ${amount} on ${card.brand} card •••• ${card.last4}.`;
                break;
              case 'requires_action':
                content = `🚨 Payment for ${amount} ${payment.status}`;
                handleCardAction(payment, doc.id);
                break;
              default:
                content = `⚠️  Payment for ${amount} ${payment.status}`;
            }
            return content;
          });
          setPaymentsMessage(paymentsData);
        });
    }

    if (user) {
      stripeCustomerUnsubscribe = firestore
        .collection('stripe_customers')
        .doc(user.uid)
        .onSnapshot((snapshot) => {
          console.log("Found customer data");
          if (snapshot.data()) {
            setCustomerData(snapshot.data());
            listenForPayments();
          } else {
            console.warn(
              `No Stripe customer found in Firestore for user: ${user.uid}`
            );
          }
        });
    }

    return () => {
      if (user) {
        stripeCustomerUnsubscribe();

        if (customerData) {
          paymentUnsubscribe();
        }
      }
    }
  }, [user]);


  /* Mostly copied from Stripe's demo page */
  const handleChange = async (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setProcessing(true);

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
    console.log("Amount", formAmount, currency);
    const data = {
      payment_method: setupIntent.payment_method,
      // payment_method: form.get('payment-method'), // Originally, this would be a payment method ID
      // payment_method: {
      //   card: elements.getElement(CardElement)
      // },
      currency,
      amount: formatAmountForStripe(formAmount, currency),
      status: 'new',
    };

    await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payments')
      .add(data);
    /* ------- */
    /* End Firebase demo */

    setProcessing(false);
    setSucceeded(true);

    // const payload = await stripe.confirmCardPayment(customerData.clientSecret, {
    //   payment_method: {
    //     card: elements.getElement(CardElement)
    //   }
    // });
    // if (payload.error) {
    //   setError(`Payment failed ${payload.error.message}`);
    //   setProcessing(false);
    // } else {
    //   setError(null);
    //   setProcessing(false);
    //   setSucceeded(true);
    // }
  };

  const handleAmountChange = (event) => {
    console.log("Handling amount change");
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
          />
        </label>
      </div>
      <br />
      <CardContainer>
        <CardElement id="card-element" options={cardStyle} onChange={handleChange} />
      </CardContainer>
      <br />
      <button
        disabled={processing || disabled}
        id="submit"
      >
        <span id="button-text">
          {processing ? (
            <div className="spinner" id="spinner">Processing...</div>
          ) : (
            "Pay"
          )}
        </span>
      </button>
      {/* Show any error that happens when processing the payment */}
      { error &&
        <CardError role="alert">
          {error}
        </CardError>
      }
      {/* Show a success message upon completion */}
      <ResultMessage hidden={!succeeded}>
        Payment succeeded, see the result in your
        <a
          href={`https://dashboard.stripe.com/test/payments`}
        >
          {" "}
          Stripe dashboard.
        </a>
      </ResultMessage>
      { paymentsMessage &&
        <ul>
          { paymentsMessage.map((paymentMessage, i) =>
            <li key={i}>
              { paymentMessage }
            </li>
          )}
        </ul>
      }
    </form>
  )
}

const CardError = styled('div')`
  color: #fa755a;
  margin: .5rem 0;
`;

const CardContainer = styled('div')`
  padding: .5rem;
  border: 1px solid #ccc;
  border-radius: 3px;
`;

const ResultMessage = styled('div')`
  display: ${props => props.hidden ? "none" : "block" };
  margin: 1rem 0;
`;

const cardStyle = {
  style: {
    base: {
      fontFamily: "Larsseit, sans-serif",
      fontSize: "16px",
      "::placeholder": {
        color: "#999"
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  },
}

export default StripeCheckoutForm;
