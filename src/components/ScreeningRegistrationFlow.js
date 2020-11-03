import React, { useState, useContext } from 'react';
import styled from '@emotion/styled';
import { css } from 'emotion';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { auth, handleUiConfig } from '../firebase';

import { UserContext } from "../providers/UserProvider";

import Modal from './Modal';

import { Button } from '../styles';

function ScreeningRegistrationFlow(props) {
  const { user } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    console.log("Opening modal");
    setShowModal(true);
  }

  const closeModal = () => {
    console.log("Closing modal");
    setShowModal(false);
  }

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
            <Button large onClick={() => openModal()}>Register</Button>
          }
          { props.screening.totalRegistered === props.screening.totalAllowed &&
            <h4>Sorry, this event is sold out!</h4>
          }
        </>
      }
      { props.screening && props.registration &&
        <>
          <h2>Registered</h2>
          { props.registration.registeredAt &&
            <h4>Registered at: { props.registration.registeredAt.toDate().toLocaleString() }</h4>
          }
          <p className={linkStyle} onClick={props.unregister}>Unregister for Hot Irons</p>
        </>
      }

      { showModal &&
        <Modal closeModal={closeModal}>
          { !user &&
            <>
              <h4>Log In or Create an Account</h4>
              <p>After creating an account you'll be able to register for this event.</p>
              <StyledFirebaseAuth uiConfig={handleUiConfig(() => props.setIsLoaded(false))} firebaseAuth={auth}/>
            </>
          }
          { user && !props.registration && props.isLoaded &&
            <>
              <h4>Register for { props.contentfulScreening.title }</h4>
              <p>We'll send you a calendar invite and reminder emails before the show!</p>
              <br />
              <form>
                <div className={flex}>
                  <input type="checkbox" id="confirmRegister" name="register" />
                  <label htmlFor="confirmRegister">Register me for { props.contentfulScreening.title } showing on &lt;date&gt;.</label>
                </div>
                <Button color="#000" textColor="#fff" onClick={props.register}>Register</Button>
              </form>
            </>
          }
          { user && !props.registration && !props.isLoaded && // When fetching registration status
            <LoadingDiv>
              <h3>Loading Registration...</h3>
            </LoadingDiv>
          }
          { user && props.registration &&
            <>
              <h4>Optional Donation to Support the Screening</h4>
              <p>We're asking for a donation to cover the costs to distribute this film. It's pay-what-you-can, but we encourage you to support &lt;Black Archives&gt; and Locally Grown in our mission to build an independent home for films we can watch together. If you can't pay anything, we understand. &lt;You can put $0 in the field (or hit skip..)&gt;.</p>
              <form>
                <label htmlFor="donationAmount">My donation:</label>
                <input type="text" id="donationAmount" name="donationAmount" />
              </form>
            </>
          }
        </Modal>
      }

    </RegistrationContainer>
  );
}

const RegistrationContainer = styled('div')`
  padding: 1rem;
  border: 1px solid white;
`;

const linkStyle = css`
  cursor: pointer;
  text-decoration: underline;
`;

const flex = css`
  display: flex;
`;

const ScreeningLoadingContainer = styled('div')`
  display: flex;
  align-items: center;
  padding: 5rem 0;
`;

const LoadingDiv = styled('div')`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default ScreeningRegistrationFlow;
