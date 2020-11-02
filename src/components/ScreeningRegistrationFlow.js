import React, { useState } from 'react';
import styled from '@emotion/styled';

import Modal from './Modal';

function ScreeningRegistrationFlow(props) {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    console.log("Opening modal");
    setShowModal(true);
  }

  const closeModal = () => {
    console.log("Closing modal");
    setShowModal(false);
  }

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
      <a onClick={() => openModal()}>Click me to open modal</a>
      { showModal &&
        <Modal closeModal={closeModal}>
          <h2>Here is a modal</h2>
          <a onClick={() => closeModal()}>Click me to close modal</a>
        </Modal>
      }

    </RegistrationContainer>
  );
}

const RegistrationContainer = styled('div')`
  padding: 1rem;
  border: 1px solid white;
`;

export default ScreeningRegistrationFlow;
