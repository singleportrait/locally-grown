import React, { useState, useEffect, createContext } from 'react';
import { auth } from '../firebase';

export const UserContext = createContext({ user: null });

function UserProvider(props) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("In UserProvider");
    // When state changes, generally
    auth.onAuthStateChanged(userAuth => {
      console.log("State changed; userAuth: ", userAuth);
      setUser(userAuth);
    });
  }, []);

  return (
    <UserContext.Provider value={{user}}>
      { props.children }
    </UserContext.Provider>
  );
}

export default UserProvider;
