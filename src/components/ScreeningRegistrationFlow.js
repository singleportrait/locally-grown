import React from 'react';
import styled from '@emotion/styled';

function ScreeningRegistrationFlow(props) {

  return (
    <RegistrationContainer>
      <h3>Registration flow</h3>
      { props.registration &&
        <>
          <h2>Registered</h2>
          { props.registration.registeredAt &&
            <h4>Registered at: { props.registration.registeredAt.toDate().toLocaleString() }</h4>
          }
          <p style={{textDecoration: "underline"}} onClick={props.unregister}>Deregister for Hot Irons</p>
        </>
      }
      { !props.registration &&
        <>
          <h2>Not registered</h2>
          { props.screening.totalAllowed > props.screening.totalRegistered &&
            <p style={{textDecoration: "underline"}} onClick={props.register}>Register for Hot Irons</p>
          }
          { props.screening.totalAllowed === props.screening.totalRegistered &&
            <h4>Sorry, this event is sold out!</h4>
          }
        </>
      }
    </RegistrationContainer>
  );
}

const RegistrationContainer = styled('div')`
  padding: 1rem;
  border: 1px solid white;
`;

export default ScreeningRegistrationFlow;
