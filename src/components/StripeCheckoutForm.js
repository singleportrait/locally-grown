import React, { useState, useEffect } from 'react';
import firebase from '../firebase';
import {
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

import { css } from 'emotion';

function StripeCheckoutForm(props) {
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  const [amount, setAmount] = useState(10);
  const [currency, setCurrency] = useState("usd");

  /* Mostly copied from Firebase's Stripe demo page */
  let currentUser = {};
  let customerData = {};

  /* Helper Functions */
  // Format amount for diplay in the UI
  function formatAmount(amount, currency) {
    amount = zeroDecimalCurrency(amount, currency)
      ? amount
      : (amount / 100).toFixed(2);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  // Format amount for Stripe
  function formatAmountForStripe(amount, currency) {
    return zeroDecimalCurrency(amount, currency)
      ? amount
      : Math.round(amount * 100);
  }

  // Check if we have a zero decimal currency
  // https://stripe.com/docs/currencies#zero-decimal
  function zeroDecimalCurrency(amount, currency) {
    let numberFormat = new Intl.NumberFormat(['en-US'], {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol',
    });
    const parts = numberFormat.formatToParts(amount);
    let zeroDecimalCurrency = true;
    for (let part of parts) {
      if (part.type === 'decimal') {
        zeroDecimalCurrency = false;
      }
    }
    return zeroDecimalCurrency;
  }

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
      .doc(currentUser.uid)
      .collection('payments')
      .doc(docId)
      .set(payment, { merge: true });
  }

  function startDataListeners() {
    /**
     * Get all payments for the logged in customer
     */
    firebase
      .firestore()
      .collection('stripe_customers')
      .doc(currentUser.uid)
      .collection('payments')
      .onSnapshot((snapshot) => {
        snapshot.forEach((doc) => {
          const payment = doc.data();
          console.log("Checking payment", payment);

          let liElement = document.getElementById(`payment-${doc.id}`);
          if (!liElement) {
            liElement = document.createElement('li');
            liElement.id = `payment-${doc.id}`;
          }

          let content = '';
          if (
            payment.status === 'new' ||
            payment.status === 'requires_confirmation'
          ) {
            content = `Creating Payment for ${formatAmount(
              payment.amount,
              payment.currency
            )}`;
          } else if (payment.status === 'succeeded') {
            const card = payment.charges.data[0].payment_method_details.card;
            content = `✅ Payment for ${formatAmount(
              payment.amount,
              payment.currency
            )} on ${card.brand} card •••• ${card.last4}.`;
          } else if (payment.status === 'requires_action') {
            content = `🚨 Payment for ${formatAmount(
              payment.amount,
              payment.currency
            )} ${payment.status}`;
            handleCardAction(payment, doc.id);
          } else {
            content = `⚠️ Payment for ${formatAmount(
              payment.amount,
              payment.currency
            )} ${payment.status}`;
          }
          liElement.innerText = content;
          document.querySelector('#payments-list').appendChild(liElement);
        });
      });
  }

  firebase.auth().onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      console.log("There's a user in stripe element");
      currentUser = firebaseUser;
      firebase
        .firestore()
        .collection('stripe_customers')
        .doc(currentUser.uid)
        .onSnapshot((snapshot) => {
          if (snapshot.data()) {
            customerData = snapshot.data();
            startDataListeners();
            // document.getElementById('loader').style.display = 'none';
            // document.getElementById('content').style.display = 'block';
          } else {
            console.warn(
              `No Stripe customer found in Firestore for user: ${currentUser.uid}`
            );
          }
        });
    } else {
      // document.getElementById('content').style.display = 'none';
      // firebaseUI.start('#firebaseui-auth-container', firebaseUiConfig);
    }
  });

  /* Mostly copied from Stripe's demo page */
  const cardStyle = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#32325d"
        }
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    }
  };

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
      document.querySelector('#error-message').textContent = error.message;
      document
        .querySelectorAll('button')
        .forEach((button) => (button.disabled = false));
      return;
    }

    /* Then add payment method to Firestore */
    await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(currentUser.uid)
      .collection('payment_methods')
      .add({ id: setupIntent.payment_method }).then(() => {
        console.log("Payment method added");
      });

    // console.log(elements.getElement(CardElement));
    // console.log("Card?", elements.getElement(CardElement).card);
    // console.log("Payment method?", elements.getElement(CardElement).payment_method);
    // return;

    /* Then, handle the form itself */
    // const form = new FormData(event.target);
    console.log("Setup intent id:", setupIntent.id, setupIntent.payment_method);
    const formAmount = Number(amount);
    // const formCurrency = currency;
    console.log("Amount & currency?", amount, currency);
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
      .doc(currentUser.uid)
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

  const handleCurrencyChange = (event) => {
    console.log("Handling currency change");
    setCurrency(event.target.value);
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div>
        <label>
          Amount:
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
        <label>
          Currency:
          <select name="currency" value={currency} onChange={handleCurrencyChange}>
            <option value="usd">USD</option>
            <option value="eur">EUR</option>
            <option value="gbp">GBP</option>
            <option value="jpy">JPY</option>
          </select>
        </label>
      </div>
      <br />
      <CardElement id="card-element" options={cardStyle} onChange={handleChange} />
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
      {error && (
        <div className="card-error" role="alert">
          {error}
        </div>
      )}
      {/* Show a success message upon completion */}
      <p className={resultMessage} hidden={!succeeded}>
        Payment succeeded, see the result in your
        <a
          href={`https://dashboard.stripe.com/test/payments`}
        >
          {" "}
          Stripe dashboard.
        </a> Refresh the page to pay again.
      </p>
      <div id="payments-list" />
      <div id="error-message" />
    </form>
  )
}

const resultMessage = css`
  display: ${props => props.hidden ? "none" : "block" };
`;

export default StripeCheckoutForm;
