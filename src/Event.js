import React, { useContext, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase, { auth } from './firebase';
import { generateUserDocument } from './firestore/users';
import { makeTestHotIronsEvent, getEvent, getEventRegistration, registerForEvent, unregisterForEvent } from './firestore/events';

import { UserContext } from "./providers/UserProvider";

// Configure FirebaseUI.
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // We will display Google and Facebook as auth providers.
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID
  ],
  // Prevent redirect to accountchooser.com
  // Could also be written `firebaseui.auth.CredentialHelper.NONE`
  // But don't want to have to import `firebaseui` just for that one line
  // Could implement one-tap sign-in here: https://github.com/firebase/firebaseui-web#credential-helper
  credentialHelper: 'none',
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: (authResult) => handleSignin(authResult)
  }
};

const linkStyle = {
  textDecoration: "underline",
  cursor: "pointer"
}

const handleSignin = (authResult) => {
  console.log("Handling sign in");
  try {
    generateUserDocument(authResult.user);
  } catch (error) {
    console.log("Error signing in", error);
  }
};

function Event(props) {
  const { user } = useContext(UserContext);
  const [error, setError] = useState();
  const eventId = "hot-irons";

  /* Check to see if user exists in Firestore (not Auth) */
  useEffect(() => {
    console.log("User in useEffect:", user?.uid);
    if (!user) {
      setRegistration(null);
      return;
    }

    generateUserDocument(user);
  }, [user]);

  /* Check to see if event exists */
  const [event, setEvent] = useState(null);
  useEffect(() => {
    if (event) return;

    async function checkEvent() {
      try {
        console.log("Checking event...");
        setEvent(await getEvent(eventId));
      } catch (error) {
        setError("Couldn't get event");
      }
    }

    checkEvent();
  }, [event]);

  /* Check to see if user is registered, on load and if event changes */
  const [registration, setRegistration] = useState(null);
  useEffect(() => {
    if (!event || !user) return;

    async function checkRegistration() {
      try {
        console.log("Checking registration...");
        setRegistration(await getEventRegistration(event.id, user.uid));
      } catch (error) {
        console.log("Error checking registration", error);
        setError("Error checking registration");
      }
    }
    checkRegistration();
  }, [user, event]);

  /* User interactions */
  const makeEvent = async () => {
    setEvent(await makeTestHotIronsEvent(eventId));
  }

  /* Issue: Because the below necessarily updates the event to get the latest
   * registered event total, it causes the registration useEffect block to
   * be run twice, once in here and then above. However, if we don't setRegistration
   * here, it's a bit confusing—though, not necessarily incorrect. */
  const register = async () => {
    if (!event || !user) return;
    console.log("Registering in component...");
    const registration = await registerForEvent(event.id, user.uid)
      .catch(e => setError(`Error registering because: ${e.code}`));
    setRegistration(registration);
    setEvent(await getEvent(event.id));
  }

  const unregister = async () => {
    if (!event || !user) return;
    console.log("Unregistering in component...");
    const registration = await unregisterForEvent(event.id, user.uid)
      .catch(e => setError(`Error unregistering because: ${e.code}`));
    setRegistration(registration);
    setEvent(await getEvent(event.id));
  }

  return (
    <>
      <Helmet>
        <title>Event Auth & Registration</title>
      </Helmet>
      <div style={{padding: '1rem'}}>
        <h1>Auth with Context & Firestore</h1>
        { !user &&
          <>
            <h4>Not signed in :)</h4>
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth}/>
          </>
        }
        { user &&
          <>
            <h4>Loaded! Hello { user.displayName }</h4>
            <p style={linkStyle} onClick={() => auth.signOut()}>Sign out</p>
            <br />
          </>
        }
        { !event &&
          <p style={linkStyle} onClick={() => makeEvent()}>Make test event</p>
        }
        { event &&
          <>
            <h4>Got the event</h4>
            <p>Event name: {event.id}</p>
            <p>Total allowed: {event.totalAllowed}</p>
            <p>Total registered: {event.totalRegistered}</p>
            { user &&
              <>
                <hr />
                { registration &&
                <>
                  <h2>Registered</h2>
                  { registration.registeredAt &&
                  <h4>Registered at: { registration.registeredAt.toDate().toLocaleString() }</h4>
                  }
                  { !registration.registeredAt &&
                    <h4>We don't have the time you registered saved</h4>
                  }
                  <p style={linkStyle} onClick={() => unregister()}>Deregister for Hot Irons</p>
                </>
                }
                { !registration &&
                  <p style={linkStyle} onClick={() => register()}>Register for Hot Irons</p>
                }
              </>
            }
          </>
        }
        { error &&
          <>
            <hr />
            <h4>Sorry, we had an error</h4>
            <p>{ error }</p>
          </>
        }
      </div>
    </>
  );
}

export default Event;
