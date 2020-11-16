import React from 'react';
import { Switch, Route, useRouteMatch, useParams, Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import withTracker from './components/withTracker';

import Screening from './Screening';
import LoadingScreen from './components/LoadingScreen';

const ScreeningWithTracker = withTracker(Screening);
const NoMatchWithTracker = withTracker(LoadingScreen, {"title": "404"});

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
          <Helmet>
            <title>{`Page Not Found | ${process.env.REACT_APP_NAME}`}</title>
          </Helmet>
          <NoMatchWithTracker showTVGuideLink {...props} />
        </>
      }
    </>
  );
}
export default Screenings;
