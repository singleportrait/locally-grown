import React, { useState, useEffect, useContext } from 'react';

import { UserContext } from "../providers/UserProvider";
import { firestore } from '../firebase';

import { getScreening } from '../firestore/screenings';

function ScreeningAdmin(props) {
  const { id, adminIds } = props.screening;
  const { user } = useContext(UserContext);

  const [screening, setScreening] = useState(props.screening);
  const [error, setError] = useState("");

  /* Live update screening and members for admin users in screening
   * A bit silly because we *get* this data from the snapshot, but this means
   * we can rely on the backend firestore/screenings.js to format it the same
   * way, and not have to listen to both screenings and members */
  useEffect(() => {
    if (!user || !id || !adminIds.includes(user.uid)) return;
    let isMounted = true;

    const screeningUnsubscribe = firestore.doc(`screenings/${id}`)
      .onSnapshot(async (doc) => {
        if (!doc.exists) {
          setError("Error: Can't find the screening");
          return;
        }
        if (isMounted) {
          setScreening(await getScreening(id, user.uid));
        }
      }, error => {
        setError("Error getting fresh screening data");
      });

    return () => {
      screeningUnsubscribe();
      isMounted = false;
    }
  }, [user, id, adminIds]);

  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };

  return (
    <>
      <h4>Admin Information</h4>
      <p>Total allowed participants: { screening.totalAllowed }</p>
      <p>Total registered: { screening.totalRegistered }</p>
      <ul>
        { screening.members.map((member, i) =>
          <li key={i} title={`Registered ${member.registeredAt.toDate().toLocaleString('en-US', options)}`}>
            { member.displayName }, { member.email }
          </li>
        )}
      </ul>
      { error &&
        <>
          <hr />
          { error }
        </>
      }
    </>
  );
}

export default ScreeningAdmin;
