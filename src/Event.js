import React, { useContext, useState, useEffect } from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase, { auth } from './firebase';
import { generateUserDocument, registerForEvent, unregisterForEvent, getEventRegistration } from './firebaseFirestoreFunctions';

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

  // As of right now, this is all working properly!
  const [isRegistered, setIsRegistered] = useState();
  useEffect(() => {
    console.log("User in useEffect:", user);
    if (!user?.uid) return;
    async function checkRegistration() {
      try {
        console.log("Checking registration...");
        setIsRegistered(await getEventRegistration("hot-irons", user.uid));
      } catch (error) {
        console.log("Error checking registration", error);
      }
    }
    checkRegistration();
  }, [user]);

  const unregister = async () => {
    setIsRegistered(await unregisterForEvent("hot-irons", user.uid));
  }

  const register = async () => {
    setIsRegistered(await registerForEvent("hot-irons", user.uid));
  }

  return (
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
          <hr />
          { isRegistered &&
            <>
              <h2>Registered</h2>
              <h4>Registered at: { isRegistered.created.toDate().toLocaleString() }</h4>
              <p style={linkStyle} onClick={() => unregister()}>Deregister for Hot Irons</p>
            </>
          }
          { !isRegistered &&
            <p style={linkStyle} onClick={() => register()}>Register for Hot Irons</p>
          }
        </>
      }
    </div>
  );
}

export default Event;
