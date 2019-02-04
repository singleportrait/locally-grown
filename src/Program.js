import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';
import { findDOMNode } from 'react-dom';
import debounce from 'lodash/debounce';

import { getCurrentProgramBlock } from './operations/programBlockOperations';

import Video from './Video';
import Navigation from './Navigation';
import ProgramBlockInfo from './ProgramBlockInfo';
import MuteButton from './MuteButton';
import FullscreenButton from './FullscreenButton';
import ChannelButton from './ChannelButton';
import InfoTooltip from './InfoTooltip';
import CurrentProgramBlockInfo from './CurrentProgramBlockInfo';
import CloseIcon from './CloseIcon';
import TVGuideLink from './TVGuideLink';

import { Logo, backgroundColor, borderColor } from './styles';

import styled, { css } from 'react-emotion';

class Program extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showInfoTooltip: false,
      showMobileProgramInfo: false,
      maxMode: false
    }

    this.toggleInfo = this.toggleInfo.bind(this);
    this.toggleMobileProgramInfo = this.toggleMobileProgramInfo.bind(this);
  }

  componentDidMount() {
    this.initializeProgram();

    // document.title = `${this.props.program.fields.title} | Locally Grown`

    document.addEventListener('mousemove', this.handleEvents);
  }

  componentDidUpdate(prevProps) {
    if (this.props.session.currentHour !== prevProps.session.currentHour) {
      console.log("Current hour updated");
      this.initializeProgram();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleEvents);
    this.handleEventEnd.cancel(); // Lodash's debounce-removing tool
  }

  handleEvents = () => {
    this.handleEventStart();
    this.handleEventEnd();
  }

  handleEventStart = debounce((e) => {
    // console.log('Preventing or removing max mode');
    this.setState({ maxMode: false });
  }, 100, {
    'leading': true,
    'trailing': false
  });

  handleEventEnd = debounce((e) => {
    // console.log('Starting max mode after 4s debounce');
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
        console.log("No current program block!");
        this.props.getCurrentProgramBlock(null);
      }
    } else {
      console.log("No program blocks!");
    }
  }

  toggleInfo() {
    this.setState({ showInfoTooltip: !this.state.showInfoTooltip });
  }

  toggleMobileProgramInfo() {
    this.setState({ showMobileProgramInfo: !this.state.showMobileProgramInfo });
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
                cropControls={true}
              />
              <VideoControls hasMultipleChannels={this.props.previousChannelSlug} maxMode={allowMaxMode && this.state.maxMode}>
                { this.props.previousChannelSlug &&
                    <ChannelButton direction="previous" to={this.props.previousChannelSlug} />
                }

                <div className={controlButtons}>
                  <MuteButton />
                  <FullscreenButton />
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
              container={() => findDOMNode(this.container)}
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
        <React.Fragment>
          { currentProgramBlock &&
              <CurrentProgramBlockInfo programBlock={currentProgramBlock} error={this.props.programBlocks.error} />
          }
          { !currentProgramBlock &&
              <div>
                <br />
                <h1>There&apos;s nothing playing on this channel right now.</h1>
                <br /><br />
                { this.props.programBlocks.error &&
                    <p>{this.props.programBlocks.error}</p>
                }
                <Link to="/tv-guide">Check out the TV Guide</Link> to find something.
              </div>
          }
          { programBlocks &&
              <ProgramBlockInfo programBlocks={programBlocks} currentHour={this.props.session.currentHour} />
          }
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <MediaQuery minWidth={800}>
          <WideProgramContainer ref={(c) => { this.container = c; }}>
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
        <MediaQuery minWidth={400} maxWidth={800}>
          <MediumProgramContainer>
            { renderChannelInfo() }
            { renderDesktopVideo(false) }
            { renderSidebarProgramContent() }
          </MediumProgramContainer>
        </MediaQuery>
        <MediaQuery maxDeviceWidth={600}>
          <div>
            <MobileProgramContainer>
              { currentProgramBlock &&
                <React.Fragment>
                  <Video
                    video={currentProgramBlock.currentVideo}
                    timestamp={currentProgramBlock.timestampToStartVideo}
                    className={mobileVideo}
                  />
                  { !this.state.showMobileProgramInfo &&
                    <div className={mobileTopRightIcon}><MuteButton /></div>
                  }
                  { this.state.showMobileProgramInfo &&
                    <div className={mobileProgramInfoCloseIcon} onClick={this.toggleMobileProgramInfo}>
                      <CloseIcon />
                    </div>
                  }
                  <div className={mobileFullscreen}><FullscreenButton /></div>
                  { this.props.previousChannelSlug && !this.state.showMobileProgramInfo &&
                    <div className={mobilePreviousChannel}><ChannelButton direction="previous" to={this.props.previousChannelSlug} /></div>
                  }
                  { this.props.nextChannelSlug &&
                    <div className={mobileNextChannel}><ChannelButton direction="next" to={this.props.nextChannelSlug} /></div>
                  }
                </React.Fragment>
              }
              { (!currentProgramBlock || !currentProgramBlock.fields.videos) &&
                <VideoPlaceholderWrapper className={mobileVideo} />
              }
            </MobileProgramContainer>
            <TopMobileText>
              <div>
                <Link to="/channels" className={css`text-decoration: none;`}><Logo>Locally Grown</Logo></Link>
                <p>
                  You&apos;re watching {this.props.channelTitle}

                  { this.props.channelUser &&
                    <span> by {this.props.channelUser.fields.name}</span>
                  }
                </p>
              </div>
              <TVGuideLink />
            </TopMobileText>
            { currentProgramBlock &&
              <BottomMobileText>
                <p>Now playing:</p>
                <h1 onClick={this.toggleMobileProgramInfo}>{currentProgramBlock.fields.title}<span className={mobileInfo}>Info</span></h1>
              </BottomMobileText>
            }
            { !currentProgramBlock &&
              <BottomMobileText>
                <h1>There&apos;s nothing playing on this channel right now.</h1>
              </BottomMobileText>
            }
            { this.state.showMobileProgramInfo &&
              <MobileProgramInfoContainer>
                <MobileProgramInfoContents>
                  { renderSidebarProgramContent() }
                </MobileProgramInfoContents>
              </MobileProgramInfoContainer>
            }
          </div>
        </MediaQuery>
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

const VideoPlaceholderWrapper = styled('div')`
  position: relative;
  padding-top: 75%;
  background: url(./static_placeholder_simpler.gif);
  background-size: cover;
`;

const MobileProgramContainer = styled('div')`
  width: 100vh;
  height: 100vw;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(90deg);
  transform-origin: 28% 50%;
`;

const mobileVideoWidth = '64vh';
const mobileTextHeight = `calc((100vh - ${mobileVideoWidth}) / 2 - 1rem)`;
const mobileInfoContainerHeight = `calc(${mobileVideoWidth} + ${mobileTextHeight} + 1rem)`;

const mobileVideo = css`
  width: ${mobileVideoWidth};
  padding-top: 50%;
`;

const mobileTopRightIcon = css`
  position: absolute;
  top: 0;
  left: 0;
`;

const mobileProgramInfoCloseIcon = css`
  ${mobileTopRightIcon}
  padding: 1rem;
`;

const mobileFullscreen = css`
  position: absolute;
  top: 0;
  right: 0;
`;

const mobilePreviousChannel = css`
  position: absolute;
  bottom: 0;
  left: 1rem;
`;

const mobileNextChannel = css`
  position: absolute;
  bottom: 0;
  right: 1rem;
`;

const baseMobileText = css`
  position: absolute;
  width: calc(100vw - 130px);
  left: 75px;
  height: ${mobileTextHeight};
`;

const TopMobileText = styled('div')`
  ${baseMobileText}
  top: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 1rem;
`;

const BottomMobileText = styled('div')`
  ${baseMobileText}
  bottom: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const mobileInfo = css`
  font-size: 12px;
  font-weight: 300;
  text-decoration: underline;
  padding-left: 5px;
`;

const MobileProgramInfoContainer = styled('div')`
  position: absolute;
  padding: 0 1rem;
  width: 100%;
  height: ${mobileInfoContainerHeight};
  top: calc(${mobileTextHeight} + 1rem);
  background-color: ${backgroundColor};
`;

const MobileProgramInfoContents = styled('div')`
  border-top: 1px solid ${borderColor};
  height: ${mobileInfoContainerHeight};
  padding: 1rem 0;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`;

const channelTitle = css`
  margin: 1rem 0;
`;

const mapStateToProps = state => ({
  programBlocks: state.programBlocks,
  session: state.session
});

export default connect(mapStateToProps, { getCurrentProgramBlock })(Program);
