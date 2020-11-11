import React, { useState, useEffect, createContext } from 'react';
import { auth, firestore } from '../firebase';

export const UserContext = createContext({
  user: null,
  userIsLoaded: false,
});

function UserProvider(props) {
  const [user, setUser] = useState(null);
  const [userIsLoaded, setUserIsLoaded] = useState(false);

  useEffect(() => {
    // console.log("In UserProvider");
    // When state changes, generally
    auth.onAuthStateChanged(userAuth => {
      console.log("State changed; userAuth: ", userAuth);

      /* Adding display name which we don't have access to server-side when
       * creating user in Firebase Functions */
      const addDisplayName = async () => {
        const userRef = firestore.doc(`users/${userAuth.uid}`);
        const userDoc = await userRef.get().catch(e => console.log("No user!", e));

        if (!userDoc.data().displayName) {
          // console.log("Adding display name");
          userRef.update({
            displayName: userAuth.displayName
          });
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
