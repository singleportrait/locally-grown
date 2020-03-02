import React, { Component } from 'react';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import debounce from 'lodash/debounce';
import consoleLog from './consoleLog';

import { getCurrentProgramBlock } from './operations/programBlockOperations';

import Video from './Video';
import Navigation from './Navigation';
import MuteButton from './MuteButton';
import ChannelButton from './ChannelButton';
import InfoTooltip from './InfoTooltip';
import ProgramSidebar from './ProgramSidebar';
import MobileProgram from './MobileProgram';
import KeyboardNavigation from './KeyboardNavigation';

import {
  VideoPlaceholderWrapper,
} from './styles';

import styled from '@emotion/styled';
import { css } from 'emotion';

class Program extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showInfoTooltip: false,
      showMobileProgramInfo: false,
      maxMode: false,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    }

    this.toggleInfo = this.toggleInfo.bind(this);
    this.toggleMobileProgramInfo = this.toggleMobileProgramInfo.bind(this);
  }

  componentDidMount() {
    this.initializeProgram();

    document.addEventListener('mousemove', this.handleEvents);

    window.addEventListener('orientationchange', this.handleOrientationChange);
  }

  componentDidUpdate(prevProps) {
    if (this.props.session.currentHour !== prevProps.session.currentHour) {
      consoleLog("Current hour updated");
      this.initializeProgram();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleEvents);
    this.handleEventEnd.cancel(); // Lodash's debounce-removing tool

    window.removeEventListener('orientationchange', this.handleOrientationChange);
  }

  handleEvents = () => {
    this.handleEventStart();
    this.handleEventEnd();
  }

  handleEventStart = debounce((e) => {
    // consoleLog('Preventing or removing max mode');
    this.setState({ maxMode: false });
  }, 100, {
    'leading': true,
    'trailing': false
  });

  handleEventEnd = debounce((e) => {
    // consoleLog('Starting max mode after 4s debounce');
    this.setState({ maxMode: true });
  }, 4000, {
    'leading': false,
    'trailing': true
  });

  initializeProgram() {
    // Note: This will allow you to come to a direct URL and see that there are
    // no programs for the current moment.
    if (this.props.program.fields.programBlocks) {
      const currentProgramBlock = this.props.program.fields.programBlocks.find(programBlock => {
        return programBlock.fields.startTime === this.props.session.currentHour;
      })

      if (currentProgramBlock) {
        this.props.getCurrentProgramBlock(currentProgramBlock.sys.id);
      } else {
        consoleLog("No current program block!");
        this.props.getCurrentProgramBlock(null);
      }
    } else {
      consoleLog("No program blocks!");
      this.props.getCurrentProgramBlock(null);
    }
  }

  toggleMobileProgramInfo() {
    this.setState({ showMobileProgramInfo: !this.state.showMobileProgramInfo });
  }

  toggleInfo() {
    this.setState({ showInfoTooltip: !this.state.showInfoTooltip });
  }

  /* This handles when mobile gets rotated twice. For some reason, <MediaQuery>
   * stops detecting properly, even though the window's size appears correctly.
   * So, we detect the rotation manually, wait for the resize to be complete,
   * and then overwrite the initial window viewport size. Then, we use that new
   * size to handle whether to show the mobile program section or not.
   *
   * We only run the resize event once, so that we're not then constantly polling
   * if the user scrolls, etc. The caveat here is that, when using Chrome
   * and the inspector, we don't generally listen for resizes, so if you're
   * switching between responsive mode and desktop mode, it's not going to
   * behave correctly. Just refresh the browser, and you'll be fine. That's
   * simpler than adding custom code just for test situations.
   *
   * This doesn't work entirely perfect on mobile Chrome. There are times
   * (probably because of the timeout) that it doesn't trigger correctly.
   * However, since the resize event doesn't trigger reliably when rotating
   * horizontally, I'm choosing not to run on both events for the time being.
   *
   * We could choose to also use the `resize` window event similarly, if we
   * want to add a backup for if this doesn't fire consistently enough, with
   * the downside that it could cause a performance lag with running both of
   * these all the time
   *
   * Some phone sizes for reference:
   * iPhone = 375 x 667
   * iPhone XL = 414 x 736
   * Pixel = 411 x 731
   * Pixel XL = 411 x 823
   */
  /* When orientationchange gets run:
   * For all mobile browsers tested: immediately after rotation
   *
   * When resize gets run:
   * Mobile iOS Safari: immediately after orientationchange but *only when rotating from horizontal to vertical*
   * Mobile (Android) Chrome: immediately after orientation when rotating both directions
   */
  handleOrientationChange = (e) => {
    // consoleLog("- Orientation changed; sizes now:", window.innerWidth, window.innerHeight);

    const handleResizeOnOrientation = () => {
      this.setState({
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });

      // consoleLog("- After orientation timeout, window size now:", this.state.viewportWidth, this.state.viewportHeight);
    }

    // Different browsers trigger the resize differently (e.g. Safari
    // triggers one instantly, but Chrome never does until scroll), so we'll
    // depend on a timeout :'( and check the viewport size ourselves.
    // Works just nicely in Safari, is a little flickery in Chrome, but at
    // least it doesn't completely break.
    setTimeout(handleResizeOnOrientation, 150);
  }

  render() {
    const program = this.props.program;
    const { programBlocks } = program.fields;
    const currentProgramBlock = this.props.programBlocks.currentProgramBlock;

    const renderDesktopVideo = (allowMaxMode = true) => {
      return (
        <React.Fragment>
          { currentProgramBlock && currentProgramBlock.fields.videos &&
            <React.Fragment>
              <Video
                video={currentProgramBlock.currentVideo}
                timestamp={currentProgramBlock.timestampToStartVideo}
              />
              <VideoControls hasMultipleChannels={this.props.previousChannelSlug} maxMode={allowMaxMode && this.state.maxMode}>
                { this.props.previousChannelSlug &&
                    <ChannelButton direction="previous" to={this.props.previousChannelSlug} />
                }

                <div className={controlButtons}>
                  <MuteButton />
                </div>

                { this.props.nextChannelSlug &&
                    <ChannelButton direction="next" to={this.props.nextChannelSlug} />
                }
              </VideoControls>
            </React.Fragment>
          }
          { (!currentProgramBlock || !currentProgramBlock.fields.videos) &&
              <VideoPlaceholderWrapper />
          }
        </React.Fragment>
      );
    }

    const renderChannelInfo = () => {
      return (
        <React.Fragment>
          <Navigation />
          <p className={channelTitle}>
            You&apos;re watching {this.props.channelTitle}

            { this.props.channelUser &&
                <span> by {this.props.channelUser.fields.name}</span>
            }
            .
            <InfoTooltip
              toggleInfo={this.toggleInfo}
              show={this.state.showInfoTooltip}
              title={program.fields.title}
              description={program.fields.description}
              user={this.props.channelUser}
            />
          </p>
          <hr/>
        </React.Fragment>
      );
    }

    const renderSidebarProgramContent = () => {
      return (
        <ProgramSidebar
          currentProgramBlock={currentProgramBlock}
          programBlocks={programBlocks}
          currentHour={this.props.session.currentHour}
          channelTitle={this.props.channelTitle}
          channelSlug={this.props.channelSlug}
        ></ProgramSidebar>
      );
    }

    return (
      <React.Fragment>
        <KeyboardNavigation
          previousChannelSlug={this.props.previousChannelSlug}
          nextChannelSlug={this.props.nextChannelSlug}
        />
        <MediaQuery minWidth={800}>
          <WideProgramContainer>
            <VideoAndControlsColumn maxMode={this.state.maxMode}>
              { renderDesktopVideo() }
            </VideoAndControlsColumn>
            <InfoColumnContainer maxMode={this.state.maxMode} onScroll={this.handleEvents}>
              <div className={infoColumn}>
                { renderChannelInfo() }
                { renderSidebarProgramContent() }
              </div>
            </InfoColumnContainer>
          </WideProgramContainer>
        </MediaQuery>
        <MediaQuery minWidth={415} maxWidth={800}>
          <MediumProgramContainer>
            { renderChannelInfo() }
            <MediumVideoContainer>
              { renderDesktopVideo(false) }
            </MediumVideoContainer>
            { renderSidebarProgramContent() }
          </MediumProgramContainer>
        </MediaQuery>
        { this.state.viewportWidth <= 767 && this.state.viewportHeight >= 415 &&
          <MobileProgram
            currentProgramBlock={currentProgramBlock}
            programBlocks={programBlocks}
            showMobileProgramInfo={this.state.showMobileProgramInfo}
            toggleMobileProgramInfo={this.toggleMobileProgramInfo}
            previousChannelSlug={this.props.previousChannelSlug}
            nextChannelSlug={this.props.nextChannelSlug}
            channelTitle={this.props.channelTitle}
            channelUser={this.props.channelUser}
            currentHour={this.props.session.currentHour}
          ></MobileProgram>
        }
      </React.Fragment>
    );
  }
}

