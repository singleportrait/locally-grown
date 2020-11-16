import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { auth, handleUiConfig } from '../firebase';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

/* Gets us the URL for the font, but Stripe's elements options still
 * doesn't seem to be pulling it (at end of file) */
// import larsseit from '../fonts/larsseit-light.woff';

import styled from '@emotion/styled';
import { css } from 'emotion';

import { UserContext } from "../providers/UserProvider";

import { getGoogleCalendarShareUrl } from '../helpers/utils';

import Modal from './Modal';
import StripeCheckoutForm from './StripeCheckoutForm';
import RegisterCheckboxes from './RegisterCheckboxes';

import { successColor, ButtonDiv } from '../styles';

function ScreeningRegistrationFlow(props) {
  const { user } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);

  const [payment, setPayment] = useState(null);
  const [skipPayment, setSkipPayment] = useState(false);

  const [stripePromise, setStripePromise] = useState();
  useEffect(() => {
    setStripePromise(loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY));
  }, []);

  const openModal = () => {
    // console.log("Opening modal");
    setShowModal(true);
  }

  const closeModal = () => {
    // console.log("Closing modal");
    setShowModal(false);
    setPayment(null);
    setSkipPayment(false);
  }

  const googleShareUrl = getGoogleCalendarShareUrl(
    props.contentfulScreening.title,
    props.contentfulScreening.shortDescription,
    `screenings/${useParams().screeningSlug}`,
    props.contentfulScreening.startDatetime,
    props.contentfulScreening.endDatetime,
    true
  );

  return (
    <RegistrationContainer>
      { !props.isLoaded && !props.screening && !props.registration &&
        <ScreeningLoadingContainer>
          <h3>Loading...</h3>
        </ScreeningLoadingContainer>
      }
      { props.screening && !props.registration &&
        <>
          { props.screening.totalRegistered <= props.screening.totalAllowed &&
            <>
              <ButtonDiv large onClick={() => openModal()}>Register Now</ButtonDiv>
              { !user &&
                <p className={loginText}>
                  Already registered? <span className={linkStyle} onClick={() => openModal()}>Log in</span>
                </p>
              }
            </>
          }
          { props.screening.totalRegistered === props.screening.totalAllowed &&
            <h4>Sorry, this event is sold out!</h4>
          }
        </>
      }
      { props.screening && props.registration &&
        <>
          <RegistrationConfirmation>
            <ConfirmationH4>Congrats, you're registered for the screening!</ConfirmationH4>
            <p>We've sent you a confirmation email, and we'll send a reminder day-of.</p>
            <hr />
            <p>Won't be able to watch? Unregister to free up a spot for another viewer:</p>
            <p className={linkStyle} onClick={props.unregister}>Unregister</p>
            <hr />
            <p>Your contribution helps support this screening and enables us to have more screenings in the future. Thank you for your support!</p>
            <p className={linkStyle} onClick={() => openModal()}>Donate</p>
          </RegistrationConfirmation>
        </>
      }

      { showModal &&
        <Modal closeModal={closeModal} className={modalStyle}>
          { !user &&
            <>
              <h4 className={modalHeader}>Log In or Create an Account</h4>
              <p>After creating an account you'll be able to register for this event.</p>
              <StyledFirebaseAuth uiConfig={handleUiConfig(() => props.setIsLoaded(false))} firebaseAuth={auth}/>
            </>
          }
          { user && !props.registration && props.isLoaded &&
            <>
              <h4 className={modalHeader}>Register for { props.contentfulScreening.title }</h4>
              <p>We'll send you a calendar invite and reminder emails before the show!</p>
              <br />
              <RegisterCheckboxes
                title={props.contentfulScreening.title}
                screeningDate={props.contentfulScreening.screeningDate}
                register={props.register} />
            </>
          }
          { user && !props.registration && !props.isLoaded && // When fetching registration status
            <LoadingDiv>
              <h3>Loading Registration...</h3>
            </LoadingDiv>
          }
          { user && props.registration && !payment && !skipPayment &&
            <>
              <h3 className={confirmedHeader}>Congrats, you're registered for the screening!</h3>
              <p>
                We've sent you a confirmation email, and we'll send a reminder on {props.contentfulScreening.screeningDate}.
                <br /><br />
                <a href={googleShareUrl} target="_blank" rel="noopener noreferrer nofollow">Add to Google calendar</a>.
              </p>
              <DonationContainer>
                <h4 className={modalHeader}>Donate to Support the Screening</h4>
                <p>We're asking for a donation to cover the costs to distribute this film. It's pay-what-you-can, but we encourage you to support Black Archives and Locally Grown in our mission to build an independent home for films we can watch together. Our suggested donation is $10. If you can't pay anything, we understand.</p>
                <hr />
                <Elements stripe={stripePromise} options={elementsOptions}>
                  <StripeCheckoutForm
                    setPayment={setPayment}
                    setSkipPayment={setSkipPayment}
                    screening={props.screening}
                    contentfulScreeningTitle={props.contentfulScreening.title}
                  />
                </Elements>
              </DonationContainer>
            </>
          }
          { user && props.registration && payment &&
            <>
              <h3 className={confirmedHeader}>Thanks for your donation!</h3>
              <h4>Supporters like you keep us running. We appreciate you! See you on {props.contentfulScreening.screeningDate}.</h4>
              <br />
              <PaymentContainer>{ payment }</PaymentContainer>
            </>
          }
          { user && props.registration && skipPayment &&
            <>
              <h3>Ok, see you soon!</h3>
              <h4>See you on {props.contentfulScreening.screeningDate}.</h4>
            </>
          }
        </Modal>
      }

    </RegistrationContainer>
  );
}

