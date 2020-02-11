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

import {
  VideoPlaceholderWrapper,
} from './styles';

import styled from '@emotion/styled/macro';
import { css } from 'emotion/macro';

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
      consoleLog("Current hour updated");
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
    }
  }

  toggleMobileProgramInfo() {
    this.setState({ showMobileProgramInfo: !this.state.showMobileProgramInfo });
  }

  toggleInfo() {
    this.setState({ showInfoTooltip: !this.state.showInfoTooltip });
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
        <MediaQuery minWidth={400} maxWidth={800}>
          <MediumProgramContainer>
            { renderChannelInfo() }
            <MediumVideoContainer>
              { renderDesktopVideo(false) }
            </MediumVideoContainer>
            { renderSidebarProgramContent() }
          </MediumProgramContainer>
        </MediaQuery>
        <MediaQuery maxDeviceWidth={600} maxWidth={400}>
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
