import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';

import { initializeSession } from './actions/sessionActions';
import { initializeChannels } from './operations/channelOperations';

import Channel from './Channel';
import TVGuide from './TVGuide';
import Channels from './Channels';
import WhatIsThisTooltip from './WhatIsThisTooltip';

import styled from 'react-emotion';

import { Logo } from './styles';

const LoadingContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  height: 100vh;
  width: 100vw;
`;

class AppContents extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showTooltip: false
    }

    this.toggleTooltip = this.toggleTooltip.bind(this);
  }

  componentDidMount() {
    this.props.initializeSession();
    this.props.initializeChannels();
  }

  toggleTooltip() {
    this.setState({ showTooltip: !this.state.showTooltip });
  }

  trackPageview() {
    ReactGA.pageview(window.location.pathname);
  };

  render() {
    const NoPrograms = () => {
      // Tracking for no available programs
      // TODO: This is running twice for some reason - we don't want that
      // ReactGA.pageview('/no-programs');
      return (
        <LoadingContainer>
          <Logo>Locally Grown</Logo>
          <h1>No programs right now.</h1>
          <br /><br />
          <WhatIsThisTooltip toggleInfo={this.toggleTooltip} showInfo={this.state.showTooltip} showLink={false} />
        </LoadingContainer>
      );
    };

    function NoMatch() {
      // Tracking for 404 page
      // TODO: This is running every time for some reason - we don't want that
      // ReactGA.pageview('/404');
      return (
        <LoadingContainer>
          <Logo>Locally Grown</Logo>
          <h1>Sorry, we couldn&apos;t find that.</h1>
          <br /><br />
          <h4><Link to="/tv-guide">Find something to watch.</Link></h4>
        </LoadingContainer>
      );
    };

    function LoadingState() {
      return (
        <LoadingContainer>
          <Logo>&nbsp;</Logo>
          <h1>Loading Locally Grown...</h1>
          <br /><br />
          <h4>&nbsp;</h4>
        </LoadingContainer>
      );
    }

    function ErrorState() {
      // Tracking for errors
      React.pageview('/error');
      return (
        <LoadingContainer>
          <Logo>Locally Grown</Logo>
          <h1>Sorry, there was an error loading channels.</h1>
          <br /><br />
          <h4>&nbsp;</h4>
        </LoadingContainer>
      );
    }

    return (
      <Router>
        <div className="App">
          { this.props.channels.isLoaded &&
            <Switch>
              { this.props.channels.availableChannels.map((channel, i) => // Tracking for avail channels
                <Route key={i} path={`/${channel.fields.slug}`} render={props => (
                  <React.Fragment>
                    {this.trackPageview()}
                    <Channel {...props} channel={channel} />
                  </React.Fragment>
                )} />
              )}
              { this.props.channels.hiddenChannels.map((channel, i) => // Tracking for hidden channels
                <Route key={i} path={`/${channel.fields.slug}`} render={props => (
                  <React.Fragment>
                    {this.trackPageview()}
                    <Channel {...props} channel={channel} />
                  </React.Fragment>
                )} />
              )}
              { this.props.channels.currentChannel && // Tracking for root & then new current channel
                <Route exact path="/" render={props => (
                  <React.Fragment>
                    {this.trackPageview()}
                    <Redirect to={`/${this.props.channels.currentChannel.fields.slug}`} />
                  </React.Fragment>
                )} />
              }
              <Route path="/tv-guide" render={props => ( // Tracking for TV Guide
                <React.Fragment>
                  {this.trackPageview()}
                  <TVGuide {...props} channels={this.props.channels.featuredChannels} />
                </React.Fragment>
              )} />
              <Route path="/channels" render={props => ( // Tracking for channels index
                <React.Fragment>
                  {this.trackPageview()}
                  <Channels {...props} featuredChannels={this.props.channels.featuredChannels} />
                </React.Fragment>
              )} />

              { !this.props.channels.currentChannel &&
                <Route exact path="/" render={props => (
                  <React.Fragment>
                    { this.props.channels.error && ErrorState() }
                    { !this.props.channels.error && NoPrograms() }
                  </React.Fragment>
                )} />
              }
              <Route component={NoMatch} />
            </Switch>
          }
          { !this.props.channels.isLoaded && LoadingState() }
        </div>
      </Router>
    );
  }
}

const mapStateToProps = state => ({
  channels: state.channels
});

export default connect(mapStateToProps, { initializeSession, initializeChannels })(AppContents);
