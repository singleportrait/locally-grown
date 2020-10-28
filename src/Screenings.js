import React from 'react';
import { Switch, Route, Link, useRouteMatch, useParams } from 'react-router-dom';

import Screening from './Screening';

function Screenings(props) {
  let { path, url } = useRouteMatch();

  const screenings = props.screenings;

  return (
    <div style={{padding: "1rem"}}>
      <Switch>
        <Route exact path={path}>
          {/* <Redirect to="/" /> */}
          <>
            <h1>Screenings</h1>
            { !props.screenings &&
            <p>No events found</p>
            }
            <h3>Please select a screening:</h3>
            { screenings && screenings.map((screening, i) =>
            <Link key={i} to={`${url}/${screening.fields.slug}`}>{screening.fields.title}</Link>
            )}
          </>
        </Route>
        <Route path={`${path}/:screeningSlug`} render={(props) => (
          <ScreeningContainer screenings={screenings} {...props} />
        )} />
      </Switch>
    </div>
  );
}

function ScreeningContainer(props) {
  let { screeningSlug } = useParams();
  const screening = props.screenings.find(screening => screening.fields.slug === screeningSlug);

  return (
    <>
      { screening &&
        <Screening screening={screening} {...props} />
      }
      { !screening &&
        <>
          <Link to="/screenings">Back to screenings</Link>
          <hr />
          <br />
          Sorry, we couldn't find a screening with that URL.
        </>
      }
    </>
  );
}
export default Screenings;
