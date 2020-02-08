import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import Overlay from 'react-overlays/Overlay';

import { initializeSession } from './actions/sessionActions';
import { initializeChannels } from './operations/channelOperations';

import Channel from './Channel';
import TVGuide from './TVGuide';
import Channels from './Channels';
import WhatIsThisTooltip from './WhatIsThisTooltip';
import Tooltip from './Tooltip';
import LowBatteryTest from './LowBatteryTest';

import styled from '@emotion/styled';

import { Logo, mobileViewportHeight } from './styles';

const LoadingContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  height: 100vh; // TODO: Could replace this on mobile if it becomes a scroll problem
  width: 100vw;
`;

const MobileSupportOverlay = styled('div')`
  width: 100vw;
  height: ${mobileViewportHeight};
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background-color: rgba(0,0,0,.6);
  display: flex;
  justify-content: center;
  padding-top: 200px;
`;

class AppContents extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showMobileOverlay: true,
    }

    this.toggleMobileOverlay = this.toggleMobileOverlay.bind(this);
  }

  componentDidMount() {
    this.props.initializeSession();
    this.props.initializeChannels();
  }

  toggleTooltip() {
    this.setState({ showTooltip: !this.state.showTooltip });
  }

  toggleMobileOverlay() {
    this.setState({ showMobileOverlay: !this.state.showMobileOverlay });
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
          <WhatIsThisTooltip showLink={false} />
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

    const mobileOverlayTitle="Low battery warning!";
    const mobileOverlayDescription="Locally Grown acts funny when your phone is in Low Battery Mode. We recommend turning it off to get the best experience.";

    return (
      <Router>
        <div className="App">
          <MediaQuery maxDeviceWidth={600} maxWidth={400}>
            <LowBatteryTest />
            {this.props.session.lowBatteryMode === true &&
              <Overlay
                show={this.state.showMobileOverlay}
                onHide={this.toggleMobileOverlay}
              >
                {({
                  ...props
                }) => (
                  <MobileSupportOverlay onClick={this.toggleMobileOverlay}>
                    <Tooltip
                      close={this.toggleMobileOverlay}
                      title={mobileOverlayTitle}
                      description={mobileOverlayDescription}
                      ignorePositioning={true}
                    />
                  </MobileSupportOverlay>
                )}
              </Overlay>
            }
          </MediaQuery>
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
                    <Helmet>
                      <title>{`${process.env.REACT_APP_NAME}`}</title>
                      <link rel="canonical" href={process.env.REACT_APP_DOMAIN} />
                      <meta property="og:title" content={process.env.REACT_APP_NAME} />
                      <meta property="og:description" content={process.env.REACT_APP_DESCRIPTION} />
                      <meta property="og:image" content={process.env.REACT_APP_DOMAIN + "share.png"} />
                    </Helmet>
                    {this.trackPageview()}
                    <Redirect to={`/${this.props.channels.currentChannel.fields.slug}`} />
                  </React.Fragment>
                )} />
              }
              <Route path="/tv-guide" render={props => ( // Tracking for TV Guide
                <React.Fragment>
                  <Helmet>
                    <title>{`TV Guide | ${process.env.REACT_APP_NAME}`}</title>
                    <link rel="canonical" href={process.env.REACT_APP_DOMAIN + "tv-guide"} />
                    <meta property="og:title" content={"TV Guide | " + process.env.REACT_APP_NAME} />
                    <meta property="og:description" content={process.env.REACT_APP_DESCRIPTION} />
                    <meta property="og:image" content={process.env.REACT_APP_DOMAIN + "share.png"} />
                  </Helmet>
                  {this.trackPageview()}
                  <TVGuide {...props} channels={this.props.channels.featuredChannels} />
                </React.Fragment>
              )} />
              <Route path="/channels" render={props => ( // Tracking for channels index
                <React.Fragment>
                  <Helmet>
                    <title>{`Channels | ${process.env.REACT_APP_NAME}`}</title>
                    <link rel="canonical" href={process.env.REACT_APP_DOMAIN + "channels"} />
                    <meta property="og:title" content={"All Channels | " + process.env.REACT_APP_NAME} />
                    <meta property="og:description" content={process.env.REACT_APP_DESCRIPTION} />
                    <meta property="og:image" content={process.env.REACT_APP_DOMAIN + "share.png"} />
                  </Helmet>
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
  channels: state.channels,
  session: state.session,
});

export default connect(mapStateToProps, { initializeSession, initializeChannels })(AppContents);
