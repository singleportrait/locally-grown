import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';
import { findDOMNode } from 'react-dom';

import { getCurrentProgramBlock } from './operations/programBlockOperations';

import Video from './Video';
import Navigation from './Navigation';
import ProgramBlockInfo from './ProgramBlockInfo';
import MuteButton from './MuteButton';
import FullscreenButton from './FullscreenButton';
import ChannelButton from './ChannelButton';
import InfoTooltip from './InfoTooltip';

import { Logo } from './styles';

import styled, { css } from 'react-emotion';

class Program extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showInfoTooltip: false
    }

    this.toggleInfo = this.toggleInfo.bind(this);
  }

  componentDidMount() {
    this.initializeProgram();

    document.title = `${this.props.program.fields.title} | Locally Grown`
  }

  componentDidUpdate(prevProps) {
    if (this.props.session.currentHour !== prevProps.session.currentHour) {
      console.log("Current hour updated");
      this.initializeProgram();
    }
  }

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

  render() {
    const program = this.props.program;
    const { programBlocks } = program.fields;
    const currentProgramBlock = this.props.programBlocks.currentProgramBlock;

    const renderDesktopVideo = () => {
      return (
        <React.Fragment>
          <Video
            video={currentProgramBlock.currentVideo}
            timestamp={currentProgramBlock.timestampToStartVideo}
            cropControls={true}
          />
          <VideoControls>
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
      );
    }

    return (
      <React.Fragment>
        <MediaQuery minDeviceWidth={600}>
          <div className={programClass} ref={(c) => { this.container = c; }}>
            <div className={videoAndControlsColumn}>
              { currentProgramBlock && currentProgramBlock.fields.videos &&
                renderDesktopVideo()
              }

              { (!currentProgramBlock || !currentProgramBlock.fields.videos) &&
                <VideoPlaceholderWrapper />
              }
            </div>
            <div className={infoColumnContainer}>
              <div className={infoColumn}>
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
                { currentProgramBlock &&
                  <React.Fragment>
                    <p>Now playing:</p>
                    <h1>{currentProgramBlock.fields.title}</h1>
                    <p>{currentProgramBlock.fields.description}</p>
                    { currentProgramBlock.programmingLength < 3600 &&
                        <p>
                          <em>Warning! This block of programming runs out at <strong>{Math.round(currentProgramBlock.programmingLength/60)} minutes</strong> after the hour, so you might get some unexpected behavior while viewing this channel.</em>
                        </p>
                    }
                    { this.props.programBlocks.error &&
                      <p>{this.props.programBlocks.error}</p>
                    }
                  </React.Fragment>
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
              </div>
            </div>
          </div>
        </MediaQuery>
        <MediaQuery maxDeviceWidth={600}>
          { currentProgramBlock &&
            <div>
              <MobileVideo>
                { currentProgramBlock &&
                  <React.Fragment>
                    <Video
                      video={currentProgramBlock.currentVideo}
                      timestamp={currentProgramBlock.timestampToStartVideo}
                      className={mobileVideo}
                    />
                    <div className={mobileMute}><MuteButton /></div>
                    <div className={mobileFullscreen}><FullscreenButton /></div>
                    { this.props.previousChannelSlug &&
                      <div className={mobilePreviousChannel}><ChannelButton direction="previous" to={this.props.previousChannelSlug} /></div>
                    }
                    { this.props.nextChannelSlug &&
                      <div className={mobileNextChannel}><ChannelButton direction="next" to={this.props.nextChannelSlug} /></div>
                    }
                  </React.Fragment>
                }
                { !currentProgramBlock &&
                  <VideoPlaceholderWrapper />
                }
              </MobileVideo>
              <TopMobileText>
                <Logo>Locally Grown</Logo>
                <p>You&apos;re watching {this.props.channelTitle}</p>
              </TopMobileText>
              <BottomMobileText>
                <p>Now playing:</p>
                <h1>{currentProgramBlock.fields.title}<span className={mobileInfo}>Info</span></h1>
              </BottomMobileText>
            </div>
          }
        </MediaQuery>
      </React.Fragment>
    );
  }
}

const programClass = css`
  display: flex;
  margin: 1.4rem;
  position: relative;
`;

const videoAndControlsColumn = css`
  position: relative;
  width: 65%;
  transition: width 0.4s ease;
  transform: translateZ(0);
  backface-visibility: hidden;
`;

const VideoControls = styled('div')`
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
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

const MobileVideo = styled('div')`
  width: 100vh;
  height: 100vw;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(90deg);
  transform-origin: 28% 50%;
`;

const mobileVideo = css`
  background-color: #222;
  width: 64vh;
  padding-top: 50%;
`;

const mobileMute = css`
  position: absolute;
  top: 0;
  left: 0;
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
  width: calc(100vw - 140px);
  left: 80px;
  height: 120px;
`;

const TopMobileText = styled('div')`
  ${baseMobileText}
  top: 1rem;
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

const infoColumnContainer = css`
  position: absolute;
  right: 0;
  width: 35%;
  padding-left: 1.4rem;
  opacity: 1;
  transition: opacity 0.4s ease, right 0.4s ease;
  transform: translateZ(0);
  backface-visibility: hidden;
  height: calc(100vh - 1.4rem);
  overflow-x: hidden;
`;

const infoColumn = css`
  padding-right: 16px;
  margin-right: -16px;
  overflow-y: scroll;
  height: 100%;
`;

const channelTitle = css`
  margin: 1rem 0;
`;

const mapStateToProps = state => ({
  programBlocks: state.programBlocks,
  session: state.session
});

export default connect(mapStateToProps, { getCurrentProgramBlock })(Program);
