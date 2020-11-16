import React from 'react';

// import { UserContext } from "./providers/UserProvider";
// import { firestore } from './firebase';

function ScreeningAdmin(props) {
  const { id, totalAllowed, totalRegistered, adminIds, members } = props.screening;
  // const { user, userIsLoaded } = useContext(UserContext);

  /* Would change component to only pass in screening ID from above */
  /* Live update screening and members for admin users in screening */
  // useEffect(() => {
  //   if (!user || !adminIds.includes(user.uid)) return;
  //   // Only run this if the user is in the admin ID
  //   if (!screening || !user) return;

  //   const screeningUnsubscribe = firestore.doc(`screenings/${id}`)
  //     .onSnapshot(snapshot => {
  //       // Update screening data on the state
  //     }, error => {
  //       console.log("Error getting screening snapshot", error);
  //     });
  //   const membersUnsubscribe = firestore.collection(`screenings/${id}/members`)
  //     .onSnapshot(snapshot => {
  //       // Update members data on the state
  //     }, error => {
  //       console.log("Error getting members snapshot", error);
  //     });

  //   return () => {
  //     screeningUnsubscribe();
  //     membersUnsubscribe();
  //   }
  // }, [user, screeningId, adminIds]);

  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };

  return (
    <>
      <h4>Admin Information</h4>
      <p>Total allowed participants: { totalAllowed }</p>
      <p>Total registered: { totalRegistered }</p>
      <ul>
        { members.map((member, i) =>
          <li key={i} title={`Registered ${member.registeredAt.toDate().toLocaleString('en-US', options)}`}>
            { member.displayName }, { member.email }
          </li>
        )}
      </ul>
    </>
  );
}

export default ScreeningAdmin;
