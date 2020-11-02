import React, { useContext, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase, { auth } from './firebase';
import { generateUserDocument } from './firestore/users';
import {
  makeTestHotIronsScreening,
  getScreening,
  getScreeningRegistration,
  registerForScreening,
  unregisterForScreening
} from './firestore/screenings';

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

function Registration(props) {
  const { user } = useContext(UserContext);
  const [error, setError] = useState();
  const screeningId = "hot-irons";

  /* Check to see if user exists in Firestore (not Auth),
  * and re-check screening when users log in and out */
  useEffect(() => {
    console.log("User in useEffect:", user?.uid);
    if (screening) {
      (async function() {
        console.log("Running async because user changed");
        setScreening(await getScreening(screeningId, user?.uid || null));
      })();
    }
    if (!user) {
      setRegistration(null);
      return;
    }

    generateUserDocument(user);
  }, [user, screening]);

  /* Check to see if screening and/or member registration exists */
  const [screening, setScreening] = useState(null);
  const [registration, setRegistration] = useState(null);
  useEffect(() => {
    if (!user) return;

    async function checkRegistration() {
      console.log("[Checking registration in useEffect...]");
      setRegistration(await getScreeningRegistration(screeningId, user.uid)
        .catch(e => setError(`Error checking registration ${e}`)));
    }

    async function checkScreening() {
      console.log("[Checking screening in useEffect...]");
      setScreening(await getScreening(screeningId, user?.uid || null)
        .catch(e => setError(`${e.name}: ${e.message}`)));
      checkRegistration();
    }

    checkScreening();
  }, [user]);

  /* User interactions */
  const makeScreening = async () => {
    setScreening(await makeTestHotIronsScreening(screeningId)
      .catch(e => setError(`${e.name}: ${e.message}`)));
  }

  /* Issue: Because the below necessarily updates the screening to get the latest
   * registered screening total, it causes the registration useEffect block to
   * be run twice, once in here and then above. However, if we don't setRegistration
   * here, it's a bit confusing—though, not necessarily incorrect. */
  const register = async () => {
    if (!screening || !user) return;
    console.log("Registering in component...");
    const registration = await registerForScreening(screening.id, user)
      .catch(e => setError(`${e.name}: ${e.message}`));
    setRegistration(registration);
    setScreening(await getScreening(screening.id, user.uid));
  }

  const unregister = async () => {
    if (!screening || !user) return;
    console.log("Unregistering in component...");
    const registration = await unregisterForScreening(screening.id, user)
      .catch(e => setError(`${e.name}: ${e.message}`));
    setRegistration(registration);
    setScreening(await getScreening(screening.id, user.uid));
  }

  return (
    <>
      <Helmet>
        <title>Screening Auth & Registration</title>
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
        { !screening &&
          <p style={linkStyle} onClick={() => makeScreening()}>Make test screening</p>
        }
        { screening &&
          <>
            <h4>Got the screening</h4>
            <p>Screening name: {screening.id}</p>
            <p>Total allowed: {screening.totalAllowed}</p>
            <p>Total registered: {screening.totalRegistered}</p>
            { screening.members &&
            <>
              Members on this event:
              <ul>
                { screening.members.map(member =>
                  <li key={member.id}>Member: {member.displayName}, {member.email}</li>
                )}
              </ul>
            </>
            }
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
                  <>
                    { screening.totalAllowed > screening.totalRegistered &&
                      <p style={linkStyle} onClick={() => register()}>Register for Hot Irons</p>
                    }
                    { screening.totalAllowed === screening.totalRegistered &&
                      <h4>Sorry, this event is sold out!</h4>
                    }
                  </>
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

export default Registration;