const WideProgramContainer = styled('div')`
  display: flex;
  margin: 1.4rem 1.4rem 0;
  position: relative;
  overflow: hidden;
  height: calc(100vh - 1.4rem);
`;

const MediumProgramContainer = styled('div')`
  margin: 1.4rem;
`;

// On horizontally-rotated phones and very short screens, scale the video to match
const MediumVideoContainer = styled('div')`
  @media (min-aspect-ratio: 16/9) {
    width: calc(90vh * 1.33);
    margin: 0 auto;
  }
`;

const shortAspectRatio = '9/5';
const shortestAspectRatio = '9/4';
// widthRelativeToBrowserHeight = (Browser width - program padding) * video 4/3 ratio
const widthRelativeToBrowserHeight = 'calc((100vh - 2.8rem) * 1.333)';

// Use the ratio of the video to learn how wide or tall it is, then position
// it accordingly based on the browser ratio
const relativeLeftValue = 'calc((100vw - 2.8rem - ((100vh - 2.8rem) * 1.333)) / 2)';
const relativeTopValue = 'calc(((100vh - 2.8rem - (100vw - 2.8rem) * .75)) / 2)';

const VideoAndControlsColumn = styled('div')`
  position: relative;
  transform: translateZ(0);
  backface-visibility: hidden;
  transition: width 0.4s ease, left 0.4s ease, top 0.4s ease;
  max-width: 100%;

  @media (min-aspect-ratio: 4/3) {
    width: ${props => props.maxMode ? widthRelativeToBrowserHeight : '65%' };
    left: ${props => props.maxMode ? relativeLeftValue : '0' };
  }

  @media (max-aspect-ratio: 4/3) {
    width: ${props => props.maxMode ? '100%' : '65%' };
    top: ${props => props.maxMode ? relativeTopValue : '0' };
  }

  @media (min-aspect-ratio: ${shortAspectRatio}) {
    width: ${props => props.maxMode ? widthRelativeToBrowserHeight : '55%' };
    left: ${props => props.maxMode ? relativeLeftValue : '5%' };
  }

  @media (min-aspect-ratio: ${shortestAspectRatio}) {
    width: ${props => props.maxMode ? widthRelativeToBrowserHeight : '45%' };
    left: ${props => props.maxMode ? relativeLeftValue : '10%' };
  }
`;

