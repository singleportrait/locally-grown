import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import Overlay from 'react-overlays/Overlay';
import { isIOS } from './helpers/utils';

import { initializeSession } from './actions/sessionActions';
import { initializeChannels } from './operations/channelOperations';
import { initializeScreenings } from './operations/screeningOperations';

import LoadingScreen from './components/LoadingScreen';
import Channel from './Channel';
import TVGuide from './TVGuide';
import Channels from './Channels';
import Tooltip from './components/Tooltip';
import LowBatteryTest from './components/LowBatteryTest';
import Screenings from './Screenings';

import Registration from './Registration';

import styled from '@emotion/styled';

import { mobileViewportHeight } from './styles';

import withTracker from './components/withTracker';
const TVGuideWithTracker = withTracker(TVGuide);
const ChannelsWithTracker = withTracker(Channels);

const mobileLowBatteryTooltipHeight = "200px";

const MobileSupportOverlay = styled('div')`
  position: absolute;
  height: ${mobileViewportHeight};
  width: 100vw;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  background-color: rgba(0,0,0,.6);
  display: flex;
  justify-content: center;
  // Padding-top to hide the Youtube play button if the videos aren't loading
  padding-top: calc((${mobileViewportHeight} - ${mobileLowBatteryTooltipHeight}) / 2);
`;

class AppContents extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showMobileOverlay: true,
      reloadingPage: false,
      isIOS: isIOS(),
    }
  }

  componentDidMount() {
    this.props.initializeSession();
    this.props.initializeChannels();
    this.props.initializeScreenings();
  }

  toggleTooltip() {
    this.setState({ showTooltip: !this.state.showTooltip });
  }

  trackPageview() {
    ReactGA.pageview(window.location.pathname);
  };

  retestLowBatteryMode = () => {
    this.setState({ reloadingPage: true });
    window.location.reload(false);
  }

  render() {
    const NoPrograms = () => {
      // Tracking for no available programs
      // TODO: This is running twice for some reason - we don't want that
      // ReactGA.pageview('/no-programs');
      return (
        <LoadingScreen message="No programs right now" showWhatIsThisTooltip />
      );
    };

    function NoMatch() {
      // Tracking for 404 page
      // TODO: This is running every time for some reason - we don't want that
      // ReactGA.pageview('/404');
      return (
        <LoadingScreen message="Sorry, we couldn&apos;t find that." showTVGuideLink />
      );
    };

    function LoadingState() {
      return (
        <LoadingScreen showInitialLoadingState />
      );
    }

    function ErrorState() {
      // Tracking for errors
      ReactGA.pageview('/error');
      return (
        <LoadingScreen message="Sorry, there was an error loading channels." />
      );
    }

    const mobileOverlayTitle="Low battery warning!";

    const renderMobileLowBatteryDescription = () => {
      return (
        <div>
          Locally Grown can't deliver videos to you when your phone is in Low Battery Mode.
          <br />
          <br />
          Please turn that off so we can get to work. We’ll wait...
          <br />
          <br />
          { this.state.reloadingPage && "Reloading..." }
          { !this.state.reloadingPage &&
            <button onClick={this.retestLowBatteryMode}>Ok, it's off now.</button>
          }
        </div>
      );
    }
    return (
      <Router>
        <div className="App">
          <MediaQuery maxDeviceWidth={600} maxWidth={400}>
            { this.state.isIOS && this.props.session.lowBatteryMode === undefined &&
              <LowBatteryTest />
            }
            { this.state.isIOS && this.props.session.lowBatteryMode === true &&
              <Overlay
                show={this.state.showMobileOverlay}
              >
                {({
                  ...props
                }) => (
                  <MobileSupportOverlay>
                    <Tooltip
                      title={mobileOverlayTitle}
                      descriptionHTML={renderMobileLowBatteryDescription()}
                      ignorePositioning={true}
                    />
                  </MobileSupportOverlay>
                )}
              </Overlay>
            }
          </MediaQuery>
          { this.props.channels.isLoaded &&
            <Switch>

              <Route path="/screenings">
                <Screenings screenings={this.props.screenings.screenings} />
              </Route>

              { this.props.channels.carouselChannels.map((channel, i) => // Tracking for carousel channels
                <Route key={i} path={`/${channel.fields.slug}`} render={props => (
                  <React.Fragment>
                    {this.trackPageview()}
                    <Channel {...props} channel={channel} />
                  </React.Fragment>
                )} />
              )}

              { this.props.channels.nonCarouselChannels.map((channel, i) => // Tracking for nonCarousel channels
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
                  <TVGuideWithTracker {...props} channels={this.props.channels.featuredChannels} />
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
                  <ChannelsWithTracker {...props} featuredChannels={this.props.channels.featuredChannels} />
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
  screenings: state.screenings,
});

export default connect(mapStateToProps, { initializeSession, initializeChannels, initializeScreenings })(AppContents);
