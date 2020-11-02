import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

import { UserContext } from "./providers/UserProvider";

import { generateUserDocument } from './firestore/users';
import {
  getScreening,
  getScreeningRegistration,
  registerForScreening,
  unregisterForScreening
} from './firestore/screenings';

function Screening(props) {
  const { user } = useContext(UserContext);
  const [error, setError] = useState();

  const { title, slug, description } = props.screening.fields;
  const contentfulScreeningId = slug;

  /* Check to see if user exists in Firestore (not Auth),
  * and re-check screening when users log in and out */
  useEffect(() => {
    console.log("User in useEffect:", user?.uid);
    if (screening) {
      (async function() {
        console.log("Running async because user changed");
        setScreening(await getScreening(contentfulScreeningId, user?.uid || null));
      })();
    }
    if (!user) {
      setRegistration(null);
      return;
    }

    generateUserDocument(user);
  }, [user, screening, contentfulScreeningId]);

  /* Check to see if screening and/or member registration exists */
  const [screening, setScreening] = useState(null);
  const [registration, setRegistration] = useState(null);
  useEffect(() => {
    if (!user) return;

    async function checkRegistration() {
      console.log("[Checking registration in useEffect...]");
      setRegistration(await getScreeningRegistration(contentfulScreeningId, user.uid)
        .catch(e => setError(`Error checking registration ${e}`)));
    }

    async function checkScreening() {
      console.log("[Checking screening in useEffect...]");
      setScreening(await getScreening(contentfulScreeningId, user?.uid || null)
        .catch(e => setError(`${e.name}: ${e.message}`)));
      checkRegistration();
    }

    checkScreening();
  }, [user, contentfulScreeningId]);

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
