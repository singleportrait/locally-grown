import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { initializeSession } from './actions/sessionActions';
import { initializeChannels } from './operations/channelOperations';

import Channel from './Channel';
import ChannelWithSlug from './ChannelWithSlug';
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
              <Link to="/">Home</Link>
              { this.props.channels.availableChannels.map((channel, i) =>
                <span key={i}>
                  &nbsp;
                  <Link to={channel.fields.slug}>{channel.fields.title}</Link>
                  <Route path={`/${channel.fields.slug}`} render={props => (
                    <ChannelWithSlug channel={channel} />
                  )} />
                </span>
              )}
              <hr/>
              <Route exact path="/" component={Channel} />
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
