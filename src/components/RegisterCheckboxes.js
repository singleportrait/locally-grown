import React, { useState, useEffect } from 'react';

import { css } from 'emotion';

import { ButtonDiv } from '../styles';

function RegisterCheckboxes(props) {
  const [registrationConfirmed, setRegistrationConfirmed] = useState(false);
  const [confirmedRegister, setConfirmedRegister] = useState(false);
  const [confirmedSecurity, setConfirmedSecurity] = useState(false);

  useEffect(() => {
    // console.log("Regisre & security", confirmedRegister, confirmedSecurity);
    setRegistrationConfirmed(confirmedRegister && confirmedSecurity);
  }, [confirmedRegister, confirmedSecurity]);

  return (
    <form>
      <div className={flex}>
        <input type="checkbox" id="confirmRegister" name="register" onChange={() => setConfirmedRegister(!confirmedRegister)} />
        <label htmlFor="confirmRegister">Register me for { props.title } showing on &lt;date&gt;.</label>
      </div>
      <br />
      <div className={flex}>
        <input type="checkbox" id="confirmSecurity" name="security" onChange={() => setConfirmedSecurity(!confirmedSecurity)} />
        <label htmlFor="confirmSecurity">By registering for this event, I agree to not share my login info with anyone else. This is a limited screening, and it’s important that it’s limited to those who have signed up.</label>
      </div>
      <ButtonDiv
        disabled={!registrationConfirmed}
        color={registrationConfirmed ? "#000" : "#ccc"}
        textColor="#fff"
        onClick={registrationConfirmed ? props.register : undefined}>Register</ButtonDiv>
    </form>
  );
}

const flex = css`
  display: flex;
`;

export default RegisterCheckboxes;
