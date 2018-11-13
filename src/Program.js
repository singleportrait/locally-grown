import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';
import * as moment from 'moment';
import { findDOMNode } from 'react-dom';
import Overlay from 'react-overlays/lib/Overlay';

import { getCurrentProgramBlock } from './operations/programBlockOperations';

import Video from './Video';
import Navigation from './Navigation';
import ProgramBlockInfo from './ProgramBlockInfo';
import MuteButton from './MuteButton';
import FullscreenButton from './FullscreenButton';
import ChannelButton from './ChannelButton';
import CloseIcon from './CloseIcon';

import { Tooltip, tooltipHeader, tooltipCloseButton } from './styles';

import styled, { css } from 'react-emotion';

class Program extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showInfo: false
    }

    this.toggleInfo = this.toggleInfo.bind(this);
  }

  componentDidMount() {
    this.initializeProgram();

    document.title = `${this.props.program.fields.title} | Locally Grown`
  }

  initializeProgram() {
    // TODO: Check whether program blocks exist at a higher level?
    // If you go to a direct URL of a channel and it has programs, but they don't have any
    // program blocks inside them, this page errors
    if (this.props.program.fields.programBlocks) {
      const currentProgramBlock = this.props.program.fields.programBlocks.find(programBlock => {
        return programBlock.fields.startTime === this.props.session.currentHour;
      })

      if (currentProgramBlock) {
        this.props.getCurrentProgramBlock(currentProgramBlock.sys.id);
      } else {
        console.log("No current program block!");
      }
    } else {
      console.log("No program blocks!");
    }
  }

  toggleInfo() {
    this.setState({ showInfo: !this.state.showInfo });
  }

  render() {
    const program = this.props.program;
    const { programBlocks } = program.fields;
    const currentProgramBlock = this.props.programBlocks.currentProgramBlock;

    return (
      <div className={programClass} ref={(c) => { this.container = c; }}>
        <MediaQuery minDeviceWidth={600}>
          <div className={videoAndControlsColumn}>
            { currentProgramBlock &&
              <React.Fragment>
                <Video
                  video={currentProgramBlock.currentVideo}
                  timestamp={currentProgramBlock.timestampToStartVideo}
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
            }

            { !currentProgramBlock &&
              <VideoPlaceholderWrapper />
            }
          </div>
          <div className={infoColumnContainer}>
            <div className={infoColumn}>
              <Navigation />
              <p>
                You're watching {this.props.channelTitle}.
                <span
                  className={tooltipTrigger}
                  ref={(t) => { this.target = t; }}
                  onClick={this.toggleInfo}
                >Info</span>
                <Overlay
                  show={this.state.showInfo}
                  onHide={() => this.setState({ showInfo: false })}
                  placement="bottom"
                  container={() => findDOMNode(this.container)}
                  rootClose={true}
                  target={() => findDOMNode(this.target)}
                >
                  <Tooltip>
                    <div className={tooltipHeader}>
                      <h4>{program.fields.title}</h4>
                      <div className={tooltipCloseButton} onClick={this.toggleInfo}>
                        <CloseIcon color="#000" />
                      </div>
                    </div>
                    {program.fields.description &&
                      <p>{program.fields.description}</p>
                    }
                    {!program.fields.description &&
                      <p><em>This program doesn't have a description!</em></p>
                    }
                  </Tooltip>
                </Overlay>
              </p>
              <p>It's {moment(this.props.session.currentHour, "HH").format("h")} o'clock.</p>
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
                </React.Fragment>
              }
              { !currentProgramBlock &&
                <div>
                  <br />
                  <h1>There's nothing playing on this channel.</h1>
                  <br /><br />
                  <Link to="/tv-guide">Check out the TV Guide</Link> to find something.
                </div>
              }
              { programBlocks &&
                <ProgramBlockInfo programBlocks={programBlocks} currentHour={this.props.session.currentHour} />
              }
            </div>
          </div>
        </MediaQuery>
        <MediaQuery maxDeviceWidth={600}>
          { currentProgramBlock &&
            <div>
              You're on a phone! This is still especially in beta, for you
              <Video
                video={currentProgramBlock.currentVideo}
                timestamp={currentProgramBlock.timestampToStartVideo}
              />
              <br />
              <VideoControls>
                <MuteButton />
                <FullscreenButton />
              </VideoControls>
              <br />
              <p>You're watching {this.props.channelTitle}</p>
              <p>Now playing:</p>
              <h1>{currentProgramBlock.fields.title}</h1>
              <p>Description: {currentProgramBlock.fields.description}</p>
            </div>
          }
        </MediaQuery>
      </div>
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

const tooltipTrigger = css`
  text-decoration: underline;
  margin-left: .3rem;
  cursor: pointer;
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

const mapStateToProps = state => ({
  programBlocks: state.programBlocks,
  session: state.session
});

export default connect(mapStateToProps, { getCurrentProgramBlock })(Program);