const InfoColumnContainer = styled('div')`
  position: absolute;
  width: 35%;
  padding-left: 1.4rem;
  transform: translateZ(0);
  backface-visibility: hidden;
  height: calc(100vh - 1.4rem);
  overflow-x: hidden;
  transition: opacity 0.4s ease, right 0.4s ease;
  opacity: ${props => props.maxMode ? '0' : '1' };
  right: ${props => props.maxMode ? '-35%' : '0' };

  @media (min-aspect-ratio: ${shortAspectRatio}) {
    right: ${props => props.maxMode ? '-35%' : '5%' };
  }

  @media (min-aspect-ratio: ${shortestAspectRatio}) {
    right: ${props => props.maxMode ? '-35%' : '10%' };
  }
`;

const infoColumn = css`
  padding-right: 16px;
  margin-right: -16px;
  overflow-y: scroll;
  height: 100%;
`;

const VideoControls = styled('div')`
  padding-top: 1rem;
  display: ${props => props.maxMode ? 'none' : 'flex'};
  justify-content: ${props => props.hasMultipleChannels ? 'space-between' : 'center'}
`;

const controlButtons = css`
  display: flex;
`;

const channelTitle = css`
  margin: 1rem 0;
`;

const mapStateToProps = state => ({
  programBlocks: state.programBlocks,
  session: state.session
});

export default connect(mapStateToProps, { getCurrentProgramBlock })(Program);
