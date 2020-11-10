import React, { useState, useEffect, createContext } from 'react';
import { auth } from '../firebase';

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
