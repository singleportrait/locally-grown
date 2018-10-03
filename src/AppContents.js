import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { initializeSession } from './actions/sessionActions';
import { initializeChannels } from './operations/channelOperations';

import Channel from './Channel';
import TVGuide from './TVGuide';
import Channels from './Channels';

class AppContents extends Component {
  componentDidMount() {
    this.props.initializeSession();
    this.props.initializeChannels();
  }

  render() {
    return (
      <Router>
        <div className="App">
          { this.props.channels.isLoaded &&
            <div>
              { this.props.channels.availableChannels.map((channel, i) =>
                <Route key={i} path={`/${channel.fields.slug}`} render={props => (
                  <Channel {...props} channel={channel} />
                )} />
              )}
              { this.props.channels.hiddenChannels.map((channel, i) =>
                <Route key={i} path={`/${channel.fields.slug}`} render={props => (
                  <Channel {...props} channel={channel} />
                )} />
              )}
              { this.props.channels.currentChannel &&
                <Route exact path="/" render={props => (
                  <Redirect to={`/${this.props.channels.currentChannel.fields.slug}`} />
                )} />
              }

              { !this.props.channels.currentChannel &&
                <h1>No programs right now!</h1>
              }
              <Route path="/tv-guide" render={props => (
                <TVGuide {...props} channels={this.props.channels.featuredChannels} />
              )} />
              <Route path="/channels" render={props => (
                <Channels testProp="test prop" />
              )} />
            </div>
          }
          { !this.props.channels.isLoaded &&
            <h1>Loading K-SBI...</h1>
          }
        </div>
      </Router>
    );
  }
}

const mapStateToProps = state => ({
  channels: state.channels
});

export default connect(mapStateToProps, { initializeSession, initializeChannels })(AppContents);
