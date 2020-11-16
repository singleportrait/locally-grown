import React from 'react';
import { Switch, Route, Link, useRouteMatch, useParams, Redirect } from 'react-router-dom';
import withTracker from './components/withTracker';

import Screening from './Screening';
const ScreeningWithTracker = withTracker(Screening);

function Screenings(props) {
  let { path } = useRouteMatch();

  const screenings = props.screenings;

  return (
    <div>
      <Switch>
        <Route exact path={path}>
          <Redirect to="/" />
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
        <ScreeningWithTracker screening={screening} {...props} />
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
