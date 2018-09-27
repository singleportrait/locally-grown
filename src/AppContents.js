import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { initializeSession } from './actions/sessionActions';

import Channel from './Channel';
import TVGuide from './TVGuide';
import Channels from './Channels';

class AppContents extends Component {
  componentDidMount() {
    this.props.initializeSession();
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Route path="/" component={Channel} />
          <Route path="/tv-guide" component={TVGuide} />
          <Route path="/channels" render={props => (
            <Channels testProp="test prop" />
          )} />
        </div>
      </Router>
    );
  }
}

export default connect(null, { initializeSession })(AppContents);
