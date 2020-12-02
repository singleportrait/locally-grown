import React, { useState, useEffect, createContext } from 'react';
import { auth, firestore } from '../firebase';
import consoleLog from '../helpers/consoleLog';

export const UserContext = createContext({
  user: null,
  userIsLoaded: false,
});

function UserProvider(props) {
  const [user, setUser] = useState(null);
  const [userIsLoaded, setUserIsLoaded] = useState(false);

  useEffect(() => {
    // consoleLog("In UserProvider");
    // When state changes, generally
    auth.onAuthStateChanged(userAuth => {
      consoleLog("State changed; userAuth: ", userAuth);

      /* Adding display name which we don't have access to server-side when
       * creating user in Firebase Functions */
      const addDisplayName = async () => {
        const userRef = firestore.doc(`users/${userAuth.uid}`);
        try {
          const userDoc = await userRef.get();

          if (!userDoc.data().displayName) {
            consoleLog("Adding display name");
            userRef.update({
              displayName: userAuth.displayName
            });
          }
        } catch (error) {
          console.error("We couldn't find that user (yet)");
        }
      }
      if (userAuth) {
        addDisplayName();
      }

      setUser(userAuth);
      setUserIsLoaded(true);
    });
  }, []);

  return (
    <UserContext.Provider value={{user, userIsLoaded}}>
      { props.children }
    </UserContext.Provider>
  );
}

export default UserProvider;
