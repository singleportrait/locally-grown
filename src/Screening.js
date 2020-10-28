import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { UserContext } from "./providers/UserProvider";

function Screening(props) {
  const { user } = useContext(UserContext);

  return (
    <div style={{padding: "1rem"}}>
      <Link to="/screenings">Back to screenings</Link>
      <hr />
      <br />
      Individual screening page:
      <h1>{ props.screening.fields.title }</h1>
      { !user &&
        <>
          <h4>Not signed in :)</h4>
          {/* <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth}/> */}
        </>
      }
      { user &&
        <>
          <h4>Loaded! Hello { user.displayName }</h4>
          {/* <p style={linkStyle} onClick={() => auth.signOut()}>Sign out</p> */}
          <br />
        </>
      }
    </div>
  );
}

export default Screening;
