import React from 'react';
import { Switch, Route, Link, useRouteMatch, useParams } from 'react-router-dom';

function Screenings(props) {
  let { path, url } = useRouteMatch();

  const screenings = props.screenings;

  return (
    <>
      <h1>Screenings</h1>
      { !props.screenings &&
        <p>No events found</p>
      }
      <Switch>
        <Route exact path={path}>
          {/* <Redirect to="/" /> */}
          <>
            <h3>Please select a screening:</h3>
            { screenings && screenings.map((screening, i) =>
            <Link key={i} to={`${url}/${screening.fields.slug}`}>{screening.fields.title}</Link>
            )}
          </>
        </Route>
        <Route path={`${path}/:eventSlug`} render={(props) => (
          <Screening screenings={screenings} {...props} />
        )} />
      </Switch>
    </>
  );
}

function Screening(props) {
  let { eventSlug } = useParams();
  const event = props.screenings.find(screening => screening.fields.slug === eventSlug);

  return (
    <>
      <Link to="/screenings">Back to screenings</Link>
      <br />
      <br />
      { event &&
        <>
          Individual event page:
          <h1>{ event.fields.title }</h1>
          { eventSlug }
        </>
      }
      { !event &&
        <>
          Sorry, we couldn't find a screening with that URL.
        </>
      }
    </>
  );
}

export default Screenings;