const RegistrationContainer = styled('div')`
  padding: 1rem 0 2rem;
  // border: 1px solid white;
`;

const linkStyle = css`
  cursor: pointer;
  text-decoration: underline;
  font-weight: 500;
  display: inline-block;
`;

const ScreeningLoadingContainer = styled('div')`
  display: flex;
  align-items: center;
  padding: 2rem 0;
`;

const LoadingDiv = styled('div')`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const loginText = css`
  margin-top: 1rem;
  color: #999;
`;

const RegistrationConfirmation = styled('div')`
  padding: 1rem 1.4rem 1.4rem;
  // background-color: ${successColor};
  // background-color: rgba(92, 203, 102, .2);
  background-color: #262626;
  // border-radius: 1rem;
  margin-bottom: 1rem;

  hr {
    border-color: #333;
    mix-blend-mode: screen;
  }
`;

const ConfirmationH4 = styled('h4')`
  font-weight: bold;
  color: ${successColor};
`;

const modalHeader = css`
  font-weight: bold;
  padding-right: 2.5rem;
  margin-bottom: .75rem;
`;

const confirmedHeader = css`
  color: ${successColor};
  padding-right: 2.5rem;
  margin-bottom: .75rem;
`;

const DonationContainer = styled('div')`
  padding: .75rem 1rem 1.25rem;
  margin: 1rem -1rem -1rem;
  background-color: #eee;
`;

const PaymentContainer = styled('div')`
  padding: .7rem 1rem .5rem;
  background-color: #eee;
`;

const elementsOptions = {
  /* This is how we actually use the custom fonts, but we need to generate the full URL to them for this to work... later */
  // fonts: [
  //   {
  //     family: 'Larsseit',
  //   //   src: 'url(https://my-domain.com/assets/avenir.woff)',
  //     src: `url(${process.env.REACT_APP_DOMAIN + larsseit})`,
  //     weight: '300',
  //   }
  // ]
}

const modalStyle = css`
  p {
    font-size: 15px;

    // Overriding some base paragraph styles (that should probably be removed) */
    @media (max-width: 600px) {
      font-size: 15px;
    }
  }
`;

export default ScreeningRegistrationFlow;
