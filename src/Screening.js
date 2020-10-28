import React from 'react';
import { Link } from 'react-router-dom';

function Screening(props) {
  return (
    <div style={{padding: "1rem"}}>
      <Link to="/screenings">Back to screenings</Link>
      <hr />
      <br />
      Individual screening page:
      <h1>{ props.screening.fields.title }</h1>
    </div>
  );
}

export default Screening;
