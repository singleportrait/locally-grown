import React, { useState, useEffect } from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from './firebase';
import 'firebase/auth';
import 'firebase/database';

// Configure FirebaseUI.
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  // signInSuccessUrl: '/signedIn',
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

const handleSignin = (authResult) => {
  console.log("Auth result:");
  console.log(authResult);
  const { uid, email, displayName } = authResult.user;

  firebase.database().ref('users/' + uid).update({
    email: email,
    displayName: displayName
  });
};

function AuthTest(props) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  // Steps for Firestore:
  // - Save or update user on login
  // - Check if event is sold out
  //
  // - Check if user is registered to event
  // - - If find userId in event.members
  // - - Security rule that only allows user to get `videoUrl` if their userId is in event.members
  //
  // - Register for event
  // - - Add userId to event.members
  // - - Add event to user.events
  // - - Security rules that require events and user to both be updated in a batch transaction
  // - - Security rule that only allows user to view or modify their own userId in users and event.members
  // - - - They should also be able to modify event.total (if needed?)
  // - - Security rule that only allows user to read their own userId in users and event.members
  //
  // - Unregister for event
  // - - Remove userId to event.members
  // - - Remove event from user.events
  // - - Same security rules as for register
  //
  // - Admin view
  // - - Security rules that allow users with `role: admin` to read all event.members
  // - - Security rules that allow users with `role: admin` to modify event.members
  //
  // - On logout
  // - - Be sure to reset all data saved to the state

  const [viewers, setViewers] = useState();
  const [members, setMembers] = useState();
  useEffect(() => {
    const setEventsData = () => {
      console.log("Running setEventsData");
      firebase.database().ref('/events/hot-irons').once('value').then((snapshot) => {
        setViewers(snapshot.val()?.viewers);
        let membersArray = Object.entries(snapshot.val().members).map(([key, value]) => {
          console.log(key, value);
          return {key, value};
        })
        setMembers(membersArray);
      }).catch((error) => {
        if (RegExp("permission_denied").test(error)) {
          console.log("Permission denied to read this event");
        } else {
          console.log(error);
        }
      });
    }

    if (isSignedIn) { setEventsData() };

    if (!isSignedIn) {
      console.log("Not running bc nobody is loggged in");
    }

    return () => {
      console.log("Cleaning up");
      setViewers();
      setMembers();
    }
  }, [isSignedIn]);

  const [displayName, setDisplayName] = useState(null);
  useEffect(() => {
    console.log("Running setDisplayNameData");
    // Some kind of race condition might be happening here, we need to make sure auth is complete before running this
    const userId = firebase.auth().currentUser?.uid; // Jamil's ID, in this example
    if (!userId) {
      return setDisplayName("Nobody is logged in!");
    }
    // const userId = "eE5AJ9tzRrcmqrs3Wgr6a3woLmq2"; // Jenn's ID
    firebase.database().ref('/users/' + userId).once('value').then((snapshot) => {
      // If you set display name to be the whole `snapshot.val()` object, it will also run forever like the events call
      setDisplayName(snapshot.val()?.displayName || 'Anonymous');
      console.log(displayName);
    }).catch((error) => {
      console.log(error);
    });
  }, [isSignedIn, displayName]);

  // let unregisterAuthObserver;
  useEffect(() => {
    let unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      console.log("User state changed");
      setIsSignedIn(!!user);
    })
    return () => {
      unregisterAuthObserver();
    }
  });

  const signOut = () => {
    console.log("Signing out...");
    firebase.auth().signOut()
  }

  return (
    <>
      <h1>Authorization page</h1>
      { !isSignedIn &&
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
      }
      { isSignedIn &&
        <>
          <p>Welcome {firebase.auth().currentUser.displayName}! You are now signed-in!</p>
          <p onClick={() => signOut()}>Sign-out</p>
          <br />
          <h4>Upcoming events:</h4>
          { displayName || "Loading user..." }
          <br />
          { viewers || "Not allowed to see viewers for this event" }
          { members?.map((member, i) =>
            <div key={member.key}>{member.key}</div>
          )}
          {/* { events && Object.entries(events).map(([key, event]) => */}
          {/*   <> */}
          {/*     <p>{ key }</p> */}
          {/*     <p>{ event.viewers }</p> */}
          {/*   </> */}
          {/* )} */}
        </>
      }
    </>
  );
}

export default AuthTest;
